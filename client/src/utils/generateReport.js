// client/src/utils/generateReport.js
//
// Generates a professional PDF "Doctor's Report" using jsPDF + jspdf-autotable.
// No server required — runs entirely in the browser.
//
// Install dependency (once):
//   npm install jspdf jspdf-autotable
//
// ─────────────────────────────────────────────────────────────────────────────

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Colour palette (matches HerCare brand) ────────────────────────────────────
const C = {
  forest:     [26,  46,  31],   // --forest
  forestMid:  [45,  74,  53],   // --forest-mid
  sage:       [122, 158, 130],  // --sage
  sagePale:   [232, 240, 233],  // --sage-pale
  gold:       [201, 168, 76],   // --gold
  goldPale:   [250, 245, 232],  // --gold-pale
  ink:        [17,  17,  16],   // --ink
  inkMid:     [44,  44,  40],   // --ink-mid
  inkSoft:    [74,  74,  68],   // --ink-soft
  inkFaint:   [122, 122, 114],  // --ink-faint
  white:      [255, 255, 255],
  border:     [212, 207, 197],
  red:        [153, 27,  27],
  redPale:    [254, 242, 242],
};

// ── Symptom meta (display labels) ─────────────────────────────────────────────
const SYMPTOM_LABELS = {
  sleep_disruption: 'Trouble Sleeping',     acne_sensitivity: 'Acne & Skin Sensitivity',
  mood_fluctuation: 'Irritability',          fatigue: 'Fatigue',
  food_craving: 'Food Cravings',             cognitive_focus: 'Difficulty Concentrating',
  skin_changes: 'Skin Changes',             cramping: 'Cramping',
  diarrhea: 'Diarrhea',                     headache: 'Headache',
  bloating: 'Bloating',                     breast_soreness: 'Breast Soreness',
  low_back_pain: 'Low Back Pain',           energy_depletion: 'Energy Depletion',
  constipation: 'Constipation',             shortness_of_breath: 'Shortness of Breath',
  dizziness: 'Dizziness',                   back_pain: 'Back Pain',
  weight_gain: 'Weight Gain',               heartburn: 'Heartburn',
  missed_period: 'Missed Period',           breast_changes: 'Breast Changes',
  varicose_veins: 'Varicose Veins',         implantation_bleeding: 'Implantation Bleeding',
  darkening_of_areola: 'Darkening of Areola', nausea: 'Nausea',
  mood_swings: 'Mood Swings',               spotting: 'Spotting',
  breast_tenderness: 'Breast Tenderness',   backache: 'Backache',
  other: 'Other',
};

const SEVERITY_LABELS = { 1: 'Mild', 2: 'Moderate', 3: 'Noticeable', 4: 'Severe', 5: 'Extreme' };
const PHASE_LABELS = {
  menstrual: 'Menstrual', follicular: 'Follicular',
  ovulation: 'Ovulation', luteal: 'Luteal', unknown: 'Unknown',
};

function fmtDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateShort(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Helper: draw a horizontal rule ────────────────────────────────────────────
function drawRule(doc, y, color = C.border) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
}

// ── Helper: section heading ───────────────────────────────────────────────────
function sectionHeading(doc, text, y) {
  // Left accent bar
  doc.setFillColor(...C.forest);
  doc.rect(14, y - 4, 3, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.forest);
  doc.text(text.toUpperCase(), 20, y);

  drawRule(doc, y + 3, C.sagePale);
  return y + 8;
}

// ── Helper: key-value row ─────────────────────────────────────────────────────
function kvRow(doc, key, value, x, y, colW = 80) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.inkSoft);
  doc.text(key, x, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.inkMid);
  doc.text(String(value || '—'), x + colW, y);
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * generateReport(options)
 *
 * @param {Object}   user          - { name, email, dietaryPreference, language }
 * @param {Object}   cycleData     - { logs: [], avgCycleLength: 28 }
 * @param {Array}    symptomLogs   - array of SymptomLog documents (last 30 days)
 * @param {Object}   pregnancy     - pregnancy document or null
 * @param {Object}   dateRange     - { from: Date, to: Date }
 * @param {boolean}  download      - true = trigger download, false = return blob
 */
