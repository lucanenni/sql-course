// I tre dataset del corso. Ogni valore è una stringa SQL (schema + dati) che
// viene eseguita su un database SQLite usa-e-getta prima di ogni esercizio.
//
//   negozio    -> dominio del percorso principale (capitoli 0–10)
//   biblioteca -> palestra guidata
//   musica     -> palestra guidata
//
// Dati piccoli ma sufficienti perché GROUP BY, JOIN e HAVING abbiano senso.
// Titoli e nomi sono inventati.

const negozio = `
CREATE TABLE clienti (
  id           INTEGER PRIMARY KEY,
  nome         TEXT    NOT NULL,
  citta        TEXT    NOT NULL,
  eta          INTEGER,
  iscritto_il  TEXT    NOT NULL
);
INSERT INTO clienti (id, nome, citta, eta, iscritto_il) VALUES
  (1, 'Anna Ferri',      'Torino',  34, '2022-03-11'),
  (2, 'Bruno Sala',      'Milano',  51, '2021-07-02'),
  (3, 'Carla Neri',      'Torino',  28, '2023-01-19'),
  (4, 'Dario Costa',     'Genova',  45, '2020-11-30'),
  (5, 'Elena Bruni',     'Milano',  39, '2022-09-05'),
  (6, 'Franco Villa',    'Bologna', 62, '2019-05-14'),
  (7, 'Giada Monti',     'Torino',  23, '2023-06-28'),
  (8, 'Ivan Greco',      'Genova',  30, '2021-02-17'),
  (9, 'Sara Longo',      'Bologna', 41, '2023-08-20');

CREATE TABLE prodotti (
  id         INTEGER PRIMARY KEY,
  nome       TEXT    NOT NULL,
  categoria  TEXT    NOT NULL,
  prezzo     REAL    NOT NULL,
  scorta     INTEGER NOT NULL
);
INSERT INTO prodotti (id, nome, categoria, prezzo, scorta) VALUES
  (1,  'Tazza in ceramica',    'Cucina',       9.50,  120),
  (2,  'Quaderno A5',          'Cancelleria',  4.00,  300),
  (3,  'Penna gel nera',       'Cancelleria',  1.80,  500),
  (4,  'Lampada da tavolo',    'Casa',        29.90,   40),
  (5,  'Cuffie wireless',      'Elettronica', 59.00,   25),
  (6,  'Mouse ottico',         'Elettronica', 14.90,   80),
  (7,  'Bottiglia termica',    'Cucina',      18.50,   60),
  (8,  'Zaino urbano',         'Accessori',   44.00,   35),
  (9,  'Set di adesivi',       'Cancelleria',  3.20,  210),
  (10, 'Tappetino mouse',      'Elettronica',  7.00,    0);

CREATE TABLE ordini (
  id          INTEGER PRIMARY KEY,
  cliente_id  INTEGER NOT NULL REFERENCES clienti(id),
  data        TEXT    NOT NULL,
  stato       TEXT    NOT NULL
);
INSERT INTO ordini (id, cliente_id, data, stato) VALUES
  (1,  1, '2023-02-01', 'consegnato'),
  (2,  1, '2023-05-12', 'consegnato'),
  (3,  2, '2023-03-08', 'spedito'),
  (4,  3, '2023-03-22', 'consegnato'),
  (5,  3, '2023-07-19', 'annullato'),
  (6,  4, '2023-01-15', 'consegnato'),
  (7,  5, '2023-06-30', 'in lavorazione'),
  (8,  5, '2023-08-04', 'spedito'),
  (9,  6, '2023-04-11', 'consegnato'),
  (10, 7, '2023-09-01', 'in lavorazione'),
  (11, 2, '2023-09-14', 'consegnato'),
  (12, 8, '2023-05-27', 'consegnato');

CREATE TABLE righe_ordine (
  id           INTEGER PRIMARY KEY,
  ordine_id    INTEGER NOT NULL REFERENCES ordini(id),
  prodotto_id  INTEGER NOT NULL REFERENCES prodotti(id),
  quantita     INTEGER NOT NULL
);
INSERT INTO righe_ordine (id, ordine_id, prodotto_id, quantita) VALUES
  (1,  1, 2, 3),
  (2,  1, 3, 5),
  (3,  2, 5, 1),
  (4,  2, 6, 1),
  (5,  3, 4, 2),
  (6,  4, 1, 4),
  (7,  4, 7, 1),
  (8,  5, 8, 1),
  (9,  6, 3, 10),
  (10, 6, 9, 4),
  (11, 7, 5, 2),
  (12, 8, 6, 3),
  (13, 8, 10, 1),
  (14, 9, 1, 2),
  (15, 9, 2, 2),
  (16, 10, 8, 1),
  (17, 11, 7, 2),
  (18, 11, 1, 1),
  (19, 12, 4, 1),
  (20, 12, 5, 1),
  (21, 12, 3, 3);
`;

