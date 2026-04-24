import { Paperclip, CheckSquare, SquarePen, CircleCheck, Circle, Trash2, HardDrive } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import type { Card } from '../types/board';
import './BoardCard.css';

interface Props {
  card: Card;
  index: number;
  onOpenCard: (card: Card) => void;
  onToggleComplete: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (card: Card, rect: DOMRect) => void;
}

export default function BoardCard({
  card,
  index,
  onOpenCard,
  onToggleComplete,
  onDeleteCard,
  onEditCard,
}: Props) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`board-card ${snapshot.isDragging ? 'dragging' : ''} ${card.image && card.coverSize === 'full' ? 'card-full-cover' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpenCard(card)}
        >
          {card.image && card.coverSize === 'full' ? (
            /* ===== Full cover mode ===== */
            <>
              <div
                className="card-cover-full"
                style={
                  card.image.startsWith('#')
                    ? { background: card.image }
                    : { backgroundImage: `url(${card.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                }
              >
                <div className="card-hover-actions card-hover-actions-full">
                  <button
                    className="card-action-btn"
                    title="Засах"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = (e.currentTarget.closest('.board-card') as HTMLElement).getBoundingClientRect();
                      onEditCard(card, rect);
                    }}
                  >
                    <SquarePen size={14} />
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="card-title-row">
                  {card.completed !== undefined && (
                    <button
                      className={`card-complete-icon ${card.completed ? 'completed' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(card.id);
                      }}
                    >
                      {card.completed ? <CircleCheck size={16} /> : <Circle size={16} />}
                    </button>
                  )}
                  <span className="card-title">{card.title}</span>
                </div>
              </div>
            </>
          ) : (
            /* ===== Half cover / no cover mode ===== */
            <>
              {card.image && (
                <div className="card-cover">
                  <img
                    src={card.image.startsWith('#') ? undefined : card.image}
                    alt={card.title}
                    style={card.image.startsWith('#') ? { background: card.image, height: 140 } : undefined}
                  />
                </div>
              )}
              <div className="card-content">
                {card.label && (
                  <span
                    className="card-label"
                    style={{ backgroundColor: card.label.color }}
                  >
                    {card.label.text}
                  </span>
                )}
                {card.isCategory && (
                  <span className="card-category-tag">БҮЛЭГ СЭДЭВ:</span>
                )}
                {card.labels && card.labels.length > 0 && (
                  <div className="card-label-dots">
                    {card.labels.map((l) => (
                      <span key={l.id} className="card-label-dot" style={{ background: l.color }} />
                    ))}
                  </div>
                )}
                <div className="card-title-row">
                  {card.completed !== undefined && (
                    <button
                      className={`card-complete-icon ${card.completed ? 'completed' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(card.id);
                      }}
                    >
                      {card.completed ? <CircleCheck size={16} /> : <Circle size={16} />}
                    </button>
                  )}
                  <span className="card-title">{card.title}</span>
                  <div className="card-hover-actions">
                    <button
                      className="card-action-btn"
                      title="Устгах"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCard(card.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      className="card-action-btn"
                      title="Засах"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget.closest('.board-card') as HTMLElement).getBoundingClientRect();
                        onEditCard(card, rect);
                      }}
                    >
                      <SquarePen size={14} />
                    </button>
                  </div>
                </div>
                <div className="card-badges">
                  {card.mirrorOf && (
                    <span className="badge mirror">
                      <HardDrive size={14} />
                      Mirror
                    </span>
                  )}
                  {card.checklists && card.checklists.length > 0 && (() => {
                    const total = card.checklists.reduce((s, c) => s + c.items.length, 0);
                    const done = card.checklists.reduce((s, c) => s + c.items.filter((i) => i.done).length, 0);
                    return (
                      <span className={`badge checklist ${done === total && total > 0 ? 'complete' : ''}`}>
                        <CheckSquare size={14} />
                        {done}/{total}
                      </span>
                    );
                  })()}
                  {card.dueDate && (
                    <span className="badge">
                      <CheckSquare size={14} />
                      {new Date(card.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {card.attachments !== undefined && (
                    <span className="badge">
                      <Paperclip size={14} />
                      {card.attachments}
                    </span>
                  )}
                  {card.members && card.members.length > 0 && (
                    <div className="card-member-avatars">
                      {card.members.map((m) => (
                        <span key={m.id} className="card-member-avatar" style={{ background: m.color }}>
                          {m.initials}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}
