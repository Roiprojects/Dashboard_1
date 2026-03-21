import { Router, Request, Response, NextFunction } from 'express';
import { query, run } from '../database';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './auth';

const router = Router();

// Middleware to protect routes
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/records - Get records (with search, category filter, date filter, pagination)
router.get('/', async (req, res) => {
  try {
    const { search, category, gender, origin, startDate, endDate, page = '1', limit = '10' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let sql = 'SELECT * FROM records WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM records WHERE 1=1';
    const params: any[] = [];

    if (search) {
      sql += ' AND name LIKE ?';
      countSql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    if (category) {
      sql += ' AND category = ?';
      countSql += ' AND category = ?';
      params.push(category);
    }

    if (gender) {
      sql += ' AND gender = ?';
      countSql += ' AND gender = ?';
      params.push(gender);
    }

    if (origin) {
      sql += ' AND origin = ?';
      countSql += ' AND origin = ?';
      params.push(origin);
    }
    
    // date should be in ISO or YYYY-MM-DD format
    if (startDate && endDate) {
      sql += ' AND date >= ? AND date <= ?';
      countSql += ' AND date >= ? AND date <= ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      sql += ' AND date >= ?';
      countSql += ' AND date >= ?';
      params.push(startDate);
    }

    // Add pagination
    sql += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    const queryParams = [...params, parseInt(limit as string), offset];

    const records = await query(sql, queryParams);
    const totalResult = await query(countSql, params);
    const total = totalResult[0].total;

    res.json({
      records,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// POST /api/records - Create a new record (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, category, date, status } = req.body;
    if (!name || !category || !date || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const result = await run(
      'INSERT INTO records (name, category, date, status) VALUES (?, ?, ?, ?)',
      [name, category, date, status]
    );
    res.status(201).json({ id: result.lastID, name, category, date, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// PUT /api/records/:id - Update a record (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, category, date, status } = req.body;
    const result = await run(
      'UPDATE records SET name = ?, category = ?, date = ?, status = ? WHERE id = ?',
      [name, category, date, status, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ id: req.params.id, name, category, date, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE /api/records/:id - Delete a record (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await run('DELETE FROM records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

export default router;
