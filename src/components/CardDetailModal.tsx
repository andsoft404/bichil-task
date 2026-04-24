import { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Tag,
  Calendar,
  CheckSquare,
  Users,
  AlignLeft,
  CircleCheck,
  Circle,
  Paperclip,
  ArrowRight,
  Trash2,
  LayoutList,
  ExternalLink,
  MoreHorizontal,
  Image,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Copy,
  FlipHorizontal,
  FileText,
  Eye,
  Share2,
  Archive,
} from 'lucide-react';
import type { Card, Column, CardMember, ActivityEntry } from '../types/board';
import { BOARD_MEMBERS } from '../data/boardData';
import AddMenuPanel, { type PanelName } from './AddMenuPanel';
import LabelsPanel from './LabelsPanel';
import DatesPanel from './DatesPanel';
import ChecklistPanel from './ChecklistPanel';
import MembersPanel from './MembersPanel';
import AttachmentPanel from './AttachmentPanel';
import MoveCardPanel from './MoveCardPanel';
import CoverPanel from './CoverPanel';
import './CardDetailModal.css';
import './Panels.css';

interface Props {
  card: Card;
  columnTitle: string;
  columnId: string;
  columns: Column[];
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onToggleComplete: (cardId: string) => void;
  onMoveCard: (cardId: string, fromColId: string, toColId: string, position: number) => void;
  initialPanel?: string | null;
}

