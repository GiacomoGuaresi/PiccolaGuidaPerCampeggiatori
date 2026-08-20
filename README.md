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
app.webmanifest         manifest PWA (nome, icone, colori dell'app installata)
sw.js                   service worker: cache della shell e di tutte le schede
manifest.json           elenco delle schede pubblicate
assets/css/style.css    palette e layout, incluse le regole di stampa A5
assets/js/app.js        carica il manifest, mostra le schede, gestisce l'export
assets/js/pwa.js        registra il service worker e il bottone "Installa app"
assets/icons/           favicon PNG e icone dell'app installata
scripts/generate_icons.sh  rigenera icone e favicon da assets/favicon.svg
assets/img/icons.svg    sprite SVG delle icone dell'interfaccia (niente emoji)
content/                un file .html per ogni scheda (solo frammento, no <html>/<body>)
content/_template.html  traccia di partenza per una nuova scheda (non va in manifest.json)
```

## Icone

Le icone dell'interfaccia stanno tutte in `assets/img/icons.svg`, uno
sprite di `<symbol>` a tratto 24×24 che ereditano il colore da
`currentColor`. Per usarne una:

```html
<svg class="icon" aria-hidden="true" focusable="false">
  <use href="assets/img/icons.svg#i-print"></use>
</svg>
```

La classe `.icon` (in `style.css`) dimensiona l'icona in `em`, quindi
segue il font-size del bottone che la contiene. I bottoni di stampa
usano una coppia di icone (stampante + foglio / frecce di aggiornamento
/ libro): la seconda va marcata `class="icon icon-sub"`, che la rende
più piccola come pittogramma di specifica. Per aggiungerne una
nuova basta un altro `<symbol id="i-...">` nello sprite. Niente emoji
nell'interfaccia: non sono stampabili in modo prevedibile e cambiano
aspetto da sistema a sistema.

## Installare l'app (PWA)

Il sito è una **PWA**: si può installare sul telefono (o sul desktop) e usare
come una normale app, a schermo intero e **senza rete** — utile visto che le
schede servono proprio dove il segnale non c'è.

- **Android / Chrome / Edge**: compare il bottone **"Installa app"** nel footer
  (evento `beforeinstallprompt`); in alternativa menu del browser →
  "Installa app".
- **iPhone / iPad**: Safari non espone quell'evento, quindi il bottone apre le
  istruzioni manuali — **Condividi** → **Aggiungi a schermata Home**. Da Chrome
  o Firefox su iOS la voce non esiste.

Alla prima visita `sw.js` mette in cache la shell (HTML/CSS/JS, icone, font) e
**tutte le schede elencate in `manifest.json`**: dopo quella visita la guida
funziona completamente offline. Le schede vengono servite dalla cache e
aggiornate in sottofondo (*stale-while-revalidate*), la navigazione prova
prima la rete e ricade sulla copia locale.

Attenzione a due cose:

- il service worker richiede **HTTPS** (GitHub Pages va bene) oppure
  `localhost`: da `file://` non si registra;
- dopo aver modificato la shell (`index.html`, CSS, JS) o il service worker
  stesso, va alzata `CACHE_VERSION` in `sw.js`, altrimenti i browser già
  installati continuano a servire la versione vecchia dalla cache.

### Icone e favicon

Tutte le icone derivano da un unico sorgente, `assets/favicon.svg`. Per
rigenerarle (serve ImageMagick, `brew install imagemagick`):

```bash
./scripts/generate_icons.sh
```

| File                               | Uso                                       |
|------------------------------------|-------------------------------------------|
| `assets/favicon.svg`               | favicon principale (browser moderni)      |
| `assets/favicon.ico`               | fallback 16/32/48 px                      |
| `assets/icons/favicon-16.png`      | tab del browser                           |
| `assets/icons/favicon-32.png`      | tab su schermi hidpi                      |
| `assets/icons/apple-touch-icon.png`| 180 px, schermata Home iOS                |
| `assets/icons/icon-192.png`        | icona PWA                                 |
| `assets/icons/icon-512.png`        | icona PWA / splash screen                 |
| `assets/icons/icon-maskable-512.png`| icona adattiva Android                   |

Due dettagli non ovvi, gestiti dallo script: la variante *maskable* ha il
logo rimpicciolito al 72% su fondo pieno senza angoli arrotondati (Android
ritaglia l'icona a cerchio o squircle, il resto finisce fuori dalla safe
zone), e nelle misure piccole (16/32/48 px) viene tolto il filo di cresta
chiaro, che a quelle dimensioni diventa solo sporco. L'icona Apple è
appiattita su pergamena perché iOS non gestisce la trasparenza.

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

Tutto passa dall'unico pulsante "Stampa" nel footer: si apre un wizard il cui
primo passo è il tipo di stampa.

- **Pagina corrente**: stampa solo la scheda aperta (il ramo è disattivato se
  non c'è nessuna scheda a schermo). Passi: tipo, formato, riepilogo.
- **Libro completo**: contenuto (capitoli o preferiti), capitoli da includere,
  formato (A5 o A4 con 2 schede per foglio), riepilogo con "Esporta PDF".
  Copertina e pagina "Versione stampata" sono aggiunte automaticamente.
- **Aggiornamento stampa**: come il libro, con un passo in più subito dopo il
  tipo, la data dell'ultima stampa: nel PDF finiscono solo le schede con tag
  `agg.` successivo a quella data.

Nella finestra di stampa del browser scegli "Salva come PDF" per ottenere il
file invece della stampa su carta.

## Gesture su telefono e tablet

Sull'area della scheda (non sulla sidebar):

- **Pinch con due dita**: zoom della scheda, fra 50% e 200%, gli stessi limiti
  dei pulsanti +/- nella barra in basso. Il livello raggiunto viene salvato in
  `localStorage` a fine gesto.
- Il tasto con la percentuale, in mezzo ai +/-, sotto i 780px **adatta la
  scheda allo schermo** (il lato più stretto fra larghezza e altezza dell'area
  di lettura) invece di riportare al 100%, che su telefono non ci starebbe
  comunque. Da 780px in su resta un reset al 100%.
- **Swipe orizzontale con un dito**: scheda precedente (verso destra) o
  successiva (verso sinistra), nell'ordine in cui compaiono in sidebar e
  rispettando la ricerca attiva; la sezione Preferiti è esclusa dal ciclo per
  non passare due volte sulla stessa scheda. Gruppo e categoria della nuova
  scheda vengono aperti in sidebar.
- Se lo zoom rende la scheda più larga dello schermo, il trascinamento
  orizzontale la sposta: il cambio scheda scatta solo partendo dal bordo già
  raggiunto.

Lo scorrimento verticale resta quello nativo del browser
(`touch-action: pan-y` su `.content`).

## Preferiti

Ogni scheda in sidebar ha una stella: vuota = non preferita, piena = preferita.
La stessa stella è nella barra in basso, accanto ai controlli di zoom, e agisce
sulla scheda aperta: serve su telefono, dove la sidebar è chiusa mentre si
legge.
Le schede con la stella finiscono nella sezione **Preferiti**, in cima al menu
laterale, e restano lì anche dopo aver chiuso il browser.

L'elenco è salvato in un **cookie** (`preferiti`, un anno di durata, solo id
delle schede separati da virgola), non in localStorage. I cookie hanno un
tetto di ~4 KB: superata la soglia il sito avvisa invece di perdere
silenziosamente dei preferiti.

Nel wizard di stampa, al passo **Contenuto**, si sceglie fra **Capitoli** e
**Preferiti**: con "Preferiti" il passo di selezione dei capitoli non compare
proprio e si stampano solo le schede con la stella — copertina e pagina
"Versione stampata" restano automatiche, e in quest'ultima l'elenco riporta i
titoli delle schede invece delle categorie. Senza nessun preferito l'opzione è
disattivata. Anche questa scelta è ricordata in un cookie
(`stampaSoloPreferiti`).

### Modalità A4 (2 schede per foglio)

Al passo **Formato** del wizard si sceglie fra A5 (una scheda per pagina) e
**A4 (2 schede per foglio)**: quest'ultima impagina due schede A5 affiancate su
un foglio A4 orizzontale (297 × 210 mm), con una linea grigia tratteggiata
al centro come guida di taglio. Se le schede sono in numero dispari,
l'ultima metà foglio resta bianca. La scelta viene ricordata (localStorage)
e vale anche per "Stampa pagina" della singola scheda.

Nella finestra di stampa del browser serve orientamento **orizzontale** e
scala **100%** ("Dimensioni reali", non "Adatta alla pagina"), altrimenti le
schede non escono in formato A5 esatto.

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

Tema "wild" (bosco/terra/pietra). Font: [Oswald](https://fonts.google.com/specimen/Oswald)
per titoli (condensato, maiuscolo), [Space Mono](https://fonts.google.com/specimen/Space+Mono)
per tag e fonti, sans di sistema per il corpo del testo.

| Colore          | Hex       | Uso                                  |
|------------------|-----------|---------------------------------------|
| Inchiostro       | `#1b1a15` | testo principale                      |
| Bosco            | `#2e3b22` | titoli, bottoni                       |
| Bosco scuro      | `#1c2614` | header/footer app, hover bottoni      |
| Muschio          | `#5a6e42` | intestazioni categoria (sidebar)      |
| Terra (bark)     | `#5b4530` | bordi, tag, righe tratteggiate        |
| Ruggine (clay)   | `#b2502e` | accenti, evidenze, dettagli grafici   |
| Pietra           | `#837f6d` | testo secondario, fonti               |
| Pergamena        | `#ece3cf` | sfondo sidebar/footer                 |
| Pergamena scura  | `#dbcda3` | hover sidebar                         |
| Bianco carta     | `#ffffff` | sfondo scheda (stampa)                |
