Quando ti chiedo di creare una "pagina" per il cheatsheet, questo è un sito statico HTML/JS (vedi README.md): NON creare markdown, la scheda vera è un frammento HTML in `content/`.

- Cerca online informazioni aggiornate e verificate (fonti ufficiali quando possibile: enti cantonali/regionali, CAI, SAC, MeteoSvizzera, Arpa, parchi naturali).
- Crea un file HTML in `content/<categoria>/<slug-argomento>.html`, copiando `content/_template.html` come punto di partenza: è un frammento (niente `<html>/<head>/<body>`), verrà iniettato in un contenitore `.a6-page` già dimensionato 105×148mm con `overflow: hidden` — il contenuto che eccede viene tagliato, non solo "sforato a vista".
- Aggiungi la riga corrispondente in `manifest.json`: `{"id": "<slug>", "title": "<titolo>", "category": "<Categoria>", "file": "content/<categoria>/<slug>.html"}`.
- Il contenuto deve stare fisicamente in una o due schede A6 (font ~9pt, riga ~1.35): telegrafico, elenco puntato, niente paragrafi lunghi. Se il tema non ci sta in una scheda, dividilo in due file/entry di manifest invece di far traboccare il testo.
- Struttura del frammento:
  - `<h2>` titolo + `<span class="tag">` per categoria e per "agg. AAAA-MM-GG"
  - Sintesi in 1-2 righe (TL;DR)
  - Punti chiave in bullet, pratici e concreti (numeri, soglie, contatti, non teoria generica)
  - Sezione "Attenzione/Errori comuni" se rilevante e se c'è spazio (1-2 righe, non un paragrafo)
  - Sezione "Fonti" con 2-4 link essenziali (`<a href>`), non l'elenco completo delle ricerche
- Stile: telegrafico, orientato all'uso sul campo, niente fuffa.
- Se trovi informazioni contrastanti tra fonti, segnalalo esplicitamente in una riga breve invece di scegliere arbitrariamente.