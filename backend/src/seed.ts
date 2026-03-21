import { db } from './database';

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const categories = ['Design', 'Development', 'Marketing', 'Sales', 'Other'];
const statuses = ['Pending', 'In Progress', 'Completed'];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = () => {
  const start = new Date(2025, 0, 1).getTime();
  const end = new Date(2026, 11, 31).getTime();
  const date = new Date(start + Math.random() * (end - start));
  return date.toISOString().split('T')[0];
};

console.log('Waiting for DB to initialize...');

setTimeout(() => {
  console.log('Seeding 1000 employees...');
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare(`INSERT INTO records (name, category, date, status) VALUES (?, ?, ?, ?)`);
    
    for (let i = 0; i < 1000; i++) {
      const name = `${getRandom(firstNames)} ${getRandom(lastNames)}`;
      const category = getRandom(categories);
      const date = getRandomDate();
      const status = getRandom(statuses);
      stmt.run(name, category, date, status);
    }
    
    stmt.finalize();
    db.run('COMMIT', () => {
      console.log('Successfully seeded 1000 employee records!');
      process.exit(0);
    });
  });
}, 1000);
