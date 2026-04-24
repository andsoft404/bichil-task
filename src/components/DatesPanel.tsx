import { useState } from 'react';
import Popover from './Popover';
import type { Card } from '../types/board';

interface Props {
  card: Card;
  onUpdate: (card: Card) => void;
  onClose: () => void;
  onBack?: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

export default function DatesPanel({ card, onUpdate, onClose, onBack }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [startDate, setStartDate] = useState(card.startDate || '');
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [picking, setPicking] = useState<'start' | 'due'>('due');

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const dim = daysInMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const pickDay = (day: number) => {
    const d = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (picking === 'start') setStartDate(d);
    else setDueDate(d);
  };

  const save = () => {
    onUpdate({ ...card, startDate: startDate || undefined, dueDate: dueDate || undefined });
    onClose();
  };

  const remove = () => {
    setStartDate('');
    setDueDate('');
    onUpdate({ ...card, startDate: undefined, dueDate: undefined });
    onClose();
  };

  const isSelected = (day: number) => {
    const d = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return d === startDate || d === dueDate;
  };
  const isToday = (day: number) =>
    viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= dim; i++) cells.push(i);

  return (
    <Popover title="Dates" onClose={onClose} onBack={onBack}>
      {/* Calendar nav */}
      <div className="cal-nav">
        <button className="pop-btn-secondary" onClick={prevMonth}>&lt;</button>
        <span className="cal-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="pop-btn-secondary" onClick={nextMonth}>&gt;</button>
      </div>

      {/* Day headers */}
      <div className="cal-grid">
        {DAYS.map((d) => <span key={d} className="cal-dayname">{d}</span>)}
        {cells.map((day, i) => (
          <button
            key={i}
            className={`cal-day ${day === null ? 'empty' : ''} ${day && isSelected(day) ? 'selected' : ''} ${day && isToday(day) ? 'today' : ''}`}
            onClick={() => day && pickDay(day)}
            disabled={day === null}
          >
            {day || ''}
          </button>
        ))}
      </div>

      {/* Start/Due inputs */}
      <div className="pop-row">
        <span className="pop-label">Start date</span>
        <input
          className="pop-input"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          onFocus={() => setPicking('start')}
        />
      </div>
      <div className="pop-row">
        <span className="pop-label">Due date</span>
        <input
          className="pop-input"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          onFocus={() => setPicking('due')}
        />
      </div>

      <button className="pop-btn" style={{ marginTop: 4 }} onClick={save}>Save</button>
      <button className="pop-btn-danger" onClick={remove}>Remove</button>
    </Popover>
  );
}
