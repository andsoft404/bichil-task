import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import {
  Star,
  Users,
  Filter,
  Lock,
  Unlock,
  Share2,
  MoreHorizontal,
  Zap,
  Plus,
  LayoutGrid,
  Calendar,
  Inbox,
  X,
  Check,
  Copy,
  Trash2,
  Archive,
  RotateCcw,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import type { Card, Column, BoardMeta } from '../types/board';
import { BOARD_MEMBERS } from '../data/boardData';
import BoardColumn from './BoardColumn';
import CardDetailModal from './CardDetailModal';
import CardQuickMenu, { type QuickMenuAction } from './CardQuickMenu';
import './KanbanBoard.css';

let nextCardId = 100;

interface Props {
  board: BoardMeta;
  onBack: () => void;
  onBoardChange: (updated: BoardMeta) => void;
}

export default function KanbanBoard({ board, onBack, onBoardChange }: Props) {
  const [columns, setColumns] = useState<Column[]>(board.columns);
  const [boardTitle, setBoardTitle] = useState(board.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(board.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync changes back to parent
  useEffect(() => {
    onBoardChange({ ...board, columns, title: boardTitle });
  }, [columns, boardTitle]);

  // Modal state
  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [modalColumnId, setModalColumnId] = useState('');
  const [modalInitialPanel, setModalInitialPanel] = useState<string | null>(null);

  // Quick menu state
  const [quickMenu, setQuickMenu] = useState<{
    card: Card;
    x: number;
    y: number;
  } | null>(null);

  // Header state
  const [starred, setStarred] = useState(false);
  const [boardLocked, setBoardLocked] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterLabel, setFilterLabel] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [boardMembers, setBoardMembers] = useState(BOARD_MEMBERS);

  const closeAllDropdowns = () => {
    setShowMembers(false);
    setShowFilter(false);
    setShowAutomation(false);
    setShowShare(false);
    setShowMoreMenu(false);
  };

  const toggleDropdown = (setter: React.Dispatch<React.SetStateAction<boolean>>, current: boolean) => {
    closeAllDropdowns();
    setter(!current);
  };

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleTitleClick = () => {
    setTitleDraft(boardTitle);
    setEditingTitle(true);
  };

  const handleTitleSave = () => {
    const trimmed = titleDraft.trim();
    if (trimmed) setBoardTitle(trimmed);
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleSave();
    if (e.key === 'Escape') setEditingTitle(false);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === 'COLUMN') {
      setColumns((prev) => {
        const newCols = [...prev];
        const [moved] = newCols.splice(source.index, 1);
        newCols.splice(destination.index, 0, moved);
        return newCols;
      });
      return;
    }

    const newColumns = [...columns];
    const srcCol = newColumns.find((c) => c.id === source.droppableId);
    const destCol = newColumns.find((c) => c.id === destination.droppableId);
    if (!srcCol || !destCol) return;

    const [moved] = srcCol.cards.splice(source.index, 1);
    destCol.cards.splice(destination.index, 0, moved);
    setColumns(newColumns);
  };

  const handleToggleCollapse = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, collapsed: !col.collapsed } : col
      )
    );
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    );
  };

  const handleAddCard = (columnId: string, title: string) => {
    const newCard: Card = {
      id: `card-${nextCardId++}`,
      title,
      completed: false,
    };
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      )
    );
  };

  const handleOpenCard = (card: Card, columnId: string, panel?: string) => {
    setModalCard(card);
    setModalColumnId(columnId);
    setModalInitialPanel(panel || null);
  };

  const handleUpdateCard = (updated: Card) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === updated.id ? updated : c)),
      }))
    );
    setModalCard(updated);
  };

  const handleToggleComplete = (cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) =>
          c.id === cardId ? { ...c, completed: !c.completed } : c
        ),
      }))
    );
    if (modalCard?.id === cardId) {
      setModalCard((prev) => prev ? { ...prev, completed: !prev.completed } : null);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      }))
    );
  };

  const handleArchiveCard = (cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) =>
          c.id === cardId ? { ...c, archived: true } : c
        ),
      }))
    );
  };

  const handleCopyCard = (cardId: string) => {
    setColumns((prev) => {
      const newCols = prev.map((c) => ({ ...c, cards: [...c.cards] }));
      for (const col of newCols) {
        const idx = col.cards.findIndex((c) => c.id === cardId);
        if (idx !== -1) {
          const original = col.cards[idx];
          const copy: Card = {
            ...JSON.parse(JSON.stringify(original)),
            id: `card-${nextCardId++}`,
            title: `${original.title} (copy)`,
          };
          col.cards.splice(idx + 1, 0, copy);
          break;
        }
      }
      return newCols;
    });
  };

  const handleCopyLink = (cardId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#card-${cardId}`;
    navigator.clipboard.writeText(url);
  };

  const handleMirrorCard = (cardId: string) => {
    setColumns((prev) => {
      const newCols = prev.map((c) => ({ ...c, cards: [...c.cards] }));
      for (const col of newCols) {
        const idx = col.cards.findIndex((c) => c.id === cardId);
        if (idx !== -1) {
          const original = col.cards[idx];
          const mirror: Card = {
            ...JSON.parse(JSON.stringify(original)),
            id: `card-${nextCardId++}`,
            title: `${original.title}`,
            mirrorOf: original.id,
          };
          col.cards.splice(idx + 1, 0, mirror);
          break;
        }
      }
      return newCols;
    });
  };

  const handleQuickMenuAction = (action: QuickMenuAction) => {
    if (!quickMenu) return;
    const cardId = quickMenu.card.id;
    const colId = columns.find((c) => c.cards.some((card) => card.id === cardId))?.id;

    switch (action) {
      case 'open':
        if (colId) handleOpenCard(quickMenu.card, colId);
        break;
      case 'labels':
      case 'members':
      case 'dates':
      case 'move':
        if (colId) handleOpenCard(quickMenu.card, colId, action);
        break;
      case 'cover':
        if (colId) handleOpenCard(quickMenu.card, colId, 'cover');
        break;
      case 'copy':
        handleCopyCard(cardId);
        break;
      case 'link':
        handleCopyLink(cardId);
        break;
      case 'mirror':
        handleMirrorCard(cardId);
        break;
      case 'archive':
        handleArchiveCard(cardId);
        break;
    }
    setQuickMenu(null);
  };

  const handleEditCard = (card: Card, rect: DOMRect) => {
    setQuickMenu({ card, x: rect.right + 4, y: rect.top });
  };

  const handleMoveCard = (cardId: string, fromColId: string, toColId: string, position: number) => {
    setColumns((prev) => {
      const newCols = prev.map((c) => ({ ...c, cards: [...c.cards] }));
      const srcCol = newCols.find((c) => c.id === fromColId);
      const destCol = newCols.find((c) => c.id === toColId);
      if (!srcCol || !destCol) return prev;
      const idx = srcCol.cards.findIndex((c) => c.id === cardId);
      if (idx === -1) return prev;
      const [card] = srcCol.cards.splice(idx, 1);
      destCol.cards.splice(position, 0, card);
      return newCols;
    });
    setModalCard(null);
  };

  const getColumnTitle = (columnId: string) => {
    return columns.find((c) => c.id === columnId)?.title || '';
  };

  // Collect all unique labels from cards for filter
  const allLabels = Array.from(
    new Map(
      columns.flatMap((col) =>
        col.cards.flatMap((card) =>
          (card.labels || []).map((l) => [l.id, l] as const)
        )
      )
    ).values()
  );

  // Filter logic
  const filteredColumns = columns.map((col) => ({
    ...col,
    cards: col.cards.filter((card) => {
      if (card.archived) return false;
      const matchText = !filterText || card.title.toLowerCase().includes(filterText.toLowerCase());
      const matchLabel = !filterLabel || (card.labels || []).some((l) => l.id === filterLabel);
      return matchText && matchLabel;
    }),
  }));

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleRemoveMember = (memberId: string) => {
    setBoardMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleAddMemberBack = (member: typeof BOARD_MEMBERS[number]) => {
    setBoardMembers((prev) => [...prev, member]);
  };

  const removedMembers = BOARD_MEMBERS.filter(
    (m) => !boardMembers.some((bm) => bm.id === m.id)
  );

  const handleArchiveAll = () => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) => ({ ...c, archived: true })),
      }))
    );
    setShowMoreMenu(false);
  };

  const handleRestoreArchived = () => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) => ({ ...c, archived: false })),
      }))
    );
    setShowMoreMenu(false);
  };

  const handleCopyBoard = () => {
    const json = JSON.stringify({ title: boardTitle, columns }, null, 2);
    navigator.clipboard.writeText(json);
    setShowMoreMenu(false);
  };

  const handleClearFilters = () => {
    setFilterText('');
    setFilterLabel('');
  };

  return (
    <div className="kanban-wrapper">
      {/* Backdrop for closing dropdowns */}
      {(showMembers || showFilter || showAutomation || showShare || showMoreMenu) && (
        <div className="dropdown-backdrop" onClick={closeAllDropdowns} />
      )}

      <header className="board-topbar">
        <div className="topbar-left">
          <button className="topbar-btn back-btn" title="Самбарууд руу буцах" onClick={onBack}>
            <ArrowLeft size={16} />
          </button>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              className="board-name-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
            />
          ) : (
            <h1 className="board-name" onClick={handleTitleClick}>{boardTitle}</h1>
          )}
          <button
            className={`topbar-btn ${starred ? 'active-toggle' : ''}`}
            title={starred ? 'Дуртайгаас хасах' : 'Дуртайд нэмэх'}
            onClick={() => setStarred(!starred)}
          >
            <Star size={16} fill={starred ? '#f2d600' : 'none'} color={starred ? '#f2d600' : '#fff'} />
          </button>
          <div className="topbar-dropdown-wrapper">
            <button
              className={`topbar-btn ${showMembers ? 'active-toggle' : ''}`}
              title="Гишүүд"
              onClick={() => toggleDropdown(setShowMembers, showMembers)}
            >
              <Users size={16} />
            </button>
            {showMembers && (
              <div className="topbar-dropdown members-dropdown">
                <div className="dropdown-header">
                  <span>Самбарын гишүүд</span>
                  <button className="dropdown-close" onClick={() => setShowMembers(false)}><X size={14} /></button>
                </div>
                <div className="dropdown-body">
                  {boardMembers.map((m) => (
                    <div key={m.id} className="member-row">
                      <div className="member-avatar" style={{ background: m.color }}>{m.initials}</div>
                      <span className="member-name">{m.name}</span>
                      <button className="member-remove" onClick={() => handleRemoveMember(m.id)} title="Хасах">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {removedMembers.length > 0 && (
                    <>
                      <div className="dropdown-divider" />
                      <div className="dropdown-section-title">Хасагдсан</div>
                      {removedMembers.map((m) => (
                        <div key={m.id} className="member-row faded">
                          <div className="member-avatar" style={{ background: m.color }}>{m.initials}</div>
                          <span className="member-name">{m.name}</span>
                          <button className="member-add-back" onClick={() => handleAddMemberBack(m)} title="Буцаах">
                            <Plus size={14} />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="topbar-right">
          <div className="avatar-group">
            {boardMembers.map((a) => (
              <div
                key={a.id}
                className="avatar"
                style={{ backgroundColor: a.color }}
                title={a.name}
              >
                {a.initials}
              </div>
            ))}
          </div>

          {/* Automation */}
          <div className="topbar-dropdown-wrapper">
            <button
              className={`topbar-btn ${showAutomation ? 'active-toggle' : ''}`}
              title="Автоматжуулалт"
              onClick={() => toggleDropdown(setShowAutomation, showAutomation)}
            >
              <Zap size={16} />
            </button>
            {showAutomation && (
              <div className="topbar-dropdown automation-dropdown">
                <div className="dropdown-header">
                  <span>Автоматжуулалт</span>
                  <button className="dropdown-close" onClick={() => setShowAutomation(false)}><X size={14} /></button>
                </div>
                <div className="dropdown-body">
                  <p className="dropdown-info">Автомат дүрмүүд тохируулж, давтагдах ажлуудыг хөнгөвчлөөрэй.</p>
                  <div className="automation-rule">
                    <Check size={14} />
                    <span>Карт хөдлөхөд гишүүд нэмэх</span>
                  </div>
                  <div className="automation-rule">
                    <Check size={14} />
                    <span>Due date дөхвөл мэдэгдэл илгээх</span>
                  </div>
                  <div className="automation-rule">
                    <Check size={14} />
                    <span>Checklist дуусвал карт зөөх</span>
                  </div>
                  <button className="dropdown-action-btn">+ Дүрэм нэмэх</button>
                </div>
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="topbar-dropdown-wrapper">
            <button
              className={`topbar-btn ${showFilter || filterText || filterLabel ? 'active-toggle' : ''}`}
              title="Шүүлтүүр"
              onClick={() => toggleDropdown(setShowFilter, showFilter)}
            >
              <Filter size={16} />
              {(filterText || filterLabel) && <span className="filter-active-dot" />}
            </button>
            {showFilter && (
              <div className="topbar-dropdown filter-dropdown">
                <div className="dropdown-header">
                  <span>Шүүлтүүр</span>
                  <button className="dropdown-close" onClick={() => setShowFilter(false)}><X size={14} /></button>
                </div>
                <div className="dropdown-body">
                  <label className="dropdown-label">Нэрээр хайх</label>
                  <input
                    className="dropdown-input"
                    placeholder="Картын нэр..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  {allLabels.length > 0 && (
                    <>
                      <label className="dropdown-label">Шошгоор шүүх</label>
                      <div className="filter-labels">
                        <button
                          className={`filter-label-btn ${!filterLabel ? 'selected' : ''}`}
                          onClick={() => setFilterLabel('')}
                        >
                          Бүгд
                        </button>
                        {allLabels.map((l) => (
                          <button
                            key={l.id}
                            className={`filter-label-btn ${filterLabel === l.id ? 'selected' : ''}`}
                            onClick={() => setFilterLabel(filterLabel === l.id ? '' : l.id)}
                          >
                            <span className="filter-label-dot" style={{ background: l.color }} />
                            {l.text || 'Label'}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {(filterText || filterLabel) && (
                    <button className="dropdown-action-btn clear-btn" onClick={handleClearFilters}>
                      Шүүлтүүр цэвэрлэх
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Lock / Unlock */}
          <button
            className={`topbar-btn ${boardLocked ? 'active-toggle' : ''}`}
            title={boardLocked ? 'Самбарыг нээх' : 'Самбарыг түгжих'}
            onClick={() => setBoardLocked(!boardLocked)}
          >
            {boardLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>

          {/* Bookmark (second star) */}
          <button
            className={`topbar-btn ${starred ? 'active-toggle' : ''}`}
            title={starred ? 'Дуртайгаас хасах' : 'Дуртайд нэмэх'}
            onClick={() => setStarred(!starred)}
          >
            <Star size={16} fill={starred ? '#f2d600' : 'none'} color={starred ? '#f2d600' : '#fff'} />
          </button>

          {/* Share */}
          <div className="topbar-dropdown-wrapper">
            <button
              className="topbar-btn highlight"
              onClick={() => toggleDropdown(setShowShare, showShare)}
            >
              <Share2 size={16} /> Share
            </button>
            {showShare && (
              <div className="topbar-dropdown share-dropdown">
                <div className="dropdown-header">
                  <span>Хуваалцах</span>
                  <button className="dropdown-close" onClick={() => setShowShare(false)}><X size={14} /></button>
                </div>
                <div className="dropdown-body">
                  <p className="dropdown-info">Самбарын линкийг хуваалцана уу.</p>
                  <div className="share-link-row">
                    <input className="dropdown-input share-link-input" readOnly value={window.location.href} />
                    <button className="dropdown-action-btn" onClick={handleShareCopy}>
                      {shareCopied ? <><Check size={14} /> Хуулсан</> : <><Copy size={14} /> Хуулах</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* More menu */}
          <div className="topbar-dropdown-wrapper">
            <button
              className={`topbar-btn ${showMoreMenu ? 'active-toggle' : ''}`}
              onClick={() => toggleDropdown(setShowMoreMenu, showMoreMenu)}
            >
              <MoreHorizontal size={16} />
            </button>
            {showMoreMenu && (
              <div className="topbar-dropdown more-dropdown">
                <div className="dropdown-header">
                  <span>Цэс</span>
                  <button className="dropdown-close" onClick={() => setShowMoreMenu(false)}><X size={14} /></button>
                </div>
                <div className="dropdown-body">
                  <button className="dropdown-menu-item" onClick={handleCopyBoard}>
                    <Copy size={15} /> Самбар хуулах
                  </button>
                  <button className="dropdown-menu-item" onClick={handleArchiveAll}>
                    <Archive size={15} /> Бүх карт архивлах
                  </button>
                  <button className="dropdown-menu-item" onClick={handleRestoreArchived}>
                    <RotateCcw size={15} /> Архивласан картуудыг сэргээх
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-menu-item danger" onClick={() => { setColumns(board.columns); setShowMoreMenu(false); }}>
                    <Trash2 size={15} /> Самбар шинэчлэх (reset)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div
              className="board-content"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {filteredColumns.map((col, index) => (
                <BoardColumn
                  key={col.id}
                  column={col}
                  index={index}
                  onToggleCollapse={handleToggleCollapse}
                  onAddCard={handleAddCard}
                  onOpenCard={handleOpenCard}
                  onToggleComplete={handleToggleComplete}
                  onDeleteCard={handleDeleteCard}
                  onEditCard={handleEditCard}
                  onRenameColumn={handleRenameColumn}
                />
              ))}
              {provided.placeholder}
              <button className="add-list-btn">
                <Plus size={16} />
                Add another list
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <footer className="board-bottombar">
        <button className="bottom-btn">
          <Inbox size={16} /> Inbox
        </button>
        <button className="bottom-btn">
          <Calendar size={16} /> Planner
        </button>
        <button className="bottom-btn active">
          <LayoutGrid size={16} /> Board
        </button>
        <button className="bottom-btn" onClick={onBack}>
          <LayoutGrid size={16} /> Switch boards
        </button>
      </footer>

      {/* Card Detail Modal */}
      {modalCard && (
        <CardDetailModal
          card={modalCard}
          columnTitle={getColumnTitle(modalColumnId)}
          columnId={modalColumnId}
          columns={columns}
          onClose={() => { setModalCard(null); setModalInitialPanel(null); }}
          onUpdate={handleUpdateCard}
          onToggleComplete={handleToggleComplete}
          onMoveCard={handleMoveCard}
          initialPanel={modalInitialPanel}
        />
      )}

      {/* Quick Edit Menu */}
      {quickMenu && (
        <CardQuickMenu
          x={quickMenu.x}
          y={quickMenu.y}
          onClose={() => setQuickMenu(null)}
          onAction={handleQuickMenuAction}
        />
      )}
    </div>
  );
}
