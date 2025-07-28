<?php

namespace App\Controllers;

use App\Config\Database;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AdminController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getDashboard(Request $request, Response $response): Response
    {
        try {
            // Estatísticas gerais
            $totalUsers = $this->db->query("SELECT COUNT(*) as count FROM users")[0]['count'];
            $totalDeposits = $this->db->query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'deposit' AND status = 'completed'")[0]['total'];
            $totalWithdraws = $this->db->query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'withdraw'")[0]['total'];
            $pendingWithdraws = $this->db->query("SELECT COUNT(*) as count FROM transactions WHERE type = 'withdraw' AND status = 'processing'")[0]['count'];

            // Transações recentes
            $recentTransactions = $this->db->query(
                "SELECT t.*, u.nome as user_name FROM transactions t 
                 JOIN users u ON t.user_id = u.id 
                 ORDER BY t.created_at DESC LIMIT 10"
            );

            // Usuários ativos
            $activeUsers = $this->db->query(
                "SELECT id, nome, email, saldo_real, saldo_bonus, created_at FROM users 
                 ORDER BY created_at DESC LIMIT 10"
            );

            $stats = [
                'total_users' => $totalUsers,
                'total_deposits' => $totalDeposits,
                'total_withdraws' => $totalWithdraws,
                'total_revenue' => $totalDeposits - $totalWithdraws,
                'pending_withdraws' => $pendingWithdraws
            ];

            $response->getBody()->write(json_encode([
                'stats' => $stats,
                'recent_transactions' => $recentTransactions,
                'active_users' => $activeUsers
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao carregar dashboard']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getUsers(Request $request, Response $response): Response
    {
        try {
            $users = $this->db->query(
                "SELECT id, nome, email, cpf, telefone, saldo_real, saldo_bonus, 
                 pontos_sorteio, jogos_realizados, total_ganho, nivel_vip, created_at 
                 FROM users ORDER BY created_at DESC"
            );

            $response->getBody()->write(json_encode(['users' => $users]));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao carregar usuários']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getTransactions(Request $request, Response $response): Response
    {
        try {
            $transactions = $this->db->query(
                "SELECT t.*, u.nome as user_name FROM transactions t 
                 JOIN users u ON t.user_id = u.id 
                 ORDER BY t.created_at DESC"
            );

            $response->getBody()->write(json_encode(['transactions' => $transactions]));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao carregar transações']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function approveWithdraw(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        $transactionId = $data['transaction_id'] ?? '';

        if (empty($transactionId)) {
            $response->getBody()->write(json_encode(['error' => 'ID da transação é obrigatório']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            $this->db->execute(
                "UPDATE transactions SET status = 'completed', processed_at = NOW() WHERE id = $1 AND type = 'withdraw'",
                [$transactionId]
            );

            $response->getBody()->write(json_encode(['success' => true, 'message' => 'Saque aprovado com sucesso']));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao aprovar saque']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function rejectWithdraw(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        $transactionId = $data['transaction_id'] ?? '';

        if (empty($transactionId)) {
            $response->getBody()->write(json_encode(['error' => 'ID da transação é obrigatório']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Buscar transação
            $transaction = $this->db->query("SELECT * FROM transactions WHERE id = $1", [$transactionId]);
            if (empty($transaction)) {
                $response->getBody()->write(json_encode(['error' => 'Transação não encontrada']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $transactionData = $transaction[0];

            // Verificar se a transação pode ser rejeitada
            if (!in_array($transactionData['status'], ['pending', 'processing'])) {
                $response->getBody()->write(json_encode(['error' => 'Transação já foi processada']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Iniciar transação
            $this->db->getConnection()->beginTransaction();

            // Rejeitar saque
            $this->db->execute(
                "UPDATE transactions SET status = 'cancelled', processed_at = NOW() WHERE id = $1",
                [$transactionId]
            );

            // Devolver valor ao usuário
            $this->db->execute(
                "UPDATE users SET saldo_real = saldo_real + $1 WHERE id = $2",
                [$transactionData['amount'], $transactionData['user_id']]
            );

            $this->db->getConnection()->commit();

            $response->getBody()->write(json_encode(['success' => true, 'message' => 'Saque rejeitado e valor devolvido']));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $this->db->getConnection()->rollBack();
            $response->getBody()->write(json_encode(['error' => 'Erro ao rejeitar saque']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}