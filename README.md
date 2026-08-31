# RAL → Netto

Prototipo realizzato per la task tecnica **AI Builder / Product Builder di Jet HR**.

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

## Avvio locale

```bash
npm install
npm run dev
```

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

- [TUIR vigente — base imponibile e detrazione da lavoro dipendente](https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917)
- [Legge 199/2025 — riduzione al 33% del secondo scaglione IRPEF dal 2026](https://www.normattiva.it/eli/stato/LEGGE/2025/12/30/199/CONSOLIDATED)
- [Legge 207/2024 — riduzione del cuneo fiscale](https://www.normattiva.it/uri-res/N2Ls?urn%3Anir%3Astato%3Alegge%3A2024-12-30%3B207~art1-com78%21vig=)
- [INPS, circolare 6/2026 — soglia dell'1% e massimale contributivo](https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2026.01.circolare-numero-6-del-30-01-2026_15151.html)
- [INPS, circolare 101/2024 — aliquota FPLD 33%, di cui 9,19% a carico del lavoratore](https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2024.11.circolare-numero-101-del-29-11-2024_14714.html)
- [MEF — elenco ufficiale addizionali regionali 2026](https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/download/tabella.htm)
- [Comune di Milano — addizionale comunale IRPEF](https://www.comune.milano.it/argomenti/tributi/addizionale-comunale-irpef)
- [MEF — archivio addizionale comunale di Milano](https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_addcomirpef/risultato.htm?anno=9999&cc=F205&pr=MI&r=1)

Fonti consultate il **31 agosto 2026**. Il modello va revisionato alla prima modifica normativa o, in assenza di modifiche, entro il **31 gennaio 2027**.

### Tracciabilità delle formule

| Voce                  | Formula adottata                                            | Fonte / anno                                 |
| --------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| Contributi ordinari   | `min(RAL, 122.295) × 9,19%`                                 | INPS, caso standard e valori 2026            |
| Contributo aggiuntivo | `1%` sulla base oltre `€56.224`, entro il massimale         | Circolare INPS 6/2026                        |
| IRPEF                 | 23% fino a €28k; 33% da €28k a €50k; 43% oltre              | TUIR + Legge 199/2025                        |
| Detrazione lavoro     | Formula dell'art. 13 TUIR, inclusi €65 tra €25k e €35k      | TUIR vigente                                 |
| Riduzione cuneo       | Somma esente fino a €20k; ulteriore detrazione fino a €40k  | Legge 207/2024                               |
| Lombardia             | 1,23%; 1,58%; 1,72%; 1,73% per scaglioni                    | CSV MEF 2026, pubblicato 28/01/2026          |
| Milano                | 0,8% sull'intero imponibile oltre €23k; sotto soglia esente | Ultima regola completa MEF/Comune, anno 2025 |

## Casi di controllo

I risultati di regressione per RAL €25.000, €30.000, €35.000 e €50.000 sono definiti in `tests/salary.test.ts` e possono essere eseguiti con:

```bash
npm run test:calc
```

## Scelte di prodotto

- **Trasparenza prima della falsa precisione:** ogni trattenuta è leggibile e le ipotesi sono esplicite.
- **Risultato immediato:** un valore di esempio è già visibile, poi l'utente può inserire la propria RAL.
- **Progressive disclosure:** il dettaglio IRPEF è disponibile senza sovraccaricare la schermata principale.
- **Fonti nel prodotto:** chi usa o valuta il prototipo può verificare direttamente le regole adottate.

## Possibili evoluzioni

- scelta di regione e comune;
- configurazione del CCNL e dell'inquadramento contributivo;
- familiari a carico e altre detrazioni o deduzioni;
- apprendistato, tempo determinato e part-time;
- bonus, fringe benefit, welfare e fondi integrativi;
- simulazione dei singoli mesi anziché della sola media annuale;
- confronto separato con il costo complessivo sostenuto dall'azienda;
- aggiornamento versionato delle regole fiscali.
