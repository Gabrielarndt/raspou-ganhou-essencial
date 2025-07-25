import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Middleware
import corsMiddleware from './middleware/cors.js';
import { authenticateToken, authenticateAdmin, authenticateAffiliate } from './middleware/auth.js';

// Controllers
import * as authController from './controllers/authController.js';
import * as gameController from './controllers/gameController.js';
import * as transactionController from './controllers/transactionController.js';
import * as userController from './controllers/userController.js';
import * as adminController from './controllers/adminController.js';


console.log('authController:', Object.keys(authController));
console.log('gameController:', Object.keys(gameController));
console.log('transactionController:', Object.keys(transactionController));
console.log('userController:', Object.keys(userController));
console.log('adminController:', Object.keys(adminController));


// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { error: 'Muitas tentativas, tente novamente em 15 minutos' }
});

// Middleware global
app.use(helmet());
app.use(corsMiddleware);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas públicas (sem autenticação)
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.post('/api/auth/admin-login', authController.adminLogin);
app.post('/api/auth/affiliate-login', authController.affiliateLogin);
app.get('/api/games', gameController.getGames);

// Rotas protegidas para usuários
app.get('/api/user/profile', authenticateToken, userController.getProfile);
app.put('/api/user/profile', authenticateToken, userController.updateProfile);
app.get('/api/user/balance-movements', authenticateToken, userController.getBalanceMovements);

// Rotas de jogos (usuários autenticados)
app.post('/api/games/play', authenticateToken, gameController.playGame);
app.get('/api/games/history', authenticateToken, gameController.getGameHistory);

// Rotas de transações (usuários autenticados)
app.post('/api/transactions/deposit', authenticateToken, transactionController.deposit);
app.post('/api/transactions/withdraw', authenticateToken, transactionController.withdraw);
app.get('/api/transactions/history', authenticateToken, transactionController.getTransactionHistory);

// Rotas administrativas (apenas admins)
app.get('/api/admin/dashboard', authenticateAdmin, adminController.getDashboard);
app.get('/api/admin/users', authenticateAdmin, adminController.getUsers);
app.get('/api/admin/transactions', authenticateAdmin, adminController.getTransactions);
app.get('/api/admin/lotteries', authenticateAdmin, adminController.getLotteries);
app.post('/api/admin/create-lottery', authenticateAdmin, adminController.createLottery);
app.put('/api/admin/update-lottery', authenticateAdmin, adminController.updateLottery);
app.delete('/api/admin/delete-lottery', authenticateAdmin, adminController.deleteLottery);
app.put('/api/admin/update-user', authenticateAdmin, adminController.updateUser);
app.get('/api/admin/admins', authenticateAdmin, adminController.getAdmins);
app.post('/api/admin/create-admin', authenticateAdmin, adminController.createAdmin);
app.put('/api/admin/update-admin', authenticateAdmin, adminController.updateAdmin);
app.delete('/api/admin/delete-admin', (req, res) => {
  const { admin_id } = req.query;

  if (!admin_id) {
    return res.status(400).json({ error: 'ID do admin é obrigatório' });
  }

  // lógica para deletar o admin usando o ID...
  console.log('Deletando admin com ID:', admin_id);

  return res.json({ message: 'Admin deletado com sucesso' });
});

app.post('/api/admin/approve-withdraw', authenticateAdmin, adminController.approveWithdraw);
app.post('/api/admin/reject-withdraw', authenticateAdmin, adminController.rejectWithdraw);

// Rotas públicas para sorteios
app.get('/api/lotteries/active', adminController.getActiveLotteries);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🔗 CORS configurado para: ${process.env.CORS_ORIGIN}`);
});