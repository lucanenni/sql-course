// Esercizi ed esempi dei capitoli.
//
// Campi:
//   dataset      chiave in datasets.js  (default: 'negozio')
//   initialCode  SQL di partenza (template literal, nessun escaping)
//   solution     una query corretta. Serve al build (calcola il risultato
//                atteso, che finisce in COURSE_DATA) e al self-test.
//                Senza 'solution' il blocco è un semplice esempio eseguibile.
//   ordered      forza il confronto ordinato/non ordinato (default: true se la
//                soluzione contiene ORDER BY)
//   verify       query eseguita DOPO il codice; il suo risultato è quello da
//                confrontare. Per esercizi INSERT / UPDATE / DELETE.
//   checks       [{ label, assert }] — assert è un'espressione booleana JS con
//                `rows` (righe come oggetti) e `cols` (nomi colonna minuscoli).
//   hint         suggerimento (HTML)

export const EXERCISES = {

  // ══ Capitolo 0 ═══════════════════════════════════════════════════════════
  'c0-prova': {
    initialCode: `-- Le righe che iniziano con -- sono commenti: il database le ignora.
-- Premi "esegui" (o Ctrl/Cmd+Invio) per lanciare la query.

SELECT 'Ciao, database!' AS saluto;
`,
  },
  'c0-guarda-tabella': {
    initialCode: `-- Cambia "clienti" con "prodotti", poi premi "esegui": guarda come cambia
-- la tabella a destra.
SELECT * FROM clienti;
`,
  },

  // ══ Capitolo 1 · SELECT ══════════════════════════════════════════════════
  'c1-select-stella': {
    initialCode: `-- Mostra TUTTE le colonne e TUTTE le righe della tabella prodotti.
SELECT
`,
    solution: `SELECT * FROM prodotti;`,
    hint: 'La forma è <code>SELECT * FROM prodotti;</code> — l\'asterisco vuol dire "tutte le colonne".',
  },
  'c1-colonne': {
    initialCode: `-- Dalla tabella prodotti, mostra solo le colonne nome e prezzo.
SELECT nome
FROM prodotti;
`,
    solution: `SELECT nome, prezzo FROM prodotti;`,
    checks: [
      { label: 'Esattamente due colonne: nome e prezzo', assert: "cols.length === 2 && cols.includes('nome') && cols.includes('prezzo')" },
    ],
    hint: 'Le colonne si elencano separate da virgola: <code>SELECT nome, prezzo FROM prodotti;</code>.',
  },
  'c1-clienti': {
    initialCode: `-- Mostra nome e città di tutti i clienti.
SELECT
FROM clienti;
`,
    solution: `SELECT nome, citta FROM clienti;`,
    hint: 'La colonna della città si chiama <code>citta</code> (senza accento).',
  },

  // ══ Capitolo 2 · WHERE ═══════════════════════════════════════════════════
  'c2-categoria': {
    initialCode: `-- Solo i prodotti della categoria 'Elettronica'.
SELECT nome, categoria, prezzo
FROM prodotti
WHERE
`,
    solution: `SELECT nome, categoria, prezzo FROM prodotti WHERE categoria = 'Elettronica';`,
    hint: 'Il testo va tra apici singoli: <code>WHERE categoria = \'Elettronica\'</code>.',
  },
  'c2-prezzo': {
    initialCode: `-- Solo i prodotti che costano meno di 10 euro.
SELECT nome, prezzo
FROM prodotti
WHERE prezzo
`,
    solution: `SELECT nome, prezzo FROM prodotti WHERE prezzo < 10;`,
    hint: 'I numeri si scrivono senza apici: <code>WHERE prezzo &lt; 10</code>.',
  },
  'c2-and': {
    initialCode: `-- Prodotti di 'Cancelleria' che costano meno di 4 euro.
SELECT nome, categoria, prezzo
FROM prodotti
WHERE categoria = 'Cancelleria'
`,
    solution: `SELECT nome, categoria, prezzo FROM prodotti WHERE categoria = 'Cancelleria' AND prezzo < 4;`,
    hint: 'Unisci due condizioni con <code>AND</code>: entrambe devono essere vere.',
  },
  'c2-in': {
    initialCode: `-- Clienti che vivono a Torino oppure a Genova.
-- Prova a usare IN (...) invece di due condizioni con OR.
SELECT nome, citta
FROM clienti
WHERE
`,
    solution: `SELECT nome, citta FROM clienti WHERE citta IN ('Torino', 'Genova');`,
    hint: '<code>WHERE citta IN (\'Torino\', \'Genova\')</code> è più corto di <code>citta = \'Torino\' OR citta = \'Genova\'</code>.',
  },
  'c2-between': {
    initialCode: `-- Prodotti con prezzo compreso fra 5 e 20 euro (estremi inclusi).
SELECT nome, prezzo
FROM prodotti
WHERE prezzo
`,
    solution: `SELECT nome, prezzo FROM prodotti WHERE prezzo BETWEEN 5 AND 20;`,
    hint: '<code>BETWEEN 5 AND 20</code> include sia 5 sia 20.',
  },
  'c2-like': {
    initialCode: `-- Prodotti il cui nome contiene la parola "mouse".
-- % sta per "una sequenza qualsiasi di caratteri".
SELECT nome
FROM prodotti
WHERE nome LIKE
`,
    solution: `SELECT nome FROM prodotti WHERE nome LIKE '%mouse%';`,
    hint: "<code>LIKE '%mouse%'</code>: % prima e dopo perché la parola può stare in mezzo.",
  },

  // ══ Capitolo 3 · ORDER BY / LIMIT ════════════════════════════════════════
  'c3-order': {
    initialCode: `-- Tutti i prodotti, dal più economico al più caro.
SELECT nome, prezzo
FROM prodotti
ORDER BY
`,
    solution: `SELECT nome, prezzo FROM prodotti ORDER BY prezzo;`,
    hint: '<code>ORDER BY prezzo</code> ordina in modo crescente (è il default, <code>ASC</code>).',
  },
  'c3-desc': {
    initialCode: `-- Tutti i prodotti, dal più caro al più economico.
SELECT nome, prezzo
FROM prodotti
ORDER BY prezzo
`,
    solution: `SELECT nome, prezzo FROM prodotti ORDER BY prezzo DESC;`,
    hint: 'Aggiungi <code>DESC</code> dopo il nome della colonna.',
  },
  'c3-limit': {
    initialCode: `-- I 3 prodotti più cari.
SELECT nome, prezzo
FROM prodotti
ORDER BY prezzo DESC
`,
    solution: `SELECT nome, prezzo FROM prodotti ORDER BY prezzo DESC LIMIT 3;`,
    hint: '<code>LIMIT 3</code> tiene solo le prime 3 righe — che, dopo l\'ordinamento, sono le più care.',
  },
  'c3-order2': {
    initialCode: `-- Clienti ordinati per città (A→Z) e, a parità di città, per età crescente.
SELECT nome, citta, eta
FROM clienti
ORDER BY
`,
    solution: `SELECT nome, citta, eta FROM clienti ORDER BY citta, eta;`,
    hint: 'Due criteri separati da virgola: <code>ORDER BY citta, eta</code>. Il secondo conta solo a parità di primo.',
  },

  // ══ Capitolo 4 · espressioni e alias ═════════════════════════════════════
  'c4-alias': {
    initialCode: `-- Per ogni prodotto: il nome e il prezzo con IVA al 22%.
-- Chiama la colonna calcolata "prezzo_ivato".
SELECT nome, prezzo * 1.22
FROM prodotti;
`,
    solution: `SELECT nome, prezzo * 1.22 AS prezzo_ivato FROM prodotti;`,
    checks: [
      { label: "La colonna calcolata si chiama 'prezzo_ivato'", assert: "cols.includes('prezzo_ivato')" },
    ],
    hint: 'Dai un nome alla colonna con <code>AS</code>: <code>prezzo * 1.22 AS prezzo_ivato</code>.',
  },
  'c4-magazzino': {
    initialCode: `-- Valore della merce in magazzino per ogni prodotto: prezzo × scorta.
-- Colonna calcolata: "valore".
SELECT nome, prezzo, scorta,
FROM prodotti;
`,
    solution: `SELECT nome, prezzo, scorta, prezzo * scorta AS valore FROM prodotti;`,
    checks: [
      { label: "C'è la colonna 'valore'", assert: "cols.includes('valore')" },
    ],
    hint: 'Puoi moltiplicare due colonne fra loro: <code>prezzo * scorta AS valore</code>.',
  },
  'c4-round': {
    initialCode: `-- Come sopra, ma il prezzo con IVA arrotondato a 2 decimali.
-- Colonna: "ivato".
SELECT nome, round(prezzo * 1.22)
FROM prodotti;
`,
    solution: `SELECT nome, round(prezzo * 1.22, 2) AS ivato FROM prodotti;`,
    checks: [
      { label: "C'è la colonna 'ivato'", assert: "cols.includes('ivato')" },
    ],
    hint: '<code>round(valore, 2)</code>: il secondo argomento è il numero di decimali.',
  },
  'c4-concat': {
    initialCode: `-- Un'etichetta per ogni cliente, tipo:  Anna Ferri (Torino)
-- L'operatore || unisce (concatena) stringhe. Colonna: "etichetta".
SELECT
FROM clienti;
`,
    solution: `SELECT nome || ' (' || citta || ')' AS etichetta FROM clienti;`,
    checks: [
      { label: "C'è la colonna 'etichetta'", assert: "cols.includes('etichetta')" },
      { label: 'Il formato è "Nome (Citta)"', assert: "rows.length > 0 && /\\(.+\\)$/.test(rows[0].etichetta)" },
    ],
    hint: "Concatena pezzo per pezzo: <code>nome || ' (' || citta || ')'</code>.",
  },

  // ══ Capitolo 5 · aggregazioni ════════════════════════════════════════════
  'c5-count': {
    initialCode: `-- Quanti ordini ci sono in tutto? Colonna: "n".
SELECT
FROM ordini;
`,
    solution: `SELECT count(*) AS n FROM ordini;`,
    checks: [{ label: "Una sola riga, colonna 'n'", assert: "rows.length === 1 && cols.includes('n')" }],
    hint: '<code>count(*)</code> conta le righe. Dagli un nome con <code>AS n</code>.',
  },
  'c5-distinct': {
    initialCode: `-- In quante città diverse abitano i clienti? Colonna: "citta_diverse".
SELECT count(
FROM clienti;
`,
    solution: `SELECT count(DISTINCT citta) AS citta_diverse FROM clienti;`,
    checks: [{ label: "Colonna 'citta_diverse'", assert: "cols.includes('citta_diverse')" }],
    hint: '<code>count(DISTINCT citta)</code> conta i valori distinti della colonna.',
  },
  'c5-sum': {
    initialCode: `-- Quanti pezzi sono stati ordinati in totale (somma delle quantità)? Colonna: "pezzi".
SELECT
FROM righe_ordine;
`,
    solution: `SELECT sum(quantita) AS pezzi FROM righe_ordine;`,
    checks: [{ label: "Colonna 'pezzi'", assert: "cols.includes('pezzi')" }],
    hint: '<code>sum(quantita)</code> somma i valori della colonna.',
  },
  'c5-avg': {
    initialCode: `-- Prezzo medio dei prodotti, arrotondato a 2 decimali. Colonna: "prezzo_medio".
SELECT
FROM prodotti;
`,
    solution: `SELECT round(avg(prezzo), 2) AS prezzo_medio FROM prodotti;`,
    checks: [{ label: "Colonna 'prezzo_medio'", assert: "cols.includes('prezzo_medio')" }],
    hint: 'Puoi annidare le funzioni: <code>round(avg(prezzo), 2)</code>.',
  },
  'c5-minmax': {
    initialCode: `-- Prezzo minimo e massimo fra tutti i prodotti.
-- Colonne: "min_prezzo" e "max_prezzo".
SELECT
FROM prodotti;
`,
    solution: `SELECT min(prezzo) AS min_prezzo, max(prezzo) AS max_prezzo FROM prodotti;`,
    checks: [{ label: "Colonne 'min_prezzo' e 'max_prezzo'", assert: "cols.includes('min_prezzo') && cols.includes('max_prezzo')" }],
    hint: 'Puoi mettere più aggregati nella stessa <code>SELECT</code>: <code>min(prezzo) AS min_prezzo, max(prezzo) AS max_prezzo</code>.',
  },

  // ══ Capitolo 6 · GROUP BY / HAVING ═══════════════════════════════════════
  'c6-group': {
    initialCode: `-- Quanti prodotti ci sono per ciascuna categoria?
-- Colonne: "categoria" e "n".
SELECT categoria, count(*) AS n
FROM prodotti
`,
    solution: `SELECT categoria, count(*) AS n FROM prodotti GROUP BY categoria;`,
    hint: '<code>GROUP BY categoria</code>: una riga di risultato per ogni categoria diversa.',
  },
  'c6-avg-group': {
    initialCode: `-- Prezzo medio per categoria (arrotondato a 2 decimali).
-- Colonne: "categoria" e "media".
SELECT categoria,
FROM prodotti
GROUP BY categoria;
`,
    solution: `SELECT categoria, round(avg(prezzo), 2) AS media FROM prodotti GROUP BY categoria;`,
    checks: [{ label: "Colonne 'categoria' e 'media'", assert: "cols.includes('categoria') && cols.includes('media')" }],
    hint: "L'aggregato si calcola dentro ogni gruppo: <code>round(avg(prezzo), 2) AS media</code>.",
  },
  'c6-per-cliente': {
    initialCode: `-- Numero di ordini per cliente.
-- Colonne: "cliente_id" e "ordini".
SELECT cliente_id,
FROM ordini
GROUP BY cliente_id;
`,
    solution: `SELECT cliente_id, count(*) AS ordini FROM ordini GROUP BY cliente_id;`,
    checks: [{ label: "Colonna 'ordini'", assert: "cols.includes('ordini')" }],
    hint: 'Raggruppa per <code>cliente_id</code> e conta le righe di ogni gruppo.',
  },
  'c6-having': {
    initialCode: `-- Solo le categorie che hanno almeno 3 prodotti.
-- Colonne: "categoria" e "n".
SELECT categoria, count(*) AS n
FROM prodotti
GROUP BY categoria
`,
    solution: `SELECT categoria, count(*) AS n FROM prodotti GROUP BY categoria HAVING count(*) >= 3;`,
    hint: '<code>HAVING</code> filtra i gruppi dopo il raggruppamento (dove <code>WHERE</code> non può arrivare): <code>HAVING count(*) &gt;= 3</code>.',
  },
  'c6-stati': {
    initialCode: `-- Numero di ordini per stato, dal più frequente al meno frequente.
-- Colonne: "stato" e "n".
SELECT stato, count(*) AS n
FROM ordini
GROUP BY stato
ORDER BY
`,
    solution: `SELECT stato, count(*) AS n FROM ordini GROUP BY stato ORDER BY n DESC;`,
    hint: "Puoi ordinare per il nome dell'alias: <code>ORDER BY n DESC</code>.",
  },

  // ══ Capitolo 7 · JOIN ════════════════════════════════════════════════════
  'c7-join': {
    initialCode: `-- Per ogni ordine: il suo id e il nome del cliente che l'ha fatto.
-- Collega ordini.cliente_id con clienti.id.
SELECT ordini.id, clienti.nome
FROM ordini
JOIN clienti ON
`,
    solution: `SELECT ordini.id, clienti.nome FROM ordini JOIN clienti ON clienti.id = ordini.cliente_id;`,
    hint: 'La condizione di join dice quali righe si corrispondono: <code>ON clienti.id = ordini.cliente_id</code>.',
  },
  'c7-join-where': {
    initialCode: `-- Nome del prodotto e quantità, solo per le righe d'ordine con quantità >= 3.
-- Colonne: "nome" e "quantita".
SELECT prodotti.nome, righe_ordine.quantita
FROM righe_ordine
JOIN prodotti ON prodotti.id = righe_ordine.prodotto_id
WHERE
`,
    solution: `SELECT prodotti.nome, righe_ordine.quantita FROM righe_ordine JOIN prodotti ON prodotti.id = righe_ordine.prodotto_id WHERE righe_ordine.quantita >= 3;`,
    hint: 'Il <code>WHERE</code> si scrive dopo il <code>JOIN</code> e può usare colonne di entrambe le tabelle.',
  },
  'c7-join-agg': {
    initialCode: `-- Quanti ordini ha fatto ogni cliente, col suo nome.
-- Colonne: "nome" e "ordini". Includi solo i clienti che hanno ordini.
SELECT clienti.nome, count(*) AS ordini
FROM ordini
JOIN clienti ON clienti.id = ordini.cliente_id
GROUP BY
`,
    solution: `SELECT clienti.nome, count(*) AS ordini FROM ordini JOIN clienti ON clienti.id = ordini.cliente_id GROUP BY clienti.id;`,
    checks: [{ label: "Colonne 'nome' e 'ordini'", assert: "cols.includes('nome') && cols.includes('ordini')" }],
    hint: 'Prima unisci le tabelle, poi raggruppa: <code>GROUP BY clienti.id</code>.',
  },
  'c7-left': {
    initialCode: `-- I clienti che NON hanno mai fatto un ordine.
-- Con LEFT JOIN i clienti senza ordini restano, con le colonne di ordini a NULL.
SELECT clienti.nome
FROM clienti
LEFT JOIN ordini ON ordini.cliente_id = clienti.id
WHERE
`,
    solution: `SELECT clienti.nome FROM clienti LEFT JOIN ordini ON ordini.cliente_id = clienti.id WHERE ordini.id IS NULL;`,
    hint: 'Dopo un <code>LEFT JOIN</code>, "nessuna corrispondenza" si riconosce da <code>ordini.id IS NULL</code>.',
  },

  // ══ Capitolo 8 · sottoquery ══════════════════════════════════════════════
  'c8-scalar': {
    initialCode: `-- I prodotti che costano più della media di tutti i prodotti.
-- Colonne: "nome" e "prezzo".
SELECT nome, prezzo
FROM prodotti
WHERE prezzo > (
`,
    solution: `SELECT nome, prezzo FROM prodotti WHERE prezzo > (SELECT avg(prezzo) FROM prodotti);`,
    hint: 'Una sottoquery fra parentesi che restituisce un solo valore si usa come se fosse un numero: <code>WHERE prezzo &gt; (SELECT avg(prezzo) FROM prodotti)</code>.',
  },
  'c8-in': {
    initialCode: `-- Nome dei clienti che hanno almeno un ordine 'annullato'.
-- Colonna: "nome".
SELECT nome
FROM clienti
WHERE id IN (
`,
    solution: `SELECT nome FROM clienti WHERE id IN (SELECT cliente_id FROM ordini WHERE stato = 'annullato');`,
    hint: 'La sottoquery produce un elenco di <code>cliente_id</code>; <code>IN (...)</code> tiene i clienti il cui id compare in quell\'elenco.',
  },
  'c8-notin': {
    initialCode: `-- Nome dei clienti che non compaiono affatto nella tabella ordini.
-- Colonna: "nome".
SELECT nome
FROM clienti
WHERE id NOT IN (
`,
    solution: `SELECT nome FROM clienti WHERE id NOT IN (SELECT cliente_id FROM ordini);`,
    hint: '<code>NOT IN (...)</code> è l\'opposto: tiene i clienti il cui id NON è nell\'elenco.',
  },
  'c8-from': {
    initialCode: `-- Dalla media dei prezzi per categoria, tieni solo le categorie con media > 10.
-- Colonne: "categoria" e "media".
SELECT categoria, media
FROM (
  SELECT categoria, round(avg(prezzo), 2) AS media
  FROM prodotti
  GROUP BY categoria
)
WHERE
`,
    solution: `SELECT categoria, media FROM (SELECT categoria, round(avg(prezzo), 2) AS media FROM prodotti GROUP BY categoria) WHERE media > 10;`,
    hint: 'Una sottoquery nel <code>FROM</code> è una "tabella temporanea": puoi filtrarla con un <code>WHERE</code> esterno sull\'alias <code>media</code>.',
  },

  // ══ Capitolo 9 · INSERT / UPDATE / DELETE ════════════════════════════════
  'c9-insert': {
    initialCode: `-- Inserisci un nuovo prodotto con questi dati esatti:
--   id 11, nome 'Righello 30cm', categoria 'Cancelleria', prezzo 2.5, scorta 100
INSERT INTO prodotti (id, nome, categoria, prezzo, scorta)
VALUES
`,
    solution: `INSERT INTO prodotti (id, nome, categoria, prezzo, scorta) VALUES (11, 'Righello 30cm', 'Cancelleria', 2.5, 100);`,
    verify: `SELECT * FROM prodotti WHERE id = 11;`,
    hint: "L'ordine dei valori deve seguire l'ordine delle colonne fra parentesi.",
  },
  'c9-update': {
    initialCode: `-- Alza del 10% il prezzo di tutti i prodotti della categoria 'Elettronica'.
UPDATE prodotti
SET prezzo =
WHERE
`,
    solution: `UPDATE prodotti SET prezzo = prezzo * 1.1 WHERE categoria = 'Elettronica';`,
    verify: `SELECT id, round(prezzo, 4) AS prezzo FROM prodotti ORDER BY id;`,
    hint: "<code>SET prezzo = prezzo * 1.1</code> usa il valore attuale. Non dimenticare il <code>WHERE</code>, altrimenti aggiorni tutto.",
  },
  'c9-delete': {
    initialCode: `-- Elimina dalla tabella ordini tutte le righe con stato 'annullato'.
DELETE FROM ordini
WHERE
`,
    solution: `DELETE FROM ordini WHERE stato = 'annullato';`,
    verify: `SELECT count(*) AS rimasti FROM ordini;`,
    hint: 'Stesso <code>WHERE</code> di una <code>SELECT</code>: <code>DELETE FROM ordini WHERE stato = \'annullato\';</code>.',
  },

  // ══ Capitolo 10 · DISTINCT / CASE / UNION ════════════════════════════════
  'c10-distinct': {
    initialCode: `-- L'elenco delle categorie, senza ripetizioni. Colonna: "categoria".
SELECT
FROM prodotti;
`,
    solution: `SELECT DISTINCT categoria FROM prodotti;`,
    checks: [{ label: 'Nessuna categoria ripetuta', assert: "new Set(rows.map(r=>r.categoria)).size === rows.length" }],
    hint: '<code>SELECT DISTINCT categoria</code> elimina i doppioni dal risultato.',
  },
  'c10-case': {
    initialCode: `-- Per ogni prodotto assegna una fascia di prezzo:
--   meno di 10  -> 'economico'
--   fra 10 e 40 -> 'medio'
--   40 o più    -> 'caro'
-- Colonne: "nome", "prezzo", "fascia".
SELECT nome, prezzo,
  CASE
  END AS fascia
FROM prodotti;
`,
    solution: `SELECT nome, prezzo,
  CASE
    WHEN prezzo < 10 THEN 'economico'
    WHEN prezzo < 40 THEN 'medio'
    ELSE 'caro'
  END AS fascia
FROM prodotti;`,
    checks: [{ label: "C'è la colonna 'fascia'", assert: "cols.includes('fascia')" }],
    hint: 'Le <code>WHEN</code> si valutano in ordine: la prima vera vince. <code>ELSE</code> copre tutti gli altri casi.',
  },
  'c10-case-agg': {
    initialCode: `-- In un colpo solo: quanti ordini sono 'consegnato' e quanti in totale.
-- Colonne: "consegnati" e "totali".
SELECT
  sum(CASE WHEN stato = 'consegnato' THEN 1 ELSE 0 END) AS consegnati,
FROM ordini;
`,
    solution: `SELECT
  sum(CASE WHEN stato = 'consegnato' THEN 1 ELSE 0 END) AS consegnati,
  count(*) AS totali
FROM ordini;`,
    checks: [{ label: "Colonne 'consegnati' e 'totali'", assert: "cols.includes('consegnati') && cols.includes('totali')" }],
    hint: 'Un <code>CASE</code> dentro <code>sum(...)</code> conta solo le righe che soddisfano la condizione.',
  },
  'c10-union': {
    initialCode: `-- Un unico elenco con due colonne "nome" e "fascia":
--   i prodotti sotto i 10 euro, etichettati 'sotto 10 euro'
--   i prodotti da 10 euro in su, etichettati 'da 10 euro in su'
SELECT nome, 'sotto 10 euro' AS fascia FROM prodotti WHERE prezzo < 10
UNION ALL
`,
    solution: `SELECT nome, 'sotto 10 euro' AS fascia FROM prodotti WHERE prezzo < 10
UNION ALL
SELECT nome, 'da 10 euro in su' AS fascia FROM prodotti WHERE prezzo >= 10;`,
    hint: '<code>UNION ALL</code> impila i risultati di due <code>SELECT</code> con le stesse colonne.',
  },
  'c10-progetto': {
    initialCode: `-- PROGETTO FINALE
-- Per ogni cliente che ha almeno un ordine 'consegnato':
--   nome, numero di ordini consegnati ("ordini"),
--   totale speso ("totale") = somma di prezzo × quantità, arrotondata a 2 decimali.
-- Ordina dal totale più alto al più basso.
SELECT c.nome,
       count(DISTINCT o.id) AS ordini,
       round(sum(p.prezzo * r.quantita), 2) AS totale
FROM clienti c
JOIN ordini o ON o.cliente_id = c.id AND o.stato = 'consegnato'
JOIN righe_ordine r ON
JOIN prodotti p ON
GROUP BY c.id
ORDER BY
`,
    solution: `SELECT c.nome,
       count(DISTINCT o.id) AS ordini,
       round(sum(p.prezzo * r.quantita), 2) AS totale
FROM clienti c
JOIN ordini o ON o.cliente_id = c.id AND o.stato = 'consegnato'
JOIN righe_ordine r ON r.ordine_id = o.id
JOIN prodotti p ON p.id = r.prodotto_id
GROUP BY c.id
ORDER BY totale DESC;`,
    checks: [{ label: "Colonne 'nome', 'ordini', 'totale'", assert: "cols.includes('nome') && cols.includes('ordini') && cols.includes('totale')" }],
    hint: 'Quattro tabelle in catena. <code>count(DISTINCT o.id)</code> perché ogni ordine ha più righe: senza <code>DISTINCT</code> conteresti le righe, non gli ordini.',
  },

  // ══ Palestra · Biblioteca ════════════════════════════════════════════════
  'pb-select': {
    dataset: 'biblioteca',
    initialCode: `-- Titolo e anno dei libri di genere 'giallo'.
SELECT
FROM libri
WHERE
`,
    solution: `SELECT titolo, anno FROM libri WHERE genere = 'giallo';`,
    hint: 'Come nel capitolo 2: <code>WHERE genere = \'giallo\'</code>.',
  },
  'pb-copie': {
    dataset: 'biblioteca',
    initialCode: `-- I libri di cui la biblioteca ha una sola copia. Colonne: "titolo", "copie".
SELECT titolo, copie
FROM libri
WHERE
`,
    solution: `SELECT titolo, copie FROM libri WHERE copie = 1;`,
    hint: '<code>WHERE copie = 1</code>.',
  },
  'pb-vecchi': {
    dataset: 'biblioteca',
    initialCode: `-- I 3 libri più vecchi. Colonne: "titolo", "anno".
SELECT titolo, anno
FROM libri
ORDER BY
`,
    solution: `SELECT titolo, anno FROM libri ORDER BY anno LIMIT 3;`,
    hint: 'Più vecchi = anno più piccolo: <code>ORDER BY anno</code> (crescente) + <code>LIMIT 3</code>.',
  },
  'pb-conta': {
    dataset: 'biblioteca',
    initialCode: `-- Quanti prestiti sono registrati in tutto? Colonna: "n".
SELECT
FROM prestiti;
`,
    solution: `SELECT count(*) AS n FROM prestiti;`,
    checks: [{ label: "Una riga, colonna 'n'", assert: "rows.length === 1 && cols.includes('n')" }],
    hint: '<code>count(*) AS n</code>.',
  },
  'pb-per-libro': {
    dataset: 'biblioteca',
    initialCode: `-- Numero di prestiti per libro. Colonne: "libro_id", "prestiti".
SELECT libro_id,
FROM prestiti
GROUP BY
`,
    solution: `SELECT libro_id, count(*) AS prestiti FROM prestiti GROUP BY libro_id;`,
    checks: [{ label: "Colonna 'prestiti'", assert: "cols.includes('prestiti')" }],
    hint: '<code>GROUP BY libro_id</code> e conta le righe di ogni gruppo.',
  },
  'pb-join': {
    dataset: 'biblioteca',
    initialCode: `-- Per ogni prestito: titolo del libro e nome del lettore.
-- Colonne: "titolo", "nome".
SELECT libri.titolo, lettori.nome
FROM prestiti
JOIN libri ON
JOIN lettori ON
`,
    solution: `SELECT libri.titolo, lettori.nome
FROM prestiti
JOIN libri ON libri.id = prestiti.libro_id
JOIN lettori ON lettori.id = prestiti.lettore_id;`,
    hint: 'Due join dalla tabella ponte <code>prestiti</code>: uno verso <code>libri</code>, uno verso <code>lettori</code>.',
  },
  'pb-aperti': {
    dataset: 'biblioteca',
    initialCode: `-- I prestiti ancora aperti (mai restituiti: reso_il è NULL).
-- Colonne: "titolo", "nome", "preso_il".
SELECT libri.titolo, lettori.nome, prestiti.preso_il
FROM prestiti
JOIN libri ON libri.id = prestiti.libro_id
JOIN lettori ON lettori.id = prestiti.lettore_id
WHERE
`,
    solution: `SELECT libri.titolo, lettori.nome, prestiti.preso_il
FROM prestiti
JOIN libri ON libri.id = prestiti.libro_id
JOIN lettori ON lettori.id = prestiti.lettore_id
WHERE prestiti.reso_il IS NULL;`,
    hint: '"Valore assente" si controlla con <code>IS NULL</code>, non con <code>= NULL</code>.',
  },
  'pb-prolifici': {
    dataset: 'biblioteca',
    initialCode: `-- Gli autori con più di 2 libri a catalogo.
-- Colonne: "nome", "libri". Ordina dal più prolifico.
SELECT autori.nome, count(*) AS libri
FROM libri
JOIN autori ON autori.id = libri.autore_id
GROUP BY autori.id
HAVING
ORDER BY
`,
    solution: `SELECT autori.nome, count(*) AS libri
FROM libri
JOIN autori ON autori.id = libri.autore_id
GROUP BY autori.id
HAVING count(*) > 2
ORDER BY libri DESC;`,
    hint: '<code>HAVING count(*) &gt; 2</code> filtra i gruppi; <code>ORDER BY libri DESC</code> li ordina.',
  },

  // ══ Palestra · Musica ════════════════════════════════════════════════════
  'pm-tracce': {
    dataset: 'musica',
    initialCode: `-- Titolo e durata (in secondi) delle tracce dell'album con id 1.
SELECT titolo, durata_sec
FROM tracce
WHERE
`,
    solution: `SELECT titolo, durata_sec FROM tracce WHERE album_id = 1;`,
    hint: '<code>WHERE album_id = 1</code>.',
  },
  'pm-lunghe': {
    dataset: 'musica',
    initialCode: `-- Le tracce che durano più di 250 secondi. Colonne: "titolo", "durata_sec".
SELECT titolo, durata_sec
FROM tracce
WHERE
`,
    solution: `SELECT titolo, durata_sec FROM tracce WHERE durata_sec > 250;`,
    hint: '<code>WHERE durata_sec &gt; 250</code>.',
  },
  'pm-top5': {
    dataset: 'musica',
    initialCode: `-- Le 5 tracce più lunghe. Colonne: "titolo", "durata_sec".
SELECT titolo, durata_sec
FROM tracce
ORDER BY
`,
    solution: `SELECT titolo, durata_sec FROM tracce ORDER BY durata_sec DESC LIMIT 5;`,
    hint: '<code>ORDER BY durata_sec DESC</code> + <code>LIMIT 5</code>.',
  },
  'pm-media': {
    dataset: 'musica',
    initialCode: `-- Durata media delle tracce, arrotondata all'intero. Colonna: "media_sec".
SELECT
FROM tracce;
`,
    solution: `SELECT round(avg(durata_sec)) AS media_sec FROM tracce;`,
    checks: [{ label: "Colonna 'media_sec'", assert: "cols.includes('media_sec')" }],
    hint: '<code>round(avg(durata_sec))</code> senza secondo argomento arrotonda all\'intero.',
  },
  'pm-per-album': {
    dataset: 'musica',
    initialCode: `-- Numero di tracce per album. Colonne: "album_id", "tracce".
SELECT album_id,
FROM tracce
GROUP BY
`,
    solution: `SELECT album_id, count(*) AS tracce FROM tracce GROUP BY album_id;`,
    checks: [{ label: "Colonna 'tracce'", assert: "cols.includes('tracce')" }],
    hint: '<code>GROUP BY album_id</code>.',
  },
  'pm-join': {
    dataset: 'musica',
    initialCode: `-- Per ogni traccia: il suo titolo, il titolo dell'album e il nome dell'artista.
-- Colonne: "traccia", "album", "artista".
SELECT tracce.titolo AS traccia, album.titolo AS album, artisti.nome AS artista
FROM tracce
JOIN album ON
JOIN artisti ON
`,
    solution: `SELECT tracce.titolo AS traccia, album.titolo AS album, artisti.nome AS artista
FROM tracce
JOIN album ON album.id = tracce.album_id
JOIN artisti ON artisti.id = album.artista_id;`,
    hint: "Catena di join: <code>tracce → album → artisti</code>. Gli alias <code>AS</code> servono perché tre colonne si chiamano 'titolo'/'nome'.",
  },
  'pm-ascoltate': {
    dataset: 'musica',
    initialCode: `-- Le tracce più ascoltate: titolo e numero di ascolti ("ascolti").
-- Ordina dalla più ascoltata; mostra solo le prime 5.
SELECT tracce.titolo, count(*) AS ascolti
FROM ascolti
JOIN tracce ON tracce.id = ascolti.traccia_id
GROUP BY tracce.id
ORDER BY
`,
    solution: `SELECT tracce.titolo, count(*) AS ascolti
FROM ascolti
JOIN tracce ON tracce.id = ascolti.traccia_id
GROUP BY tracce.id
ORDER BY ascolti DESC
LIMIT 5;`,
    hint: 'Unisci <code>ascolti</code> e <code>tracce</code>, raggruppa per traccia, ordina per <code>ascolti DESC</code>, poi <code>LIMIT 5</code>.',
  },
  'pm-mai-ascoltati': {
    dataset: 'musica',
    initialCode: `-- Gli artisti di cui nessuna traccia è mai stata ascoltata. Colonna: "nome".
-- Suggerimento: parti dall'elenco degli artisti che HANNO ascolti, poi escludilo.
SELECT nome
FROM artisti
WHERE id NOT IN (
`,
    solution: `SELECT nome FROM artisti WHERE id NOT IN (
  SELECT album.artista_id
  FROM ascolti
  JOIN tracce ON tracce.id = ascolti.traccia_id
  JOIN album ON album.id = tracce.album_id
);`,
    hint: 'La sottoquery restituisce gli <code>artista_id</code> che compaiono negli ascolti; <code>NOT IN</code> tiene gli altri.',
  },

};