const biblioteca = `
CREATE TABLE autori (
  id            INTEGER PRIMARY KEY,
  nome          TEXT    NOT NULL,
  nazionalita   TEXT    NOT NULL,
  anno_nascita  INTEGER
);
INSERT INTO autori (id, nome, nazionalita, anno_nascita) VALUES
  (1, 'Marta Ligabue',   'italiana',  1965),
  (2, 'Owen Blackwood',  'inglese',   1948),
  (3, 'Sofia Marchetti', 'italiana',  1979),
  (4, 'Henrik Solberg',  'norvegese', 1955),
  (5, 'Clara Fontaine',  'francese',  1971),
  (6, 'Paolo Riva',      'italiana',  1983);

CREATE TABLE libri (
  id         INTEGER PRIMARY KEY,
  titolo     TEXT    NOT NULL,
  autore_id  INTEGER NOT NULL REFERENCES autori(id),
  anno       INTEGER NOT NULL,
  genere     TEXT    NOT NULL,
  copie      INTEGER NOT NULL
);
INSERT INTO libri (id, titolo, autore_id, anno, genere, copie) VALUES
  (1,  'La stanza di sabbia',      1, 2001, 'romanzo',      3),
  (2,  'Nebbia sul porto',         1, 2010, 'giallo',       2),
  (3,  'Il calcolo delle maree',   2, 1994, 'saggio',       1),
  (4,  'Rotte polari',             4, 1988, 'avventura',    4),
  (5,  'La casa vuota',            3, 2015, 'giallo',       5),
  (6,  'Piccola teoria del tempo', 2, 2003, 'saggio',       2),
  (7,  'Lettere da Oslo',          4, 2007, 'romanzo',      2),
  (8,  'Il giardino capovolto',    5, 2012, 'romanzo',      3),
  (9,  'Codici e segreti',         6, 2019, 'saggio',       4),
  (10, 'Ultimo treno per Lione',   5, 2018, 'giallo',       1),
  (11, 'Mattine d''inverno',       3, 2021, 'poesia',       2),
  (12, 'La mappa incompleta',      3, 2022, 'avventura',    3);

CREATE TABLE lettori (
  id           INTEGER PRIMARY KEY,
  nome         TEXT    NOT NULL,
  citta        TEXT    NOT NULL,
  tessera_dal  TEXT    NOT NULL
);
INSERT INTO lettori (id, nome, citta, tessera_dal) VALUES
  (1, 'Luca Bianchi',   'Torino',  '2019-04-10'),
  (2, 'Marina Rossi',   'Milano',  '2020-01-22'),
  (3, 'Nadia Conti',    'Torino',  '2021-09-03'),
  (4, 'Omar Testa',     'Padova',  '2018-11-15'),
  (5, 'Paola Gatti',    'Milano',  '2022-05-30'),
  (6, 'Remo Fabbri',    'Genova',  '2023-02-08');

CREATE TABLE prestiti (
  id          INTEGER PRIMARY KEY,
  libro_id    INTEGER NOT NULL REFERENCES libri(id),
  lettore_id  INTEGER NOT NULL REFERENCES lettori(id),
  preso_il    TEXT    NOT NULL,
  reso_il     TEXT
);
INSERT INTO prestiti (id, libro_id, lettore_id, preso_il, reso_il) VALUES
  (1,  1,  1, '2023-01-05', '2023-01-20'),
  (2,  5,  2, '2023-01-11', '2023-02-01'),
  (3,  4,  1, '2023-02-03', '2023-02-19'),
  (4,  9,  3, '2023-02-14', NULL),
  (5,  2,  4, '2023-03-01', '2023-03-15'),
  (6,  5,  5, '2023-03-09', '2023-03-30'),
  (7,  8,  2, '2023-03-22', '2023-04-10'),
  (8,  3,  6, '2023-04-02', NULL),
  (9,  5,  1, '2023-04-18', '2023-05-02'),
  (10, 12, 3, '2023-05-06', '2023-05-27'),
  (11, 7,  4, '2023-05-20', NULL),
  (12, 10, 5, '2023-06-01', '2023-06-14'),
  (13, 9,  2, '2023-06-15', '2023-07-05'),
  (14, 1,  6, '2023-07-01', NULL),
  (15, 4,  3, '2023-07-12', '2023-07-29');
`;

