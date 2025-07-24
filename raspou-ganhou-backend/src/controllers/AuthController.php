<?php

namespace App\Controllers;

use App\Config\Database;
use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function login(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            $response->getBody()->write(json_encode(['error' => 'Email e senha são obrigatórios']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Verificar usuário
            $user = $this->db->query(
                "SELECT * FROM users WHERE email = $1",
                [$email]
            );

            if (empty($user) || !password_verify($password, $user[0]['senha'])) {
                $response->getBody()->write(json_encode(['error' => 'Credenciais inválidas']));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            $userData = $user[0];
            
            // Gerar JWT
            $payload = [
                'user_id' => $userData['id'],
                'email' => $userData['email'],
                'role' => 'user',
                'exp' => time() + (24 * 60 * 60) // 24 horas
            ];

            $token = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

            // Remover senha dos dados retornados
            unset($userData['senha']);

            $response->getBody()->write(json_encode([
                'success' => true,
                'token' => $token,
                'user' => $userData
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro interno do servidor']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function register(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        
        $requiredFields = ['nome', 'email', 'telefone', 'cpf', 'senha'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $response->getBody()->write(json_encode(['error' => "Campo {$field} é obrigatório"]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
        }

        try {
            // Verificar se email já existe
            $existingUser = $this->db->query(
                "SELECT id FROM users WHERE email = $1 OR cpf = $2",
                [$data['email'], $data['cpf']]
            );

            if (!empty($existingUser)) {
                $response->getBody()->write(json_encode(['error' => 'Email ou CPF já cadastrado']));
                return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
            }

            // Hash da senha
            $hashedPassword = password_hash($data['senha'], PASSWORD_DEFAULT);

            // Inserir usuário
            $this->db->execute(
                "INSERT INTO users (nome, email, telefone, cpf, senha, saldo_real, saldo_bonus, pontos_sorteio) 
                 VALUES ($1, $2, $3, $4, $5, 0.00, 10.00, 0)",
                [
                    $data['nome'],
                    $data['email'],
                    $data['telefone'],
                    $data['cpf'],
                    $hashedPassword
                ]
            );

            $response->getBody()->write(json_encode(['success' => true, 'message' => 'Usuário criado com sucesso']));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro ao criar usuário']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function adminLogin(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        try {
            // Verificar admin
            $admin = $this->db->query(
                "SELECT * FROM admins WHERE email = $1",
                [$email]
            );

            if (empty($admin) || !password_verify($password, $admin[0]['password'])) {
                $response->getBody()->write(json_encode(['error' => 'Credenciais inválidas']));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            $adminData = $admin[0];
            
            // Gerar JWT
            $payload = [
                'user_id' => $adminData['id'],
                'email' => $adminData['email'],
                'role' => $adminData['is_super_admin'] ? 'super_admin' : 'admin',
                'exp' => time() + (24 * 60 * 60)
            ];

            $token = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

            unset($adminData['password']);

            $response->getBody()->write(json_encode([
                'success' => true,
                'token' => $token,
                'user' => $adminData
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro interno do servidor']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function affiliateLogin(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        try {
            // Verificar afiliado
            $affiliate = $this->db->query(
                "SELECT * FROM affiliates WHERE email = $1",
                [$email]
            );

            if (empty($affiliate) || !password_verify($password, $affiliate[0]['password'])) {
                $response->getBody()->write(json_encode(['error' => 'Credenciais inválidas']));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            $affiliateData = $affiliate[0];
            
            // Gerar JWT
            $payload = [
                'user_id' => $affiliateData['id'],
                'email' => $affiliateData['email'],
                'role' => 'affiliate',
                'exp' => time() + (24 * 60 * 60)
            ];

            $token = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

            unset($affiliateData['password']);

            $response->getBody()->write(json_encode([
                'success' => true,
                'token' => $token,
                'user' => $affiliateData
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Erro interno do servidor']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}