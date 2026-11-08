<?php
// GET wines.php?q=testo  -> ricerca vini per nome/produttore (max 20)
// GET wines.php?id=N     -> singolo vino

declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Metodo non consentito', 405);
}

$pdo = db();

if (isset($_GET['id'])) {
    $st = $pdo->prepare('SELECT * FROM wines WHERE id = ?');
    $st->execute([(int)$_GET['id']]);
    $row = $st->fetch();
    if (!$row) json_error('Vino non trovato', 404);
    json_out(wine_from_row($row));
}

$q = trim((string)($_GET['q'] ?? ''));
if ($q === '') {
    $st = $pdo->query('SELECT * FROM wines ORDER BY updated_at DESC LIMIT 20');
} else {
    $like = '%' . addcslashes($q, '%_\\') . '%';
    $st = $pdo->prepare('SELECT * FROM wines WHERE nome LIKE ? OR produttore LIKE ? ORDER BY nome, annata DESC LIMIT 20');
    $st->execute([$like, $like]);
}
json_out(array_map('wine_from_row', $st->fetchAll()));
