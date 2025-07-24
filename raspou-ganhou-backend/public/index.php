<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use App\Middleware\CorsMiddleware;
use App\Middleware\AuthMiddleware;
use App\Controllers\AuthController;
use App\Controllers\GameController;
use App\Controllers\TransactionController;
use App\Controllers\UserController;
use App\Controllers\AdminController;
use Dotenv\Dotenv;

// Carregar variáveis de ambiente
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Criar app Slim
$app = AppFactory::create();

// Middleware global
$app->add(new CorsMiddleware());

// Middleware para OPTIONS requests
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// Rotas públicas (sem autenticação)
$app->post('/api/auth/login', [AuthController::class, 'login']);
$app->post('/api/auth/register', [AuthController::class, 'register']);
$app->post('/api/auth/admin-login', [AuthController::class, 'adminLogin']);
$app->post('/api/auth/affiliate-login', [AuthController::class, 'affiliateLogin']);
$app->get('/api/games', [GameController::class, 'getGames']);

// Rotas protegidas (com autenticação)
$app->group('/api', function ($group) {
    // Usuário
    $group->get('/user/profile', [UserController::class, 'getProfile']);
    $group->put('/user/profile', [UserController::class, 'updateProfile']);
    $group->get('/user/balance-movements', [UserController::class, 'getBalanceMovements']);
    
    // Jogos
    $group->post('/games/play', [GameController::class, 'playGame']);
    $group->get('/games/history', [GameController::class, 'getGameHistory']);
    
    // Transações
    $group->post('/transactions/deposit', [TransactionController::class, 'deposit']);
    $group->post('/transactions/withdraw', [TransactionController::class, 'withdraw']);
    $group->get('/transactions/history', [TransactionController::class, 'getTransactionHistory']);
    
    // Admin
    $group->get('/admin/dashboard', [AdminController::class, 'getDashboard']);
    $group->get('/admin/users', [AdminController::class, 'getUsers']);
    $group->get('/admin/transactions', [AdminController::class, 'getTransactions']);
    $group->post('/admin/approve-withdraw', [AdminController::class, 'approveWithdraw']);
    $group->post('/admin/reject-withdraw', [AdminController::class, 'rejectWithdraw']);
    
})->add(new AuthMiddleware());

// Error handling
$app->addErrorMiddleware(true, true, true);

$app->run();