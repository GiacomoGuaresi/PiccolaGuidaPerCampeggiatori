# Piano di riorganizzazione dei contenuti

Stato di partenza: 186 schede + 2 speciali ("Guida"), 22 categorie piatte, sidebar con 22 sezioni.
Obiettivo: passare a un raggruppamento **a due livelli — gruppo (generico) > categoria (specifico)** —
riducendo la navigazione a 6 voci di primo livello, e chiudere alcuni debiti tecnici già presenti.

Le schede già stampate non vincolano nulla: si può spostare, rinominare e riformattare liberamente.

---

## 1. La nuova tassonomia

**6 gruppi, 17 categorie, 186 schede.** Nessuna scheda eliminata, nessuna duplicata (mappatura completa
verificata in appendice: 186/186 assegnate).

| Gruppo | Categorie | Schede |
|---|---|---|
| **Regole e ambiente** | Normativa bivacco (12) · Etica e ambiente (8) | 20 |
| **Attrezzatura** | Tenda e riparo (18) · Sacco a pelo e riposo (12) · Trekking (8) · Cucina e acqua (7) | 45 |
| **Tecnica sul terreno** | Trekking (11) · Vie ferrate (8) · Neve e valanghe (9) · Inverno (5) · Orientamento (7) | 40 |
| **Meteo e natura** | Meteo (9) · Fauna e flora (12) | 21 |
| **Salute e sicurezza** | Salute in montagna (12) · Igiene (4) · Emergenze e soccorso (8) · Sopravvivenza (8) | 32 |
| **Pianificazione e logistica** | Prima di partire (10) · Rifugi e bivacchi fissi (10) · Campeggio e camper (8) | 28 |

Il modello è esattamente quello richiesto: lo stesso nome specifico può comparire sotto generici diversi,
ed è questo a rendere la struttura leggibile invece che ridondante —

```
Attrezzatura      > Trekking      (cosa metto nello zaino)
Tecnica sul terreno > Trekking    (come mi muovo)
Attrezzatura      > Tenda e riparo / Sacco a pelo e riposo   (il "bivacco" come oggetto)
Tecnica sul terreno > Inverno / Neve e valanghe              (il "bivacco" come attività)
```

### Perché queste scelte

- **Le 4 categorie anemiche spariscono per fusione, non per sfoltimento.** Acqua (3) e Cibo e fornelli (4)
  → `Attrezzatura > Cucina e acqua`; Flora (4) → `Meteo e natura > Fauna e flora`; Etica (4) → `Regole e ambiente > Etica e ambiente`.
- **Le 2 categorie obese si spezzano.** Tenda (19) si divide fra `Tenda e riparo` e `Salute e sicurezza`
  (`monossido-carbonio-tenda-bivacchi` è una scheda di sicurezza, non di attrezzatura); Escursionismo
  invernale (12) si divide fra `Neve e valanghe` (il blocco valanghe/ARTVA/bollettini) e `Inverno`
  (muoversi e dormire al freddo).
- **Le sovrapposizioni segnalate in analisi si risolvono spostando, non riscrivendo:**
  - `bollettino-nivometeorologico` esce da Meteo e raggiunge `Neve e valanghe`, dove stanno scala europea,
    problemi valanghivi e bollettini di riferimento.
  - `bivacco-su-neve` esce da Tenda e raggiunge `Inverno`, accanto a `bivacco-invernale-attrezzatura`.
  - `r-value-materassino`, `scelta-sacco-a-pelo`, `piuma-vs-sintetico`, `layering-notte-bivacco` escono da
    "Zaino e attrezzatura" e raggiungono `abbinamento-materassino` in `Sacco a pelo e riposo`.
  - `raccolta-funghi-lombardia-svizzera` e `specie-protette-divieto-raccolta` sono norme, non botanica:
    vanno in `Etica e ambiente` (Flora resta con le 2 schede davvero botaniche, fuse in Fauna e flora).
  - `dare-posizione-al-soccorso` esce da Orientamento e raggiunge `Emergenze e soccorso`, con
    `farsi-trovare-dal-soccorso`, `segnali-allarme-internazionali`, `plb`, `numeri-emergenza`, `telefono-in-montagna`,
    `chi-paga-il-soccorso`, `assicurazioni-soccorso-alpino` — che oggi sono sparse su 4 categorie diverse.
  - `cura-piedi-trekking`, `riconoscere-ipotermia`, `colpo-di-calore-disidratazione` confluiscono in
    `Salute in montagna` insieme a quota/AMS/congelamento.
- **"Informazioni utili" (9) viene smontata**: era un contenitore residuale. Le sue schede finiscono dove
  competono (`Regole e ambiente`, `Emergenze e soccorso`, `Attrezzatura > Trekking`, `Prima di partire`).

### Ridondanze da valutare a parte (non incluse in questo piano)

Restano tre coppie che raccontano la stessa cosa da angoli diversi. Non le fondo qui perché è una decisione
editoriale, non strutturale — ma vanno decise prima di stampare la prossima edizione:

- `gestione-rifiuti-leave-no-trace` (Etica) / `gestione-rifiuti-alimentari` (Cucina) / `gestione-cibo-rifiuti-fauna` (Fauna)
- `kit-autosoccorso-valanga-artva-pala-sonda` / `artva-check-gruppo-trasmissione-ricerca` (forte sovrapposizione)
- `cose-un-bivacco-fisso` / `cosa-trovi-bivacco-fisso` (titoli quasi identici, contenuti in parte gemelli)