export async function generateReport({
  user,
  cycleData,
  symptomLogs = [],
  pregnancy = null,
  dateRange,
  download = true,
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = 210; // page width
  const margin = 14;
  const contentW = W - margin * 2;

  const now      = new Date();
  const fromDate = dateRange?.from || new Date(now.getTime() - 30 * 86400000);
  const toDate   = dateRange?.to   || now;
  const rangeStr = `${fmtDate(fromDate)} – ${fmtDate(toDate)}`;

  // Filter data to date range
  const logsInRange = (cycleData?.logs || []).filter(l => {
    const d = new Date(l.lastPeriodDate);
    return d >= fromDate && d <= toDate;
  });
  const symptomsInRange = symptomLogs.filter(s => {
    const d = new Date(s.date);
    return d >= fromDate && d <= toDate;
  });

  let y = 0; // current Y cursor

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — HEADER
  // ════════════════════════════════════════════════════════════════════════════

  // Deep green header band
  doc.setFillColor(...C.forest);
  doc.rect(0, 0, W, 42, 'F');

  // Gold accent line
  doc.setFillColor(...C.gold);
  doc.rect(0, 42, W, 1.2, 'F');

  // App logo / name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.white);
  doc.text('HerCare', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 210, 200);
  doc.text('Women\'s Health Platform', margin, 25);

  // Report title (right-aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text('HEALTH REPORT', W - margin, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 185);
  doc.text(`Generated: ${fmtDate(now)}`, W - margin, 21, { align: 'right' });
  doc.text(`Period: ${rangeStr}`, W - margin, 27, { align: 'right' });

  // ── Patient info strip ───────────────────────────────────────────────────
  doc.setFillColor(...C.sagePale);
  doc.rect(0, 43.2, W, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.forest);
  doc.text(user?.name || 'Patient', margin, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.inkSoft);
  doc.text(user?.email || '', margin, 57);

  // Right side of patient strip
  doc.setFontSize(8);
  doc.text(`Dietary Preference: ${(user?.dietaryPreference || 'vegetarian').charAt(0).toUpperCase() + (user?.dietaryPreference || 'vegetarian').slice(1)}`, W - margin, 52, { align: 'right' });
  doc.text(`Language: ${user?.language === 'hi' ? 'Hindi' : user?.language === 'mr' ? 'Marathi' : 'English'}`, W - margin, 57, { align: 'right' });

  // Bottom border of strip
  doc.setFillColor(...C.gold);
  doc.rect(0, 65.2, W, 0.5, 'F');

  y = 76;

  // ── Disclaimer box ───────────────────────────────────────────────────────
  doc.setFillColor(...C.goldPale);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, 'F');
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...[107, 77, 10]);
  doc.text('⚕  MEDICAL DISCLAIMER', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'This report is generated for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment.',
    margin + 4, y + 9,
  );
  y += 18;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 1 — CYCLE SUMMARY
  // ════════════════════════════════════════════════════════════════════════════
  y = sectionHeading(doc, 'Menstrual Cycle Summary', y);

  const latestLog = cycleData?.logs?.[0];
  const avgCycle  = cycleData?.avgCycleLength || 28;

  // 2-column KV grid
  const col1x = margin + 3;
  const col2x = margin + contentW / 2 + 3;

  kvRow(doc, 'Average Cycle Length', `${avgCycle} days`, col1x, y);
  kvRow(doc, 'Logs in Period',       `${logsInRange.length} entries`, col2x, y);
  y += 6;
  kvRow(doc, 'Last Period Date',     fmtDate(latestLog?.lastPeriodDate), col1x, y);
  kvRow(doc, 'Predicted Next Period',fmtDate(latestLog?.predictedNextDate), col2x, y);
  y += 6;
  kvRow(doc, 'Ovulation Date',       fmtDate(latestLog?.ovulationDate), col1x, y);
  kvRow(doc, 'Typical Flow',         latestLog?.flow || '—', col2x, y);
  y += 10;

  // Cycle history table
  if (logsInRange.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Period Start', 'Cycle Length', 'Period Length', 'Flow', 'Predicted Next']],
      body: logsInRange.slice(0, 10).map(l => [
        fmtDate(l.lastPeriodDate),
        `${l.cycleLength} days`,
        `${l.periodLength} days`,
        (l.flow || '—').charAt(0).toUpperCase() + (l.flow || '—').slice(1),
        fmtDate(l.predictedNextDate),
      ]),
      styles: {
        font: 'helvetica', fontSize: 8,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        textColor: C.inkMid,
        lineColor: C.border, lineWidth: 0.2,
      },
      headStyles: {
        fillColor: C.forest, textColor: C.white,
        fontStyle: 'bold', fontSize: 8,
      },
      alternateRowStyles: { fillColor: C.sagePale },
      margin: { left: margin, right: margin },
      tableWidth: contentW,
    });
    y = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.inkFaint);
    doc.text('No cycle logs found in the selected date range.', col1x, y);
    y += 10;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 2 — SYMPTOM LOG
  // ════════════════════════════════════════════════════════════════════════════

  // Auto page-break check
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionHeading(doc, 'Symptom Log', y);

  if (symptomsInRange.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.inkFaint);
    doc.text('No symptoms logged in the selected date range.', col1x, y);
    y += 10;
  } else {
    // Flatten all symptom entries into rows
    const symRows = [];
    symptomsInRange.forEach(log => {
      log.symptoms?.forEach(s => {
        symRows.push([
          fmtDateShort(log.date),
          SYMPTOM_LABELS[s.type] || s.type,
          s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : '—',
          `${s.severity}/5 — ${SEVERITY_LABELS[s.severity] || ''}`,
          s.notes || '',
        ]);
      });
    });

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Symptom', 'Category', 'Severity', 'Notes']],
      body: symRows.slice(0, 60),   // cap at 60 rows to stay reasonable
      styles: {
        font: 'helvetica', fontSize: 7.5,
        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        textColor: C.inkMid,
        lineColor: C.border, lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: C.forestMid, textColor: C.white,
        fontStyle: 'bold', fontSize: 8,
      },
      alternateRowStyles: { fillColor: C.sagePale },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 48 },
        2: { cellWidth: 28 },
        3: { cellWidth: 34 },
        4: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
      tableWidth: contentW,
    });
    y = doc.lastAutoTable.finalY + 10;

    // Symptom frequency summary
    if (y > 220) { doc.addPage(); y = 20; }

    const freq = {};
    symptomsInRange.forEach(log => {
      log.symptoms?.forEach(s => {
        freq[s.type] = (freq[s.type] || 0) + 1;
      });
    });
    const topSymptoms = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    if (topSymptoms.length > 0) {
      y = sectionHeading(doc, 'Most Frequent Symptoms', y);

      // Mini bar chart via filled rects
      const barMaxW = 80;
      const maxCount = topSymptoms[0][1];
      topSymptoms.forEach(([type, count], i) => {
        const barW = Math.max(2, (count / maxCount) * barMaxW);
        const rowY  = y + i * 8;

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...C.inkMid);
        doc.text(SYMPTOM_LABELS[type] || type, col1x, rowY);

        // Bar
        doc.setFillColor(...C.sagePale);
        doc.rect(col1x + 58, rowY - 4, barMaxW, 5.5, 'F');
        doc.setFillColor(...C.forest);
        doc.rect(col1x + 58, rowY - 4, barW, 5.5, 'F');

        // Count label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...C.forest);
        doc.text(`${count}×`, col1x + 58 + barW + 2, rowY);
      });
      y += topSymptoms.length * 8 + 6;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 3 — PREGNANCY (if active)
  // ════════════════════════════════════════════════════════════════════════════
  if (pregnancy) {
    if (y > 220) { doc.addPage(); y = 20; }
    y = sectionHeading(doc, 'Pregnancy Information', y);

    kvRow(doc, 'Current Week',    `Week ${pregnancy.currentWeek} of 40`, col1x, y);
    kvRow(doc, 'Trimester',       `${pregnancy.trimester} of 3`, col2x, y);
    y += 6;
    kvRow(doc, 'Due Date',        fmtDate(pregnancy.dueDate), col1x, y);
    kvRow(doc, 'Last LMP',        fmtDate(pregnancy.lastMenstrualPeriod), col2x, y);
    y += 10;

    // Progress bar
    const pct    = Math.min(100, Math.round((pregnancy.currentWeek / 40) * 100));
    const barW   = contentW - 6;
    const fillW  = (pct / 100) * barW;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.inkSoft);
    doc.text(`Pregnancy Progress: ${pct}% complete`, col1x, y);
    y += 4;

    doc.setFillColor(...C.sagePale);
    doc.roundedRect(col1x, y, barW, 5, 1, 1, 'F');
    doc.setFillColor(...C.forest);
    if (fillW > 0) doc.roundedRect(col1x, y, fillW, 5, 1, 1, 'F');
    y += 10;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 4 — DOCTOR'S NOTES (blank area for handwriting)
  // ════════════════════════════════════════════════════════════════════════════
  if (y > 200) { doc.addPage(); y = 20; }
  y = sectionHeading(doc, 'Doctor\'s Notes', y);

  // Ruled lines for handwriting
  for (let i = 0; i < 5; i++) {
    const lineY = y + i * 10;
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(margin, lineY, W - margin, lineY);
  }
  y += 58;

  // ════════════════════════════════════════════════════════════════════════════
  // FOOTER — every page
  // ════════════════════════════════════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = 297;

    // Bottom gold rule
    doc.setFillColor(...C.gold);
    doc.rect(0, pageH - 14, W, 0.5, 'F');

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.inkFaint);
    doc.text('HerCare — Women\'s Health Platform', margin, pageH - 8);
    doc.text(`Page ${i} of ${totalPages}`, W - margin, pageH - 8, { align: 'right' });
    doc.text('⚕ This report is for informational purposes only and does not constitute medical advice.', W / 2, pageH - 8, { align: 'center' });
  }

  // ── Output ────────────────────────────────────────────────────────────────
  const fileName = `HerCare_Report_${user?.name?.replace(/\s+/g, '_') || 'Patient'}_${now.toISOString().split('T')[0]}.pdf`;

  if (download) {
    doc.save(fileName);
    return null;
  } else {
    return doc.output('blob');
  }
}