<?php

namespace App\Controllers;

use App\Config\Database;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UserController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getProfile(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');

        try {
            $userData = $this->db->query("SELECT * FROM users WHERE id = $1", [$user->user_id]);
            
            if (empty($userData)) {
                $response->getBody()->write(json_encode(['error' => 'Usuário não encontrado']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $userProfile = $userData[0];
            unset($userProfile['senha']); // Remover senha

            $response->getBody()->write(json_encode(['user' => $userProfile]));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao carregar perfil']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function updateProfile(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');
        $data = json_decode($request->getBody()->getContents(), true);

        try {
            $allowedFields = ['nome', 'telefone'];
            $updateFields = [];
            $updateValues = [];
            $paramIndex = 1;

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "{$field} = \${$paramIndex}";
                    $updateValues[] = $data[$field];
                    $paramIndex++;
                }
            }

            if (empty($updateFields)) {
                $response->getBody()->write(json_encode(['error' => 'Nenhum campo para atualizar']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            $updateValues[] = $user->user_id;
            $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = \${$paramIndex}";

            $this->db->execute($sql, $updateValues);

            $response->getBody()->write(json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso']));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao atualizar perfil']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getBalanceMovements(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');

        try {
            $movements = $this->db->query(
                "SELECT * FROM balance_movements WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100",
                [$user->user_id]
            );

            $response->getBody()->write(json_encode(['movements' => $movements]));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao carregar movimentações']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}