---

## 2. Fasi di lavoro

Le fasi 1-4 sono la riorganizzazione vera e vanno fatte in sequenza. Le fasi 5-8 sono indipendenti fra loro
e possono essere fatte prima, dopo o in parallelo — tranne la 7, che va per ultima perché misura il risultato.

### Fase 1 — Dati: `manifest.json`

Aggiungere il campo `group` a ogni entry e riscrivere `category` con il nome specifico:

```json
{
  "id": "criteri-scelta-sito",
  "title": "Criteri di scelta del sito",
  "group": "Attrezzatura",
  "category": "Tenda e riparo",
  "file": "content/attrezzatura/tenda/criteri-scelta-sito.html"
}
```

- Le 2 entry speciali (`copertina`, `guida-al-sito`) restano `"group": "Guida"`, `"category": "Guida"`, sempre in testa.
- L'ordine delle entry nel manifest segue l'ordine dei gruppi della tabella al §1: l'export completo stampa in quest'ordine.
- Conversione meccanica dalla tabella in appendice; a fine fase verificare `len(manifest) == 188` e che ogni `file` esista.

### Fase 2 — File system

Nuovo albero, un livello per gruppo e uno per categoria:

```
content/
  copertina.html
  guida-al-sito.html
  _template.html
  regole/{normativa,etica}/
  attrezzatura/{tenda,riposo,trekking,cucina-acqua}/
  tecnica/{trekking,vie-ferrate,neve-valanghe,inverno,orientamento}/
  meteo-natura/{meteo,fauna-flora}/
  salute-sicurezza/{salute,igiene,emergenze,sopravvivenza}/
  pianificazione/{prima-di-partire,rifugi,campeggio}/
```

Spostare con `git mv` (i path completi sono in appendice), in un commit separato da quello del manifest così
il diff resta leggibile. Nessun altro file referenzia i path delle schede: l'unico consumatore è `manifest.json`.

### Fase 3 — Tag dentro le 186 schede

Ogni scheda apre con `<span class="tag">Categoria</span>` che oggi porta il vecchio nome. Sostituirlo con
**due tag**, gruppo e categoria, così la scheda stampata resta auto-descrittiva anche fuori dal raccoglitore:

```html
<h2>Criteri di scelta del sito</h2>
<span class="tag">Attrezzatura</span>
<span class="tag">Tenda e riparo</span>
<span class="tag">agg. 2026-08-19</span>
```

Passata scriptata sul primo `<span class="tag">` di ogni file, guidata dal manifest. Il tag `agg.` non si tocca:
la riorganizzazione non cambia il contenuto e non giustifica una nuova data.

### Fase 4 — Applicazione: `assets/js/app.js`, `style.css`, `index.html`

Punti di intervento, tutti in `app.js` salvo l'ultimo:

| Dove | Cosa |
|---|---|
| `CATEGORY_ORDER` (riga 3) | sostituire con `GROUP_ORDER` (6 voci + Guida/Altro) e `CATEGORY_ORDER` per gruppo |
| `groupByCategory()` (riga 239) | diventa `groupByGroup()` → `{gruppo: {categoria: [entry]}}` |
| `sortCategories()` (riga 247) | due funzioni: `sortGroups()` e `sortCategories(group, cats)` |
| `renderSidebar()` (riga 154) | `<details class="group">` per gruppo, `<details class="category">` annidato per categoria; l'accordion "uno aperto alla volta" si applica al livello gruppo, dentro il gruppo aperto le categorie restano indipendenti |
| `getOpenCategory` / `setOpenCategory` (riga 226) | chiave `openCategory` → `openGroup` + `openCategoryByGroup`; le vecchie chiavi in localStorage vanno ignorate, non migrate |
| `filterManifest()` (riga 126) | includere `entry.group` nel testo indicizzato, così "attrezzatura" trova tutto il gruppo |
| `renderCategoryPicker()` (riga 460) | picker della stampa a due livelli: checkbox di gruppo che seleziona/deseleziona i figli, checkbox per categoria; il conteggio va su entrambi |
| `printBook()` (riga 497) | filtro sulle categorie selezionate; ordinamento pagine gruppo → categoria → ordine manifest |
| `buildVersionPage()` (riga 555) | la "ricevuta di stampa" elenca `Gruppo > Categoria` invece della sola categoria |
| `PRINTED_CATEGORIES_KEY` (riga 441) | rinominare in `lastPrintedCategories.v2`: le selezioni salvate con i vecchi nomi non sono più valide |
| `style.css` (~riga 595) | stile per il `<details>` annidato: rientro, peso del `summary` di secondo livello, e verifica che il pannello mobile (`max-width: 780px`) non diventi troppo profondo |
| `index.html` | testo del modale di stampa: "sezioni" → "gruppi e categorie" |

### Fase 5 — Rimozione dell'indice

`content/indice.html` + `indice-2..14.html` sono 14 file tracciati che **non sono più referenziati da nulla**:
sono usciti dal manifest nel commit `ff69430` ("Add mountain-themed doodle background"), in mezzo a un commit
di UI, e `app.js` non li carica in nessun altro modo. Sono comunque rimasti aggiornati a mano fino a oggi
(coprono tutte e 186 le schede): lavoro speso su pagine che non vengono renderizzate né stampate.

