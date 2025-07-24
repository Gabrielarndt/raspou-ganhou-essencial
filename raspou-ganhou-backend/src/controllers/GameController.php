<?php

namespace App\Controllers;

use App\Config\Database;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class GameController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getGames(Request $request, Response $response): Response
    {
        try {
            $games = $this->db->query("SELECT * FROM games WHERE is_active = true ORDER BY price ASC");
            
            $response->getBody()->write(json_encode(['games' => $games]));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao carregar jogos']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function playGame(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');
        $data = json_decode($request->getBody()->getContents(), true);
        $gameId = $data['game_id'] ?? '';

        if (empty($gameId)) {
            $response->getBody()->write(json_encode(['error' => 'ID do jogo é obrigatório']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Buscar jogo
            $game = $this->db->query("SELECT * FROM games WHERE id = $1 AND is_active = true", [$gameId]);
            if (empty($game)) {
                $response->getBody()->write(json_encode(['error' => 'Jogo não encontrado']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $gameData = $game[0];

            // Buscar usuário atual
            $userData = $this->db->query("SELECT * FROM users WHERE id = $1", [$user->user_id]);
            if (empty($userData)) {
                $response->getBody()->write(json_encode(['error' => 'Usuário não encontrado']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $currentUser = $userData[0];
            $totalBalance = $currentUser['saldo_real'] + $currentUser['saldo_bonus'];

            // Verificar saldo
            if ($totalBalance < $gameData['price']) {
                $response->getBody()->write(json_encode(['error' => 'Saldo insuficiente']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Calcular pagamento
            $realUsed = min($currentUser['saldo_real'], $gameData['price']);
            $bonusUsed = $gameData['price'] - $realUsed;
            $newRealBalance = $currentUser['saldo_real'] - $realUsed;
            $newBonusBalance = $currentUser['saldo_bonus'] - $bonusUsed;

            // Gerar resultado do jogo
            $symbols = ['💎', '🍀', '⭐', '🎯', '🏆', '💰', '🎲', '🔥'];
            $gameSymbols = [];
            for ($i = 0; $i < 9; $i++) {
                $gameSymbols[] = $symbols[array_rand($symbols)];
            }

            // 30% chance de ganhar
            $won = rand(1, 100) <= 30;
            $prize = 0;
            $winningPositions = [];

            if ($won) {
                $winningSymbol = $symbols[array_rand($symbols)];
                $winningPositions = [0, 4, 8]; // Diagonal
                foreach ($winningPositions as $pos) {
                    $gameSymbols[$pos] = $winningSymbol;
                }

                // Calcular prêmio baseado no símbolo
                $multipliers = [
                    '💎' => 10, '🍀' => 8, '⭐' => 6, '🎯' => 5,
                    '🏆' => 4, '💰' => 3, '🎲' => 2, '🔥' => 1.5
                ];
                $multiplier = $multipliers[$winningSymbol] ?? 1;
                $prize = $gameData['price'] * $multiplier;

                // Adicionar prêmio ao saldo correto
                if ($realUsed > 0 && $bonusUsed == 0) {
                    $newRealBalance += $prize;
                } elseif ($realUsed == 0 && $bonusUsed > 0) {
                    $newBonusBalance += $prize;
                } else {
                    $newRealBalance += $prize;
                }
            }

            // Iniciar transação
            $this->db->getConnection()->beginTransaction();

            // Atualizar saldo do usuário
            $this->db->execute(
                "UPDATE users SET saldo_real = $1, saldo_bonus = $2, pontos_sorteio = pontos_sorteio + 10, 
                 jogos_realizados = jogos_realizados + 1, total_ganho = total_ganho + $3 WHERE id = $4",
                [$newRealBalance, $newBonusBalance, $prize, $user->user_id]
            );

            // Registrar resultado do jogo
            $this->db->execute(
                "INSERT INTO game_results (user_id, game_id, cost, prize, won, symbols, winning_positions, payment_breakdown)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [
                    $user->user_id,
                    $gameId,
                    $gameData['price'],
                    $prize,
                    $won,
                    json_encode($gameSymbols),
                    json_encode($winningPositions),
                    json_encode(['realUsed' => $realUsed, 'bonusUsed' => $bonusUsed])
                ]
            );

            // Registrar movimentação de saldo
            if ($realUsed > 0) {
                $this->db->execute(
                    "INSERT INTO balance_movements (user_id, type, balance_type, amount, previous_balance, new_balance, description)
                     VALUES ($1, 'debit', 'real', $2, $3, $4, $5)",
                    [
                        $user->user_id,
                        $realUsed,
                        $currentUser['saldo_real'],
                        $newRealBalance,
                        "Jogo: {$gameData['name']}"
                    ]
                );
            }

            if ($bonusUsed > 0) {
                $this->db->execute(
                    "INSERT INTO balance_movements (user_id, type, balance_type, amount, previous_balance, new_balance, description)
                     VALUES ($1, 'debit', 'bonus', $2, $3, $4, $5)",
                    [
                        $user->user_id,
                        $bonusUsed,
                        $currentUser['saldo_bonus'],
                        $newBonusBalance,
                        "Jogo: {$gameData['name']}"
                    ]
                );
            }

            if ($won && $prize > 0) {
                $balanceType = ($realUsed > 0 && $bonusUsed == 0) ? 'real' : 
                              ($realUsed == 0 && $bonusUsed > 0) ? 'bonus' : 'real';
                
                $this->db->execute(
                    "INSERT INTO balance_movements (user_id, type, balance_type, amount, previous_balance, new_balance, description)
                     VALUES ($1, 'credit', $2, $3, $4, $5, $6)",
                    [
                        $user->user_id,
                        $balanceType,
                        $prize,
                        $balanceType == 'real' ? $newRealBalance - $prize : $newBonusBalance - $prize,
                        $balanceType == 'real' ? $newRealBalance : $newBonusBalance,
                        "Prêmio: {$gameData['name']}"
                    ]
                );
            }

            $this->db->getConnection()->commit();

            $response->getBody()->write(json_encode([
                'success' => true,
                'result' => [
                    'won' => $won,
                    'prize' => $prize,
                    'symbols' => $gameSymbols,
                    'winning_positions' => $winningPositions,
                    'new_balance' => [
                        'saldo_real' => $newRealBalance,
                        'saldo_bonus' => $newBonusBalance,
                        'pontos_sorteio' => $currentUser['pontos_sorteio'] + 10
                    ]
                ]
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $this->db->getConnection()->rollBack();
            $response->getBody()->write(json_encode(['error' => 'Erro ao processar jogo']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getGameHistory(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');

        try {
            $history = $this->db->query(
                "SELECT gr.*, g.name as game_name FROM game_results gr 
                 JOIN games g ON gr.game_id = g.id 
                 WHERE gr.user_id = $1 ORDER BY gr.created_at DESC LIMIT 50",
                [$user->user_id]
            );

            $response->getBody()->write(json_encode(['history' => $history]));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao carregar histórico']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}