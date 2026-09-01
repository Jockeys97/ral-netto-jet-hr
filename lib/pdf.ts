import { jsPDF } from 'jspdf';

import type { SalaryResult } from '@/lib/salary';

const BLUE = '#244fbf';
const NAVY = '#111b33';
const SLATE = '#53627a';
const LIGHT_BLUE = '#eef3ff';
const LIGHT_GRAY = '#f6f7f9';
const GREEN = '#087a55';

export type PdfView = 'annual' | 'monthly';

function amount(value: number) {
  return `${new Intl.NumberFormat('it-IT', {
    maximumFractionDigits: 0,
  }).format(value)} EUR`;
}

function dateLabel() {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function filename(result: SalaryResult, view: PdfView) {
  const period = view === 'monthly' ? 'mensile' : 'annuale';
  return `stima-netto-${period}-${Math.round(result.grossAnnual)}-eur.pdf`;
}

export function buildSalaryPdf(result: SalaryResult, view: PdfView = 'annual') {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const isMonthly = view === 'monthly';
  const divisor = isMonthly ? result.months : 1;
  const shown = (value: number) => value / divisor;
  const primaryNet = shown(result.netAnnual);
  const primaryNetLabel = isMonthly
    ? 'Netto mensile medio'
    : 'Netto annuo stimato';
  const secondaryNet = isMonthly ? result.netAnnual : result.netMonthly;
  const secondaryNetLabel = isMonthly
    ? 'netto annuo stimato'
    : `media su ${result.months} mensilita`;
  const calculationLabel = isMonthly
    ? `Media su ${result.months} mensilita generata il ${dateLabel()}`
    : `Calcolo annuale generato il ${dateLabel()}`;

  pdf.setFillColor(NAVY);
  pdf.roundedRect(margin, 15, contentWidth, 50, 4, 4, 'F');
  pdf.setTextColor('#ffffff');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('RAL -> NETTO', margin + 8, 27);
  pdf.setFontSize(8);
  pdf.setTextColor('#c9d6ff');
  pdf.text('STIMA ORIENTATIVA - MODELLO FISCALE 2026', margin + 8, 34);
  pdf.setFontSize(24);
  pdf.setTextColor('#ffffff');
  pdf.text(amount(primaryNet), margin + 8, 49);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor('#c9d6ff');
  pdf.text(primaryNetLabel, margin + 8, 56);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor('#ffffff');
  pdf.text(amount(secondaryNet), pageWidth - margin - 8, 48, {
    align: 'right',
  });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor('#c9d6ff');
  pdf.text(secondaryNetLabel, pageWidth - margin - 8, 56, {
    align: 'right',
  });

  pdf.setTextColor(NAVY);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Come si arriva al netto', margin, 80);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(SLATE);
  pdf.text(calculationLabel, margin, 86);

  const rows: Array<[string, number, 'neutral' | 'minus' | 'plus']> = [
    [
      isMonthly ? 'Retribuzione lorda media' : 'Retribuzione annua lorda',
      shown(result.grossAnnual),
      'neutral',
    ],
    [
      'Contributi INPS ordinari (9,19%)',
      shown(result.ordinaryContributions),
      'minus',
    ],
  ];
  if (result.additionalContribution > 0) {
    rows.push([
      'Contributo aggiuntivo 1% oltre la soglia',
      shown(result.additionalContribution),
      'minus',
    ]);
  }
  rows.push(
    ['IRPEF netta', shown(result.netIrpef), 'minus'],
    ['Addizionale regionale Lombardia', shown(result.regionalTax), 'minus'],
    ['Addizionale comunale Milano', shown(result.municipalTax), 'minus'],
  );
  if (result.taxFreeBenefit > 0) {
    rows.push([
      'Somma esente riduzione cuneo',
      shown(result.taxFreeBenefit),
      'plus',
    ]);
  }
  if (result.integrativeTreatment > 0) {
    rows.push([
      'Trattamento integrativo',
      shown(result.integrativeTreatment),
      'plus',
    ]);
  }

  let y = 94;
  for (const [label, value, tone] of rows) {
    pdf.setDrawColor('#dfe4ec');
    pdf.line(margin, y + 7, pageWidth - margin, y + 7);
    pdf.setFont('helvetica', tone === 'neutral' ? 'bold' : 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(tone === 'neutral' ? NAVY : SLATE);
    pdf.text(label, margin, y + 2);
    pdf.setFont('courier', 'bold');
    pdf.setTextColor(tone === 'plus' ? GREEN : tone === 'minus' ? SLATE : NAVY);
    const prefix = tone === 'plus' ? '+ ' : tone === 'minus' ? '- ' : '';
    pdf.text(`${prefix}${amount(value)}`, pageWidth - margin, y + 2, {
      align: 'right',
    });
    y += 11;
  }

  pdf.setFillColor(LIGHT_BLUE);
  pdf.roundedRect(margin, y + 3, contentWidth, 16, 3, 3, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(NAVY);
  pdf.text(primaryNetLabel, margin + 6, y + 13);
  pdf.setFont('courier', 'bold');
  pdf.setTextColor(BLUE);
  pdf.text(amount(primaryNet), pageWidth - margin - 6, y + 13, {
    align: 'right',
  });

  y += 31;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(NAVY);
  pdf.text('Dettaglio fiscale', margin, y);
  y += 7;
  const taxDetails: Array<[string, number, 'minus' | 'plus' | 'neutral']> = [
    ['Imponibile fiscale', shown(result.taxableIncome), 'neutral'],
    ['IRPEF lorda', shown(result.grossIrpef), 'minus'],
    ['Detrazione lavoro dipendente', shown(result.employeeDeduction), 'plus'],
  ];
  if (result.additionalDeduction > 0) {
    taxDetails.push([
      'Ulteriore detrazione cuneo fiscale',
      shown(result.additionalDeduction),
      'plus',
    ]);
  }
  for (const [label, value, tone] of taxDetails) {
    pdf.setFillColor(LIGHT_GRAY);
    pdf.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(SLATE);
    pdf.text(label, margin + 4, y + 6);
    pdf.setFont('courier', 'bold');
    pdf.setTextColor(tone === 'plus' ? GREEN : tone === 'minus' ? SLATE : NAVY);
    const prefix = tone === 'plus' ? '+ ' : tone === 'minus' ? '- ' : '';
    pdf.text(`${prefix}${amount(value)}`, pageWidth - margin - 4, y + 6, {
      align: 'right',
    });
    y += 11;
  }

  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(NAVY);
  pdf.text('Ipotesi e limiti', margin, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(SLATE);
  const monthlyNote = isMonthly
    ? ` Gli importi mensili sono medie ottenute dividendo i valori annuali per ${result.months}: i singoli cedolini possono variare.`
    : '';
  const note = `Dipendente privato non dirigente, tempo indeterminato, lavoro per l intero anno, residenza fiscale a Milano, nessun familiare a carico o altra agevolazione personale. Il risultato e una stima semplificata: non sostituisce una busta paga o una consulenza fiscale.${monthlyNote}`;
  const noteLines = pdf.splitTextToSize(note, contentWidth);
  pdf.text(noteLines, margin, y);

  const footerY = 280;
  pdf.setDrawColor('#dfe4ec');
  pdf.line(margin, footerY - 7, pageWidth - margin, footerY - 7);
  pdf.setFontSize(7.5);
  pdf.setTextColor(SLATE);
  pdf.text(
    'Formule, fonti ufficiali e decisioni di prodotto:',
    margin,
    footerY,
  );
  pdf.setTextColor(BLUE);
  pdf.textWithLink(
    'github.com/Jockeys97/ral-netto-jet-hr',
    margin,
    footerY + 5,
    {
      url: 'https://github.com/Jockeys97/ral-netto-jet-hr',
    },
  );
  pdf.setTextColor(SLATE);
  pdf.text('Pagina 1 / 1', pageWidth - margin, footerY + 5, { align: 'right' });

  return pdf;
}

export function exportSalaryPdf(
  result: SalaryResult,
  view: PdfView = 'annual',
) {
  buildSalaryPdf(result, view).save(filename(result, view));
}
