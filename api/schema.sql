-- Schema database Tastevin (MySQL 5.7+ / MariaDB 10.2+)

CREATE TABLE IF NOT EXISTS wines (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(200) NOT NULL,
  produttore      VARCHAR(200) NOT NULL DEFAULT '',
  annata          SMALLINT UNSIGNED NULL,
  grado           DECIMAL(4,1) NULL,
  colore          ENUM('bianco','rosa','rosso') NULL,
  tipologia       VARCHAR(255) NOT NULL DEFAULT '',   -- valori separati da virgola
  classificazione VARCHAR(20) NULL,
  regione         VARCHAR(100) NULL,
  specifiche      TEXT NULL,
  vitigni         TEXT NULL,
  note            TEXT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_wines_nome (nome),
  KEY idx_wines_produttore (produttore)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tastings (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  wine_id         INT UNSIGNED NOT NULL,
  data            DATE NOT NULL,
  note            TEXT NULL,
  esame_visivo    MEDIUMTEXT NULL,  -- JSON
  esame_olfattivo MEDIUMTEXT NULL,  -- JSON
  esame_gustativo MEDIUMTEXT NULL,  -- JSON
  considerazioni  MEDIUMTEXT NULL,  -- JSON
  punteggio_attivo TINYINT(1) NOT NULL DEFAULT 0,
  punteggi        TEXT NULL,        -- JSON
  totale          TINYINT UNSIGNED NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tastings_data (data),
  CONSTRAINT fk_tastings_wine FOREIGN KEY (wine_id) REFERENCES wines (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
