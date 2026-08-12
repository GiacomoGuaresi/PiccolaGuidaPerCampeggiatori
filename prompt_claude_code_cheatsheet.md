# Prompt per Claude Code — Cheatsheet Trekking/Bivacco/Campeggio

Backlog di schede da creare, pensato per essere eseguito **una voce alla volta**
in loop. Ogni voce è già un prompt completo: si copia/incolla così com'è.

---

## Come usare questo file in loop

Prompt da dare a Claude Code a ogni iterazione:

> Apri `prompt_claude_code_cheatsheet.md`, prendi la **prima voce non ancora
> spuntata** del backlog, crea la scheda seguendo alla lettera `CLAUDE.md`
> (ricerca online su fonti ufficiali, frammento HTML in `content/<categoria>/`,
> riga in `manifest.json`, voce in `content/indice*.html`, link scritti per
> esteso), poi spunta la voce qui con `[x]`.
> Se la categoria non esiste ancora, valuta se aggiungerla a `CATEGORY_ORDER`
> in `assets/js/app.js`. Se l'ultima pagina di indice è piena (~6 categorie o
> ~28 righe), crea `content/indice-N.html` con lo stesso markup.

Regole trasversali valide per **tutte** le voci sotto:

- Ambito geografico di riferimento: **Alpi centrali Italia (Lombardia, Trentino,
  Piemonte, Valle d'Aosta) e Svizzera (Ticino, Grigioni, Vallese)**. Se una
  regola cambia tra Italia e Svizzera, dirlo esplicitamente in una riga.
- Numeri, soglie, quantità, contatti: sempre concreti. Niente teoria.
- Se le fonti sono contrastanti, una riga breve che lo segnala.
- Ogni scheda deve stare fisicamente in una A5; se non ci sta, dividere in due
  file/entry invece di comprimere il testo fino a renderlo illeggibile.

---

## Stato attuale della guida (analisi)

Coperto bene (82 schede): Normativa bivacco IT/CH per regione e cantone, Meteo,
Orientamento con carta/bussola/GPX, Etica Leave No Trace, Tenda (scelta sito +
manutenzione completa), Sacchi a pelo, Zaino e attrezzatura, Acqua, Cibo e
fornelli, Sicurezza e primo soccorso, Fauna, Rifugi CAI/SAC.

Buchi principali individuati, che il backlog qui sotto colma:

1. **Trekking come attività** — niente su scale di difficoltà (T/E/EE/EEA, SAC
   T1–T6), segnavia, calcolo tempi, ritmo, terreni tecnici, piedi/scarpe.
2. **Pianificazione dell'uscita** — niente su come si costruisce e si verifica
   un itinerario, piano B, lasciare detto, orari luce, avvicinamento.
3. **Quota e fisiologia** — mal di montagna/acclimatazione totalmente assenti.
4. **Sopravvivenza vera** — bivacco forzato, riparo di fortuna, fuoco, cosa fare
   se ci si perde, telo termico, nodi.
5. **Camping organizzato e logistica** — la categoria "camping" richiesta non
   esiste: costi, prenotazioni, aree camper, etichetta, TCS/ACSI.
6. **Info utili di base** — soccorso e chi paga (elicottero IT vs CH), tessera
   CAI/SAC, REGA, trasporti pubblici, frontiera IT–CH, telefono/roaming.
7. **Fauna mancante** — zecche (TBE/Lyme), orso in Trentino, vespe/imenotteri,
   bovini al pascolo.
8. **Flora e raccolta** — funghi, bacche, piante urticanti/velenose.
9. **Igiene personale** — lavarsi senza inquinare, ciclo mestruale, cura piedi.
10. **Neve/stagione fredda oltre il bollettino** — nevai residui, ramponcini.

---

## Backlog

### Categoria: Trekking

- [x] Scala di difficoltà dei sentieri in Italia (T, E, EE, EEA): cosa richiede
      davvero ogni livello, con esempi concreti e attrezzatura minima.
- [x] Scala SAC svizzera dei sentieri di montagna (T1–T6) e corrispondenza con
      la scala CAI; colori dei segnavia CH (giallo, bianco-rosso-bianco,
      bianco-blu-bianco) e cosa implicano.
- [x] Segnaletica dei sentieri CAI: segnavia bianco-rosso, numerazione, paline,
      ometti, bolli — come leggerli e cosa fare quando spariscono.
- [ ] Calcolare i tempi di percorrenza: regole pratiche (dislivello/ora in
      salita e discesa, formula DIN/SAC, correzioni per zaino, neve, gruppo) e
      perché i tempi delle paline sono spesso ottimistici.
- [ ] Gestire il ritmo e le pause su lunghi dislivelli: cadenza, respirazione,
      pausa ogni quanto, alimentazione e idratazione durante la marcia.
- [ ] Uso corretto dei bastoncini da trekking: lunghezza, salita/discesa,
      traversi, quando NON usarli.
- [ ] Scegliere e preparare gli scarponi: tipologie (A/AB/B/C), taglia, rodaggio,
      allacciatura per la discesa.
- [ ] Cura dei piedi in trekking: prevenire e trattare vesciche, calze, cambio,
      cosa mettere nel kit piedi.
- [ ] Camminare su ghiaione, sfasciumi e sentieri esposti: tecnica, distanza dal
      compagno, cosa fare se si smuovono sassi.
- [ ] Attraversare nevai residui estivi: valutazione, tecnica, quando servono
      ramponcini/piccozza, quando rinunciare.
- [ ] Guadare un torrente in sicurezza: valutazione della portata, punto giusto,
      tecnica, orario migliore (fusione glaciale).
- [ ] Discesa in sicurezza: perché la maggior parte degli incidenti avviene in
      discesa, tecnica, gestione della stanchezza.
- [ ] Trekking con il cane in montagna: normativa IT/CH, pascoli e cani da
      guardiania, acqua, zampe, rifugi.
- [ ] Trekking con bambini: dislivelli e distanze realistici per età, gestione
      del freddo, margini di sicurezza.

### Categoria: Pianificazione

- [ ] Pianificare un'uscita in giornata: sequenza di controlli dal meteo alla
      traccia, tempi, margine di sicurezza, ora di rientro.
- [ ] Pianificare un trekking di più giorni con bivacco: tappe, punti acqua,
      punti di fuga, peso e cibo per giorno.
- [ ] Piano B e criteri di rinuncia: definire in anticipo orario limite, punti
      di uscita, condizioni che fanno tornare indietro.
- [ ] Lasciare detto dove si va: cosa scrivere a chi resta a casa, strumenti di
      condivisione posizione, cosa fare se non si rientra.
- [ ] Ore di luce, alba e tramonto in montagna: come pianificare partenze
      notturne e evitare di finire al buio.
- [ ] Peso dello zaino: base weight, regola del % del peso corporeo, come
      caricare e regolare lo zaino, cosa tagliare per primo.
- [ ] Raggiungere i sentieri con i mezzi pubblici in Lombardia/Ticino/Grigioni:
      strumenti, orari, parcheggi e ZTL alternative.
- [ ] Preparazione fisica minima per un trekking con bivacco: cosa allenare nelle
      settimane precedenti, test realistici.

### Categoria: Sopravvivenza

- [ ] Bivacco forzato d'emergenza: decisione, scelta del posto, isolamento da
      terra, gestione della notte senza tenda.
- [ ] Riparo di fortuna con telo/tarp/telo termico: 3 configurazioni base con
      pochi punti di ancoraggio.
- [ ] Telo termico (metallina): come si usa davvero, lato argento/oro, errori
      comuni, limiti reali.
- [ ] Cosa fare se ci si perde: procedura STOP, quando fermarsi, quando risalire,
      come farsi trovare.
- [ ] Accendere un fuoco in montagna: dove è lecito (rimando alla scheda fuochi
      liberi), esca, legna, accensione con vento/umidità, spegnimento corretto.
- [ ] Nodi essenziali per bivacco e trekking: 5 nodi (bulino, prusik, teso,
      barcaiolo, otto) e a cosa servono sul campo.
- [ ] Farsi trovare dal soccorso: dove posizionarsi, segnali visivi, luce,
      colori, come guidare l'elicottero.
- [ ] Sopravvivere a una notte imprevista al freddo: priorità (riparo, isolamento,
      calorie, idratazione), cosa NON fare (alcol, sudare, immobilità).
- [ ] Gestire il panico e la stanchezza estrema in gruppo: segnali, decisioni,
      chi comanda.

### Categoria: Quota e salute

- [ ] Mal acuto di montagna (AMS): sintomi, soglie di quota, regole di salita e
      quando scendere subito.
- [ ] Edema polmonare e cerebrale d'alta quota (HAPE/HACE): riconoscerli e agire.
- [ ] Acclimatazione: regole pratiche per dormire in quota, ritmo di salita,
      farmaci e loro limiti.
- [ ] Sole in quota: UV, ustioni, crema, occhiali (categoria 3/4), oftalmia da
      neve.
- [ ] Alimentazione e idratazione in quota: fabbisogno calorico reale, sali,
      appetito ridotto.
- [ ] Congelamenti e principi di congelamento: riconoscere, trattare, errori.

### Categoria: Igiene

- [ ] Lavarsi in bivacco senza inquinare: sapone biodegradabile, distanza
      dall'acqua, salviette, gestione dell'acqua grigia.
- [ ] Igiene delle mani e prevenzione di gastroenteriti in trekking.
- [ ] Ciclo mestruale in trekking e bivacco: gestione pratica, smaltimento,
      coppetta, fauna.
- [ ] Lavare e asciugare i vestiti durante un trekking di più giorni.

### Categoria: Camping

- [ ] Campeggio organizzato in Italia e Svizzera: come funziona, prenotazione,
      documenti, costi tipici a notte, tassa di soggiorno.
- [ ] Scegliere una piazzola: sole/ombra, drenaggio, rumore, servizi, distanza
      dai bagni.
- [ ] Etichetta del campeggio: orari di silenzio, uso dei servizi comuni, ospiti,
      cani, fuochi e barbecue.
- [ ] Elettricità in campeggio: prese CEE, amperaggi tipici, adattatori, consumi
      realistici, sicurezza.
- [ ] Tessere e sconti (TCS, ACSI, Camping Key Europe): quando convengono
      davvero.
- [ ] Aree di sosta camper e "camper stop" in Italia e Svizzera: differenza da un
      campeggio, servizi, regole.
- [ ] Campeggio in Svizzera: specificità (costi, regole, tassa, cantoni più
      restrittivi) rispetto all'Italia.
- [ ] Attrezzatura da campeggio "base auto" vs trekking: cosa cambia e cosa vale
      la pena portare quando il peso non è un problema.

### Categoria: Informazioni utili

- [ ] Chi paga il soccorso in montagna: Italia (ticket regionali, elisoccorso) vs
      Svizzera (costi reali, REGA), con cifre indicative.
- [ ] Assicurazioni per il soccorso alpino: tessera CAI, socio REGA, polizze
      terze — cosa coprono davvero.
- [ ] Diventare socio CAI o SAC: costi, vantaggi concreti (sconti rifugi,
      soccorso, assicurazione), come iscriversi.
- [ ] Telefono in montagna: copertura, roaming Italia–Svizzera, chiamate di
      emergenza senza campo, SMS al 112, risparmio batteria.
- [ ] Attraversare il confine Italia–Svizzera a piedi: documenti, dogana,
      limiti su cibo e merci, franchigie.
- [ ] Coltelli e attrezzi in zaino: cosa è legale portare in Italia e in
      Svizzera, e sui mezzi pubblici.
- [ ] Glossario dei termini di montagna IT/DE/FR usati su carte e segnaletica
      svizzere (Hütte, Alp, Grat, Col, Bisse...).
- [ ] Assicurazione e responsabilità in gruppo informale: chi risponde di cosa
      quando si va in montagna con amici.
- [ ] Drone in montagna: dove è vietato in Italia e Svizzera (parchi, riserve,
      aree faunistiche), regole base.

### Categoria: Fauna (integrazioni)

- [ ] Zecche: zone e quote a rischio, prevenzione, rimozione corretta, sintomi di
      Lyme e TBE, vaccino TBE in Svizzera.
- [ ] Orso bruno in Trentino: comportamento in caso di incontro, gestione del
      cibo in bivacco, aree e periodi più sensibili, fonti ufficiali.
- [ ] Vespe, calabroni e api: prevenzione in bivacco, reazione allergica,
      adrenalina autoiniettabile.
- [ ] Bovini al pascolo e mucche con vitelli: distanze, cani, comportamento se si
      viene caricati.
- [ ] Roditori e volpi in bivacco: proteggere cibo e attrezzatura, rischio
      rosicchiamenti, malattie.

### Categoria: Flora

- [ ] Raccolta di funghi in Lombardia e nei cantoni svizzeri: permessi, quantità,
      giorni di divieto, sanzioni.
- [ ] Piante velenose e urticanti comuni sulle Alpi: riconoscerle ed evitarle.
- [ ] Bacche e piante commestibili: le poche affidabili, e perché non improvvisare
      il resto.
- [ ] Specie protette e divieto di raccolta (stella alpina & co.): cosa non si
      tocca, sanzioni.

### Categoria: Orientamento (integrazioni)

- [ ] Dare la propria posizione al soccorso: coordinate WGS84 vs CH1903+/LV95,
      formati, come leggerle dall'app, what3words e i suoi limiti.
- [ ] Altimetro barometrico: taratura, deriva col meteo, uso per orientarsi.
- [ ] Orientarsi in nebbia o al buio: navigazione a bussola, conteggio passi,
      handrail, quando fermarsi.

### Categoria: Meteo (integrazioni)

- [ ] Inversione termica e nebbia di valle: quando la quota è più calda del
      fondovalle e cosa implica per il bivacco.
- [ ] Finestra meteo: leggere modelli e tendenze a 2–5 giorni senza illudersi.
- [ ] Neve fuori stagione e gelo notturno: soglie realistiche per mese e quota
      sulle Alpi centrali.

### Categoria: Tenda / attrezzatura (integrazioni)

- [ ] Kit di riparazione minimo da portare sempre: cosa contiene, peso, e i 5
      guasti che risolve.
- [ ] Gestione della tenda sotto pioggia continua: entrare/uscire, cucinare,
      asciugare, spostarsi.
- [ ] Bivacco su neve: piattaforma, ancoraggi, ventilazione, rischio CO con il
      fornello.
- [ ] Monossido di carbonio in tenda e nei bivacchi chiusi: rischio reale,
      regole, sintomi.

### Categoria: Rifugi e punti di appoggio (integrazioni) — bivacchi fissi

Nota: qui "bivacco" è la **struttura** (locale invernale, capanna non
custodita), non l'atto di dormire in tenda. Nelle schede dire esplicitamente
questa differenza in una riga, perché nel resto della guida il termine è usato
nell'altro senso.

- [ ] Cos'è un bivacco fisso: tipologie (bivacco Apollonio/fisso di alta quota,
      locale invernale di un rifugio custodito, capanna non custodita CH),
      chi li gestisce, sempre aperti o con chiave, quota tipica.
