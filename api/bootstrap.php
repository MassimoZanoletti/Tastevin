<?php
// Funzioni comuni: configurazione, CORS, connessione PDO, risposte JSON.

declare(strict_types=1);

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Configurazione mancante: creare api/config.php da config.sample.php']);
    exit;
}
$CONFIG = require $configFile;

// ---------- CORS ----------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $CONFIG['cors_origins'] ?? [];
if ($origin !== '' && (in_array('*', $allowed, true) || in_array($origin, $allowed, true))) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
    header('Access-Control-Max-Age: 86400');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// ---------- Chiave API ----------
$apiKey = (string)($CONFIG['api_key'] ?? '');
if ($apiKey !== '' && !hash_equals($apiKey, (string)($_SERVER['HTTP_X_API_KEY'] ?? ''))) {
    json_error('Non autorizzato', 401);
}

function json_out($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);
    exit;
}

function json_error(string $message, int $status = 400): void
{
    json_out(['error' => $message], $status);
}

function db(): PDO
{
    global $CONFIG;
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $CONFIG['db_host'], (int)($CONFIG['db_port'] ?? 3306), $CONFIG['db_name']
        );
        try {
            $pdo = new PDO($dsn, $CONFIG['db_user'], $CONFIG['db_pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            error_log('Tastevin DB: ' . $e->getMessage());
            json_error('Database non raggiungibile', 500);
        }
    }
    return $pdo;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_error('Richiesta non valida');
    }
    return $data;
}

/** Stringa ripulita e troncata, oppure null se vuota. */
function str_or_null($v, int $max = 65535): ?string
{
    if ($v === null) return null;
    $s = trim((string)$v);
    return $s === '' ? null : mb_substr($s, 0, $max);
}

function int_or_null($v): ?int
{
    return ($v === null || $v === '') ? null : (int)$v;
}

function float_or_null($v): ?float
{
    return ($v === null || $v === '') ? null : round((float)$v, 1);
}

/** Converte una riga della tabella wines nel formato dell'app. */
function wine_from_row(array $r): array
{
    return [
        'id'              => (int)$r['id'],
        'nome'            => $r['nome'],
        'produttore'      => $r['produttore'] ?? '',
        'annata'          => $r['annata'] !== null ? (int)$r['annata'] : null,
        'grado'           => $r['grado'] !== null ? (float)$r['grado'] : null,
        'colore'          => $r['colore'],
        'tipologia'       => $r['tipologia'] !== '' && $r['tipologia'] !== null ? explode(',', $r['tipologia']) : [],
        'classificazione' => $r['classificazione'],
        'regione'         => $r['regione'],
        'specifiche'      => $r['specifiche'] ?? '',
        'vitigni'         => $r['vitigni'] ?? '',
        'note'            => $r['note'] ?? '',
    ];
}
