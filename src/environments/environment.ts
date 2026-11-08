// Configurazione di produzione: indirizzo delle API PHP sul server.
// Se l'app viene pubblicata su un dominio diverso da www.webporter.it,
// aggiungerlo a cors_origins in config.php sul server.
export const environment = {
  production: true,
  apiUrl: 'https://www.webporter.it/code/bend/tastevin',
  apiKey: '', // deve coincidere con api_key in config.php (vuoto = disattivato)
};
