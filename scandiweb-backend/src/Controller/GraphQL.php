<?php

namespace App\Controller;

use GraphQL\GraphQL as GraphQLBase;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;
use GraphQL\Type\SchemaConfig;
use RuntimeException;
use Throwable;

class GraphQL {
    static public function handle() {
        try {
            // Load DB credentials from .env
            $envPath = __DIR__ . '/../../../.env';
            $env = [];
            if (file_exists($envPath)) {
                foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                    if (strpos(trim($line), '=') !== false) {
                        [$k, $v] = explode('=', $line, 2);
                        $env[trim($k)] = trim($v);
                    }
                }
            }
            $dbhost = $env['DB_HOST'] ?? 'localhost';
            $dbname = $env['DB_NAME'] ?? 'scandiweb';
            $dbuser = $env['DB_USER'] ?? 'root';
            $dbpass = $env['DB_PASSWORD'] ?? '';
            $pdo = new \PDO("mysql:host=$dbhost;dbname=$dbname;charset=utf8", $dbuser, $dbpass, [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION
            ]);

            $categoryType = new ObjectType([
                'name' => 'Category',
                'fields' => [
                    // Use 'name' as the category id for frontend compatibility
                    'id' => [
                        'type' => Type::string(),
                        'resolve' => function($cat) { return $cat['name']; }
                    ],
                    'name' => [ 'type' => Type::string() ]
                ]
            ]);

            $attributeItemType = new ObjectType([
                'name' => 'AttributeItem',
                'fields' => [
                    'id' => ['type' => Type::string()],
                    'value' => ['type' => Type::string()],
                    'display_value' => ['type' => Type::string()],
                ]
            ]);

            $attributeType = new ObjectType([
                'name' => 'Attribute',
                'fields' => [
                    'id' => ['type' => Type::string()],
                    'name' => ['type' => Type::string()],
                    'type' => ['type' => Type::string()],
                    'items' => [
                        'type' => Type::listOf($attributeItemType),
                        'resolve' => function($attr) use ($pdo) {
                            $stmt = $pdo->prepare('SELECT id, value, display_value FROM attribute_items WHERE attribute_id = ?');
                            $stmt->execute([$attr['id']]);
                            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
                        }
                    ]
                ]
            ]);

            $priceType = new ObjectType([
                'name' => 'Price',
                'fields' => [
                    'currency' => [ 'type' => Type::string() ],
                    'amount' => [ 'type' => Type::float() ]
                ]
            ]);

            $productType = new ObjectType([
                'name' => 'Product',
                'fields' => [
                    'id' => [ 'type' => Type::string() ],
                    'name' => [ 'type' => Type::string() ],
                    'brand' => [ 'type' => Type::string() ],
                    'inStock' => [ 'type' => Type::boolean(), 'resolve' => fn($p) => (bool)$p['in_stock'] ],
                    'gallery' => [ 'type' => Type::listOf(Type::string()), 'resolve' => fn($p) => json_decode($p['gallery'], true) ],
                    'description' => [ 'type' => Type::string() ],
                    'category_id' => [ 'type' => Type::string() ],
                    'prices' => [
                        'type' => Type::listOf($priceType),
                        'resolve' => function($p) use ($pdo) {
                            $stmt = $pdo->prepare('SELECT currency, amount FROM prices WHERE product_id = ?');
                            $stmt->execute([$p['id']]);
                            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
                        }
                    ],
                    'attributes' => [
                        'type' => Type::listOf($attributeType),
                        'resolve' => function($p) use ($pdo) {
                            $stmt = $pdo->prepare('SELECT a.id, a.name, a.type FROM attributes a INNER JOIN product_attributes pa ON pa.attribute_id = a.id WHERE pa.product_id = ?');
                            $stmt->execute([$p['id']]);
                            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
                        }
                    ]
                ]
            ]);

            $queryType = new ObjectType([
                'name' => 'Query',
                'fields' => [
                    'categories' => [
                        'type' => Type::listOf($categoryType),
                        'resolve' => function() use ($pdo) {
                            $stmt = $pdo->query('SELECT id, name FROM categories');
                            $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                            file_put_contents(__DIR__ . '/../../../categories_debug.log', print_r($rows, true));
                            return $rows;
                        }
                    ],
                    'products' => [
                        'type' => Type::listOf($productType),
                        'args' => [
                            'categoryId' => ['type' => Type::string()]
                        ],
                        'resolve' => function($root, $args) use ($pdo) {
                            if (isset($args['categoryId']) && $args['categoryId'] !== 'all') {
                                // Find category id by name
                                $stmt = $pdo->prepare('SELECT id FROM categories WHERE name = ?');
                                $stmt->execute([$args['categoryId']]);
                                $cat = $stmt->fetch(\PDO::FETCH_ASSOC);
                                if ($cat) {
                                    $stmt = $pdo->prepare('SELECT * FROM products WHERE category_id = ?');
                                    $stmt->execute([$cat['id']]);
                                    $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                                } else {
                                    $rows = [];
                                }
                            } else {
                                $stmt = $pdo->query('SELECT * FROM products');
                                $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                            }
                            file_put_contents(__DIR__ . '/../../../products_debug.log', print_r($rows, true));
                            return $rows;
                        }
                    ],
                    'product' => [
                        'type' => $productType,
                        'args' => [
                            'id' => ['type' => Type::string()]
                        ],
                        'resolve' => function($root, $args) use ($pdo) {
                            if (!isset($args['id'])) return null;
                            $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
                            $stmt->execute([$args['id']]);
                            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
                            return $row ?: null;
                        }
                    ]
                ]
            ]);

            $mutationType = new ObjectType([
                'name' => 'Mutation',
                'fields' => [
                    'sum' => [
                        'type' => Type::int(),
                        'args' => [
                            'x' => ['type' => Type::int()],
                            'y' => ['type' => Type::int()],
                        ],
                        'resolve' => static fn ($calc, array $args): int => $args['x'] + $args['y'],
                    ],
                ],
            ]);
        
            $schema = new Schema(
                (new SchemaConfig())
                ->setQuery($queryType)
                ->setMutation($mutationType)
            );
        
            $rawInput = file_get_contents('php://input');
            if ($rawInput === false) {
                throw new RuntimeException('Failed to get php://input');
            }
        
            $input = json_decode($rawInput, true);
            $query = $input['query'];
            $variableValues = $input['variables'] ?? null;
        
            $rootValue = ['prefix' => 'You said: '];
            $result = GraphQLBase::executeQuery($schema, $query, $rootValue, null, $variableValues);
            $output = $result->toArray();
        } catch (Throwable $e) {
            $output = [
                'error' => [
                    'message' => $e->getMessage(),
                ],
            ];
        }

        header('Content-Type: application/json; charset=UTF-8');
        return json_encode($output);
    }
}