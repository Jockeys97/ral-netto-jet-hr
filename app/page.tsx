'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BadgeEuro,
  Calculator,
  CheckCircle2,
  Download,
  ExternalLink,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { calculateSalary, type SalaryResult } from '@/lib/salary';

const eur = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const pct = new Intl.NumberFormat('it-IT', {
  style: 'percent',
  maximumFractionDigits: 1,
});

const sources = [
  {
    label: 'Scaglioni IRPEF 2026',
    detail: 'Legge 199/2025, art. 1 — versione vigente al 31/12/2026',
    href: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2025-12-30;199~art1!vig=2026-12-31',
  },
  {
    label: 'Detrazione da lavoro dipendente',
    detail: 'D.P.R. 917/1986, art. 13 — versione vigente al 31/12/2026',
    href: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917~art13!vig=2026-12-31',
  },
  {
    label: 'Riduzione del cuneo fiscale',
    detail:
      'Legge 207/2024, art. 1, commi 4–7 — versione vigente al 31/12/2026',
    href: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1!vig=2026-12-31',
  },
  {
    label: 'Nuovo Testo unico dal 2027',
    detail:
      'D.Lgs. 117/2026 — sostituisce il D.P.R. 917/1986 dal 1° gennaio 2027',
    href: 'https://www.gazzettaufficiale.it/eli/id/2026/07/03/26G00131/sg',
  },
  {
    label: 'Soglie contributive 2026',
    detail: 'Circolare INPS n. 6/2026',
    href: 'https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2026.01.circolare-numero-6-del-30-01-2026_15151.html',
  },
  {
    label: 'Aliquota FPLD ordinaria',
    detail:
      'Circolare INPS 101/2024: richiamo al 9,19% a carico del lavoratore',
    href: 'https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2024.11.circolare-numero-101-del-29-11-2024_14714.html',
  },
  {
    label: 'Addizionali Lombardia 2026',
    detail: 'Elenco ufficiale MEF con CSV 2026',
    href: 'https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/download/tabella.htm',
  },
  {
    label: 'Addizionale Milano',
    detail: 'Comune di Milano',
    href: 'https://www.comune.milano.it/argomenti/tributi/addizionale-comunale-irpef',
  },
  {
    label: 'Delibere Milano 2025/2026',
    detail: 'Archivio MEF: dato 2025 e assenza di dati 2026',
    href: 'https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_addcomirpef/risultato.htm?anno=9999&cc=F205&pr=MI&r=1',
  },
];