- `git rm content/indice*.html` (14 file).
- Rimuovere da `CLAUDE.md` la regola che impone di aggiornare `content/indice.html` a ogni nuova scheda.
- Rimuovere il commento su `indice.html` in `assets/css/style.css` (~riga 595) e le regole `.index-category` /
  `.index-list` se non usate altrove — **da verificare prima**: `copertina.html` potrebbe condividerne qualcuna.
- Se in futuro serve di nuovo un indice stampabile, va **generato** da `manifest.json` a build time
  (`scripts/build_index.py`), non mantenuto a mano: la manutenzione manuale ha già fallito una volta senza che nessuno se ne accorgesse.

### Fase 6 — Formato unico delle schede: via `<h3>Sintesi</h3>`

Oggi convivono due formati, divisi nettamente per data:

- **66 schede** (`agg. 2026-08-01`): `<h2>` → tag → **paragrafo di sintesi senza titolo** → `<h3>` tematici → Fonti. **Questo è il formato corretto.**
- **120 schede** (`agg. 2026-08-11/12/13`): identiche ma con un `<h3>Sintesi</h3>` sopra il paragrafo.

Il titolo "Sintesi" non aggiunge informazione — il primo paragrafo è la sintesi per posizione — e costa una riga
in altezza su una scheda che ha già poco spazio. Si allineano le 120 al formato delle 66.

- La stringa è **esattamente `<h3>Sintesi</h3>` su riga propria in tutti e 120 i file** (verificato): la trasformazione
  è la cancellazione di quella riga, senza toccare il paragrafo che segue. Nessun altro uso della parola "Sintesi" nel contenuto.
- Effetto collaterale utile: −1 riga su 120 schede, contributo diretto alla Fase 7.
- Aggiornare `CLAUDE.md`, sezione "Struttura del frammento": togliere `<h3>Sintesi</h3>` e descrivere il paragrafo di
  apertura senza titolo. Restano il divieto di scrivere "TL;DR" e la sezione Fonti.
