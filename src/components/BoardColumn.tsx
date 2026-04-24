import { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, ChevronsLeftRight, ChevronsRightLeft, X } from 'lucide-react';
import type { Card, Column } from '../types/board';
import BoardCard from './BoardCard';
import './BoardColumn.css';

interface Props {
  column: Column;
  index: number;
  onToggleCollapse: (columnId: string) => void;
  onAddCard: (columnId: string, title: string) => void;
  onOpenCard: (card: Card, columnId: string) => void;
  onToggleComplete: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (card: Card, rect: DOMRect) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
}

export default function BoardColumn({
  column,
  index,
  onToggleCollapse,
  onAddCard,
  onOpenCard,
  onToggleComplete,
  onDeleteCard,
  onEditCard,
  onRenameColumn,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingColTitle, setEditingColTitle] = useState(false);
  const [colTitleDraft, setColTitleDraft] = useState(column.title);
  const colTitleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingColTitle && colTitleRef.current) {
      colTitleRef.current.focus();
      colTitleRef.current.select();
    }
  }, [editingColTitle]);

  const saveColTitle = () => {
    const trimmed = colTitleDraft.trim();
    if (trimmed && trimmed !== column.title) {
      onRenameColumn(column.id, trimmed);
    } else {
      setColTitleDraft(column.title);
    }
    setEditingColTitle(false);
  };
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [adding]);

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (trimmed) {
      onAddCard(column.id, trimmed);
      setNewTitle('');
      // keep form open for continuous adding
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setAdding(false);
      setNewTitle('');
    }
  };

  if (column.collapsed) {
    return (
      <Draggable draggableId={column.id} index={index}>
        {(provided, snapshot) => (
          <div
            className={`board-column collapsed ${snapshot.isDragging ? 'column-dragging' : ''}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <button
              className="collapse-expand-btn"
              title="Дэлгэх"
              onClick={() => onToggleCollapse(column.id)}
            >
              <ChevronsLeftRight size={16} />
            </button>
            <div className="collapsed-header">
              <span className="collapsed-title">{column.title}</span>
              {column.cards.filter((c) => !c.archived).length > 0 && (
                <span className="collapsed-count">{column.cards.filter((c) => !c.archived).length}</span>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  }

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`board-column ${snapshot.isDragging ? 'column-dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="column-header" {...provided.dragHandleProps}>
            {editingColTitle ? (
              <input
                ref={colTitleRef}
                className="column-title-input"
                value={colTitleDraft}
                onChange={(e) => setColTitleDraft(e.target.value)}
                onBlur={saveColTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveColTitle();
                  if (e.key === 'Escape') { setColTitleDraft(column.title); setEditingColTitle(false); }
                }}
              />
            ) : (
              <h3
                className="column-title"
                onClick={() => { setColTitleDraft(column.title); setEditingColTitle(true); }}
              >
                {column.title}
              </h3>
            )}
            <div className="column-actions">
              <button className="icon-btn" onClick={() => onToggleCollapse(column.id)} title="Эвхэх">
                <ChevronsRightLeft size={16} />
              </button>
              <button className="icon-btn"><MoreHorizontal size={16} /></button>
            </div>
          </div>
          <Droppable droppableId={column.id} type="CARD">
            {(dropProvided, dropSnapshot) => (
              <div
                className={`column-cards ${dropSnapshot.isDraggingOver ? 'drag-over' : ''}`}
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
              >
                {column.cards.filter((card) => !card.archived).map((card, cardIndex) => (
                  <BoardCard
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    onOpenCard={(c) => onOpenCard(c, column.id)}
                    onToggleComplete={onToggleComplete}
                    onDeleteCard={onDeleteCard}
                    onEditCard={onEditCard}
                  />
                ))}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>

          {adding ? (
            <div className="add-card-form">
              <textarea
                ref={inputRef}
                className="add-card-input"
                placeholder="Enter a title or paste a link"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />
              <div className="add-card-actions">
                <button className="add-card-submit" onClick={handleAdd}>
                  Add card
                </button>
                <button
                  className="add-card-cancel"
                  onClick={() => {
                    setAdding(false);
                    setNewTitle('');
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <button className="add-card-btn" onClick={() => setAdding(true)}>
              <Plus size={16} />
              Add a card
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}
