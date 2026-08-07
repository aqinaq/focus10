/**
 * RFC 4180 бойынша CSV жолын құрайды. Үтір, тырнақша, жол тасымалы бар
 * мәндер тырнақшаға алынады — әйтпесе тапсырма атындағы үтір бүкіл файлды
 * бұзады.
 *
 * Алдындағы BOM — Excel-дің UTF-8-ді дұрыс тануы үшін (онсыз кириллица
 * әріптері бүлініп көрінеді).
 */
const escapeCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(headers, rows) {
  const lines = [headers.map(escapeCell).join(',')]

  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','))
  }

  return `﻿${lines.join('\r\n')}\r\n`
}