- Aggiornare `content/_template.html` di conseguenza (oggi non ha `<h3>Sintesi</h3>`: è già corretto, va solo aggiunto
  l'esempio del secondo tag di gruppo previsto dalla Fase 3).
- Correggere anche il font: `CLAUDE.md` dice "font ~10pt", ma `.a5-page` è a **8pt** (`style.css:398`). L'indicazione
  di quanto testo ci sta in una scheda è quindi sbagliata da tempo.

### Fase 7 — Verifica overflow con render reale

`.a5-page` è `overflow: hidden`: il testo in eccesso **sparisce senza lasciare traccia**, non "sfora a vista". Serve una
misura vera, non una stima.

**Procedura** (Chrome è installato: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`):

1. `scripts/check_overflow.mjs` — con `npx --yes puppeteer-core` puntato al Chrome di sistema (`executablePath`, nessun
   download di Chromium). Per ogni entry del manifest: iniettare il frammento in `.a5-page`, attendere il caricamento dei
   font (`document.fonts.ready` — Playpen Sans è un font largo, misurare con il fallback falserebbe il risultato),
   e confrontare `scrollHeight` con `clientHeight`. Output: tabella `id, altezza, capienza, overflow px` ordinata per eccesso.
2. Render dell'intero libro in PDF con lo stesso Chrome (`--headless --print-to-pdf`, oppure la stampa dell'app) e
   **controllo visivo pagina per pagina** delle schede segnalate: la misura DOM dice *se* taglia, il PDF dice *cosa* ha tagliato
   (spesso è proprio la sezione Fonti, l'ultima, cioè la parte che su carta serve di più).
3. Per ogni scheda in overflow: accorciare, oppure **dividerla in due schede** con due entry di manifest, come già prevede `CLAUDE.md`.
4. Aggiungere lo script alla documentazione come controllo da rilanciare a ogni nuova scheda.

**Candidati da controllare per primi** (stima per densità di testo e numero di intestazioni, capienza ~48 righe a 8pt;
è una stima grezza, la misura vera è quella del punto 1). Il blocco invernale — l'ultimo scritto e il più denso — domina la lista:

| Scheda | Categoria attuale | Righe stimate |
|---|---|---|
| `problemi-valanghivi-tipici` | Escursionismo invernale | ~65 |
| `freddo-buio-escursione-invernale` | Escursionismo invernale | ~60 |
| `bivacco-invernale-attrezzatura` | Escursionismo invernale | ~60 |
| `scegliere-itinerario-invernale-basso-rischio` | Escursionismo invernale | ~58 |
| `autosoccorso-valanga-primi-15-minuti` | Escursionismo invernale | ~58 |
| `differenza-bivacco-campeggio` | Normativa | ~57 |
| `scale-difficolta-ferrate` | Vie ferrate | ~57 |
| `sanzioni-bivacco-abusivo` | Normativa | ~57 |
| `fuochi-liberi` | Normativa | ~57 |
| `pendenza-terreno-30-gradi` | Escursionismo invernale | ~55 |
| `bollettino-nivometeorologico` | Meteo | ~55 |
| `uso-bussola-carta` | Orientamento | ~55 |
| `leggere-bollettino-montano` | Meteo | ~54 |
| `attrezzatura-base-ciaspole` | Escursionismo invernale | ~53 |
| `parco-adamello`, `artva-check-gruppo-trasmissione-ricerca`, `scala-europea-pericolo-valanghe`, `parco-stelvio`, `simbologia-carte-igm-swisstopo`, `bollettini-valanghe-alpi-centrali` | varie | ~51-53 |

`problemi-valanghivi-tipici` (8 sezioni `<h3>`, zero elenchi) è il candidato più probabile a una divisione in due schede
(«problemi valanghivi 1: lastroni e neve ventata» / «2: neve bagnata, strati deboli persistenti»).

All'estremo opposto, sprecano metà scheda e possono assorbire contenuto: `bivacco-lombardia` (127 parole),
`lavarsi-in-bivacco-senza-inquinare` (150), `conservazione-corretta` (153), `confine-italia-svizzera-a-piedi` (162).

### Fase 8 — Documentazione

Aggiornare `CLAUDE.md`: struttura a due livelli, campo `group` nel manifest, nuovo albero di `content/`,
formato senza `<h3>Sintesi</h3>`, font 8pt, niente più indice a mano, e il richiamo a rilanciare
`scripts/check_overflow.mjs` dopo ogni nuova scheda. Allineare `README.md` se descrive le categorie.

---

## 3. Ordine consigliato dei commit

1. `Remove orphaned index pages` (Fase 5) — indipendente, sfoltisce prima di muovere.
2. `Drop redundant Sintesi heading from 120 cards` (Fase 6) — tocca il contenuto, meglio prima degli spostamenti.
3. `Reorganize content into two-level taxonomy` (Fasi 1+2, `git mv` + manifest insieme: separarli lascerebbe il repo rotto a metà).
4. `Update card tags with group and category` (Fase 3).
5. `Render two-level navigation and print picker` (Fase 4).
6. `Add A5 overflow check script` + i fix scheda per scheda che ne derivano (Fase 7).
7. `Update guidelines for two-level structure` (Fase 8).

---

## Appendice — Mappatura completa (186 schede)

La colonna "spostata" segna le schede che cambiano cartella di appartenenza rispetto a oggi.

### Regole e ambiente (20)


**Regole e ambiente > Normativa bivacco** — 12 schede → `content/regole/normativa/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Bivacco e campeggio libero in Lombardia <br>`bivacco-lombardia` | Normativa |  |
| Bivacco e campeggio libero in Piemonte <br>`bivacco-piemonte` | Normativa |  |
| Bivacco e campeggio libero in Valle d'Aosta <br>`bivacco-valle-aosta` | Normativa |  |
| Bivacco e campeggio libero in Trentino-Alto Adige <br>`bivacco-trentino-alto-adige` | Normativa |  |
| Bivacco nel canton Ticino <br>`bivacco-ticino` | Normativa |  |
| Bivacco nel canton Grigioni <br>`bivacco-grigioni` | Normativa |  |
| Bivacco nel canton Vallese <br>`bivacco-vallese` | Normativa |  |
| Bivacco, campeggio libero, campeggio organizzato: le differenze <br>`differenza-bivacco-campeggio` | Normativa |  |
| Bivacco e campeggio nel Parco Nazionale dello Stelvio <br>`parco-stelvio` | Normativa |  |
| Bivacco e campeggio nel Parco Adamello Brenta e nel Parco dell'Adamello <br>`parco-adamello` | Normativa |  |
| Fuochi liberi in montagna: regole per regione/cantone <br>`fuochi-liberi` | Normativa |  |
| Sanzioni per bivacco/campeggio abusivo: Italia e Svizzera <br>`sanzioni-bivacco-abusivo` | Normativa |  |

**Regole e ambiente > Etica e ambiente** — 8 schede → `content/regole/etica/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Gestione delle deiezioni umane in alta quota <br>`gestione-deiezioni-quota` | Etica |  |
| Leave No Trace: gestione rifiuti in trekking e bivacco <br>`gestione-rifiuti-leave-no-trace` | Etica |  |
| Rispetto verso pascoli e bestiame al pascolo <br>`rispetto-pascoli-bestiame` | Etica |  |
| Distanza minima da corsi d'acqua per bivacco e igiene <br>`distanza-corsi-acqua` | Etica |  |
| Raccolta di funghi in Lombardia e nei cantoni svizzeri <br>`raccolta-funghi-lombardia-svizzera` | Flora | **sì** |
| Specie protette e divieto di raccolta <br>`specie-protette-divieto-raccolta` | Flora | **sì** |
| Drone in montagna <br>`drone-in-montagna` | Informazioni utili | **sì** |
| Attraversare il confine Italia–Svizzera a piedi <br>`confine-italia-svizzera-a-piedi` | Informazioni utili | **sì** |

### Attrezzatura (45)


**Attrezzatura > Tenda e riparo** — 18 schede → `content/attrezzatura/tenda/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Criteri per scegliere il sito tenda in bivacco <br>`criteri-scelta-sito` | Tenda |  |
| Rischio caduta massi, frane e valanghe residue nella scelta del sito <br>`rischio-caduta-massi-sito` | Tenda |  |
| Orientare la tenda rispetto a vento e sole <br>`orientamento-vento-sole` | Tenda |  |
| Evitare conche e accumuli di aria fredda per la tenda <br>`evitare-conche-aria-fredda` | Tenda |  |
| Montare la tenda su roccia o neve: ancoraggi alternativi <br>`ancoraggio-terreno-roccioso-neve` | Tenda |  |
| Distanze di rispetto in bivacco: sentieri, rifugi, altre persone <br>`distanze-rispetto-bivacco` | Tenda |  |
| Montare la tenda con vento forte senza danni <br>`montaggio-vento-forte` | Tenda |  |
| Tecniche di piantaggio picchetti su terreni diversi <br>`tecniche-piantaggio-picchetti` | Tenda |  |
| Gestire la condensa interna nella tenda <br>`gestione-condensa` | Tenda |  |
| Pulire e asciugare la tenda dopo l'uso <br>`pulizia-asciugatura-post-uso` | Tenda |  |
| Ri-impermeabilizzare il telo esterno della tenda <br>`riimpermeabilizzazione-telo` | Tenda |  |
| Sigillare e riparare le cuciture della tenda (seam sealing) <br>`sigillatura-cuciture` | Tenda |  |
| Riparare uno strappo nel telo della tenda sul campo <br>`riparazione-strappi-campo` | Tenda |  |
| Conservare la tenda durante i mesi di non utilizzo <br>`conservazione-lungo-termine` | Tenda |  |
| Manutenzione e riparazione dei bastoni della tenda <br>`manutenzione-riparazione-bastoni` | Tenda |  |
| Kit di riparazione minimo <br>`kit-riparazione-minimo` | Tenda |  |
| Gestire la tenda sotto pioggia continua <br>`gestione-tenda-pioggia-continua` | Tenda |  |
| Tarp, bivy sack o tenda leggera: quale scegliere <br>`tarp-vs-bivy-vs-tenda` | Zaino e attrezzatura | **sì** |

**Attrezzatura > Sacco a pelo e riposo** — 12 schede → `content/attrezzatura/riposo/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Lavare un sacco a pelo in piuma <br>`lavaggio-piuma` | Sacchi a pelo | **sì** |
| Lavare un sacco a pelo sintetico <br>`lavaggio-sintetico` | Sacchi a pelo | **sì** |
| Conservare il sacco a pelo tra un utilizzo e l'altro <br>`conservazione-corretta` | Sacchi a pelo | **sì** |
| Fill power della piuma: valutarlo e mantenerlo <br>`fill-power-mantenimento` | Sacchi a pelo | **sì** |
| Gestire il sacco a pelo bagnato in bivacco di più giorni <br>`gestione-umidita-campo` | Sacchi a pelo | **sì** |
| Accessori utili per prolungare la vita del sacco a pelo <br>`accessori-utili` | Sacchi a pelo | **sì** |
| Scegliere la taglia corretta del sacco a pelo <br>`scelta-taglia-corretta` | Sacchi a pelo | **sì** |
| Abbinare sacco a pelo e materassino <br>`abbinamento-materassino` | Sacchi a pelo | **sì** |
| Scegliere il sacco a pelo: comfort vs limite <br>`scelta-sacco-a-pelo` | Zaino e attrezzatura | **sì** |
| Sacco a pelo: piuma o sintetico? <br>`piuma-vs-sintetico` | Zaino e attrezzatura | **sì** |
| R-value del materassino sopra i 2000 metri <br>`r-value-materassino` | Zaino e attrezzatura | **sì** |
| Layering per la notte in bivacco <br>`layering-notte-bivacco` | Zaino e attrezzatura | **sì** |

**Attrezzatura > Trekking** — 8 schede → `content/attrezzatura/trekking/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Checklist zaino bivacco leggero estivo <br>`checklist-bivacco-estivo` | Zaino e attrezzatura | **sì** |
| Checklist zaino per bivacco in mezza stagione <br>`checklist-bivacco-mezza-stagione` | Zaino e attrezzatura | **sì** |
| Torcia frontale: lumen e autonomia per trekking/bivacco <br>`frontale-lumen-autonomia` | Zaino e attrezzatura | **sì** |
| Gestire batterie e power bank in quota col freddo <br>`gestione-batterie-quota` | Zaino e attrezzatura | **sì** |
| Peso dello zaino <br>`peso-zaino` | Pianificazione | **sì** |
| Scegliere e preparare gli scarponi <br>`scegliere-preparare-scarponi` | Trekking |  |
| Uso corretto dei bastoncini da trekking <br>`uso-bastoncini-trekking` | Trekking |  |
| Coltelli e attrezzi in zaino <br>`coltelli-attrezzi-in-zaino` | Informazioni utili | **sì** |

**Attrezzatura > Cucina e acqua** — 7 schede → `content/attrezzatura/cucina-acqua/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Fornelli da trekking: gas, multifuel o alcool <br>`tipi-fornelli-confronto` | Cibo e fornelli | **sì** |
| Fornelli a gas a basse temperature: come gestirli <br>`fornelli-gas-basse-temperature` | Cibo e fornelli | **sì** |
| Cibo liofilizzato vs disidratato autoprodotto <br>`liofilizzato-vs-autoprodotto` | Cibo e fornelli | **sì** |
| Gestione dei rifiuti alimentari in bivacco <br>`gestione-rifiuti-alimentari` | Cibo e fornelli | **sì** |
| Quanta acqua portare in trekking/bivacco <br>`quanta-acqua-portare` | Acqua | **sì** |
| Metodi di trattamento dell'acqua in montagna: confronto <br>`metodi-trattamento-acqua` | Acqua | **sì** |
| Quando trattare davvero l'acqua raccolta in quota <br>`quando-trattare-acqua-quota` | Acqua | **sì** |

### Tecnica sul terreno (40)


**Tecnica sul terreno > Trekking** — 11 schede → `content/tecnica/trekking/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Scala di difficoltà dei sentieri (T, E, EE, EEA) <br>`scala-difficolta-sentieri-italia` | Trekking |  |
| Scala SAC svizzera (T1–T6) e segnavia CH <br>`scala-sac-svizzera-t1-t6` | Trekking |  |
| Segnaletica dei sentieri CAI <br>`segnaletica-sentieri-cai` | Trekking |  |
| Calcolare i tempi di percorrenza <br>`calcolo-tempi-percorrenza` | Trekking |  |
| Gestire il ritmo e le pause su lunghi dislivelli <br>`ritmo-pause-lunghi-dislivelli` | Trekking |  |
| Camminare su ghiaione, sfasciumi e sentieri esposti <br>`ghiaione-sfasciumi-sentieri-esposti` | Trekking |  |
| Attraversare nevai residui estivi <br>`attraversare-nevai-residui-estivi` | Trekking |  |
| Guadare un torrente in sicurezza <br>`guadare-torrente-sicurezza` | Trekking |  |
| Discesa in sicurezza <br>`discesa-sicurezza` | Trekking |  |
| Trekking con il cane in montagna <br>`trekking-con-il-cane` | Trekking |  |
| Trekking con bambini <br>`trekking-con-bambini` | Trekking |  |

**Tecnica sul terreno > Vie ferrate** — 8 schede → `content/tecnica/vie-ferrate/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Cos'è una via ferrata <br>`cose-una-via-ferrata` | Vie ferrate |  |
| Kit da ferrata obbligatorio <br>`kit-da-ferrata-obbligatorio` | Vie ferrate |  |
| Scadenza e controllo del kit da ferrata <br>`scadenza-controllo-kit-ferrata` | Vie ferrate |  |
| Scale di difficoltà delle ferrate <br>`scale-difficolta-ferrate` | Vie ferrate |  |
| Progressione corretta su ferrata <br>`progressione-corretta-ferrata` | Vie ferrate |  |
| Errori e rischi tipici in ferrata <br>`errori-rischi-tipici-ferrata` | Vie ferrate |  |
| Ferrata con bambini o principianti <br>`ferrata-bambini-principianti` | Vie ferrate |  |
| Meteo e stagione per le ferrate <br>`meteo-stagione-ferrate` | Vie ferrate |  |

**Tecnica sul terreno > Neve e valanghe** — 9 schede → `content/tecnica/neve-valanghe/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Bollettino nivometeorologico: cos'è e quando serve <br>`bollettino-nivometeorologico` | Meteo | **sì** |
| Scala europea del pericolo valanghe (1-5) <br>`scala-europea-pericolo-valanghe` | Escursionismo invernale | **sì** |
| Problemi valanghivi tipici <br>`problemi-valanghivi-tipici` | Escursionismo invernale | **sì** |
| Pendenza e terreno: la soglia dei 30° <br>`pendenza-terreno-30-gradi` | Escursionismo invernale | **sì** |
| Bollettini valanghe di riferimento per le Alpi centrali <br>`bollettini-valanghe-alpi-centrali` | Escursionismo invernale | **sì** |
| Scegliere un itinerario invernale a basso rischio <br>`scegliere-itinerario-invernale-basso-rischio` | Escursionismo invernale | **sì** |
| Kit autosoccorso in valanga (ARTVA, pala, sonda) <br>`kit-autosoccorso-valanga-artva-pala-sonda` | Escursionismo invernale | **sì** |
| ARTVA: check di gruppo, trasmissione/ricerca, batterie e interferenze <br>`artva-check-gruppo-trasmissione-ricerca` | Escursionismo invernale | **sì** |
| Autosoccorso in valanga: i primi 15 minuti <br>`autosoccorso-valanga-primi-15-minuti` | Escursionismo invernale | **sì** |

**Tecnica sul terreno > Inverno** — 5 schede → `content/tecnica/inverno/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Ciaspole <br>`ciaspole` | Escursionismo invernale | **sì** |
| Attrezzatura base per un'escursione con le ciaspole <br>`attrezzatura-base-ciaspole` | Escursionismo invernale | **sì** |
| Freddo e buio in escursione invernale <br>`freddo-buio-escursione-invernale` | Escursionismo invernale | **sì** |
| Bivacco invernale: cosa cambia rispetto all'estate <br>`bivacco-invernale-attrezzatura` | Escursionismo invernale | **sì** |
| Bivacco su neve <br>`bivacco-su-neve` | Tenda | **sì** |

**Tecnica sul terreno > Orientamento** — 7 schede → `content/tecnica/orientamento/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Carte IGM vs Swisstopo: differenze di simbologia <br>`simbologia-carte-igm-swisstopo` | Orientamento |  |
| Bussola e carta: il metodo base per orientarsi <br>`uso-bussola-carta` | Orientamento |  |
| App offline per navigazione escursionistica: confronto <br>`app-offline-navigazione` | Orientamento |  |
| Fonti affidabili di tracce GPX: Lombardia/Ticino/Grigioni <br>`fonti-tracce-gpx` | Orientamento |  |
| Perché portare sempre una carta cartacea di backup <br>`backup-carta-cartacea` | Orientamento |  |
| Altimetro barometrico <br>`altimetro-barometrico` | Orientamento |  |
| Orientarsi in nebbia o al buio <br>`orientarsi-nebbia-buio` | Orientamento |  |

### Meteo e natura (21)


**Meteo e natura > Meteo** — 9 schede → `content/meteo-natura/meteo/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Come leggere un bollettino meteo montano <br>`leggere-bollettino-montano` | Meteo |  |
| Fonti meteo affidabili per zona alpina Lombardia/Svizzera <br>`fonti-meteo-affidabili` | Meteo |  |
| Segnali di temporale imminente: cosa osservare <br>`segnali-temporale-imminente` | Meteo |  |
| Fulmini in montagna: come comportarsi <br>`comportamento-fulmini` | Meteo |  |
| Gradiente termico: stimare la temperatura in quota <br>`gradiente-termico-quota` | Meteo |  |
| Vento in cresta: stimarlo e gestirlo <br>`vento-in-cresta` | Meteo |  |
| Inversione termica e nebbia di valle <br>`inversione-termica-nebbia-di-valle` | Meteo |  |
| Finestra meteo: modelli e tendenze a 2-5 giorni <br>`finestra-meteo-modelli-tendenze` | Meteo |  |
| Neve fuori stagione e gelo notturno <br>`neve-fuori-stagione-gelo-notturno` | Meteo |  |

**Meteo e natura > Fauna e flora** — 12 schede → `content/meteo-natura/fauna-flora/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Incontro con vipere: comportamento e primo soccorso <br>`comportamento-vipere` | Fauna | **sì** |
| Incontro con cinghiali: come comportarsi <br>`comportamento-cinghiali` | Fauna | **sì** |
| Zone con presenza di lupo: precauzioni per il bivacco <br>`zone-presenza-lupo` | Fauna | **sì** |
| Cani da guardiania (maremmano-abruzzesi): come comportarsi <br>`cani-pastore-maremmani` | Fauna | **sì** |
| Gestire cibo e rifiuti in bivacco per non attirare fauna <br>`gestione-cibo-rifiuti-fauna` | Fauna | **sì** |
| Zecche: rischio, prevenzione, rimozione <br>`zecche` | Fauna | **sì** |
| Orso bruno in Trentino <br>`orso-bruno-trentino` | Fauna | **sì** |
| Vespe, calabroni e api <br>`vespe-calabroni-api` | Fauna | **sì** |
| Bovini al pascolo e mucche con vitelli <br>`bovini-pascolo-mucche-vitelli` | Fauna | **sì** |
| Roditori e volpi in bivacco <br>`roditori-volpi-in-bivacco` | Fauna | **sì** |
| Piante velenose e urticanti comuni sulle Alpi <br>`piante-velenose-urticanti-alpi` | Flora | **sì** |
| Bacche e piante commestibili <br>`bacche-piante-commestibili` | Flora | **sì** |

### Salute e sicurezza (32)


**Salute e sicurezza > Salute in montagna** — 12 schede → `content/salute-sicurezza/salute/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Mal acuto di montagna (AMS) <br>`mal-acuto-di-montagna-ams` | Quota e salute | **sì** |
| Edema polmonare e cerebrale d'alta quota (HAPE/HACE) <br>`hape-hace-edema-alta-quota` | Quota e salute | **sì** |
| Acclimatazione in alta quota <br>`acclimatazione-alta-quota` | Quota e salute | **sì** |
| Sole in quota <br>`sole-in-quota` | Quota e salute | **sì** |
| Alimentazione e idratazione in quota <br>`alimentazione-idratazione-quota` | Quota e salute | **sì** |
| Congelamenti e principio di congelamento <br>`congelamento` | Quota e salute | **sì** |
| Riconoscere e trattare l'ipotermia sul campo <br>`riconoscere-ipotermia` | Sicurezza e primo soccorso | **sì** |
| Riconoscere colpo di calore e disidratazione in quota <br>`colpo-di-calore-disidratazione` | Sicurezza e primo soccorso | **sì** |
| Kit di primo soccorso minimo per trekking/bivacco <br>`kit-primo-soccorso-minimo` | Sicurezza e primo soccorso | **sì** |
| Autosoccorso base per infortuni lievi <br>`autosoccorso-base` | Sicurezza e primo soccorso | **sì** |
| Monossido di carbonio in tenda e bivacchi chiusi <br>`monossido-carbonio-tenda-bivacchi` | Tenda | **sì** |
| Cura dei piedi in trekking <br>`cura-piedi-trekking` | Trekking | **sì** |

**Salute e sicurezza > Igiene** — 4 schede → `content/salute-sicurezza/igiene/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Lavarsi in bivacco senza inquinare <br>`lavarsi-in-bivacco-senza-inquinare` | Igiene |  |
| Igiene delle mani e prevenzione di gastroenteriti <br>`igiene-mani-gastroenterite` | Igiene |  |
| Ciclo mestruale in trekking e bivacco <br>`ciclo-mestruale-trekking-bivacco` | Igiene |  |
| Lavare e asciugare i vestiti durante un trekking <br>`lavare-asciugare-vestiti-trekking` | Igiene |  |

**Salute e sicurezza > Emergenze e soccorso** — 8 schede → `content/salute-sicurezza/emergenze/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Numeri di emergenza in montagna: Italia e Svizzera <br>`numeri-emergenza-italia-svizzera` | Sicurezza e primo soccorso | **sì** |
| PLB e localizzatori satellitari: quando portarli <br>`plb-localizzatori-satellitari` | Sicurezza e primo soccorso | **sì** |
| Segnali di allarme internazionali in montagna <br>`segnali-allarme-internazionali` | Sicurezza e primo soccorso | **sì** |
| Dare la propria posizione al soccorso <br>`dare-posizione-al-soccorso` | Orientamento | **sì** |
| Farsi trovare dal soccorso <br>`farsi-trovare-dal-soccorso` | Sopravvivenza | **sì** |
| Telefono in montagna <br>`telefono-in-montagna` | Informazioni utili | **sì** |
| Chi paga il soccorso in montagna <br>`chi-paga-il-soccorso` | Informazioni utili | **sì** |
| Assicurazioni per il soccorso alpino <br>`assicurazioni-soccorso-alpino` | Informazioni utili | **sì** |

**Salute e sicurezza > Sopravvivenza** — 8 schede → `content/salute-sicurezza/sopravvivenza/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Bivacco forzato d'emergenza <br>`bivacco-forzato-emergenza` | Sopravvivenza |  |
| Riparo di fortuna con telo/tarp/telo termico <br>`riparo-fortuna-telo-tarp` | Sopravvivenza |  |
| Telo termico (metallina) <br>`telo-termico-metallina` | Sopravvivenza |  |
| Cosa fare se ci si perde <br>`cosa-fare-se-ci-si-perde` | Sopravvivenza |  |
| Accendere un fuoco in montagna <br>`accendere-fuoco-montagna` | Sopravvivenza |  |
| Nodi essenziali per bivacco e trekking <br>`nodi-essenziali-bivacco-trekking` | Sopravvivenza |  |
| Sopravvivere a una notte imprevista al freddo <br>`notte-imprevista-freddo` | Sopravvivenza |  |
| Gestire il panico e la stanchezza estrema in gruppo <br>`panico-stanchezza-gruppo` | Sopravvivenza |  |

### Pianificazione e logistica (28)


**Pianificazione e logistica > Prima di partire** — 10 schede → `content/pianificazione/prima-di-partire/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Pianificare un'uscita in giornata <br>`pianificare-uscita-giornata` | Pianificazione | **sì** |
| Pianificare un trekking di più giorni con bivacco <br>`trekking-piu-giorni-bivacco` | Pianificazione | **sì** |
| Piano B e criteri di rinuncia <br>`piano-b-criteri-rinuncia` | Pianificazione | **sì** |
| Lasciare detto dove si va <br>`lasciare-detto-dove-si-va` | Pianificazione | **sì** |
| Ore di luce, alba e tramonto in montagna <br>`ore-luce-alba-tramonto` | Pianificazione | **sì** |
| Preparazione fisica minima per trekking con bivacco <br>`preparazione-fisica-trekking-bivacco` | Pianificazione | **sì** |
| Raggiungere i sentieri con i mezzi pubblici <br>`mezzi-pubblici-sentieri-lombardia-ticino-grigioni` | Pianificazione | **sì** |
| Diventare socio CAI o SAC <br>`diventare-socio-cai-sac` | Informazioni utili | **sì** |
| Glossario termini di montagna IT/DE/FR (carte svizzere) <br>`glossario-termini-montagna-svizzeri` | Informazioni utili | **sì** |
| Assicurazione e responsabilità in gruppo informale <br>`responsabilita-gruppo-informale` | Informazioni utili | **sì** |

**Pianificazione e logistica > Rifugi e bivacchi fissi** — 10 schede → `content/pianificazione/rifugi/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Prenotare un rifugio CAI in Italia <br>`prenotazione-rifugio-cai` | Rifugi e punti di appoggio |  |
| Prenotare un rifugio (capanna) SAC in Svizzera <br>`prenotazione-rifugio-sac` | Rifugi e punti di appoggio |  |
| Rifugi CAI vs capanne SAC: le differenze principali <br>`differenze-servizi-cai-sac` | Rifugi e punti di appoggio |  |
| Cos'è un bivacco fisso <br>`cose-un-bivacco-fisso` | Rifugi e punti di appoggio |  |
| Etichetta e regole d'uso di un bivacco fisso <br>`etichetta-regole-bivacco-fisso` | Rifugi e punti di appoggio |  |
| Cosa trovi e cosa NON trovi in un bivacco fisso <br>`cosa-trovi-bivacco-fisso` | Rifugi e punti di appoggio |  |
| Dormire in un bivacco fisso in sicurezza <br>`dormire-bivacco-fisso-sicurezza` | Rifugi e punti di appoggio |  |
| Trovare i bivacchi fissi in Lombardia e Trentino <br>`trovare-bivacchi-lombardia-trentino` | Rifugi e punti di appoggio |  |
| Capanne non custodite e locali invernali in Svizzera <br>`capanne-non-custodite-svizzera` | Rifugi e punti di appoggio |  |
| Locale invernale di un rifugio custodito <br>`locale-invernale-rifugio-custodito` | Rifugi e punti di appoggio |  |

**Pianificazione e logistica > Campeggio e camper** — 8 schede → `content/pianificazione/campeggio/`

| scheda | categoria attuale | spostata |
|---|---|---|
| Campeggio organizzato in Italia e Svizzera <br>`campeggio-organizzato-italia-svizzera` | Camping | **sì** |
| Scegliere una piazzola <br>`scegliere-una-piazzola` | Camping | **sì** |
| Etichetta del campeggio <br>`etichetta-campeggio` | Camping | **sì** |
| Elettricità in campeggio <br>`elettricita-in-campeggio` | Camping | **sì** |
| Tessere e sconti (TCS, ACSI, Camping Key Europe) <br>`tessere-sconti-tcs-acsi-camping-key` | Camping | **sì** |
| Aree di sosta camper e "camper stop" <br>`aree-di-sosta-camper` | Camping | **sì** |
| Campeggio in Svizzera: specificità <br>`campeggio-in-svizzera-specificita` | Camping | **sì** |
| Attrezzatura da campeggio "base auto" vs trekking <br>`attrezzatura-campeggio-auto-vs-trekking` | Camping | **sì** |