<?php

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        $supabaseUrl = $_ENV['SUPABASE_URL'];
        $serviceRoleKey = $_ENV['SUPABASE_SERVICE_ROLE_KEY'];
        
        // Extract database connection details from Supabase URL
        $parsedUrl = parse_url($supabaseUrl);
        $host = str_replace('https://', '', $supabaseUrl);
        $host = explode('.', $host)[0] . '.supabase.co';
        
        $dsn = "pgsql:host=db.{$host};port=5432;dbname=postgres";
        
        try {
            $this->connection = new PDO($dsn, 'postgres', $serviceRoleKey, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            throw new \Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO
    {
        return $this->connection;
    }

    public function query(string $sql, array $params = []): array
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new \Exception("Query failed: " . $e->getMessage());
        }
    }

    public function execute(string $sql, array $params = []): bool
    {
        try {
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            throw new \Exception("Execute failed: " . $e->getMessage());
        }
    }

    public function lastInsertId(): string
    {
        return $this->connection->lastInsertId();
    }
}