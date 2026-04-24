import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import {
  Star,
  Users,
  Filter,
  MoreHorizontal,
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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Card, Column, BoardMeta } from '../types/board';
import { BOARD_MEMBERS, ALL_SYSTEM_MEMBERS } from '../data/boardData';
import type { UserProfile } from '../types/board';
import BoardColumn from './BoardColumn';
import CardDetailModal from './CardDetailModal';
import CardQuickMenu, { type QuickMenuAction } from './CardQuickMenu';
import ProfileModal from './ProfileModal';
import './ProfileModal.css';
import './KanbanBoard.css';

let nextCardId = 100;
const INBOX_DAYS = ['Даваа', 'Мягмар', 'Лхавга', 'Пүрэв', 'Баасан'] as const;
const INBOX_WEEKS = [1, 2, 3, 4] as const;
const INBOX_WEEK_COLORS = [
  { bg: '#1565a0', header: '#0f4c81' },
  { bg: '#1a7a5e', header: '#145e47' },
  { bg: '#5e35b1', header: '#4527a0' },
  { bg: '#b83b00', header: '#962e00' },
];

interface Props {
  board: BoardMeta;
  onBack: () => void;
  onBoardChange: (updated: BoardMeta) => void;
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenGantt: () => void;
}

export default function KanbanBoard({ board, onBack, onBoardChange, currentUser, onUpdateProfile, onOpenGantt }: Props) {
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
  const [showMembers, setShowMembers] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterLabel, setFilterLabel] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [boardMembers, setBoardMembers] = useState(BOARD_MEMBERS);
  const [activeBottomTab, setActiveBottomTab] = useState<'inbox' | 'planner' | 'board'>('board');
  const [inboxWeeklyNotes, setInboxWeeklyNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`inbox-weekly-notes-${board.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [plannerCurrentDate, setPlannerCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [plannerNotes, setPlannerNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`planner-notes-${board.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Member invite state
  type SystemMember = typeof ALL_SYSTEM_MEMBERS[number];
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchResult, setMemberSearchResult] = useState<SystemMember | null | 'not-found'>(null);
  const [pendingInvitations, setPendingInvitations] = useState<SystemMember[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<{ id: string; member: SystemMember }[]>([
    { id: 'req-demo-1', member: ALL_SYSTEM_MEMBERS[4] },
  ]);
  const [selectedFriend, setSelectedFriend] = useState<SystemMember | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    | { type: 'delete-card'; cardId: string }
    | { type: 'remove-member'; memberId: string }
    | { type: 'cancel-invite'; memberId: string }
    | null
  >(null);

  const closeAllDropdowns = () => {
    setShowMembers(false);
    setShowFilter(false);
    setShowMoreMenu(false);
    setSelectedFriend(null);
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

  useEffect(() => {
    localStorage.setItem(`planner-notes-${board.id}`, JSON.stringify(plannerNotes));
  }, [plannerNotes, board.id]);

  useEffect(() => {
    localStorage.setItem(`inbox-weekly-notes-${board.id}`, JSON.stringify(inboxWeeklyNotes));
  }, [inboxWeeklyNotes, board.id]);

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
    setConfirmAction({ type: 'delete-card', cardId });
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

  const handleRemoveMember = (memberId: string) => {
    setConfirmAction({ type: 'remove-member', memberId });
  };

  const handleAddMemberBack = (member: SystemMember) => {
    if (boardMembers.some((m) => m.id === member.id)) return;
    if (pendingInvitations.some((m) => m.id === member.id)) return;
    setPendingInvitations((prev) => [...prev, member]);
  };

  const removedMembers = BOARD_MEMBERS.filter(
    (m) => !boardMembers.some((bm) => bm.id === m.id)
  );

  const handleSearchMember = () => {
    const id = memberSearch.trim();
    if (!id) return;
    if (!/^\d{4}$/.test(id)) {
      setMemberSearchResult('not-found');
      return;
    }
    const found = ALL_SYSTEM_MEMBERS.find((m) => m.id === id);
    if (!found) {
      setMemberSearchResult('not-found');
      return;
    }
    if (boardMembers.some((m) => m.id === found.id)) {
      setMemberSearchResult('not-found');
      return;
    }
    setMemberSearchResult(found);
  };

  const handleInviteMember = (member: SystemMember) => {
    if (pendingInvitations.some((m) => m.id === member.id)) return;
    setPendingInvitations((prev) => [...prev, member]);
    setMemberSearchResult(null);
    setMemberSearch('');
  };

  const handleCancelInvite = (memberId: string) => {
    setConfirmAction({ type: 'cancel-invite', memberId });
  };

  const getConfirmText = () => {
    if (!confirmAction) return '';
    if (confirmAction.type === 'delete-card') return 'Энэ картыг устгах уу?';
    if (confirmAction.type === 'remove-member') return 'Энэ гишүүнийг самбараас хасах уу?';
    return 'Энэ урилгыг цуцлах уу?';
  };

  const handleConfirmProceed = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'delete-card') {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== confirmAction.cardId),
        }))
      );
    }

    if (confirmAction.type === 'remove-member') {
      setBoardMembers((prev) => prev.filter((m) => m.id !== confirmAction.memberId));
    }

    if (confirmAction.type === 'cancel-invite') {
      setPendingInvitations((prev) => prev.filter((m) => m.id !== confirmAction.memberId));
    }

    setConfirmAction(null);
  };

  const handleAcceptRequest = (reqId: string) => {
    const req = incomingRequests.find((r) => r.id === reqId);
    if (req && !boardMembers.some((m) => m.id === req.member.id)) {
      setBoardMembers((prev) => [...prev, req.member]);
    }
    setIncomingRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleRejectRequest = (reqId: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

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

  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChangeMonth = (offset: number) => {
    setPlannerCurrentDate((prev) =>
      new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  const handlePlannerNoteChange = (dateKey: string, value: string) => {
    setPlannerNotes((prev) => ({ ...prev, [dateKey]: value }));
  };

  const year = plannerCurrentDate.getFullYear();
  const month = plannerCurrentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekDay = new Date(year, month, 1).getDay();
  const calendarCells: Array<Date | null> = [
    ...Array.from({ length: startWeekDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const monthLabel = plannerCurrentDate.toLocaleString('mn-MN', {
    month: 'long',
    year: 'numeric',
  });

  const handleDayNoteChange = (week: number, day: string, value: string) => {
    setInboxWeeklyNotes((prev) => ({ ...prev, [`w${week}-${day}`]: value }));
  };

  return (
    <div className="kanban-wrapper">
      {/* Backdrop for closing dropdowns */}
      {(showMembers || showFilter || showMoreMenu || selectedFriend) && (
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
              {incomingRequests.length > 0 && (
                <span className="topbar-notify-dot">{incomingRequests.length}</span>
              )}
            </button>
            {showMembers && (
              <div className="topbar-dropdown members-dropdown">
                <div className="dropdown-header">
                  <span>Самбарын гишүүд</span>
                  <button className="dropdown-close" onClick={() => setShowMembers(false)}><X size={14} /></button>
                </div>
                <div className="dropdown-body">
                  {/* ── Одоогийн гишүүд ── */}
                  {boardMembers.map((m) => (
                    <div key={m.id} className="member-row">
                      <div className="member-avatar" style={{ background: m.color }}>{m.initials}</div>
                      <div className="member-info">
                        <span className="member-name">{m.name}</span>
                        <span className="member-id-tag">ID: {m.id}</span>
                      </div>
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
                          <div className="member-info">
                            <span className="member-name">{m.name}</span>
                            <span className="member-id-tag">ID: {m.id}</span>
                          </div>
                          <button className="member-add-back" onClick={() => handleAddMemberBack(m)} title="Хүсэлт явуулах">
                            <Plus size={14} />
                          </button>
                        </div>
                      ))}
                    </>
                  )}

                  {/* ── ID-ээр хайж урих ── */}
                  <div className="dropdown-divider" />
                  <div className="dropdown-section-title">Гишүүн урих</div>
                  <div className="invite-search-row">
                    <input
                      className="dropdown-input invite-input"
                      placeholder="Гишүүний ID (жиш: 1004)"
                      value={memberSearch}
                      onChange={(e) => { setMemberSearch(e.target.value); setMemberSearchResult(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchMember()}
                    />
                    <button className="invite-search-btn" onClick={handleSearchMember}>Хайх</button>
                  </div>
                  {memberSearchResult === 'not-found' && (
                    <p className="invite-not-found">4 оронтой ID оруулна уу (жиш: 1004), эсвэл энэ гишүүн аль хэдийн нэмэгдсэн байна.</p>
                  )}
                  {memberSearchResult && memberSearchResult !== 'not-found' && (
                    <div className="member-row invite-result-row">
                      <div className="member-avatar" style={{ background: memberSearchResult.color }}>{memberSearchResult.initials}</div>
                      <div className="member-info">
                        <span className="member-name">{memberSearchResult.name}</span>
                        <span className="member-id-tag">ID: {memberSearchResult.id}</span>
                      </div>
                      {pendingInvitations.some((m) => m.id === memberSearchResult.id) ? (
                        <span className="invite-pending-badge">Хүлээгдэж байна</span>
                      ) : (
                        <button className="member-invite-btn" onClick={() => handleInviteMember(memberSearchResult)}>
                          Урих
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── Явуулсан урилгууд ── */}
                  {pendingInvitations.length > 0 && (
                    <>
                      <div className="dropdown-divider" />
                      <div className="dropdown-section-title">Явуулсан урилгууд</div>
                      {pendingInvitations.map((m) => (
                        <div key={m.id} className="member-row">
                          <div className="member-avatar" style={{ background: m.color }}>{m.initials}</div>
                          <div className="member-info">
                            <span className="member-name">{m.name}</span>
                            <span className="member-id-tag pending">Хүлээгдэж байна...</span>
                          </div>
                          <button className="member-remove" onClick={() => handleCancelInvite(m.id)} title="Цуцлах">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </>
                  )}

                  {/* ── Ирсэн хүсэлтүүд ── */}
                  {incomingRequests.length > 0 && (
                    <>
                      <div className="dropdown-divider" />
                      <div className="dropdown-section-title incoming-title">
                        Ирсэн хүсэлтүүд
                        <span className="incoming-badge">{incomingRequests.length}</span>
                      </div>
                      {incomingRequests.map((req) => (
                        <div key={req.id} className="member-row incoming-request-row">
                          <div className="member-avatar" style={{ background: req.member.color }}>{req.member.initials}</div>
                          <div className="member-info">
                            <span className="member-name">{req.member.name}</span>
                            <span className="member-id-tag">ID: {req.member.id}</span>
                          </div>
                          <div className="incoming-actions">
                            <button className="accept-btn" onClick={() => handleAcceptRequest(req.id)} title="Зөвшөөрөх">
                              <Check size={13} />
                            </button>
                            <button className="reject-btn" onClick={() => handleRejectRequest(req.id)} title="Татгалзах">
                              <X size={13} />
                            </button>
                          </div>
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
          <div className="topbar-dropdown-wrapper">
            <div className="avatar-group" title="Найз болсон гишүүд">
              {boardMembers.map((a) => (
                <button
                  key={a.id}
                  className="avatar-btn"
                  onClick={() => {
                    closeAllDropdowns();
                    setSelectedFriend(a);
                  }}
                  title={`${a.name} профайл`}
                >
                  <div
                    className="avatar"
                    style={{ backgroundColor: a.color }}
                  >
                    {a.initials}
                  </div>
                </button>
              ))}
            </div>

            {selectedFriend && (
              <div className="topbar-dropdown friend-profile-dropdown">
                <div className="dropdown-header">
                  <span>Гишүүний профайл</span>
                  <button className="dropdown-close" onClick={() => setSelectedFriend(null)}><X size={14} /></button>
                </div>
                <div className="dropdown-body friend-profile-body">
                  <div className="friend-profile-head">
                    <div className="friend-profile-avatar" style={{ backgroundColor: selectedFriend.color }}>
                      {selectedFriend.initials}
                    </div>
                    <div>
                      <p className="friend-profile-name">{selectedFriend.name}</p>
                      <p className="friend-profile-id">ID: {selectedFriend.id}</p>
                    </div>
                  </div>
                  <div className="friend-profile-meta">
                    <div className="friend-profile-row">
                      <span>Төлөв</span>
                      <strong>Найз болсон гишүүн</strong>
                    </div>
                    <div className="friend-profile-row">
                      <span>Имэйл</span>
                      <strong>{`${selectedFriend.id}@newtulv.mn`}</strong>
                    </div>
                    <div className="friend-profile-row">
                      <span>Найзууд</span>
                      <strong>{boardMembers.length} гишүүнтэй сүлжээтэй</strong>
                    </div>
                  </div>
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

          {/* Profile button */}
          <button
            className="profile-trigger-btn"
            title="Профайл"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="profile-trigger-avatar" style={{ background: currentUser.color }}>
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} />
              ) : (
                currentUser.initials
              )}
            </div>
          </button>
        </div>
      </header>

      {activeBottomTab === 'inbox' ? (
        <section className="inbox-weekly-view">
          <div className="inbox-weekly-header">
            <h2>Долоо хоногийн төлөвлөгөө</h2>
            <p>Ажлын долоо хоног бүрийн өдрийг төлөвлөн бичнэ үү.</p>
          </div>

          <div className="inbox-grid">
            {INBOX_WEEKS.map((weekNum, i) => {
              const color = INBOX_WEEK_COLORS[i];
              const filledCount = INBOX_DAYS.filter((d) => inboxWeeklyNotes[`w${weekNum}-${d}`]).length;
              return (
                <div key={weekNum} className="inbox-week-col" style={{ background: color.bg }}>
                  <div className="inbox-week-title" style={{ background: color.header }}>
                    <span>{weekNum}-р долоо хоног</span>
                    <span className={`inbox-week-badge ${filledCount === INBOX_DAYS.length ? 'full' : ''}`}>
                      {filledCount}/{INBOX_DAYS.length}
                    </span>
                  </div>
                  <div className="inbox-week-body">
                    {INBOX_DAYS.map((day) => {
                      const val = inboxWeeklyNotes[`w${weekNum}-${day}`] || '';
                      return (
                        <div key={day} className="inbox-day-row">
                          <div className="inbox-day-header">
                            <span className="inbox-day-label">{day}</span>
                            {val && (
                              <button
                                className="inbox-day-clear"
                                title="Устгах"
                                onClick={() => handleDayNoteChange(weekNum, day, '')}
                              >×</button>
                            )}
                          </div>
                          <textarea
                            className="inbox-day-input"
                            rows={2}
                            placeholder="..."
                            value={val}
                            onChange={(e) => handleDayNoteChange(weekNum, day, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : activeBottomTab === 'planner' ? (
        <section className="planner-view">
          <div className="planner-toolbar">
            <button className="planner-nav-btn" onClick={() => handleChangeMonth(-1)} title="Өмнөх сар">
              <ChevronLeft size={16} />
            </button>
            <h2 className="planner-month-title">{monthLabel}</h2>
            <button className="planner-nav-btn" onClick={() => handleChangeMonth(1)} title="Дараах сар">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="planner-weekdays">
            <span>Ня</span>
            <span>Да</span>
            <span>Мя</span>
            <span>Лх</span>
            <span>Пү</span>
            <span>Ба</span>
            <span>Бя</span>
          </div>

          <div className="planner-grid">
            {calendarCells.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="planner-day-cell empty" />;

              const dateKey = getDateKey(date);
              const isToday = dateKey === getDateKey(new Date());

              return (
                <div key={dateKey} className={`planner-day-cell ${isToday ? 'today' : ''}`}>
                  <div className="planner-day-header">
                    <span className="planner-day-number">{date.getDate()}</span>
                    {plannerNotes[dateKey]?.trim() && <span className="planner-day-dot" />}
                  </div>
                  <textarea
                    className="planner-note-input"
                    placeholder="Өдрийн тэмдэглэл..."
                    value={plannerNotes[dateKey] || ''}
                    onChange={(e) => handlePlannerNoteChange(dateKey, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : (
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
      )}

      <footer className="board-bottombar">
        <button className={`bottom-btn ${activeBottomTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveBottomTab('inbox')}>
          <Inbox size={16} /> Inbox
        </button>
        <button className={`bottom-btn ${activeBottomTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveBottomTab('planner')}>
          <Calendar size={16} /> Planner
        </button>
        <button className={`bottom-btn ${activeBottomTab === 'board' ? 'active' : ''}`} onClick={() => setActiveBottomTab('board')}>
          <LayoutGrid size={16} /> Board
        </button>
        <button className="bottom-btn" onClick={onOpenGantt}>
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

      {/* In-app confirmation modal */}
      {confirmAction && (
        <div className="site-confirm-overlay" onClick={() => setConfirmAction(null)}>
          <div className="site-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="site-confirm-title">Анхааруулга</h3>
            <p className="site-confirm-message">{getConfirmText()}</p>
            <div className="site-confirm-actions">
              <button className="site-confirm-cancel" onClick={() => setConfirmAction(null)}>
                Болих
              </button>
              <button className="site-confirm-ok" onClick={handleConfirmProceed}>
                Тийм
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <ProfileModal
          profile={currentUser}
          onSave={onUpdateProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
