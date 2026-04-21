import { useState } from 'react';
import Popover from './Popover';
import type { Card, Checklist } from '../types/board';

interface Props {
  card: Card;
  onUpdate: (card: Card) => void;
  onClose: () => void;
  onBack?: () => void;
}

export default function ChecklistPanel({ card, onUpdate, onClose, onBack }: Props) {
  const [title, setTitle] = useState('Checklist');
  const [copyFrom, setCopyFrom] = useState('');

  const existingChecklists = card.checklists || [];

  const add = () => {
    const sourceItems = copyFrom
      ? (existingChecklists.find((cl) => cl.id === copyFrom)?.items || []).map((item) => ({
          ...item,
          id: `cli-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          done: false,
        }))
      : [];
    const cl: Checklist = { id: `cl-${Date.now()}`, title: title || 'Checklist', items: sourceItems };
    onUpdate({ ...card, checklists: [...existingChecklists, cl] });
    onClose();
  };

  return (
    <Popover title="Add checklist" onClose={onClose} onBack={onBack}>
      <div className="pop-row">
        <span className="pop-label">Title</span>
        <input
          className="pop-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          autoFocus
        />
      </div>
      <div className="pop-row">
        <span className="pop-label">Copy items from...</span>
        <select
          className="pop-input"
          value={copyFrom}
          onChange={(e) => setCopyFrom(e.target.value)}
        >
          <option value="">(none)</option>
          {existingChecklists.map((cl) => (
            <option key={cl.id} value={cl.id}>{cl.title}</option>
          ))}
        </select>
      </div>
      <button className="pop-btn" onClick={add}>Add</button>
    </Popover>
  );
}
