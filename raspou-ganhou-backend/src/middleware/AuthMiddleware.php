<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class AuthMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Token não fornecido']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $token = substr($authHeader, 7);

        try {
            $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
            $request = $request->withAttribute('user', $decoded);
            return $handler->handle($request);
        } catch (\Exception $e) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Token inválido']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    }
}