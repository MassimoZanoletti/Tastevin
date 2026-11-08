<?php
// Copiare questo file in config.php e inserire i dati del database.
// config.php NON va messo sotto controllo di versione.

return [
    'db_host'     => 'localhost',
    'db_port'     => 3306,
    'db_name'     => 'tastevin',
    'db_user'     => 'utente',
    'db_pass'     => 'password',

    // Origini autorizzate a chiamare le API (CORS). '*' = tutte.
    // In sviluppo con "ng serve" aggiungere 'http://localhost:4200'.
    'cors_origins' => ['http://localhost:4200'],

    // Chiave semplice richiesta nell'header X-Api-Key (stringa vuota = nessun controllo).
    // Deve coincidere con apiKey in src/environments/environment*.ts
    'api_key'     => '',
];
