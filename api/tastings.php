<?php
// GET    tastings.php?q=testo  -> elenco degustazioni (con dati del vino)
// GET    tastings.php?id=N     -> degustazione completa { wine, tasting }
// POST   tastings.php          -> crea/aggiorna vino + degustazione, body { wine, tasting }
// DELETE tastings.php?id=N     -> elimina la degustazione (il vino resta in archivio)

declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

const COLORI = ['bianco', 'rosa', 'rosso'];

$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            json_out(load_record($pdo, (int)$_GET['id']));
        }
        list_tastings($pdo, trim((string)($_GET['q'] ?? '')));
        break;

    case 'POST':
        save_record($pdo, read_json_body());
        break;

    case 'DELETE':
        $id = (int)($_GET['id'] ?? 0);
        $st = $pdo->prepare('DELETE FROM tastings WHERE id = ?');
        $st->execute([$id]);
        if ($st->rowCount() === 0) json_error('Degustazione non trovata', 404);
        json_out(['ok' => true]);
        break;

    default:
        json_error('Metodo non consentito', 405);
}

// --------------------------------------------------------------------------

function list_tastings(PDO $pdo, string $q): void
{
    $sql = 'SELECT t.id, t.data, t.totale, t.esame_visivo,
                   w.id AS wine_id, w.nome, w.produttore, w.annata, w.colore
              FROM tastings t JOIN wines w ON w.id = t.wine_id';
    $params = [];
    if ($q !== '') {
        $like = '%' . addcslashes($q, '%_\\') . '%';
        $sql .= ' WHERE w.nome LIKE ? OR w.produttore LIKE ? OR w.regione LIKE ? OR w.vitigni LIKE ? OR CAST(w.annata AS CHAR) LIKE ?';
        $params = [$like, $like, $like, $like, $like];
    }
    $sql .= ' ORDER BY t.data DESC, t.id DESC LIMIT 500';
    $st = $pdo->prepare($sql);
    $st->execute($params);

    $out = [];
    foreach ($st->fetchAll() as $r) {
        $visivo = json_decode($r['esame_visivo'] ?? 'null', true);
        $out[] = [
            'id'            => (int)$r['id'],
            'data'          => $r['data'],
            'totale'        => $r['totale'] !== null ? (int)$r['totale'] : null,
            'wine_id'       => (int)$r['wine_id'],
            'nome'          => $r['nome'],
            'produttore'    => $r['produttore'],
            'annata'        => $r['annata'] !== null ? (int)$r['annata'] : null,
            'colore'        => $r['colore'],
            'colore_visivo' => is_array($visivo) ? ($visivo['colore'] ?? null) : null,
        ];
    }
    json_out($out);
}

function load_record(PDO $pdo, int $id): array
{
    $st = $pdo->prepare('SELECT * FROM tastings WHERE id = ?');
    $st->execute([$id]);
    $t = $st->fetch();
    if (!$t) json_error('Degustazione non trovata', 404);

    $st = $pdo->prepare('SELECT * FROM wines WHERE id = ?');
    $st->execute([(int)$t['wine_id']]);
    $w = $st->fetch();

    return [
        'wine'    => $w ? wine_from_row($w) : null,
        'tasting' => [
            'id'              => (int)$t['id'],
            'data'            => $t['data'],
            'note'            => $t['note'] ?? '',
            'visivo'          => json_decode($t['esame_visivo'] ?? 'null', true),
            'olfattivo'       => json_decode($t['esame_olfattivo'] ?? 'null', true),
            'gustativo'       => json_decode($t['esame_gustativo'] ?? 'null', true),
            'finale'          => json_decode($t['considerazioni'] ?? 'null', true),
            'punteggioAttivo' => (bool)$t['punteggio_attivo'],
            'punteggi'        => json_decode($t['punteggi'] ?? 'null', true),
            'totale'          => $t['totale'] !== null ? (int)$t['totale'] : null,
        ],
    ];
}

/** Punteggio: fattori AIS, ogni voce 0..4, totale max 100 (ricalcolato lato server). */
function compute_total(?array $scores): ?int
{
    $factors = [
        'limpidezza' => 1, 'colore' => 3, 'fluidita' => 1,
        'olfIntensita' => 1, 'olfPersistenza' => 3, 'olfQualita' => 3,
        'corpo' => 1, 'equilibrio' => 2, 'gusIntensita' => 2, 'pai' => 3,
        'armonia' => 4, 'statoEvolutivo' => 1,
    ];
    if (!$scores) return null;
    $total = 0;
    $any = false;
    foreach ($factors as $k => $f) {
        if (isset($scores[$k]) && $scores[$k] !== null) {
            $total += max(0, min(4, (int)$scores[$k])) * $f;
            $any = true;
        }
    }
    return $any ? $total : null;
}

