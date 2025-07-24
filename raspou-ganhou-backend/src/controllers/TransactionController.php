<?php

namespace App\Controllers;

use App\Config\Database;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TransactionController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function deposit(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');
        $data = json_decode($request->getBody()->getContents(), true);
        
        $amount = $data['amount'] ?? 0;
        $method = $data['method'] ?? '';

        if ($amount <= 0 || empty($method)) {
            $response->getBody()->write(json_encode(['error' => 'Dados inválidos']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Buscar usuário atual
            $userData = $this->db->query("SELECT * FROM users WHERE id = $1", [$user->user_id]);
            if (empty($userData)) {
                $response->getBody()->write(json_encode(['error' => 'Usuário não encontrado']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $currentUser = $userData[0];
            
            // Calcular bônus (10% para depósitos acima de R$ 100)
            $bonus = $amount >= 100 ? $amount * 0.1 : 0;
            
            // Iniciar transação
            $this->db->getConnection()->beginTransaction();

            // Criar transação
            $this->db->execute(
                "INSERT INTO transactions (user_id, type, method, amount, net_amount, status, payment_provider)
                 VALUES ($1, 'deposit', $2, $3, $4, 'completed', 'simulated')",
                [$user->user_id, $method, $amount, $amount]
            );

            // Atualizar saldo do usuário
            $newRealBalance = $currentUser['saldo_real'] + $amount;
            $newBonusBalance = $currentUser['saldo_bonus'] + $bonus;

            $this->db->execute(
                "UPDATE users SET saldo_real = $1, saldo_bonus = $2 WHERE id = $3",
                [$newRealBalance, $newBonusBalance, $user->user_id]
            );

            // Registrar movimentação de saldo
            $this->db->execute(
                "INSERT INTO balance_movements (user_id, type, balance_type, amount, previous_balance, new_balance, description)
                 VALUES ($1, 'credit', 'real', $2, $3, $4, $5)",
                [
                    $user->user_id,
                    $amount,
                    $currentUser['saldo_real'],
                    $newRealBalance,
                    "Depósito via {$method}"
                ]
            );

            if ($bonus > 0) {
                $this->db->execute(
                    "INSERT INTO balance_movements (user_id, type, balance_type, amount, previous_balance, new_balance, description)
                     VALUES ($1, 'credit', 'bonus', $2, $3, $4, 'Bônus de depósito')",
                    [
                        $user->user_id,
                        $bonus,
                        $currentUser['saldo_bonus'],
                        $newBonusBalance
                    ]
                );
            }

            $this->db->getConnection()->commit();

            $response->getBody()->write(json_encode([
                'success' => true,
                'new_balance' => [
                    'saldo_real' => $newRealBalance,
                    'saldo_bonus' => $newBonusBalance
                ],
                'bonus_received' => $bonus
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $this->db->getConnection()->rollBack();
            $response->getBody()->write(json_encode(['error' => 'Erro ao processar depósito']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function withdraw(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');
        $data = json_decode($request->getBody()->getContents(), true);
        
        $amount = $data['amount'] ?? 0;
        $method = $data['method'] ?? '';
        $details = $data['details'] ?? [];

        if ($amount <= 0 || empty($method)) {
            $response->getBody()->write(json_encode(['error' => 'Dados inválidos']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Buscar usuário atual
            $userData = $this->db->query("SELECT * FROM users WHERE id = $1", [$user->user_id]);
            if (empty($userData)) {
                $response->getBody()->write(json_encode(['error' => 'Usuário não encontrado']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $currentUser = $userData[0];

            // Verificar saldo real (só pode sacar saldo real)
            if ($currentUser['saldo_real'] < $amount) {
                $response->getBody()->write(json_encode(['error' => 'Saldo real insuficiente']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Calcular taxa
            $fee = $method === 'bank' ? 5.00 : 0;
            $netAmount = $amount - $fee;

            // Iniciar transação
            $this->db->getConnection()->beginTransaction();

            // Criar transação
            $this->db->execute(
                "INSERT INTO transactions (user_id, type, method, amount, fee, net_amount, status, metadata)
                 VALUES ($1, 'withdraw', $2, $3, $4, $5, 'processing', $6)",
                [$user->user_id, $method, $amount, $fee, $netAmount, json_encode($details)]
            );

            // Atualizar saldo do usuário
            $newRealBalance = $currentUser['saldo_real'] - $amount;

            $this->db->execute(
                "UPDATE users SET saldo_real = $1 WHERE id = $2",
                [$newRealBalance, $user->user_id]
            );

            // Registrar movimentação de saldo
            $this->db->execute(
                "INSERT INTO balance_movements (user_id, type, balance_type, amount, previous_balance, new_balance, description)
                 VALUES ($1, 'debit', 'real', $2, $3, $4, $5)",
                [
                    $user->user_id,
                    $amount,
                    $currentUser['saldo_real'],
                    $newRealBalance,
                    "Saque via {$method}"
                ]
            );

            $this->db->getConnection()->commit();

            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Saque solicitado com sucesso',
                'new_balance' => [
                    'saldo_real' => $newRealBalance,
                    'saldo_bonus' => $currentUser['saldo_bonus']
                ]
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $this->db->getConnection()->rollBack();
            $response->getBody()->write(json_encode(['error' => 'Erro ao processar saque']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getTransactionHistory(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');

        try {
            $transactions = $this->db->query(
                "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
                [$user->user_id]
            );

            $response->getBody()->write(json_encode(['transactions' => $transactions]));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao carregar histórico']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}