export default function CardDetailModal({
  card,
  columnTitle,
  columnId,
  columns,
  onClose,
  onUpdate,
  onToggleComplete,
  onMoveCard,
  initialPanel = null,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [editingDesc, setEditingDesc] = useState(false);
  const [openPanel, setOpenPanel] = useState<PanelName | 'add' | 'cover' | null>(initialPanel as PanelName | 'add' | 'cover' | null);
  const [showCoverPanel, setShowCoverPanel] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const activityLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc && descRef.current) {
      descRef.current.focus();
    }
  }, [editingDesc]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openPanel) setOpenPanel(null);
        else onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose, openPanel]);

  useEffect(() => {
    const el = activityLogRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [card.activities]);

  const saveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== card.title) {
      onUpdate(withActivity({ ...card, title: trimmed }, `гарчгийг "${card.title}" → "${trimmed}" болгов`));
    }
    setEditingTitle(false);
  };

  const saveDescription = () => {
    const hadDesc = !!(card.description && card.description.trim());
    const updated = { ...card, description };
    const text = hadDesc ? 'тайлбарыг шинэчиллээ' : 'тайлбар нэмлээ';
    onUpdate(withActivity(updated, text));
    setEditingDesc(false);
  };

  const closePanel = () => setOpenPanel(null);

  // ---- Activity helpers ----
  const withActivity = (updatedCard: Card, text: string): Card => {
    const entry: ActivityEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      createdAt: new Date().toISOString(),
      type: 'activity',
    };
    return { ...updatedCard, activities: [...(updatedCard.activities || []), entry] };
  };

  const formatActivityTime = (isoString: string): string => {
    const date = new Date(isoString);
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} мин өмнө`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} цаг өмнө`;
    return date.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // --------------------------

  const handleAddMenuSelect = (panel: PanelName) => setOpenPanel(panel);

  const handleAttach = (file: { name: string; url: string }) => {
    const newFile = {
      id: `att-${Date.now()}`,
      name: file.name,
      url: file.url,
      addedAt: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    };
    const files = [...(card.attachmentFiles || []), newFile];
    const updated = { ...card, attachmentFiles: files, attachments: files.length };
    onUpdate(withActivity(updated, `"${file.name}" файл хавсаргалаа`));
  };

  const handleDeleteAttachment = (attId: string) => {
    const att = (card.attachmentFiles || []).find((a) => a.id === attId);
    const files = (card.attachmentFiles || []).filter((a) => a.id !== attId);
    const updated = { ...card, attachmentFiles: files, attachments: files.length };
    onUpdate(withActivity(updated, `"${att?.name || 'файл'}" хавсралтыг устгалаа`));
  };

  const handleToggleChecklistItem = (clId: string, itemId: string) => {
    const cl = card.checklists?.find((c) => c.id === clId);
    const item = cl?.items.find((i) => i.id === itemId);
    const wasDone = item?.done || false;
    const checklists = (card.checklists || []).map((c) =>
      c.id === clId
        ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, done: !i.done } : i) }
        : c
    );
    const updated = { ...card, checklists };
    const text = wasDone
      ? `"${item?.text}" тэмдэглэгдсэнийг болиулсан`
      : `"${item?.text}" дууссан гэж тэмдэглэлээ`;
    onUpdate(withActivity(updated, text));
  };

  const handleAddChecklistItem = (clId: string, text: string) => {
    const checklists = (card.checklists || []).map((cl) =>
      cl.id === clId
        ? { ...cl, items: [...cl.items, { id: `cli-${Date.now()}`, text, done: false }] }
        : cl
    );
    const updated = { ...card, checklists };
    onUpdate(withActivity(updated, `"${text}" зүйл нэмлээ`));
  };

  const handleAssignChecklistItem = (clId: string, itemId: string, member: CardMember | undefined) => {
    const checklists = (card.checklists || []).map((cl) =>
      cl.id === clId
        ? { ...cl, items: cl.items.map((i) => i.id === itemId ? { ...i, assignee: member } : i) }
        : cl
    );
    onUpdate({ ...card, checklists });
  };

  const handleDeleteChecklist = (clId: string) => {
    const cl = card.checklists?.find((c) => c.id === clId);
    const updated = { ...card, checklists: (card.checklists || []).filter((c) => c.id !== clId) };
    onUpdate(withActivity(updated, `"${cl?.title || 'Checklist'}" жагсаалтыг устгалаа`));
  };

  const handleDeleteChecklistItem = (clId: string, itemId: string) => {
    const cl = card.checklists?.find((c) => c.id === clId);
    const item = cl?.items.find((i) => i.id === itemId);
    const checklists = (card.checklists || []).map((c) =>
      c.id === clId
        ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
        : c
    );
    const updated = { ...card, checklists };
    onUpdate(withActivity(updated, `"${item?.text || 'зүйл'}" жагсаалтын зүйлийг устгалаа`));
  };

  const handleSetChecklistItemDueDate = (clId: string, itemId: string, date: string | undefined) => {
    const checklists = (card.checklists || []).map((cl) =>
      cl.id === clId
        ? { ...cl, items: cl.items.map((i) => i.id === itemId ? { ...i, dueDate: date } : i) }
        : cl
    );
    onUpdate({ ...card, checklists });
  };

  const handleSetCover = (url: string | undefined) => {
    onUpdate({ ...card, image: url });
  };

  const handleSetCoverSize = (size: 'full' | 'half') => {
    onUpdate({ ...card, coverSize: size });
  };

  // ---- Panel update wrappers ----
  const handleLabelsUpdate = (updatedCard: Card) => {
    const oldLabels = card.labels || [];
    const newLabels = updatedCard.labels || [];
    const added = newLabels.filter((l) => !oldLabels.find((ol) => ol.id === l.id));
    const removed = oldLabels.filter((l) => !newLabels.find((nl) => nl.id === l.id));
    let c = updatedCard;
    for (const l of added) c = withActivity(c, `"${l.text || l.color}" шошго нэмлээ`);
    for (const l of removed) c = withActivity(c, `"${l.text || l.color}" шошгыг хаслаа`);
    onUpdate(added.length > 0 || removed.length > 0 ? c : updatedCard);
  };

  const handleDatesUpdate = (updatedCard: Card) => {
    let c = updatedCard;
    if (updatedCard.dueDate !== card.dueDate) {
      const text = updatedCard.dueDate ? `дуусах огноог "${updatedCard.dueDate}" болгов` : 'дуусах огноог хаслаа';
      c = withActivity(c, text);
    }
    if (updatedCard.startDate !== card.startDate) {
      const text = updatedCard.startDate ? `эхлэх огноог "${updatedCard.startDate}" болгов` : 'эхлэх огноог хаслаа';
      c = withActivity(c, text);
    }
    onUpdate(c);
  };

  const handleChecklistPanelUpdate = (updatedCard: Card) => {
    const oldIds = new Set((card.checklists || []).map((cl) => cl.id));
    const added = (updatedCard.checklists || []).filter((cl) => !oldIds.has(cl.id));
    let c = updatedCard;
    for (const cl of added) c = withActivity(c, `"${cl.title}" жагсаалт нэмлээ`);
    onUpdate(c);
  };

  const handleMembersUpdate = (updatedCard: Card) => {
    const oldMembers = card.members || [];
    const newMembers = updatedCard.members || [];
    const added = newMembers.filter((m) => !oldMembers.find((om) => om.id === m.id));
    const removed = oldMembers.filter((m) => !newMembers.find((nm) => nm.id === m.id));
    let c = updatedCard;
    for (const m of added) c = withActivity(c, `${m.name} гишүүнийг нэмлээ`);
    for (const m of removed) c = withActivity(c, `${m.name} гишүүнийг хаслаа`);
    onUpdate(added.length > 0 || removed.length > 0 ? c : updatedCard);
  };
  // --------------------------------

  const renderPanel = () => {
    if (!openPanel) return null;

    switch (openPanel) {
      case 'add':
        return <AddMenuPanel onSelect={handleAddMenuSelect} onClose={closePanel} />;
      case 'labels':
        return <LabelsPanel card={card} onUpdate={handleLabelsUpdate} onClose={closePanel} onBack={() => setOpenPanel('add')} />;
      case 'dates':
        return <DatesPanel card={card} onUpdate={handleDatesUpdate} onClose={closePanel} onBack={() => setOpenPanel('add')} />;
      case 'checklist':
        return <ChecklistPanel card={card} onUpdate={handleChecklistPanelUpdate} onClose={closePanel} onBack={() => setOpenPanel('add')} />;
      case 'members':
        return <MembersPanel card={card} onUpdate={handleMembersUpdate} onClose={closePanel} onBack={() => setOpenPanel('add')} />;
      case 'attachment':
        return <AttachmentPanel onAttach={handleAttach} onClose={closePanel} onBack={() => setOpenPanel('add')} />;
      case 'move':
        return <MoveCardPanel card={card} columns={columns} currentColumnId={columnId} onMove={onMoveCard} onClose={closePanel} onBack={() => setOpenPanel('add')} />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Cover image */}
        {card.image && (
          <div
            className="modal-cover"
            style={
              card.image.startsWith('#')
                ? { background: card.image }
                : { backgroundImage: `url(${card.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            }
          />
        )}

        {/* Top-right floating buttons (over cover) */}
        <div className="modal-topright-btns">
          <button className="modal-topright-btn" onClick={() => setShowCoverPanel(!showCoverPanel)} title="Cover">
            <Image size={18} />
          </button>
          <button className="modal-topright-btn" onClick={() => { setShowMoreMenu(!showMoreMenu); setShowCoverPanel(false); }} title="More">
            <MoreHorizontal size={18} />
          </button>
          <button className="modal-topright-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* More menu dropdown */}
        {showMoreMenu && (
          <div className="modal-more-menu">
            <button className="modal-more-item" onClick={() => setShowMoreMenu(false)}>
              <LogOut size={16} /> Leave
            </button>
            <button className="modal-more-item" onClick={() => { setOpenPanel('move'); setShowMoreMenu(false); }}>
              <ArrowRight size={16} /> Move
            </button>
            <button className="modal-more-item" onClick={() => setShowMoreMenu(false)}>
              <Copy size={16} /> Copy
            </button>
            <button className="modal-more-item" onClick={() => setShowMoreMenu(false)}>
              <FlipHorizontal size={16} /> Mirror
            </button>
            <button className="modal-more-item" onClick={() => setShowMoreMenu(false)}>
              <FileText size={16} /> Make template
            </button>
            <button className="modal-more-item" onClick={() => setShowMoreMenu(false)}>
              <Eye size={16} /> Watch
            </button>
            <button className="modal-more-item" onClick={() => setShowMoreMenu(false)}>
              <Share2 size={16} /> Share
            </button>
            <button className="modal-more-item" onClick={() => setShowMoreMenu(false)}>
              <Archive size={16} /> Archive
            </button>
          </div>
        )}

        {/* Cover panel */}
        {showCoverPanel && (
          <div className="modal-cover-panel-wrap">
            <CoverPanel
              cover={card.image}
              coverSize={card.coverSize}
              onSetCover={handleSetCover}
              onSetCoverSize={handleSetCoverSize}
              onClose={() => setShowCoverPanel(false)}
            />
          </div>
        )}

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-column-badge">{columnTitle} ▾</span>
          </div>
        </div>

        {/* Title */}
        <div className="modal-title-section">
          <button
            className={`modal-complete-btn ${card.completed ? 'completed' : ''}`}
            onClick={() => onToggleComplete(card.id)}
          >
            {card.completed ? <CircleCheck size={22} /> : <Circle size={22} />}
          </button>
          {editingTitle ? (
            <textarea
              ref={titleRef}
              className="modal-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveTitle();
                }
                if (e.key === 'Escape') setEditingTitle(false);
              }}
              rows={1}
            />
          ) : (
            <h2
              className="modal-title"
              onClick={() => {
                setTitleDraft(card.title);
                setEditingTitle(true);
              }}
            >
              {card.title}
            </h2>
          )}
        </div>

        <div className="modal-body">
          {/* Left content */}
          <div className="modal-main">
            {/* Labels display */}
            {card.labels && card.labels.length > 0 && (
              <div className="modal-section modal-labels-display">
                <span className="pop-label">Labels</span>
                <div className="modal-labels-row">
                  {card.labels.map((l) => (
                    <span key={l.id} className="modal-label-tag" style={{ background: l.color }}>
                      {l.text || ''}
                    </span>
                  ))}
                  <button className="modal-label-add" onClick={() => setOpenPanel('labels')}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Due date display */}
            {(card.dueDate || card.startDate) && (
              <div className="modal-section modal-dates-display">
                <span className="pop-label">Dates</span>
                <button className="modal-date-badge" onClick={() => setOpenPanel('dates')}>
                  <Calendar size={14} />
                  {card.startDate && <span>{card.startDate}</span>}
                  {card.startDate && card.dueDate && <span> - </span>}
                  {card.dueDate && <span>{card.dueDate}</span>}
                </button>
              </div>
            )}

            {/* Members display */}
            {card.members && card.members.length > 0 && (
              <div className="modal-section modal-members-display">
                <span className="pop-label">Members</span>
                <div className="modal-members-row">
                  {card.members.map((m) => (
                    <span key={m.id} className="modal-member-chip" style={{ background: m.color }}>
                      {m.initials}
                    </span>
                  ))}
                  <button className="modal-label-add" onClick={() => setOpenPanel('members')}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Quick action chips */}
            <div className="modal-chips-wrapper">
              <div className="modal-chips">
                <button className={`modal-chip ${openPanel === 'add' ? 'active' : ''}`} onClick={() => setOpenPanel(openPanel === 'add' ? null : 'add')}>
                  <Plus size={14} /> Add
                </button>
                <button className={`modal-chip ${openPanel === 'labels' ? 'active' : ''}`} onClick={() => setOpenPanel(openPanel === 'labels' ? null : 'labels')}>
                  <Tag size={14} /> Labels
                </button>
                <button className={`modal-chip ${openPanel === 'dates' ? 'active' : ''}`} onClick={() => setOpenPanel(openPanel === 'dates' ? null : 'dates')}>
                  <Calendar size={14} /> Dates
                </button>
                <button className={`modal-chip ${openPanel === 'checklist' ? 'active' : ''}`} onClick={() => setOpenPanel(openPanel === 'checklist' ? null : 'checklist')}>
                  <CheckSquare size={14} /> Checklist
                </button>
                <button className={`modal-chip ${openPanel === 'members' ? 'active' : ''}`} onClick={() => setOpenPanel(openPanel === 'members' ? null : 'members')}>
                  <Users size={14} /> Members
                </button>
                <button className={`modal-chip ${openPanel === 'attachment' ? 'active' : ''}`} onClick={() => setOpenPanel(openPanel === 'attachment' ? null : 'attachment')}>
                  <Paperclip size={14} /> Attachment
                </button>
                <button className={`modal-chip ${openPanel === 'move' ? 'active' : ''}`} onClick={() => setOpenPanel(openPanel === 'move' ? null : 'move')}>
                  <ArrowRight size={14} /> Move
                </button>
              </div>
              {openPanel && (
                <div className="modal-panel-dropdown">
                  {renderPanel()}
                </div>
              )}
            </div>

            {/* Checklists */}
            {card.checklists && card.checklists.map((cl) => (
              <ChecklistSection
                key={cl.id}
                checklist={cl}
                members={BOARD_MEMBERS}
                onToggle={(itemId) => handleToggleChecklistItem(cl.id, itemId)}
                onAddItem={(text) => handleAddChecklistItem(cl.id, text)}
                onAssign={(itemId, member) => handleAssignChecklistItem(cl.id, itemId, member)}
                onSetDueDate={(itemId, date) => handleSetChecklistItemDueDate(cl.id, itemId, date)}
                onDeleteItem={(itemId) => handleDeleteChecklistItem(cl.id, itemId)}
                onDelete={() => handleDeleteChecklist(cl.id)}
              />
            ))}

            {/* Attachments */}
            {card.attachmentFiles && card.attachmentFiles.length > 0 && (
              <div className="modal-section">
                <div className="modal-section-header">
                  <Paperclip size={18} />
                  <h3>Attachments</h3>
                  <button
                    className="pop-btn-secondary"
                    style={{ marginLeft: 'auto', fontSize: 13, padding: '4px 12px' }}
                    onClick={() => setOpenPanel('attachment')}
                  >
                    Add
                  </button>
                </div>
                <div className="attachment-subtitle">Files</div>
                <div className="attachment-list">
                  {card.attachmentFiles.map((att) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.name) || att.url.startsWith('blob:');
                    return (
                      <div key={att.id} className="attachment-item">
                        <div className="attachment-thumb">
                          {isImage ? (
                            <img src={att.url} alt={att.name} />
                          ) : (
                            <Paperclip size={20} />
                          )}
                        </div>
                        <div className="attachment-info">
                          <span className="attachment-name">{att.name}</span>
                          <span className="attachment-meta">
                            Added {att.addedAt} &bull; <button className="attachment-cover-btn">⊞ Cover</button>
                          </span>
                        </div>
                        <div className="attachment-actions">
                          <a className="attachment-action-btn" href={att.url} target="_blank" rel="noreferrer">
                            <ExternalLink size={16} />
                          </a>
                          <button className="attachment-action-btn" onClick={() => handleDeleteAttachment(att.id)}>
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="modal-section">
              <div className="modal-section-header">
                <AlignLeft size={18} />
                <h3>Description</h3>
              </div>
              {editingDesc ? (
                <div className="desc-editor">
                  <textarea
                    ref={descRef}
                    className="desc-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    rows={4}
                  />
                  <div className="desc-actions">
                    <button className="btn-primary" onClick={saveDescription}>
                      Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setDescription(card.description || '');
                        setEditingDesc(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="desc-placeholder"
                  onClick={() => setEditingDesc(true)}
                >
                  {description || 'Add a more detailed description...'}
                </div>
              )}
            </div>

            {/* Нэмэлт багаж */}
            <CustomFieldsSection card={card} onUpdate={onUpdate} />
          </div>

          {/* Right sidebar - Activity */}
          <div className="modal-sidebar">
            <div className="modal-section">
              <div className="modal-section-header">
                <Clock size={18} />
                <h3>Үйл ажиллагаа</h3>
              </div>
              {/* Activity log */}
              <div className="activity-log" ref={activityLogRef}>
                {(!card.activities || card.activities.length === 0) && (
                  <div className="activity-log-entry">
                    <span className="activity-log-time">{formatActivityTime(new Date().toISOString())}</span>
                    <span className="activity-log-text"><strong>kuzo kuzo</strong> энэ картыг нэмлээ</span>
                  </div>
                )}
                {[...(card.activities || [])].reverse().map((entry) => (
                  <div key={entry.id} className="activity-log-entry">
                    <span className="activity-log-time">{formatActivityTime(entry.createdAt)}</span>
                    <span className="activity-log-text"><strong>kuzo kuzo</strong> {entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Checklist Section ============ */
function ChecklistSection({ checklist, members, onToggle, onAddItem, onAssign, onSetDueDate, onDeleteItem, onDelete }: {
  checklist: { id: string; title: string; items: { id: string; text: string; done: boolean; assignee?: CardMember; dueDate?: string }[] };
  members: { id: string; initials: string; name: string; color: string }[];
  onToggle: (itemId: string) => void;
  onAddItem: (text: string) => void;
  onAssign: (itemId: string, member: CardMember | undefined) => void;
  onSetDueDate: (itemId: string, date: string | undefined) => void;
  onDeleteItem: (itemId: string) => void;
  onDelete: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);
  const [actionsItemId, setActionsItemId] = useState<string | null>(null);
  const [dueDateItemId, setDueDateItemId] = useState<string | null>(null);
  const [assignSearch, setAssignSearch] = useState('');
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const total = checklist.items.length;
  const done = checklist.items.filter((i) => i.done).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const addItem = () => {
    if (newText.trim()) {
      onAddItem(newText.trim());
      setNewText('');
    }
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(assignSearch.toLowerCase())
  );

  return (
    <div className="modal-section checklist-section">
      <div className="modal-section-header">
        <CheckSquare size={18} />
        <h3>{checklist.title}</h3>
        <button className="pop-btn-secondary" style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 10px' }} onClick={onDelete}>
          <Trash2 size={12} /> Delete
        </button>
      </div>
      <div className="checklist-progress-bar">
        <span className="checklist-pct">{pct}%</span>
        <div className="checklist-bar">
          <div className="checklist-bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? '#61bd4f' : '#579dff' }} />
        </div>
      </div>
      {checklist.items.map((item) => (
        <div key={item.id} className={`checklist-item ${item.done ? 'done' : ''}`}>
          <label className="checklist-item-left">
            <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
            <span>{item.text}</span>
          </label>
          <div className="checklist-item-right">
            {item.dueDate && (
              <span className="checklist-item-due" title={`Due: ${new Date(item.dueDate).toLocaleString()}`}>
                {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            <button
              className="checklist-assign-btn"
              title="Due date"
              onClick={() => {
                if (dueDateItemId === item.id) {
                  setDueDateItemId(null);
                } else {
                  setDueDateItemId(item.id);
                  setAssigningItemId(null);
                  setActionsItemId(null);
                  const now = new Date();
                  if (item.dueDate) {
                    const d = new Date(item.dueDate);
                    setCalMonth(d.getMonth());
                    setCalYear(d.getFullYear());
                    setSelectedDate(`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`);
                    setSelectedTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
                  } else {
                    setCalMonth(now.getMonth());
                    setCalYear(now.getFullYear());
                    setSelectedDate(`${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`);
                    setSelectedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
                  }
                }
              }}
            >
              <Clock size={14} />
            </button>
            {item.assignee && (
              <span
                className="checklist-assignee-avatar"
                style={{ background: item.assignee.color }}
                title={item.assignee.name}
              >
                {item.assignee.initials}
              </span>
            )}
            <button
              className="checklist-assign-btn"
              title="Assign"
              onClick={() => {
                setAssigningItemId(assigningItemId === item.id ? null : item.id);
                setActionsItemId(null);
                setDueDateItemId(null);
                setAssignSearch('');
              }}
            >
              <Users size={14} />
            </button>
            <button
              className="checklist-assign-btn"
              title="Item actions"
              onClick={() => {
                setActionsItemId(actionsItemId === item.id ? null : item.id);
                setAssigningItemId(null);
                setDueDateItemId(null);
              }}
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
          {actionsItemId === item.id && (
            <div className="checklist-actions-popover">
              <div className="checklist-assign-header">
                <span>Item actions</span>
                <button className="checklist-assign-close" onClick={() => setActionsItemId(null)}>
                  <X size={14} />
                </button>
              </div>
              <button className="checklist-action-option" onClick={() => { setActionsItemId(null); }}>
                Convert to card
              </button>
              <button className="checklist-action-option checklist-action-delete" onClick={() => { onDeleteItem(item.id); setActionsItemId(null); }}>
                Delete
              </button>
            </div>
          )}
          {dueDateItemId === item.id && (
            <div className="checklist-duedate-popover">
              <div className="checklist-assign-header">
                <span>Change due date</span>
                <button className="checklist-assign-close" onClick={() => setDueDateItemId(null)}>
                  <X size={14} />
                </button>
              </div>
              {/* Calendar */}
              <div className="cl-cal-nav">
                <button onClick={() => setCalYear(calYear - 1)}><ChevronsLeft size={14} /></button>
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}><ChevronLeft size={14} /></button>
                <span className="cl-cal-title">
                  {new Date(calYear, calMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}><ChevronRight size={14} /></button>
                <button onClick={() => setCalYear(calYear + 1)}><ChevronsRight size={14} /></button>
              </div>
              <div className="cl-cal-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="cl-cal-dow">{d}</div>
                ))}
                {(() => {
                  const firstDay = new Date(calYear, calMonth, 1).getDay();
                  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                  const prevDays = new Date(calYear, calMonth, 0).getDate();
                  const cells: React.ReactNode[] = [];
                  for (let i = firstDay - 1; i >= 0; i--) {
                    cells.push(<div key={`p${i}`} className="cl-cal-day other">{prevDays - i}</div>);
                  }
                  const today = new Date();
                  const selParts = selectedDate.split('/');
                  const selM = parseInt(selParts[0]), selD = parseInt(selParts[1]), selY = parseInt(selParts[2]);
                  for (let d = 1; d <= daysInMonth; d++) {
                    const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                    const isSel = d === selD && calMonth === (selM - 1) && calYear === selY;
                    cells.push(
                      <div
                        key={d}
                        className={`cl-cal-day ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(`${calMonth + 1}/${d}/${calYear}`)}
                      >
                        {d}
                      </div>
                    );
                  }
                  const rem = 42 - cells.length;
                  for (let i = 1; i <= rem; i++) {
                    cells.push(<div key={`n${i}`} className="cl-cal-day other">{i}</div>);
                  }
                  return cells;
                })()}
              </div>
              {/* Due date inputs */}
              <div className="cl-due-label">Due date</div>
              <div className="cl-due-row">
                <label className="cl-due-check">
                  <input type="checkbox" checked={!!selectedDate} onChange={() => {}} />
                </label>
                <input
                  className="pop-input cl-due-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <input
                  className="pop-input cl-due-input"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={{ width: 80 }}
                />
              </div>
              <div className="cl-due-label">Set due date reminder</div>
              <select className="pop-input cl-due-select">
                <option>None</option>
                <option>At time of due date</option>
                <option>5 Minutes before</option>
                <option>15 Minutes before</option>
                <option>1 Hour before</option>
                <option>1 Day before</option>
              </select>
              <div className="cl-due-hint">Reminders will be sent to members assigned to this checklist item.</div>
              <button
                className="btn-primary cl-due-save"
                onClick={() => {
                  if (selectedDate) {
                    const parts = selectedDate.split('/');
                    const [timePart] = selectedTime.split(' ');
                    const [h, m] = timePart.split(':').map(Number);
                    const d = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]), h || 0, m || 0);
                    onSetDueDate(item.id, d.toISOString());
                  }
                  setDueDateItemId(null);
                }}
              >
                Save
              </button>
              <button
                className="pop-btn-secondary cl-due-remove"
                onClick={() => {
                  onSetDueDate(item.id, undefined);
                  setDueDateItemId(null);
                }}
              >
                Remove
              </button>
            </div>
          )}
          {assigningItemId === item.id && (
            <div className="checklist-assign-popover">
              <div className="checklist-assign-header">
                <span>Assign</span>
                <button className="checklist-assign-close" onClick={() => setAssigningItemId(null)}>
                  <X size={14} />
                </button>
              </div>
              <input
                className="pop-input"
                placeholder="Search members"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                autoFocus
              />
              <div className="checklist-assign-label">Board members</div>
              <div className="checklist-assign-list">
                {filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    className={`checklist-assign-member ${item.assignee?.id === m.id ? 'selected' : ''}`}
                    onClick={() => {
                      onAssign(item.id, item.assignee?.id === m.id ? undefined : m);
                      setAssigningItemId(null);
                    }}
                  >
                    <span className="checklist-assign-member-avatar" style={{ background: m.color }}>
                      {m.initials}
                    </span>
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      {adding ? (
        <div className="checklist-add-form">
          <input
            className="pop-input"
            placeholder="Add an item"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button className="btn-primary" style={{ fontSize: 13, padding: '4px 12px' }} onClick={addItem}>Add</button>
            <button className="btn-cancel" onClick={() => { setAdding(false); setNewText(''); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="pop-btn-secondary" style={{ marginTop: 6, fontSize: 13 }} onClick={() => setAdding(true)}>
          Add an item
        </button>
      )}
    </div>
  );
}

/* ============ Custom Fields Section ============ */
import type { CustomField } from '../types/board';

const DEFAULT_CUSTOM_FIELDS: CustomField[] = [
  { id: 'cf-1', name: 'Чиглэл', type: 'select', options: ['Маркетинг', 'Борлуулалт', 'Дизайн', 'Хөгжүүлэлт', 'HR'] },
  { id: 'cf-2', name: 'Тесөв', type: 'text' },
  { id: 'cf-3', name: 'Гүйцэтгэл', type: 'text' },
];

function CustomFieldsSection({ card, onUpdate }: { card: Card; onUpdate: (card: Card) => void }) {
  const fields = card.customFields && card.customFields.length > 0
    ? card.customFields
    : DEFAULT_CUSTOM_FIELDS;

  const [showAll, setShowAll] = useState(true);

  const updateField = (fieldId: string, value: string) => {
    const updated = fields.map((f) => f.id === fieldId ? { ...f, value } : f);
    onUpdate({ ...card, customFields: updated });
  };

  return (
    <div className="modal-section custom-fields-section">
      <div className="modal-section-header">
        <LayoutList size={18} />
        <h3>Нэмэлт багаж:</h3>
        <button
          className="pop-btn-secondary"
          style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 10px' }}
          onClick={() => setShowAll(!showAll)}
        >
          Visible Fields
        </button>
      </div>
      {showAll && (
        <div className="cf-grid">
          {fields.map((field) => (
            <div key={field.id} className="cf-item">
              <span className="cf-label">{field.name}:</span>
              {field.type === 'select' ? (
                <select
                  className="cf-input cf-select"
                  value={field.value || ''}
                  onChange={(e) => updateField(field.id, e.target.value)}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="cf-input"
                  placeholder="Add value..."
                  value={field.value || ''}
                  onChange={(e) => updateField(field.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
