import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import recordsRoutes from './routes/records';
import enquiriesRoutes from './routes/enquiries';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/enquiries', enquiriesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
