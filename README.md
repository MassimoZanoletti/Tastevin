# Tastevin

Applicazione web (Angular 19 + PrimeNG 19) per la degustazione guidata del vino secondo il metodo AIS,
ottimizzata per il cellulare. Specifiche in `doc/tastevin.docx`.

## Struttura

| Percorso | Contenuto |
|---|---|
| `src/app/models/ais.ts` | Voci e scale AIS, colori, fattori dei punteggi |
| `src/app/models/tasting.ts` | Modello dati di vino e degustazione, calcolo del totale |
| `src/app/pages/tasting` | Procedura guidata: Vino → Visivo → Olfattivo → Gustativo → Finale → Riepilogo |
| `src/app/pages/archive`, `detail` | Archivio delle degustazioni e dettaglio (modifica / elimina / nuova degustazione dello stesso vino) |
| `src/app/shared` | Selettore a chip, punteggio 0–4, calice colorato, riepilogo |
| `api/` | Web API PHP (PDO) e schema MySQL |

La degustazione in corso viene salvata anche nel browser: ricaricando la pagina non si perde.
Il salvataggio nel database avviene solo se sono stati inseriti i dati del vino (almeno il nome).

## Database e API

1. Creare il database MySQL ed eseguire `api/schema.sql`.
2. Copiare `api/config.sample.php` in `api/config.php` e inserire le credenziali.
   - `cors_origins`: origini ammesse (per lo sviluppo `http://localhost:4200`).
   - `api_key`: facoltativa; se impostata, va messa uguale in `src/environments/environment*.ts`.
3. Caricare la cartella `api/` sul server (PHP 7.4 o superiore, estensione `pdo_mysql`).

Endpoint:

- `GET  api/wines.php?q=…` ricerca vini
- `GET  api/tastings.php?q=…` elenco degustazioni
- `GET  api/tastings.php?id=N` degustazione completa
- `POST api/tastings.php` crea/aggiorna `{ wine, tasting }`
- `DELETE api/tastings.php?id=N` elimina la degustazione

## Sviluppo

```
npm install
npm run serve        # http://localhost:4200
```

In sviluppo le API sono lette da `apiUrl` in `src/environments/environment.development.ts`.

## Pubblicazione

```
npm run production
```

Genera `dist/tastevin/browser/` con l'app, il file `.htaccess` (rotte Angular su Apache) e la cartella `api/`.
In produzione l'app chiama `api/` nella stessa cartella (`src/environments/environment.ts`).
Se l'app non è pubblicata nella radice del sito, compilare con `ng build --base-href /percorso/`.