- [ ] Etichetta e regole d'uso di un bivacco fisso: chi ha precedenza, quante
      notti, non prenotabile, lasciarlo come lo si è trovato, coperte e
      materassi, rifiuti da riportare a valle, quaderno di bivacco.
- [ ] Cosa trovi e cosa NON trovi in un bivacco fisso: brande, coperte, stufa,
      acqua, legna, luce, servizi — e cosa devi comunque portarti (sacco a pelo,
      cibo, fornello, acqua, frontale).
- [ ] Dormire in un bivacco fisso in sicurezza: ventilazione e monossido con
      fornello/stufa, umidità, freddo, valanghe e accesso invernale, cosa fare
      se è già pieno (avere sempre un piano B).
- [ ] Trovare i bivacchi fissi in Lombardia e Trentino: elenchi e mappe
      ufficiali (CAI sezionali, SAT, portali regionali, OpenStreetMap
      `shelter_type=basic_hut`), come verificare che siano agibili prima di
      partire.
- [ ] Capanne non custodite e locali invernali in Svizzera (Grigioni, Ticino,
      Vallese): come funzionano, cassetta per il pagamento e tariffe tipiche,
      chiave/codice SAC, dove trovarne l'elenco.
- [ ] Locale invernale di un rifugio custodito: quando è aperto, come si accede,
      differenze rispetto al rifugio in stagione, pagamento e registro.

