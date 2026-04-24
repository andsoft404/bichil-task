import { useState } from 'react';
import Popover from './Popover';
import type { Card, Column } from '../types/board';

interface Props {
  card: Card;
  columns: Column[];
  currentColumnId: string;
  onMove: (cardId: string, fromColId: string, toColId: string, position: number) => void;
  onClose: () => void;
  onBack?: () => void;
}

export default function MoveCardPanel({ card, columns, currentColumnId, onMove, onClose, onBack }: Props) {
  const [toCol, setToCol] = useState(currentColumnId);
  const targetCol = columns.find((c) => c.id === toCol);
  const maxPos = targetCol ? targetCol.cards.filter((c) => c.id !== card.id).length : 0;
  const [position, setPosition] = useState(0);

  const move = () => {
    onMove(card.id, currentColumnId, toCol, position);
    onClose();
  };

  return (
    <Popover title="Move card" onClose={onClose} onBack={onBack}>
      <div className="pop-row">
        <span className="pop-label">List</span>
        <select className="pop-input" value={toCol} onChange={(e) => { setToCol(e.target.value); setPosition(0); }}>
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}{c.id === currentColumnId ? ' (current)' : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="pop-row">
        <span className="pop-label">Position</span>
        <select className="pop-input" value={position} onChange={(e) => setPosition(Number(e.target.value))}>
          {Array.from({ length: maxPos + 1 }, (_, i) => (
            <option key={i} value={i}>{i + 1}</option>
          ))}
        </select>
      </div>
      <button className="pop-btn" onClick={move}>Move</button>
    </Popover>
  );
}
