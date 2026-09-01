# RAL → Netto

Prototipo realizzato per la task tecnica **AI Builder / Product Builder di Jet HR**.

## Demo

[Apri il prototipo su Vercel](https://jet-hr-netto-task.vercel.app)

## Problema e utente

Il prototipo risponde alla domanda: **“Se offro a una persona una certa RAL, quanto riceverà e quali trattenute verranno applicate?”** È pensato per founder, responsabili HR e candidati che hanno bisogno di una prima stima comprensibile senza conoscere in anticipo la struttura di un cedolino.

L'applicazione riceve una retribuzione annua lorda e restituisce:

- netto annuo stimato;
- netto mensile medio su 12, 13 o 14 mensilità;
- contributi previdenziali del lavoratore;
- IRPEF lorda, detrazioni e IRPEF netta;
- addizionali regionale e comunale;
- totale delle imposte e totale delle trattenute;
- fonti e ipotesi usate dal modello.

## Perimetro scelto

La difficoltà principale non era aggiungere il maggior numero possibile di campi, ma costruire una stima comprensibile e verificabile. Ho quindi scelto un **caso standard unico**: lavoratore dipendente privato, impiegato non dirigente, contratto full-time a tempo indeterminato per l'intero anno, residenza fiscale a Milano e 13 mensilità preimpostate.

Questa scelta rende ogni risultato riconducibile a un'ipotesi esplicita. Regione, comune, CCNL, qualifica e situazione familiare non sono selezionabili perché richiederebbero regole aggiuntive che, nel tempo disponibile per il prototipo, avrebbero aumentato la copertura a scapito dell'affidabilità.

## Decisioni di prodotto

| Decisione | Perché | Compromesso dichiarato |
| --- | --- | --- |
| Un solo caso standard Milano | Mantiene il modello verificabile e permette di mostrare anche le addizionali | Il risultato non è generalizzabile automaticamente ad altri territori o inquadramenti |
| RAL come unico dato richiesto | Riduce l'attrito e risponde subito alla domanda principale | Le caratteristiche personali che influenzano il cedolino restano fuori dal perimetro |
| Netto annuo in evidenza | È il risultato fiscalmente coerente con un calcolo costruito su base annuale | Il netto mensile viene presentato come media, non come cedolino reale |
| Scelta tra 12, 13 e 14 mensilità | Traduce lo stesso netto annuo nella periodicità più utile all'utente | Cambia la distribuzione media, non imposte o contributi annuali |
| Dettaglio IRPEF espandibile | Offre profondità senza sovraccaricare la prima lettura | L'utente deve aprire volontariamente il livello più tecnico |
| Fonti dentro il prodotto | Aliquote e soglie possono essere controllate senza fidarsi di una “scatola nera” | La manutenzione normativa diventa parte esplicita del prodotto |
| Importi mostrati senza centesimi | Favorisce una lettura rapida ed evita un'impressione di precisione da cedolino | Il motore conserva i decimali; l'interfaccia arrotonda soltanto la visualizzazione |

## Avvio locale

```bash
npm install
npm run dev
```

Aprire quindi [http://localhost:3000](http://localhost:3000).

## Struttura tecnica

Il prototipo usa Next.js, React e TypeScript. Il calcolo avviene interamente nel browser: non ci sono database, autenticazione o API esterne necessarie durante l'utilizzo.

- `app/page.tsx`: interfaccia, stato dell'input e presentazione dei risultati;
- `lib/salary.ts`: motore di calcolo puro e configurazione centralizzata di aliquote e soglie;
- `tests/salary.test.ts`: casi di regressione e controlli sui principali punti di discontinuità;
- `README.md`: fonti, formule, ipotesi, decisioni e limiti del modello.

Separare il motore dalla UI consente di testare le formule senza dipendere dal browser e, in futuro, di riutilizzarle in un'API o in altri strumenti.

### Dati e privacy

La RAL inserita non viene salvata né inviata a servizi esterni. Tutti i risultati vengono calcolati localmente nella sessione del browser.

## Modello di calcolo

Il prototipo considera un caso volutamente semplice: dipendente privato full-time a tempo indeterminato, impiegato per l'intero anno, residente a Milano, senza familiari a carico né altre detrazioni personali.

1. Stima i contributi INPS ordinari del lavoratore al 9,19%, applica l'1% aggiuntivo sulla quota oltre €56.224 e, per l'ipotesi post-1995, limita la base contributiva a €122.295.
2. Sottrae i contributi dalla RAL per ottenere l'imponibile fiscale.
3. Calcola l'IRPEF progressiva 2026 con aliquote 23%, 33% e 43%.
4. Applica la detrazione da lavoro dipendente, la riduzione del cuneo fiscale e, sotto €15.000, il trattamento integrativo quando supera il test di capienza previsto.
5. Applica le addizionali della Lombardia e del Comune di Milano.
6. Divide il netto annuo per il numero di mensilità selezionato.

Il netto mensile è una **media aritmetica**: il valore dei singoli cedolini può differire, soprattutto per tredicesima, quattordicesima, conguagli e modalità di trattenuta delle addizionali.

## Limiti dichiarati

Il risultato non sostituisce un cedolino o il calcolo di un consulente del lavoro. Non sono inclusi, tra gli altri: aliquote contributive specifiche del CCNL o della qualifica, familiari a carico, bonus, welfare, premi, deduzioni personali, conguagli e variazioni infra-annuali. Il 9,19% è una semplificazione riferita al caso standard dichiarato, non un'aliquota universale.

Il modello assume inoltre un lavoratore iscritto a forme pensionistiche obbligatorie dopo il 31 dicembre 1995. Per un lavoratore già assicurato a quella data il massimale contributivo può non applicarsi; questa variante resta fuori dal prototipo.

## Fonti

- [D.P.R. 917/1986, art. 13 — versione vigente al 31 dicembre 2026](https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917~art13!vig=2026-12-31)
- [D.P.R. 917/1986, art. 11 — scaglioni IRPEF; versione vigente al 31 dicembre 2026](https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917~art11!vig=2026-12-31)
- [D.Lgs. 117/2026 — nuovo Testo unico applicabile dal 1° gennaio 2027](https://www.gazzettaufficiale.it/eli/id/2026/07/03/26G00131/sg)
- [Legge 199/2025, art. 1 — riduzione al 33% del secondo scaglione IRPEF; versione vigente al 31 dicembre 2026](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2025-12-30;199~art1!vig=2026-12-31)
- [Legge 207/2024, art. 1, commi 4-7 — riduzione del cuneo fiscale; versione vigente al 31 dicembre 2026](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1!vig=2026-12-31)
- [D.L. 3/2020, art. 1 — trattamento integrativo; versione vigente al 31 dicembre 2026](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2020-02-05;3~art1!vig=2026-12-31)
- [INPS, circolare 6/2026 — soglia dell'1% e massimale contributivo](https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2026.01.circolare-numero-6-del-30-01-2026_15151.html)
- [INPS, circolare 101/2024 — richiamo all'aliquota FPLD ordinaria del 33%, di cui 9,19% a carico del lavoratore](https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2024.11.circolare-numero-101-del-29-11-2024_14714.html)
- [MEF — elenco ufficiale addizionali regionali 2026](https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/download/tabella.htm)
- [Regione Lombardia — aliquote e scaglioni dell'addizionale regionale IRPEF](https://www.regione.lombardia.it/bollo-auto-e-tributi-regionali/red-addizionale-regionale-irpef)
- [Comune di Milano — addizionale comunale IRPEF](https://www.comune.milano.it/argomenti/tributi/addizionale-comunale-irpef)
- [MEF — archivio addizionale comunale di Milano](https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_addcomirpef/risultato.htm?anno=9999&cc=F205&pr=MI&r=1)

### Criterio di scelta e validità temporale delle fonti

Le formule non derivano da blog o calcolatori commerciali. Ho seguito una gerarchia di fonti primarie coerente con la natura di ciascuna voce:

1. **Normattiva e Gazzetta Ufficiale** per aliquote, detrazioni e agevolazioni previste dalla normativa nazionale;
2. **INPS** per aliquote, soglie e massimali contributivi;
3. **MEF, Regione Lombardia e Comune di Milano** per le addizionali territoriali.

Le fonti secondarie possono essere utili come controllo di plausibilità, ma non modificano automaticamente il modello. In caso di differenza con un calcolatore esterno, occorre prima confrontare anno fiscale, residenza, CCNL, qualifica, mensilità, detrazioni e modalità di applicazione delle addizionali.

Per evitare che un collegamento consolidato mostri una versione normativa successiva a quella simulata, i link a Normattiva sono fissati alla versione vigente al **31 dicembre 2026**. Il modello applica quindi il D.P.R. 917/1986 valido per il periodo d'imposta 2026.

Normattiva può mostrare la dicitura «provvedimento abrogato» quando visualizza il testo futuro in vigore dal **1° gennaio 2027**. Da quella data il D.P.R. 917/1986 viene sostituito dal D.Lgs. 117/2026. Il nuovo Testo unico è citato per rendere esplicito il confine temporale del prototipo, ma **non viene utilizzato nelle formule 2026**.

Per l'addizionale comunale di Milano, al momento della verifica il MEF non pubblicava ancora un dato 2026. Il prototipo riutilizza quindi l'ultima disciplina completa disponibile, relativa al 2025 — aliquota dello 0,8% ed esenzione fino a €23.000 — dichiarando questa assunzione sia nell'interfaccia sia nella documentazione. L'esenzione viene trattata come soglia e non come franchigia.

Le fonti sono state consultate il **31 agosto 2026**. Il modello deve essere revisionato:

- alla pubblicazione di una nuova norma o circolare che modifichi aliquote, soglie o formule;
- quando il MEF pubblicherà il dato comunale di Milano per il 2026;
- in ogni caso entro il **31 gennaio 2027**, prima di riutilizzarlo per un diverso periodo d'imposta.

### Tracciabilità delle formule

| Voce                  | Formula adottata                                            | Fonte / anno                                 |
| --------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| Contributi ordinari   | `min(RAL, 122.295) × 9,19%`                                 | INPS, caso standard e valori 2026            |
| Contributo aggiuntivo | `1%` sulla base oltre `€56.224`, entro il massimale         | Circolare INPS 6/2026                        |
| IRPEF                 | 23% fino a €28k; 33% da €28k a €50k; 43% oltre              | D.P.R. 917/1986 (versione 2026) + Legge 199/2025 |
| Detrazione lavoro     | Formula dell'art. 13 TUIR, inclusi €65 tra €25k e €35k      | D.P.R. 917/1986, art. 13, vigente al 31/12/2026 |
| Riduzione cuneo       | Somma esente fino a €20k; ulteriore detrazione fino a €40k  | Legge 207/2024                               |
| Lombardia             | 1,23%; 1,58%; 1,72%; 1,73% per scaglioni                    | Elenco MEF 2026, aggiornato 19/06/2026       |
| Milano                | 0,8% sull'intero imponibile oltre €23k; sotto soglia esente | Ultima regola completa MEF/Comune, anno 2025 |
| Trattamento integrativo | €1.200 sotto €15k, subordinato al test di capienza          | D.L. 3/2020, art. 1, versione 2026           |

## Casi di controllo

I risultati di regressione per RAL €25.000, €30.000, €35.000 e €50.000 sono definiti in `tests/salary.test.ts` e possono essere eseguiti con:

```bash
npm run test:calc
```

La verifica completa prima di una release è:

```bash
npm run lint
npm run test:calc
npm run build
```

I test coprono inoltre la soglia del contributo INPS aggiuntivo, il massimale post-1995, il trattamento integrativo e il fatto che l'esenzione comunale di Milano sia una soglia e non una franchigia.

## Possibili evoluzioni

- scelta di regione e comune;
- configurazione del CCNL e dell'inquadramento contributivo;
- familiari a carico e altre detrazioni o deduzioni;
- apprendistato, tempo determinato e part-time;
- bonus, fringe benefit, welfare e fondi integrativi;
- simulazione dei singoli mesi anziché della sola media annuale;
- confronto separato con il costo complessivo sostenuto dall'azienda;
- aggiornamento versionato delle regole fiscali.
