import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import Popover from './Popover';
import type { Card, CardLabel } from '../types/board';
import { DEFAULT_LABELS } from '../data/boardData';

const COLOR_GRID = [
  ['#4bce97', '#c4a33b', '#c77a20', '#f87168', '#9f8fef'],
  ['#4ecdc4', '#e6c84d', '#e8922a', '#ef5350', '#ce93d8'],
  ['#81ecb0', '#d4a017', '#f5a623', '#e74c3c', '#ab47bc'],
  ['#00695c', '#00838f', '#827717', '#ad1457', '#757575'],
  ['#1565c0', '#00838f', '#7cb342', '#e91e82', '#9e9e9e'],
  ['#1976d2', '#0097a7', '#8bc34a', '#ec407a', '#bdbdbd'],
];

interface Props {
  card: Card;
  onUpdate: (card: Card) => void;
  onClose: () => void;
  onBack?: () => void;
}

export default function LabelsPanel({ card, onUpdate, onClose, onBack }: Props) {
  const [search, setSearch] = useState('');
  const [editingLabel, setEditingLabel] = useState<CardLabel | null>(null);
  const [editText, setEditText] = useState('');
  const [allLabels, setAllLabels] = useState<CardLabel[]>(() => {
    const existing = [...DEFAULT_LABELS];
    card.labels?.forEach((cl) => {
      if (!existing.find((e) => e.id === cl.id)) existing.push(cl);
    });
    return existing;
  });

  const [editColor, setEditColor] = useState('');

  const selected = card.labels || [];

  const toggle = (label: CardLabel) => {
    const has = selected.find((l) => l.id === label.id);
    const next = has ? selected.filter((l) => l.id !== label.id) : [...selected, label];
    onUpdate({ ...card, labels: next });
  };

  const createLabel = () => {
    const id = `lbl-${Date.now()}`;
    const newLabel: CardLabel = { id, color: '#579dff', text: '' };
    setEditingLabel(newLabel);
    setEditText('');
    setEditColor(newLabel.color);
  };

  const saveEdit = () => {
    if (!editingLabel) return;
    const updatedLabel = { ...editingLabel, text: editText, color: editColor || editingLabel.color };

    // Check if it's a new label (not yet in allLabels)
    const existing = allLabels.find((l) => l.id === editingLabel.id);
    if (existing) {
      setAllLabels(allLabels.map((l) => l.id === editingLabel.id ? updatedLabel : l));
      const updatedSel = selected.map((l) => l.id === editingLabel.id ? updatedLabel : l);
      onUpdate({ ...card, labels: updatedSel });
    } else {
      setAllLabels([...allLabels, updatedLabel]);
      onUpdate({ ...card, labels: [...selected, updatedLabel] });
    }
    setEditingLabel(null);
  };

  const deleteLabel = () => {
    if (!editingLabel) return;
    setAllLabels(allLabels.filter((l) => l.id !== editingLabel.id));
    onUpdate({ ...card, labels: selected.filter((l) => l.id !== editingLabel.id) });
    setEditingLabel(null);
  };

  const filtered = allLabels.filter((l) =>
    !search || (l.text || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover title="Labels" onClose={onClose} onBack={onBack}>
      <input
        className="pop-input"
        placeholder="Search labels..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <span className="pop-label">Labels</span>
      <div className="labels-list">
        {filtered.map((label) => (
          <div key={label.id} className="label-row">
            <input
              type="checkbox"
              checked={!!selected.find((l) => l.id === label.id)}
              onChange={() => toggle(label)}
              className="label-check"
            />
            <div
              className="label-swatch"
              style={{ background: label.color }}
              onClick={() => toggle(label)}
            >
              {label.text || ''}
            </div>
            <button
              className="label-edit-btn"
              onClick={() => { setEditingLabel(label); setEditText(label.text || ''); setEditColor(label.color); }}
            >
              <Pencil size={14} />
            </button>
          </div>
        ))}
      </div>
      <button className="pop-btn" style={{ marginTop: 8 }} onClick={createLabel}>
        Create a new label
      </button>

      {editingLabel && (
        <div className="label-edit-overlay">
          <Popover
            title="Edit label"
            onClose={() => setEditingLabel(null)}
            onBack={() => setEditingLabel(null)}
          >
            {/* Color preview */}
            <div className="label-edit-preview" style={{ background: editColor || editingLabel.color }}>
              {editText}
            </div>

            {/* Title */}
            <div className="pop-row">
              <span className="pop-label">Title</span>
              <input
                className="pop-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                autoFocus
              />
            </div>

            {/* Color grid */}
            <div className="pop-row">
              <span className="pop-label">Select a color</span>
              <div className="label-color-grid">
                {COLOR_GRID.map((row, ri) =>
                  row.map((color, ci) => (
                    <button
                      key={`${ri}-${ci}`}
                      className={`label-color-cell ${editColor === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setEditColor(color)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Remove color */}
            <button className="label-remove-color" onClick={() => setEditColor('#3a3f44')}>
              <X size={14} /> Remove color
            </button>

            {/* Save / Delete */}
            <div className="label-edit-actions">
              <button className="pop-btn" onClick={saveEdit}>Save</button>
              <button className="label-delete-btn" onClick={deleteLabel}>Delete</button>
            </div>
          </Popover>
        </div>
      )}
    </Popover>
  );
}