const musica = `
CREATE TABLE artisti (
  id     INTEGER PRIMARY KEY,
  nome   TEXT    NOT NULL,
  paese  TEXT    NOT NULL,
  genere TEXT    NOT NULL
);
INSERT INTO artisti (id, nome, paese, genere) VALUES
  (1, 'Le Correnti',      'Italia',  'indie'),
  (2, 'Aran Powers',      'Irlanda', 'rock'),
  (3, 'Nordwind',         'Germania','elettronica'),
  (4, 'Marisol Vega',     'Spagna',  'pop'),
  (5, 'The Paper Boats',  'USA',     'folk'),
  (6, 'Kenji Aoki',       'Giappone','jazz'),
  (7, 'Zoe Hart',         'USA',     'pop');

CREATE TABLE album (
  id         INTEGER PRIMARY KEY,
  titolo     TEXT    NOT NULL,
  artista_id INTEGER NOT NULL REFERENCES artisti(id),
  anno       INTEGER NOT NULL
);
INSERT INTO album (id, titolo, artista_id, anno) VALUES
  (1,  'Fari spenti',        1, 2018),
  (2,  'Onde lunghe',        1, 2022),
  (3,  'Stone Garden',       2, 2015),
  (4,  'Hollow Year',        2, 2020),
  (5,  'Signale',            3, 2019),
  (6,  'Kaltlicht',          3, 2023),
  (7,  'Mediodía',           4, 2021),
  (8,  'Paper Trails',       5, 2017),
  (9,  'River and Rust',     5, 2022),
  (10, 'Blue Lantern',       6, 2016),
  (11, 'First Light',        7, 2019);

CREATE TABLE tracce (
  id          INTEGER PRIMARY KEY,
  titolo      TEXT    NOT NULL,
  album_id    INTEGER NOT NULL REFERENCES album(id),
  durata_sec  INTEGER NOT NULL
);
INSERT INTO tracce (id, titolo, album_id, durata_sec) VALUES
  (1,  'Partenza',         1, 194),
  (2,  'Molo nord',        1, 231),
  (3,  'Controluce',       1, 178),
  (4,  'Alta marea',       2, 252),
  (5,  'Riflesso',         2, 205),
  (6,  'Salsedine',        2, 289),
  (7,  'Granite',          3, 241),
  (8,  'Moss',             3, 199),
  (9,  'Quarry Road',      4, 263),
  (10, 'Hollow',           4, 220),
  (11, 'Static Bloom',     4, 187),
  (12, 'Erster Kontakt',   5, 300),
  (13, 'Nachtbus',         5, 274),
  (14, 'Kaltlicht',        6, 318),
  (15, 'Signalrausch',     6, 256),
  (16, 'Verano',           7, 198),
  (17, 'La Ola',           7, 212),
  (18, 'Cometa',           7, 176),
  (19, 'Old Pier',         8, 224),
  (20, 'Folded Map',       8, 241),
  (21, 'River',            9, 267),
  (22, 'Rust',             9, 233),
  (23, 'Driftwood',        9, 209),
  (24, 'Lantern Song',    10, 288),
  (25, 'Midnight Blue',   10, 331),
  (26, 'Dawn',            11, 201),
  (27, 'Paper Kite',      11, 236);

CREATE TABLE ascolti (
  id            INTEGER PRIMARY KEY,
  traccia_id    INTEGER NOT NULL REFERENCES tracce(id),
  utente        TEXT    NOT NULL,
  ascoltato_il  TEXT    NOT NULL
);
INSERT INTO ascolti (id, traccia_id, utente, ascoltato_il) VALUES
  (1,  1,  'sara',  '2023-06-01'),
  (2,  4,  'sara',  '2023-06-01'),
  (3,  4,  'sara',  '2023-06-03'),
  (4,  12, 'diego', '2023-06-02'),
  (5,  13, 'diego', '2023-06-02'),
  (6,  7,  'lea',   '2023-06-04'),
  (7,  9,  'lea',   '2023-06-04'),
  (8,  9,  'lea',   '2023-06-10'),
  (9,  16, 'sara',  '2023-06-05'),
  (10, 17, 'sara',  '2023-06-05'),
  (11, 24, 'diego', '2023-06-06'),
  (12, 25, 'diego', '2023-06-07'),
  (13, 25, 'diego', '2023-06-11'),
  (14, 25, 'lea',   '2023-06-12'),
  (15, 2,  'lea',   '2023-06-08'),
  (16, 5,  'sara',  '2023-06-09'),
  (17, 6,  'sara',  '2023-06-09'),
  (18, 21, 'diego', '2023-06-13'),
  (19, 21, 'sara',  '2023-06-14'),
  (20, 22, 'lea',   '2023-06-15'),
  (21, 14, 'diego', '2023-06-16'),
  (22, 14, 'diego', '2023-06-18'),
  (23, 19, 'lea',   '2023-06-17'),
  (24, 20, 'lea',   '2023-06-17'),
  (25, 1,  'diego', '2023-06-19'),
  (26, 3,  'sara',  '2023-06-20'),
  (27, 10, 'lea',   '2023-06-21'),
  (28, 16, 'diego', '2023-06-22'),
  (29, 24, 'sara',  '2023-06-23'),
  (30, 4,  'lea',   '2023-06-24');
`;

export const DATASETS = { negozio, biblioteca, musica };

// Etichette leggibili per l'intestazione del playground.
export const DATASET_LABELS = {
    negozio: 'Negozio online',
    biblioteca: 'Biblioteca',
    musica: 'Musica',
};
