Quando ti chiedo di creare una "pagina" per il cheatsheet, questo è un sito statico HTML/JS (vedi README.md): NON creare markdown, la scheda vera è un frammento HTML in `content/`.

- Cerca online informazioni aggiornate e verificate (fonti ufficiali quando possibile: enti cantonali/regionali, CAI, SAC, MeteoSvizzera, Arpa, parchi naturali).
- Crea un file HTML in `content/<categoria>/<slug-argomento>.html`, copiando `content/_template.html` come punto di partenza: è un frammento (niente `<html>/<head>/<body>`), verrà iniettato in un contenitore `.a5-page` già dimensionato 148×210mm con `overflow: hidden` — il contenuto che eccede viene tagliato, non solo "sforato a vista".
- Aggiungi la riga corrispondente in `manifest.json`: `{"id": "<slug>", "title": "<titolo>", "category": "<Categoria>", "file": "content/<categoria>/<slug>.html"}`.
- Il contenuto deve stare fisicamente in una o due schede A5 (font ~10pt, riga ~1.4): telegrafico, elenco puntato, niente paragrafi lunghi. Se il tema non ci sta in una scheda, dividilo in due file/entry di manifest invece di far traboccare il testo.
- Le schede sono pensate per essere stampate su carta: i link vanno sempre scritti per esteso, cioè il testo visibile del link è l'URL stesso (`<a href="URL">URL</a>`, classe `sources` per il font ridotto), mai un testo cliccabile generico ("clicca qui", "fonte 1"). Su carta un link non testuale è inutilizzabile.
- Struttura del frammento:
  - `<h2>` titolo + `<span class="tag">` per categoria e per "agg. AAAA-MM-GG"
  - `<h3>Sintesi</h3>` (mai scrivere letteralmente "TL;DR" nell'HTML) + 1-2 righe di sintesi
  - Punti chiave in bullet, pratici e concreti (numeri, soglie, contatti, non teoria generica)
  - Sezione "Attenzione/Errori comuni" se rilevante e se c'è spazio (1-2 righe, non un paragrafo)
  - Sezione "Fonti" (`<p class="sources">`) con 2-4 link essenziali per esteso, non l'elenco completo delle ricerche
- Stile: telegrafico, orientato all'uso sul campo, niente fuffa.
- Se trovi informazioni contrastanti tra fonti, segnalalo esplicitamente in una riga breve invece di scegliere arbitrariamente.
- `content/copertina.html` e `content/guida-al-sito.html` sono schede speciali (categoria "Guida", sempre prime nel manifest così restano in testa nell'export completo): non seguono la struttura standard h2/Sintesi/Fonti e usano wrapper dedicati già stilizzati in `style.css` (`.cover`).