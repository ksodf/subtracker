const Subscription = require('../models/Subscription');
const { normalizeCurrency } = require('../utils/currencyUtils');
const { sendServerError } = require('../utils/errorUtils');
const { enrichSubscriptions, getSummary } = require('../utils/subscriptionUtils');

function escapeCsv(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function formatAmount(value) {
  return Number(value || 0).toFixed(2);
}

function buildReportRows(subscriptions, displayCurrency) {
  return enrichSubscriptions(subscriptions, displayCurrency).map(sub => ({
    name: sub.name,
    category: sub.category,
    price: formatAmount(sub.price),
    currency: sub.currency,
    billingCycle: sub.billing_cycle,
    monthlyEquivalent: formatAmount(sub.monthly_display_price),
    reportCurrency: displayCurrency,
    nextBillingDate: sub.billing_date,
    status: sub.status,
    paymentMethod: sub.payment_method || '',
    notes: sub.notes || '',
  }));
}

function buildCsv(rows) {
  const headers = [
    'Name',
    'Category',
    'Price',
    'Currency',
    'Billing Cycle',
    'Monthly Equivalent',
    'Report Currency',
    'Next Billing Date',
    'Status',
    'Payment Method',
    'Notes',
  ];
  const lines = [
    headers.join(','),
    ...rows.map(row => [
      row.name,
      row.category,
      row.price,
      row.currency,
      row.billingCycle,
      row.monthlyEquivalent,
      row.reportCurrency,
      row.nextBillingDate,
      row.status,
      row.paymentMethod,
      row.notes,
    ].map(escapeCsv).join(',')),
  ];
  return lines.join('\n');
}

function escapePdfText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function renderPdfPage(lines) {
  const content = ['BT', '/F1 11 Tf', '14 TL', '50 750 Td'];
  lines.forEach(line => {
    content.push(`(${escapePdfText(line)}) Tj`);
    content.push('T*');
  });
  content.push('ET');
  return content.join('\n');
}

function buildPdf(lines) {
  const pageChunks = [];
  for (let i = 0; i < lines.length; i += 48) {
    pageChunks.push(lines.slice(i, i + 48));
  }

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  const pageRefs = [];

  pageChunks.forEach(chunk => {
    const stream = renderPdfPage(chunk);
    const contentId = objects.length + 1;
    objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    const pageId = objects.length + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ` +
      `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageRefs.push(`${pageId} 0 R`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pageRefs.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf);
}

async function getReportData(req) {
  const displayCurrency = normalizeCurrency(req.query.currency);
  const subscriptions = await Subscription.findAllByUser(req.user.id);
  return {
    displayCurrency,
    rows: buildReportRows(subscriptions, displayCurrency),
    summary: getSummary(subscriptions, displayCurrency),
  };
}

exports.downloadCsv = async (req, res) => {
  try {
    const { displayCurrency, rows } = await getReportData(req);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="subtracker-report-${displayCurrency}.csv"`);
    res.send(buildCsv(rows));
  } catch (err) {
    console.error('downloadCsv:', err);
    sendServerError(res, err);
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { displayCurrency, rows, summary } = await getReportData(req);
    const lines = [
      'SubTracker Subscription Report',
      `Generated: ${new Date().toLocaleString()}`,
      `Report currency: ${displayCurrency}`,
      `Monthly total: ${formatAmount(summary.monthlyTotal)} ${displayCurrency}`,
      `Active subscriptions: ${rows.filter(row => row.status === 'active').length}`,
      '',
      'Subscriptions',
      ...rows.map(row =>
        `${row.name} | ${row.category} | ${row.price} ${row.currency} | ` +
        `${row.monthlyEquivalent} ${displayCurrency}/mo | due ${row.nextBillingDate} | ${row.status}`
      ),
    ];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="subtracker-report-${displayCurrency}.pdf"`);
    res.send(buildPdf(lines));
  } catch (err) {
    console.error('downloadPdf:', err);
    sendServerError(res, err);
  }
};