### Categoria: Vie ferrate

Nota: aprire questa categoria allarga lo scopo della guida oltre il trekking.
Le schede devono ripetere in modo netto che la ferrata è alpinismo attrezzato,
non un sentiero, e che senza kit omologato non si entra.

- [ ] Cos'è una via ferrata e cosa la distingue da un sentiero attrezzato o da un
      sentiero EE: quando serve il kit, quando basta l'attenzione.
- [ ] Kit da ferrata obbligatorio: imbrago, set con dissipatore (norma EN 958 /
      UIAA 128), casco, guanti, scarpe — cosa comprare e cosa non improvvisare
      mai (niente cordino autocostruito).
- [ ] Scadenza e controllo del kit da ferrata: vita utile dei materiali tessili,
      limiti di peso del dissipatore, controlli prima di ogni uscita, quando
      buttarlo dopo una caduta.
- [ ] Scale di difficoltà delle ferrate: scala italiana (F/PD/D/TD/ED) e scala
      tedesca/Hüsler (A–E), corrispondenze approssimative, come scegliere la
      prima ferrata.
- [ ] Progressione corretta su ferrata: sempre due moschettoni sul cavo, cambio
      all'ancoraggio, un solo escursionista per tratto di cavo, distanze, uso
      di staffe e scale.
