import { useState } from 'react';
import Popover from './Popover';
import type { Card, CardMember } from '../types/board';
import { BOARD_MEMBERS } from '../data/boardData';

interface Props {
  card: Card;
  onUpdate: (card: Card) => void;
  onClose: () => void;
  onBack?: () => void;
}

export default function MembersPanel({ card, onUpdate, onClose, onBack }: Props) {
  const [search, setSearch] = useState('');
  const selected = card.members || [];

  const toggle = (m: CardMember) => {
    const has = selected.find((s) => s.id === m.id);
    const next = has ? selected.filter((s) => s.id !== m.id) : [...selected, m];
    onUpdate({ ...card, members: next });
  };

  const filtered = BOARD_MEMBERS.filter((m) =>
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover title="Members" onClose={onClose} onBack={onBack}>
      <input
        className="pop-input"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10 }}
        autoFocus
      />
      <span className="pop-label">Board members</span>
      <div className="members-list">
        {filtered.map((m) => (
          <button
            key={m.id}
            className={`member-row ${selected.find((s) => s.id === m.id) ? 'selected' : ''}`}
            onClick={() => toggle(m)}
          >
            <span className="member-avatar" style={{ background: m.color }}>{m.initials}</span>
            <span className="member-name">{m.name}</span>
            {selected.find((s) => s.id === m.id) && <span className="member-check">✓</span>}
          </button>
        ))}
      </div>
    </Popover>
  );
}