function MoneyRow({
  label,
  value,
  tone = 'negative',
}: {
  label: string;
  value: number;
  tone?: 'negative' | 'positive' | 'neutral';
}) {
  const color =
    tone === 'positive'
      ? 'text-emerald-700'
      : tone === 'neutral'
        ? 'text-slate-950'
        : 'text-slate-600';
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 py-3 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-mono text-sm font-semibold tabular-nums ${color}`}>
        {tone === 'negative' ? '− ' : tone === 'positive' ? '+ ' : ''}
        {eur.format(value)}
      </span>
    </div>
  );
}

function Results({ result }: { result: SalaryResult }) {
  const [breakdownView, setBreakdownView] = useState<'annual' | 'monthly'>(
    'annual',
  );
  const [isExporting, setIsExporting] = useState(false);
  const retained = result.netAnnual / result.grossAnnual;
  const isMonthly = breakdownView === 'monthly';
  const divisor = isMonthly ? result.months : 1;
  const shown = (value: number) => value / divisor;

  async function downloadPdf() {
    setIsExporting(true);
    try {
      const { exportSalaryPdf } = await import('@/lib/pdf');
      exportSalaryPdf(result, breakdownView);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-4" aria-live="polite">
      <Card className="border-0 bg-[#111b33] text-white shadow-[0_24px_70px_rgba(16,28,55,0.22)] ring-0">
        <CardHeader className="pb-1">
          <CardDescription className="flex items-center gap-2 text-blue-100">
            <CheckCircle2 className="size-4 text-[#c9ff4a]" /> Stima del netto
          </CardDescription>
          <CardTitle className="font-mono text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
            {eur.format(result.netAnnual)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 pt-3">
          <div className="rounded-xl bg-white/8 p-4 ring-1 ring-white/10">
            <p className="text-xs text-blue-100">Netto mensile</p>
            <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
              {eur.format(result.netMonthly)}
            </p>
            <p className="mt-1 text-[11px] text-blue-200">
              media su {result.months} mensilità
            </p>
          </div>
          <div className="rounded-xl bg-white/8 p-4 ring-1 ring-white/10">
            <p className="text-xs text-blue-100">Quota netta</p>
            <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
              {pct.format(retained)}
            </p>
            <p className="mt-1 text-[11px] text-blue-200">della RAL iniziale</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 shadow-sm ring-slate-200">
        <CardHeader className="border-b border-slate-100 sm:grid-cols-[1fr_auto] sm:grid-rows-[auto_auto]">
          <CardTitle>Come si arriva al netto</CardTitle>
          <fieldset className="mt-2 inline-grid grid-cols-2 rounded-lg bg-slate-100 p-1 sm:col-start-2 sm:row-span-2 sm:mt-0 sm:self-center">
            <legend className="sr-only">Periodo del dettaglio</legend>
            {(['annual', 'monthly'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setBreakdownView(view)}
                aria-pressed={breakdownView === view}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244fbf]/30 ${breakdownView === view ? 'bg-white text-[#244fbf] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {view === 'annual' ? 'Annuale' : 'Mensile'}
              </button>
            ))}
          </fieldset>
          <CardDescription>
            {isMonthly
              ? `Media su ${result.months} mensilità delle trattenute stimate`
              : 'Dettaglio annuale delle trattenute stimate'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MoneyRow
            label={
              isMonthly
                ? 'Retribuzione lorda media'
                : 'Retribuzione annua lorda'
            }
            value={shown(result.grossAnnual)}
            tone="neutral"
          />
          <MoneyRow
            label="Contributi INPS ordinari (9,19%)"
            value={shown(result.ordinaryContributions)}
          />
          {result.additionalContribution > 0 && (
            <MoneyRow
              label="Contributo aggiuntivo 1% oltre €56.224"
              value={shown(result.additionalContribution)}
            />
          )}
          <MoneyRow label="IRPEF netta" value={shown(result.netIrpef)} />
          <MoneyRow
            label="Addizionale regionale Lombardia"
            value={shown(result.regionalTax)}
          />
          <MoneyRow
            label="Addizionale comunale Milano"
            value={shown(result.municipalTax)}
          />
          <div className="my-3 grid grid-cols-2 gap-2 border-y border-slate-200 py-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Totale imposte</p>
              <p className="mt-1 font-mono text-base font-bold text-slate-900">
                {eur.format(shown(result.totalTaxes))}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Totale trattenute</p>
              <p className="mt-1 font-mono text-base font-bold text-slate-900">
                {eur.format(shown(result.totalDeductions))}
              </p>
            </div>
          </div>
          {result.taxFreeBenefit > 0 && (
            <MoneyRow
              label="Somma esente per riduzione del cuneo"
              value={shown(result.taxFreeBenefit)}
              tone="positive"
            />
          )}
          {result.integrativeTreatment > 0 && (
            <MoneyRow
              label="Trattamento integrativo"
              value={shown(result.integrativeTreatment)}
              tone="positive"
            />
          )}
          <div className="mt-2 flex items-center justify-between gap-4 rounded-xl bg-[#eef3ff] px-4 py-3">
            <span className="text-sm font-semibold text-[#111b33]">
              {isMonthly ? 'Netto mensile medio' : 'Netto annuo stimato'}
            </span>
            <span className="font-mono text-base font-bold text-[#244fbf]">
              {eur.format(shown(result.netAnnual))}
            </span>
          </div>
          {isMonthly && (
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Media ottenuta dividendo gli importi annuali per {result.months}.
              I singoli cedolini possono variare per addizionali, conguagli e
              tredicesima o quattordicesima.
            </p>
          )}
        </CardContent>
      </Card>

      <details className="group rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-800">
          Vedi il calcolo IRPEF{' '}
          <ArrowDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 border-t border-slate-100 pt-2">
          <MoneyRow
            label="Imponibile fiscale"
            value={shown(result.taxableIncome)}
            tone="neutral"
          />
          <MoneyRow label="IRPEF lorda" value={shown(result.grossIrpef)} />
          <MoneyRow
            label="Detrazione lavoro dipendente"
            value={shown(result.employeeDeduction)}
            tone="positive"
          />
          {result.additionalDeduction > 0 && (
            <MoneyRow
              label="Ulteriore detrazione cuneo fiscale"
              value={shown(result.additionalDeduction)}
              tone="positive"
            />
          )}
        </div>
      </details>

      <Button
        type="button"
        variant="outline"
        onClick={downloadPdf}
        disabled={isExporting}
        className="h-11 w-full rounded-xl border-[#244fbf]/25 bg-white/75 text-[#244fbf] shadow-sm hover:border-[#244fbf]/45 hover:bg-[#eef3ff]"
      >
        <Download className="size-4" />
        {isExporting ? 'Creo il PDF...' : 'Scarica riepilogo PDF'}
      </Button>
    </div>
  );
}

export default function Home() {
  const [grossInput, setGrossInput] = useState('35000');
  const [submittedGross, setSubmittedGross] = useState(35000);
  const [months, setMonths] = useState<12 | 13 | 14>(13);
  const [error, setError] = useState('');
  const result = useMemo(
    () => calculateSalary(submittedGross, months),
    [submittedGross, months],
  );

  function submit(event: { preventDefault(): void }) {
    event.preventDefault();
    const value = Number(grossInput.replace(',', '.'));
    if (!Number.isFinite(value) || value < 1000 || value > 250000) {
      setError('Inserisci una RAL compresa tra €1.000 e €250.000.');
      return;
    }
    setError('');
    setSubmittedGross(value);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f4ed] text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_75%_10%,rgba(75,117,255,0.18),transparent_35%),radial-gradient(circle_at_10%_10%,rgba(201,255,74,0.15),transparent_30%)]" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#244fbf] text-white">
            <BadgeEuro className="size-5" />
          </span>
          RAL → Netto
        </div>
        <span className="rounded-full border border-slate-300/80 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600">
          Modello fiscale 2026
        </span>
      </header>

      <section className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:pt-16">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#244fbf]">
            <Calculator className="size-4" /> Simulatore per dipendenti
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[0.96] tracking-[-0.065em] text-[#111b33] sm:text-6xl">
            Dalla RAL al netto
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">
            Una stima trasparente per un dipendente a tempo indeterminato
            residente a Milano. Ogni voce è visibile, ogni ipotesi è dichiarata.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 max-w-lg rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(17,27,51,0.08)] ring-1 ring-slate-200"
          >
            <label
              htmlFor="ral"
              className="text-sm font-semibold text-slate-800"
            >
              Retribuzione annua lorda
            </label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-slate-500">
                €
              </span>
              <Input
                id="ral"
                inputMode="decimal"
                value={grossInput}
                onChange={(event) => setGrossInput(event.target.value)}
                className="h-14 rounded-xl border-slate-300 bg-[#fbfaf7] pl-9 pr-4 font-mono text-xl font-semibold focus-visible:border-[#244fbf] focus-visible:ring-[#244fbf]/20"
                aria-describedby={error ? 'ral-error' : undefined}
                aria-invalid={Boolean(error)}
              />
            </div>
            {error && (
              <p id="ral-error" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <fieldset className="mt-5">
              <legend className="text-xs font-medium text-slate-500">
                Mensilità <span className="text-[#244fbf]">· 13 standard</span>
              </legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([12, 13, 14] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMonths(value)}
                    aria-pressed={months === value}
                    className={`h-10 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#244fbf]/30 ${months === value ? 'border-[#244fbf] bg-[#eef3ff] text-[#244fbf]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>

            <Button
              type="submit"
              size="lg"
              className="mt-5 h-12 w-full rounded-xl bg-[#244fbf] px-5 text-base text-white hover:bg-[#1d409c]"
            >
              Calcola il netto <ArrowRight data-icon="inline-end" />
            </Button>
          </form>

          <div className="mt-5 flex max-w-lg items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50/70 p-4 text-sm leading-5 text-amber-950">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>È una stima orientativa.</strong> CCNL, familiari a
              carico, bonus, detrazioni personali e conguagli possono modificare
              il cedolino reale.
            </p>
          </div>
        </div>
        <Results result={result} />
      </section>

      <section className="relative border-t border-slate-200 bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold text-[#244fbf]">Metodo</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#111b33]">
              Le ipotesi del modello
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-slate-600">
              Caso semplificato: rapporto full-time per l’intero anno, settore
              privato, residenza a Milano, nessun familiare a carico e nessuna
              agevolazione personale. L’imponibile fiscale è stimato sottraendo
              dalla RAL i contributi INPS del lavoratore.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                'IRPEF progressiva 2026: 23%, 33% e 43%',
                'INPS ordinario 9,19% + 1% sopra la soglia 2026',
                'Detrazioni, riduzione del cuneo e trattamento integrativo',
                'Addizionali regionale Lombardia e comunale Milano',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />{' '}
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Fuori dal perimetro
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Il calcolo riguarda ciò che riceve il dipendente. Non include
                contributi aziendali, INAIL, TFR, fondi, welfare, buoni pasto o
                altri elementi del costo complessivo per l’azienda.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
              Fonti istituzionali
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sources.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#244fbf]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#244fbf]/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-slate-900">
                      {source.label}
                    </p>
                    <ExternalLink className="size-4 shrink-0 text-slate-400 group-hover:text-[#244fbf]" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{source.detail}</p>
                </a>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500">
              Per il periodo d’imposta 2026 si applica il D.P.R. 917/1986 nella
              versione vigente al 31 dicembre 2026. Il provvedimento risulta
              abrogato dal 1° gennaio 2027, quando viene sostituito dal D.Lgs.
              117/2026. Fonti consultate il 31 agosto 2026. Il MEF non riporta
              ancora una delibera Milano 2026: viene quindi riutilizzata,
              dichiarandolo, l’ultima regola completa 2025 (0,8%, esenzione fino
              a €23.000).
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