- [ ] Errori e rischi tipici in ferrata: fattore di caduta alto, caduta sassi dal
      gruppo sopra, temporali e cavo metallico, affaticamento delle braccia,
      ritirarsi a metà via.
- [ ] Ferrata con bambini o principianti: peso minimo per il dissipatore, corda
      di sicurezza dall'alto, scelta dell'itinerario, quando serve una guida.
- [ ] Meteo e stagione per le ferrate: orari, temporali pomeridiani, neve e
      ghiaccio residui sui tratti in ombra, quando la via è "in condizione".

### Categoria: Escursionismo invernale

Nota: blocco a sé. Ogni scheda deve chiarire che con neve invernale il terreno
è **valanghivo** e che questa categoria non sostituisce un corso di neve e
valanghe (CAI/SAC). Coordinare con la scheda già esistente
"Bollettino nivometeorologico: cos'è e quando serve" senza duplicarla.

- [ ] Ciaspole: quando servono davvero, tipi e taglie, come si cammina (salita,
      discesa, traversi), uso dell'alzatacco, errori comuni.
- [ ] Attrezzatura base per un'escursione con le ciaspole: bastoncini con
      rondelle da neve, ghette, strati, ricambi, quantità d'acqua e cibo, luce.
- [ ] Kit autosoccorso in valanga (ARTVA, pala, sonda): perché vanno insieme e
      perché senza formazione servono a poco; come si porta e dove.