function json_field($v): ?string
{
    return is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : null;
}

function save_record(PDO $pdo, array $body): void
{
    $w = $body['wine'] ?? null;
    $t = $body['tasting'] ?? null;
    if (!is_array($w) || !is_array($t)) json_error('Dati mancanti');

    $nome = str_or_null($w['nome'] ?? null, 200);
    if ($nome === null) json_error('Il nome del vino è obbligatorio');

    $data = (string)($t['data'] ?? '');
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) $data = date('Y-m-d');

    $colore = in_array($w['colore'] ?? null, COLORI, true) ? $w['colore'] : null;
    $tipologia = is_array($w['tipologia'] ?? null)
        ? implode(',', array_map(fn($x) => str_replace(',', ' ', (string)$x), $w['tipologia']))
        : '';

    $wineParams = [
        $nome,
        str_or_null($w['produttore'] ?? null, 200) ?? '',
        int_or_null($w['annata'] ?? null),
        float_or_null($w['grado'] ?? null),
        $colore,
        mb_substr($tipologia, 0, 255),
        str_or_null($w['classificazione'] ?? null, 20),
        str_or_null($w['regione'] ?? null, 100),
        str_or_null($w['specifiche'] ?? null),
        str_or_null($w['vitigni'] ?? null),
        str_or_null($w['note'] ?? null),
    ];

    $scoring = !empty($t['punteggioAttivo']);
    $punteggi = is_array($t['punteggi'] ?? null) ? $t['punteggi'] : null;
    $tastingParams = [
        $data,
        str_or_null($t['note'] ?? null),
        json_field($t['visivo'] ?? null),
        json_field($t['olfattivo'] ?? null),
        json_field($t['gustativo'] ?? null),
        json_field($t['finale'] ?? null),
        $scoring ? 1 : 0,
        json_field($punteggi),
        $scoring ? compute_total($punteggi) : null,
    ];

    $pdo->beginTransaction();
    try {
        // --- vino ---
        $wineId = (int)($w['id'] ?? 0);
        if ($wineId > 0) {
            $st = $pdo->prepare('UPDATE wines SET nome=?, produttore=?, annata=?, grado=?, colore=?, tipologia=?,
                                 classificazione=?, regione=?, specifiche=?, vitigni=?, note=? WHERE id=?');
            $st->execute([...$wineParams, $wineId]);
            $exists = $pdo->prepare('SELECT 1 FROM wines WHERE id = ?');
            $exists->execute([$wineId]);
            if (!$exists->fetch()) $wineId = 0;
        }
        if ($wineId <= 0) {
            $st = $pdo->prepare('INSERT INTO wines (nome, produttore, annata, grado, colore, tipologia,
                                 classificazione, regione, specifiche, vitigni, note) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
            $st->execute($wineParams);
            $wineId = (int)$pdo->lastInsertId();
        }

        // --- degustazione ---
        $tastingId = (int)($t['id'] ?? 0);
        if ($tastingId > 0) {
            $st = $pdo->prepare('UPDATE tastings SET wine_id=?, data=?, note=?, esame_visivo=?, esame_olfattivo=?,
                                 esame_gustativo=?, considerazioni=?, punteggio_attivo=?, punteggi=?, totale=? WHERE id=?');
            $st->execute([$wineId, ...$tastingParams, $tastingId]);
            $exists = $pdo->prepare('SELECT 1 FROM tastings WHERE id = ?');
            $exists->execute([$tastingId]);
            if (!$exists->fetch()) $tastingId = 0;
        }
        if ($tastingId <= 0) {
            $st = $pdo->prepare('INSERT INTO tastings (wine_id, data, note, esame_visivo, esame_olfattivo,
                                 esame_gustativo, considerazioni, punteggio_attivo, punteggi, totale)
                                 VALUES (?,?,?,?,?,?,?,?,?,?)');
            $st->execute([$wineId, ...$tastingParams]);
            $tastingId = (int)$pdo->lastInsertId();
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Tastevin save: ' . $e->getMessage());
        json_error('Errore durante il salvataggio', 500);
    }

    json_out(load_record($pdo, $tastingId));
}
