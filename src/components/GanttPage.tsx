import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight, Printer } from 'lucide-react';
import type { UserProfile } from '../types/board';
import './GanttPage.css';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface GanttMilestone {
  id: string;
  label: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  color: string;
}

export interface GanttRow {
  id: string;
  number: string;
  priority: string;
  task: string;
  subTask: string;
  partner: string;
  cost: string;
  planStart: string;
  planEnd: string;
  progress: number;
  actualStart: string;
  actualEnd: string;
  quality: string;
  isGroup: boolean;
  parentId?: string;
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtShortDate(s: string) {
  if (!s) return '';
  const d = parseDate(s);
  if (!d) return s;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const DAY_ABBR = ['ÐÐ¯', 'Ð”Ð', 'ÐœÐ¯', 'Ð›Ð¥', 'ÐŸÒ®', 'Ð‘Ð', 'Ð‘Ð¯'];
const MONTH_MN = ['1-Ñ€ ÑÐ°Ñ€','2-Ñ€ ÑÐ°Ñ€','3-Ñ€ ÑÐ°Ñ€','4-Ñ€ ÑÐ°Ñ€','5-Ñ€ ÑÐ°Ñ€','6-Ñ€ ÑÐ°Ñ€',
  '7-Ñ€ ÑÐ°Ñ€','8-Ñ€ ÑÐ°Ñ€','9-Ñ€ ÑÐ°Ñ€','10-Ñ€ ÑÐ°Ñ€','11-Ñ€ ÑÐ°Ñ€','12-Ñ€ ÑÐ°Ñ€'];
const PRIORITIES = ['', 'Low', 'Medium', 'High'];
const PRIORITY_COLORS: Record<string, string> = {
  High: '#c0392b', Medium: '#e67e22', Low: '#27ae60', '': '',
};

const DEFAULT_MILESTONES: GanttMilestone[] = [
  { id: 'm1', label: 'ÐšÐžÐœÐŸÐÐÐ˜Ð¢ ÐÐ–Ð˜Ð›', startDate: '2026-05-01', endDate: '2026-05-10', color: '#e67e22' },
  { id: 'm2', label: 'Ð—Ð£Ð Ð¨Ð˜Ð›ÐÐÐ¡ Ð¥Ð­Ð’Ð¨Ð˜Ð› Ð Ð£Ð£', startDate: '2026-04-27', endDate: '2026-05-10', color: '#7f8c8d' },
  { id: 'm3', label: 'ÐÐ Ð“Ð Ð¥Ð­ÐœÐ–Ð­Ð­', startDate: '2026-05-11', endDate: '2026-05-17', color: '#2980b9' },
  { id: 'm4', label: 'Ð˜Ð”Ð­Ð’Ð¥Ð–Ò®Ò®Ð›Ð­Ð›Ð¢', startDate: '2026-05-18', endDate: '2026-05-24', color: '#d4ac0d' },
  { id: 'm5', label: 'Ò®Ð  Ð”Ò®Ð / Ð¢ÐÐ™Ð›ÐÐ', startDate: '2026-05-25', endDate: '2026-05-30', color: '#27ae60' },
];

let nextRowId = 200;

const DEFAULT_ROWS: GanttRow[] = [
  { id: 'r1', number: '1.0', priority: 'Medium', task: 'Ð¡ÑÐ´ÑÐ²', subTask: '', partner: '', cost: '', planStart: '2026-04-03', planEnd: '2026-04-20', progress: 25, actualStart: '2026-04-03', actualEnd: '2026-04-22', quality: '', isGroup: true },
  { id: 'r2', number: '1.1', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-03', planEnd: '2026-04-11', progress: 33, actualStart: '2026-04-05', actualEnd: '2026-04-15', quality: '', isGroup: false, parentId: 'r1' },
  { id: 'r3', number: '1.2', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-08', planEnd: '2026-04-20', progress: 100, actualStart: '2026-04-08', actualEnd: '2026-04-20', quality: '', isGroup: false, parentId: 'r1' },
  { id: 'r4', number: '1.3', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-13', planEnd: '2026-04-20', progress: 90, actualStart: '2026-04-13', actualEnd: '2026-04-18', quality: '', isGroup: false, parentId: 'r1' },
  { id: 'r5', number: '1.4', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-03', planEnd: '2026-04-11', progress: 33, actualStart: '2026-04-03', actualEnd: '2026-04-12', quality: '', isGroup: false, parentId: 'r1' },
  { id: 'r5a', number: '1.5', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-08', planEnd: '2026-04-20', progress: 100, actualStart: '2026-04-09', actualEnd: '2026-04-20', quality: '', isGroup: false, parentId: 'r1' },
  { id: 'r5b', number: '1.6', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-13', planEnd: '2026-04-20', progress: 90, actualStart: '2026-04-13', actualEnd: '2026-04-22', quality: '', isGroup: false, parentId: 'r1' },
  { id: 'r6', number: '2.0', priority: '', task: 'Ð¡ÑÐ´ÑÐ²', subTask: '', partner: '', cost: '', planStart: '2026-04-21', planEnd: '2026-06-21', progress: 40, actualStart: '2026-04-22', actualEnd: '2026-06-21', quality: '', isGroup: true },
  { id: 'r7', number: '2.1', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-21', planEnd: '2026-06-17', progress: 70, actualStart: '2026-04-22', actualEnd: '2026-06-21', quality: '', isGroup: false, parentId: 'r6' },
  { id: 'r7a', number: '2.2', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-05-05', planEnd: '2026-06-21', progress: 60, actualStart: '2026-05-03', actualEnd: '2026-06-19', quality: '', isGroup: false, parentId: 'r6' },
  { id: 'r7b', number: '2.3', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '', planEnd: '', progress: 0, actualStart: '', actualEnd: '', quality: '', isGroup: false, parentId: 'r6' },
  { id: 'r7c', number: '2.4', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '', planEnd: '', progress: 0, actualStart: '', actualEnd: '', quality: '', isGroup: false, parentId: 'r6' },
  { id: 'r7d', number: '2.5', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '', planEnd: '', progress: 0, actualStart: '', actualEnd: '', quality: '', isGroup: false, parentId: 'r6' },
  { id: 'r8', number: '3.0', priority: '', task: 'Ð¡ÑÐ´ÑÐ²', subTask: '', partner: '', cost: '', planStart: '2026-04-03', planEnd: '2026-04-11', progress: 25, actualStart: '2026-04-03', actualEnd: '2026-04-11', quality: '', isGroup: true },
  { id: 'r9', number: '3.1', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-03', planEnd: '2026-04-11', progress: 33, actualStart: '2026-04-03', actualEnd: '2026-04-11', quality: '', isGroup: false, parentId: 'r8' },
  { id: 'r9a', number: '3.2', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-08', planEnd: '2026-04-20', progress: 100, actualStart: '2026-04-08', actualEnd: '2026-04-20', quality: '', isGroup: false, parentId: 'r8' },
  { id: 'r9b', number: '3.3', priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»', subTask: '', partner: '', cost: '', planStart: '2026-04-13', planEnd: '2026-04-20', progress: 90, actualStart: '2026-04-13', actualEnd: '2026-04-20', quality: '', isGroup: false, parentId: 'r8' },
  { id: 'r10', number: '4.0', priority: '', task: 'Ð¡ÑÐ´ÑÐ²', subTask: '', partner: '', cost: '', planStart: '2026-04-03', planEnd: '2026-04-11', progress: 40, actualStart: '2026-04-03', actualEnd: '2026-04-11', quality: '', isGroup: true },
  { id: 'r11', number: '4.1', priority: '', task: 'Sub Task 1', subTask: '', partner: '', cost: '', planStart: '2026-04-03', planEnd: '2026-04-11', progress: 70, actualStart: '2026-04-03', actualEnd: '2026-04-11', quality: '', isGroup: false, parentId: 'r10' },
  { id: 'r12', number: '4.2', priority: '', task: 'Sub Task 2', subTask: '', partner: '', cost: '', planStart: '2026-04-08', planEnd: '2026-04-20', progress: 60, actualStart: '2026-04-08', actualEnd: '2026-04-20', quality: '', isGroup: false, parentId: 'r10' },
  { id: 'r13', number: '4.3', priority: '', task: 'Sub Task 3', subTask: '', partner: '', cost: '', planStart: '2026-04-13', planEnd: '2026-04-20', progress: 50, actualStart: '2026-04-13', actualEnd: '2026-04-20', quality: '', isGroup: false, parentId: 'r10' },
  { id: 'r14', number: '4.4', priority: '', task: 'Sub Task 4', subTask: '', partner: '', cost: '', planStart: '2026-04-03', planEnd: '2026-04-11', progress: 50, actualStart: '2026-04-03', actualEnd: '2026-04-11', quality: '', isGroup: false, parentId: 'r10' },
];

// â”€â”€â”€ Editable text cell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function EditCell({ value, onChange, type = 'text' }: {
  value: string; onChange: (v: string) => void; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  if (editing) {
    return (
      <input
        ref={ref}
        className="gec-input"
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); onChange(draft); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { setEditing(false); onChange(draft); }
          if (e.key === 'Escape') { setEditing(false); setDraft(value); }
        }}
      />
    );
  }
  return (
    <span className="gec-text" onClick={() => { setDraft(value); setEditing(true); }}>
      {type === 'date' ? (fmtShortDate(value) || <span className="gec-empty">â€”</span>) : (value || <span className="gec-empty">â€”</span>)}
    </span>
  );
}

// â”€â”€â”€ Progress cell (click to edit) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ProgressCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const color = value >= 100 ? '#27ae60' : value >= 70 ? '#1976d2' : value >= 40 ? '#e67e22' : value > 0 ? '#c0392b' : '#bdc3c7';
  if (editing) {
    return (
      <input
        ref={ref}
        className="gec-input"
        type="number"
        min={0} max={100}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); onChange(Math.max(0, Math.min(100, Number(draft)))); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { setEditing(false); onChange(Math.max(0, Math.min(100, Number(draft)))); }
          if (e.key === 'Escape') { setEditing(false); }
        }}
      />
    );
  }
  return (
    <div className="gprog-wrap" onClick={() => { setDraft(String(value)); setEditing(true); }} title="Ð”Ð°Ñ€Ð¶ Ð·Ð°ÑÐ°Ñ…">
      <div className="gprog-track">
        <div className="gprog-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="gprog-lbl">{value}%</span>
    </div>
  );
}

// â”€â”€â”€ Priority select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PriorityCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      className="gpri-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={value ? { background: PRIORITY_COLORS[value], color: '#fff', borderColor: PRIORITY_COLORS[value] } : undefined}
    >
      {PRIORITIES.map((p) => (
        <option key={p} value={p}>{p || 'â€”'}</option>
      ))}
    </select>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Props {
  onBack: () => void;
  currentUser: UserProfile;
  projectTitle?: string;
}

export default function GanttPage({ onBack, currentUser: _cu, projectTitle = 'Ð‘Ð¸Ð·Ð½ÐµÑ Ñ…Ó©Ð³Ð¶Ð»Ð¸Ð¹Ð½ Ð³Ð°Ð·Ñ€Ñ‹Ð½ Ñ‚Ó©Ð»Ó©Ð²Ð»Ó©Ð³Ó©Ó©' }: Props) {
  const [rows, setRows] = useState<GanttRow[]>(DEFAULT_ROWS);
  const [milestones] = useState<GanttMilestone[]>(DEFAULT_MILESTONES);
  const [department, setDepartment] = useState('Ð‘Ð¸Ð·Ð½ÐµÑ Ñ…Ó©Ð³Ð¶Ð»Ð¸Ð¹Ð½ Ð³Ð°Ð·Ð°Ñ€');
  const [responsible, setResponsible] = useState('ÐÑÐ³Ñ‚Ð³ÑÐ»');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'split' | 'table'>('split');

  // â”€â”€ Synced scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const leftBodyRef = useRef<HTMLDivElement>(null);
  const rightBodyRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);

  const syncScroll = useCallback((source: 'left' | 'right') => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    const src = source === 'left' ? leftBodyRef.current : rightBodyRef.current;
    const dst = source === 'left' ? rightBodyRef.current : leftBodyRef.current;
    if (src && dst) dst.scrollTop = src.scrollTop;
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  // â”€â”€ Date range â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const allDates = rows.flatMap((r) => [r.planStart, r.planEnd, r.actualStart, r.actualEnd].filter(Boolean));
  const today = new Date().toISOString().slice(0, 10);
  const minDateStr = allDates.reduce((a, b) => (a < b ? a : b), today);
  const maxDateStr = allDates.reduce((a, b) => (a > b ? a : b), today);

  const msStartDates = milestones.map((m) => m.startDate).filter(Boolean);
  const msEndDates = milestones.map((m) => m.endDate).filter(Boolean);
  const allRangeStart = [...allDates, ...msStartDates].reduce((a, b) => (a < b ? a : b), today);
  const allRangeEnd = [...allDates, ...msEndDates].reduce((a, b) => (a > b ? a : b), today);

  const ganttStart = addDays(parseDate(allRangeStart) || new Date(), -5);
  const ganttEnd = addDays(parseDate(allRangeEnd) || new Date(), 10);
  const totalDays = diffDays(ganttStart, ganttEnd) + 1;
  const dayArray: Date[] = Array.from({ length: totalDays }, (_, i) => addDays(ganttStart, i));

  // Month spans
  const monthSpans: { label: string; days: number }[] = [];
  let cur = { month: dayArray[0]?.getMonth() ?? 0, year: dayArray[0]?.getFullYear() ?? 2026, count: 0 };
  for (const d of dayArray) {
    if (d.getMonth() === cur.month && d.getFullYear() === cur.year) {
      cur.count++;
    } else {
      monthSpans.push({ label: `${cur.year} Ð¾Ð½Ñ‹ ${MONTH_MN[cur.month]}`, days: cur.count });
      cur = { month: d.getMonth(), year: d.getFullYear(), count: 1 };
    }
  }
  monthSpans.push({ label: `${cur.year} Ð¾Ð½Ñ‹ ${MONTH_MN[cur.month]}`, days: cur.count });

  const COL_W = 28;
  const ROW_H = 32;
  const todayPx = diffDays(ganttStart, new Date()) * COL_W;

  // â”€â”€ Mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function updateRow(id: string, patch: Partial<GanttRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addGroupRow() {
    const maxNum = rows.reduce((mx, r) => { const n = parseFloat(r.number); return n > mx ? n : mx; }, 0);
    setRows((prev) => [...prev, {
      id: `r-${nextRowId++}`, number: `${Math.floor(maxNum) + 1}.0`, priority: '', task: 'Ð¡ÑÐ´ÑÐ²',
      subTask: '', partner: '', cost: '', planStart: '', planEnd: '', progress: 0,
      actualStart: '', actualEnd: '', quality: '', isGroup: true,
    }]);
  }

  function addChildRow(parentId: string) {
    const parent = rows.find((r) => r.id === parentId);
    if (!parent) return;
    const groupNum = Math.floor(parseFloat(parent.number));
    const siblings = rows.filter((r) => r.parentId === parentId);
    setRows((prev) => [...prev, {
      id: `r-${nextRowId++}`, number: `${groupNum}.${siblings.length + 1}`, priority: '', task: 'Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»',
      subTask: '', partner: '', cost: '', planStart: parent.planStart, planEnd: parent.planEnd,
      progress: 0, actualStart: '', actualEnd: '', quality: '', isGroup: false, parentId,
    }]);
  }

  function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id && r.parentId !== id));
  }

  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  const visibleRows = rows.filter((r) => !r.parentId || !collapsedGroups.has(r.parentId));

  function calcOverdue(row: GanttRow) {
    const a = parseDate(row.planEnd), b = parseDate(row.actualEnd);
    return a && b ? diffDays(a, b) : 0;
  }
  function calcDuration(row: GanttRow) {
    const a = parseDate(row.planStart), b = parseDate(row.planEnd);
    return a && b ? diffDays(a, b) : 0;
  }

  function barPos(start: string, end: string) {
    const s = parseDate(start), e = parseDate(end);
    if (!s || !e) return null;
    return { left: diffDays(ganttStart, s) * COL_W, width: (diffDays(s, e) + 1) * COL_W };
  }

  function msPos(m: GanttMilestone) {
    const s = parseDate(m.startDate), e = parseDate(m.endDate);
    if (!s || !e) return null;
    return { left: diffDays(ganttStart, s) * COL_W, width: (diffDays(s, e) + 1) * COL_W };
  }

  const leafRows = rows.filter((r) => !r.isGroup);
  const totalProgress = leafRows.length
    ? Math.round(leafRows.reduce((s, r) => s + r.progress, 0) / leafRows.length)
    : 0;
  const doneCount = leafRows.filter((r) => r.progress >= 100).length;
  const reportDate = new Date().toLocaleDateString('mn-MN');

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="gp-page">

      {/* â”€â”€ Top header â”€â”€ */}
      <div className="gp-header">
        <button className="gp-back" onClick={onBack}><ArrowLeft size={14} /> Ð‘ÑƒÑ†Ð°Ñ…</button>
        <div className="gp-title-block">
          <h1 className="gp-main-title">{projectTitle}</h1>
          <span className="gp-year-badge">
            {new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="gp-header-spacer" />
        <div className="gp-milestones-legend">
          {milestones.map((m) => (
            <div key={m.id} className="gp-ms-chip" style={{ background: m.color }}>
              <span className="gp-ms-chip-label">{m.label}</span>
              <span className="gp-ms-chip-sub">ÐÑÑ€</span>
            </div>
          ))}
        </div>
      </div>

      {/* â”€â”€ Meta bar â”€â”€ */}
      <div className="gp-meta">
        <div className="gp-meta-item">
          <span className="gp-meta-lbl">Ð“Ð°Ð·Ð°Ñ€ Ð½ÑÐ³Ð¶:</span>
          <input className="gp-meta-inp" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </div>
        <div className="gp-meta-item">
          <span className="gp-meta-lbl">Ð¥Ð°Ñ€Ð¸ÑƒÑ†Ð°Ð³Ñ‡:</span>
          <input className="gp-meta-inp" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
        </div>
        <div className="gp-meta-item">
          <span className="gp-meta-lbl">Ð¥Ð¸Ð¹Ð³Ð´ÑÑ… Ñ…ÑƒÐ³Ð°Ñ†Ð°Ð°:</span>
          <span className="gp-meta-val">{reportDate}</span>
        </div>
        <div className="gp-meta-spacer" />
        <div className="gp-meta-item">
          <span className="gp-meta-lbl">ÐÐ¸Ð¹Ñ‚ Ð³Ò¯Ð¹Ñ†ÑÑ‚Ð³ÑÐ»:</span>
          <div className="gp-total-bar-wrap">
            <div className="gp-total-bar">
              <div className="gp-total-fill" style={{ width: `${totalProgress}%` }} />
            </div>
            <span className="gp-total-pct">{totalProgress}%</span>
          </div>
        </div>
        <div className="gp-meta-item">
          <span className="gp-meta-badge">{doneCount}/{leafRows.length} Ð´ÑƒÑƒÑÑÐ°Ð½</span>
        </div>
      </div>

      {/* â”€â”€ Toolbar â”€â”€ */}
      <div className="gp-toolbar">
        <div className="gp-mode-tabs">
          <button className={mode === 'split' ? 'active' : ''} onClick={() => setMode('split')}>
            Ð¥Ò¯ÑÐ½ÑÐ³Ñ‚ + Gantt
          </button>
          <button className={mode === 'table' ? 'active' : ''} onClick={() => setMode('table')}>
            Ð—Ó©Ð²Ñ…Ó©Ð½ Ñ…Ò¯ÑÐ½ÑÐ³Ñ‚
          </button>
        </div>
        <div className="gp-toolbar-right">
          <button className="gp-add-btn" onClick={addGroupRow}><Plus size={13} /> Ð‘Ò¯Ð»ÑÐ³ Ð½ÑÐ¼ÑÑ…</button>
          <button className="gp-icon-btn" title="Ð¥ÑÐ²Ð»ÑÑ…" onClick={() => window.print()}><Printer size={14} /></button>
        </div>
      </div>

      {/* â”€â”€ Body â”€â”€ */}
      <div className="gp-body">

        {/* â”€â”€â”€ LEFT TABLE PANEL â”€â”€â”€ */}
        <div className="gp-left" style={mode === 'split' ? { width: 660, minWidth: 660 } : { flex: 1 }}>
          {/* Table header */}
          <div className="gp-left-head">
            <div className="gp-th gth-num">â„–</div>
            <div className="gp-th gth-pri">ÐÑ‡ Ñ…Ð¾Ð»Ð±Ð¾Ð³Ð´Ð¾Ð»</div>
            <div className="gp-th gth-task">Ð¥Ð¸Ð¹Ð³Ð´ÑÑ… Ð°Ð¶Ð¸Ð»</div>
            <div className="gp-th gth-subtask">Ð—Ð°Ð´Ñ€Ð°Ñ… Ð°Ð¶Ð¸Ð»</div>
            <div className="gp-th gth-partner">Ð¥Ð°Ð¼Ñ‚Ñ€Ð°Ñ… Ð½ÑÐ³Ð¶</div>
            <div className="gp-th gth-cost">Ð“Ð°Ñ€Ð°Ñ… Ð·Ð°Ñ€Ð´Ð°Ð»</div>
            <div className="gp-th gth-date">Ð­Ñ…Ð»ÑÑ…</div>
            <div className="gp-th gth-date">Ð”ÑƒÑƒÑÐ°Ñ…</div>
            <div className="gp-th gth-pct">Ð“Ò¯Ð¹Ñ†ÑÑ‚Ð³ÑÐ»</div>
            <div className="gp-th gth-date">Ð‘.Ð­Ñ…Ð»ÑÑ…</div>
            <div className="gp-th gth-date">Ð‘.Ð”ÑƒÑƒÑÐ°Ñ…</div>
            <div className="gp-th gth-qual">Ð§Ð°Ð½Ð°Ñ€</div>
            <div className="gp-th gth-over">Ð¥ÑÑ‚ÑÑ€ÑÑÐ½</div>
            <div className="gp-th gth-dur">Ð¥Ð¾Ð½Ð¾Ð³</div>
            <div className="gp-th gth-act"></div>
          </div>

          {/* Scrollable rows */}
          <div
            className="gp-left-body"
            ref={leftBodyRef}
            onScroll={() => syncScroll('left')}
          >
            {visibleRows.map((row) => {
              const od = calcOverdue(row);
              const dur = calcDuration(row);
              return (
                <div
                  key={row.id}
                  className={`gp-row ${row.isGroup ? 'gp-row-group' : 'gp-row-child'}`}
                  style={{ height: ROW_H }}
                >
                  <div className="gp-td gth-num">
                    <div className="gp-num-wrap">
                      {row.isGroup
                        ? <button className="gp-collapse-btn" onClick={() => toggleGroup(row.id)}>
                            {collapsedGroups.has(row.id) ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                          </button>
                        : <span className="gp-indent" />
                      }
                      <span>{row.number}</span>
                    </div>
                  </div>
                  <div className="gp-td gth-pri">
                    <PriorityCell value={row.priority} onChange={(v) => updateRow(row.id, { priority: v })} />
                  </div>
                  <div className="gp-td gth-task">
                    <EditCell value={row.task} onChange={(v) => updateRow(row.id, { task: v })} />
                  </div>
                  <div className="gp-td gth-subtask">
                    <EditCell value={row.subTask} onChange={(v) => updateRow(row.id, { subTask: v })} />
                  </div>
                  <div className="gp-td gth-partner">
                    <EditCell value={row.partner} onChange={(v) => updateRow(row.id, { partner: v })} />
                  </div>
                  <div className="gp-td gth-cost">
                    <EditCell value={row.cost} onChange={(v) => updateRow(row.id, { cost: v })} />
                  </div>
                  <div className="gp-td gth-date">
                    <EditCell type="date" value={row.planStart} onChange={(v) => updateRow(row.id, { planStart: v })} />
                  </div>
                  <div className="gp-td gth-date">
                    <EditCell type="date" value={row.planEnd} onChange={(v) => updateRow(row.id, { planEnd: v })} />
                  </div>
                  <div className="gp-td gth-pct">
                    <ProgressCell value={row.progress} onChange={(v) => updateRow(row.id, { progress: v })} />
                  </div>
                  <div className="gp-td gth-date">
                    <EditCell type="date" value={row.actualStart} onChange={(v) => updateRow(row.id, { actualStart: v })} />
                  </div>
                  <div className="gp-td gth-date">
                    <EditCell type="date" value={row.actualEnd} onChange={(v) => updateRow(row.id, { actualEnd: v })} />
                  </div>
                  <div className="gp-td gth-qual">
                    <EditCell value={row.quality} onChange={(v) => updateRow(row.id, { quality: v })} />
                  </div>
                  <div className="gp-td gth-over" style={{ color: od > 0 ? '#c0392b' : od < 0 ? '#27ae60' : undefined }}>
                    {od !== 0 ? od : ''}
                  </div>
                  <div className="gp-td gth-dur">{dur || ''}</div>
                  <div className="gp-td gth-act">
                    <div className="gp-row-btns">
                      {row.isGroup && (
                        <button className="gp-act-btn" title="Ð”ÑÐ´ Ð°Ð¶Ð¸Ð» Ð½ÑÐ¼ÑÑ…" onClick={() => addChildRow(row.id)}>
                          <Plus size={11} />
                        </button>
                      )}
                      <button className="gp-act-btn danger" title="Ð£ÑÑ‚Ð³Ð°Ñ…" onClick={() => deleteRow(row.id)}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* â”€â”€â”€ RIGHT GANTT PANEL â”€â”€â”€ */}
        {mode === 'split' && (
          <div className="gp-right">
            {/* Fixed header */}
            <div className="gp-gantt-head-wrap">
              {/* Month row */}
              <div className="gp-gantt-months" style={{ width: totalDays * COL_W }}>
                {monthSpans.map((ms, i) => (
                  <div key={i} className="gp-month-cell" style={{ width: ms.days * COL_W }}>{ms.label}</div>
                ))}
              </div>

              {/* Milestone row */}
              <div className="gp-gantt-ms-row" style={{ width: totalDays * COL_W, position: 'relative' }}>
                {milestones.map((m) => {
                  const pos = msPos(m);
                  if (!pos) return null;
                  return (
                    <div key={m.id} className="gp-ms-bar" style={{ left: pos.left, width: pos.width, background: m.color }}>
                      {pos.width > 60 && m.label}
                    </div>
                  );
                })}
              </div>

              {/* Day row */}
              <div className="gp-gantt-days" style={{ width: totalDays * COL_W }}>
                {dayArray.map((d, i) => {
                  const dow = d.getDay();
                  const isWeekend = dow === 0 || dow === 6;
                  const isTdy = diffDays(ganttStart, d) * COL_W === todayPx;
                  return (
                    <div key={i} className={`gp-day-cell ${isWeekend ? 'wknd' : ''} ${isTdy ? 'tdy' : ''}`} style={{ width: COL_W }}>
                      <div className="gp-day-abbr">{DAY_ABBR[dow]}</div>
                      <div className="gp-day-num">{d.getDate()}/{d.getMonth() + 1}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scrollable bar rows */}
            <div
              className="gp-gantt-rows"
              ref={rightBodyRef}
              onScroll={() => syncScroll('right')}
              style={{ width: totalDays * COL_W }}
            >
              {/* Column grid */}
              {dayArray.map((d, i) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div
                    key={i}
                    className={`gp-grid-col ${isWeekend ? 'wknd' : ''}`}
                    style={{ left: i * COL_W, width: COL_W, height: visibleRows.length * ROW_H }}
                  />
                );
              })}

              {/* Today line */}
              <div className="gp-today-line" style={{ left: todayPx, height: visibleRows.length * ROW_H }} />

              {/* Bars */}
              {visibleRows.map((row, ri) => {
                const top = ri * ROW_H;
                const plan = barPos(row.planStart, row.planEnd);
                const actual = barPos(row.actualStart, row.actualEnd);
                const planColor = row.isGroup ? '#546e7a' : '#1976d2';
                const actualColor = row.isGroup ? '#37474f' : '#00897b';
                return (
                  <div key={row.id}>
                    {plan && (
                      <div
                        className={`gp-bar gp-bar-plan ${row.isGroup ? 'gp-bar-grp' : ''}`}
                        style={{ left: plan.left, top: top + 5, width: plan.width }}
                        title={`${row.task}: ${row.planStart} – ${row.planEnd}`}
                      >
                        <div className="gp-bar-bg" style={{ background: `${planColor}33` }} />
                        <div className="gp-bar-fill" style={{ width: `${row.progress}%`, background: planColor }} />
                        {plan.width > 36 && (
                          <span className="gp-bar-lbl">{row.task.length > 12 ? row.task.slice(0, 10) + '…' : row.task}</span>
                        )}
                      </div>
                    )}
                    {actual && (
                      <div
                        className="gp-bar gp-bar-actual"
                        style={{ left: actual.left, top: top + 21, width: actual.width, background: `${actualColor}bb` }}
                        title={`Бодит: ${row.actualStart} – ${row.actualEnd}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Summary footer ── */}
      <div className="gp-footer">
        <span>Нийт бүлэг: <strong>{rows.filter((r) => r.isGroup).length}</strong></span>
        <span>Нийт ажил: <strong>{leafRows.length}</strong></span>
        <span>Дууссан: <strong style={{ color: '#27ae60' }}>{doneCount}</strong></span>
        <span>Хоцорсон: <strong style={{ color: '#c0392b' }}>{leafRows.filter((r) => calcOverdue(r) > 0).length}</strong></span>
        <span>Дундаж гүйцэтгэл: <strong>{totalProgress}%</strong></span>
      </div>
    </div>
  );
}
              })}

              {/* Today line */}
              <div className="gp-today-line" style={{ left: todayPx, height: visibleRows.length * ROW_H }} />

              {/* Bars */}
              {visibleRows.map((row, ri) => {
                const top = ri * ROW_H;
                const plan = barPos(row.planStart, row.planEnd);
                const actual = barPos(row.actualStart, row.actualEnd);
                const planColor = row.isGroup ? '#546e7a' : '#1976d2';
                const actualColor = row.isGroup ? '#37474f' : '#00897b';
                return (
                  <div key={row.id}>
                    {plan && (
                      <div
                        className={`gp-bar gp-bar-plan ${row.isGroup ? 'gp-bar-grp' : ''}`}
                        style={{ left: plan.left, top: top + 5, width: plan.width }}
                        title={`${row.task}: ${row.planStart} â€“ ${row.planEnd}`}
                      >
                        <div className="gp-bar-bg" style={{ background: `${planColor}33` }} />
                        <div className="gp-bar-fill" style={{ width: `${row.progress}%`, background: planColor }} />
                        {plan.width > 36 && (
                          <span className="gp-bar-lbl">{row.task.length > 12 ? row.task.slice(0, 10) + 'â€¦' : row.task}</span>
                        )}
                      </div>
                    )}
                    {actual && (
                      <div
                        className="gp-bar gp-bar-actual"
                        style={{ left: actual.left, top: top + 21, width: actual.width, background: `${actualColor}bb` }}
                        title={`Ð‘Ð¾Ð´Ð¸Ñ‚: ${row.actualStart} â€“ ${row.actualEnd}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* â”€â”€ Summary footer â”€â”€ */}
      <div className="gp-footer">
        <span>ÐÐ¸Ð¹Ñ‚ Ð±Ò¯Ð»ÑÐ³: <strong>{rows.filter((r) => r.isGroup).length}</strong></span>
        <span>ÐÐ¸Ð¹Ñ‚ Ð°Ð¶Ð¸Ð»: <strong>{leafRows.length}</strong></span>
        <span>Ð”ÑƒÑƒÑÑÐ°Ð½: <strong style={{ color: '#27ae60' }}>{doneCount}</strong></span>
        <span>Ð¥Ð¾Ñ†Ð¾Ñ€ÑÐ¾Ð½: <strong style={{ color: '#c0392b' }}>{leafRows.filter((r) => calcOverdue(r) > 0).length}</strong></span>
        <span>Ð”ÑƒÐ½Ð´Ð°Ð¶ Ð³Ò¯Ð¹Ñ†ÑÑ‚Ð³ÑÐ»: <strong>{totalProgress}%</strong></span>
      </div>
    </div>
  );
}
