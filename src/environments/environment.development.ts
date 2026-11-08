// Configurazione per "ng serve".
// Le chiamate ad "api/..." vengono girate al server remoto da proxy.conf.json
// (il database accetta connessioni solo dagli script PHP sul server).
export const environment = {
  production: false,
  apiUrl: 'api',
  apiKey: '',
};
