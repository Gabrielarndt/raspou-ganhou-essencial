import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Import controllers
import {
  getDashboard,
  getUsers,
  getTransactions,
  approveWithdraw,
  rejectWithdraw,
  updateUser,
  createLottery,
  updateLottery,
  deleteLottery,
  getLotteries,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  getActiveLotteries
} from './controllers/adminController.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Admin routes
app.get('/api/admin/dashboard', getDashboard);
app.get('/api/admin/users', getUsers);
app.get('/api/admin/transactions', getTransactions);
app.post('/api/admin/approve-withdraw', approveWithdraw);
app.post('/api/admin/reject-withdraw', rejectWithdraw);
app.put('/api/admin/update-user', updateUser);

// Lottery routes
app.get('/api/admin/lotteries', getLotteries);
app.post('/api/admin/create-lottery', createLottery);
app.put('/api/admin/update-lottery', updateLottery);
app.delete('/api/admin/delete-lottery', deleteLottery);
app.get('/api/lotteries/active', getActiveLotteries);

// Admin management routes
app.get('/api/admin/admins', getAdmins);
app.post('/api/admin/create-admin', createAdmin);
app.put('/api/admin/update-admin', updateAdmin);
app.delete('/api/admin/delete-admin', deleteAdmin);

// Affiliate routes
app.get('/api/admin/affiliates', getAffiliates);
app.post('/api/admin/create-affiliate', createAffiliate);
app.put('/api/admin/update-affiliate', updateAffiliate);
app.delete('/api/admin/delete-affiliate', deleteAffiliate);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/health`);
  console.log(`🌍 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;