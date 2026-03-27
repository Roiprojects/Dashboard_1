import { Router } from 'express';
import { db } from '../database';
import { authenticate } from './auth';

const router = Router();

// Get all monthly enquiries
router.get('/', (req, res) => {
  db.all('SELECT * FROM monthly_enquiries ORDER BY year ASC, id ASC', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error fetching enquiries' });
    }
    res.json(rows);
  });
});

// Update a specific monthly enquiry (Protected)
router.put('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  if (value === undefined || typeof value !== 'number') {
    return res.status(400).json({ error: 'Valid value number is required' });
  }

  db.run(
    'UPDATE monthly_enquiries SET value = ? WHERE id = ?',
    [value, id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update enquiry' });
      }
      res.json({ message: 'Enquiry updated successfully', changes: this.changes });
    }
  );
});

export default router;
