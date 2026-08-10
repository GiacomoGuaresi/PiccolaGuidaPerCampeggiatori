# Piccola Guida per Campeggiatori

Piccola webapp statica per raccogliere cheatsheet tascabili (montagna,
trekking, sopravvivenza, meteo, ...). Ogni scheda è pensata per stare su
un cartoncino formato **A5** (148 × 210 mm), consultabile online e
esportabile in PDF — sia singolarmente sia tutte insieme. Le schede sono
pensate per essere stampate: i link vanno scritti per esteso (URL come
testo), non solo come testo cliccabile.

Nessun framework, nessuna build: solo HTML/CSS/JS statico, adatto a
GitHub Pages.

## Struttura

```
index.html              shell dell'app (sidebar + area scheda)
manifest.json           elenco delle schede pubblicate
assets/css/style.css    palette e layout, incluse le regole di stampa A5
assets/js/app.js        carica il manifest, mostra le schede, gestisce l'export
content/                un file .html per ogni scheda (solo frammento, no <html>/<body>)
content/_template.html  traccia di partenza per una nuova scheda (non va in manifest.json)
```

## Aggiungere una nuova scheda

1. Copia `content/_template.html` in `content/<categoria>/<slug>.html`
   (o direttamente in `content/`, i sottocartelle sono solo per ordine).
2. Scrivi il contenuto: è un frammento HTML, verrà iniettato dentro un
   contenitore già dimensionato A5 (`.a5-page`). Ci sono classi pronte
   per titoli (`h2`, `h3`), tag (`<span class="tag">...</span>`) e fonti
   (`<p class="sources">...</p>`, link scritti per esteso per la stampa).
3. Aggiungi una riga in `manifest.json`:

   ```json
   {
     "id": "slug-univoco",
     "title": "Titolo mostrato in sidebar",
     "category": "Montagna",
     "file": "content/montagna/slug.html"
   }
   ```

4. Ricarica la pagina: la scheda compare in sidebar, raggruppata per
   categoria.

Le categorie mostrate per prime in sidebar sono definite in
`CATEGORY_ORDER` dentro `assets/js/app.js`; quelle non elencate finiscono
in coda in ordine alfabetico.

## Sviluppo locale

Le schede vengono caricate via `fetch`, quindi serve un server locale
(aprire `index.html` come `file://` non funziona per via del CORS del
browser):

```bash
python3 -m http.server 8000
# oppure
npx serve .
```

Poi apri `http://localhost:8000`.

## Esportare in PDF

- **Scheda singola**: apri la scheda, premi "Esporta questa scheda
  (PDF)", poi nella finestra di stampa del browser scegli "Salva come
  PDF".
- **Tutte le schede**: premi "Esporta tutte le schede (PDF)" nel footer;
  ogni scheda finisce su una pagina separata.

Le regole `@page { size: 148mm 210mm; }` in `style.css` impostano già il
formato A5. Chrome/Edge rispettano la dimensione custom automaticamente;
Firefox potrebbe richiedere di selezionare "Dimensioni carta gestite
dal sito" nel pannello di stampa.

## Pubblicazione su GitHub Pages

1. Crea la repo su GitHub e pusha questo contenuto sul branch `main`.
2. Impostazioni della repo → Pages → Source: `main`, cartella `/ (root)`.
3. Il file `.nojekyll` è già presente: serve a evitare che GitHub Pages
   provi a processare il sito con Jekyll (altrimenti ignorerebbe file e
   cartelle che iniziano con `_`, come `content/_template.html`).

## Palette

| Colore          | Hex       | Uso                              |
|------------------|-----------|-----------------------------------|
| Nero             | `#1c1b18` | testo principale                  |
| Verde scuro      | `#33432c` | titoli, header, bottoni           |
| Verde scuro 2    | `#263320` | hover bottoni, sottotitoli scheda |
| Tan              | `#c9a876` | bordi, tag, accenti               |
| Tan chiaro       | `#e7d9bd` | sfondo sidebar/hover, tag         |
| Crema            | `#f6f1e6` | sfondo sidebar/footer             |
| Bianco carta     | `#fffdf8` | sfondo scheda                     |