- [ ] ARTVA: check di gruppo prima di partire, modalità trasmissione/ricerca,
      batterie e freddo, interferenze con telefono e cavi.
- [ ] Autosoccorso in valanga: i primi 15 minuti, sequenza ricerca di segnale →
      ricerca grossolana → fine → sondaggio → scavo a V, e chiamata al soccorso.
- [ ] Scala europea del pericolo valanghe (1–5): cosa significa ogni grado in
      termini di scelte concrete di itinerario, non solo di colore.
- [ ] Problemi valanghivi tipici (neve fresca, neve ventata, strato debole
      persistente, neve bagnata, slittamenti): come si riconoscono e cosa
      cambiano nella scelta dell'orario e del pendio.
- [ ] Pendenza e terreno: perché 30° è la soglia chiave, come misurarla su carta
      e app, trappole del terreno, esposizione e quota.
- [ ] Scegliere un itinerario invernale a basso rischio: criteri di selezione,
      fonti di itinerari classificati, orari, quando rinunciare.
- [ ] Freddo e buio in escursione invernale: gestione della sudorazione, pause
      corte, borraccia che gela, batterie, giornate corte, rientro anticipato.
- [ ] Bollettini valanghe di riferimento per Alpi centrali: AINEVA/Meteomont per
      l'Italia, SLF per la Svizzera — dove leggerli, aggiornamento, differenze
      di impostazione.
- [ ] Bivacco invernale: cosa cambia rispetto all'estate (sacco a pelo, R-value
      sommato, fornello e gas invernale, acqua da neve fusa, disidratazione) e
      quando è meglio puntare a un bivacco fisso.