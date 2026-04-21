import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Star,
  LayoutGrid,
  Trash2,
  X,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Pencil,
  Search,
  Sparkles,
  Clock,
  Link,
  Image,
} from 'lucide-react';
import type { BoardMeta, Workspace } from '../types/board';
import './BoardsListPage.css';

const BOARD_COLORS = [
  '#5c3d8f',
  '#0079bf',
  '#d29034',
  '#519839',
  '#b04632',
  '#89609e',
  '#cd5a91',
  '#4bbf6b',
  '#00aecc',
  '#838c91',
];

const BOARD_GRADIENTS = [
  'linear-gradient(135deg, #5c3d8f 0%, #7b5ea7 100%)',
  'linear-gradient(135deg, #0079bf 0%, #5ba4cf 100%)',
  'linear-gradient(135deg, #d29034 0%, #e6c069 100%)',
  'linear-gradient(135deg, #519839 0%, #7bc86c 100%)',
  'linear-gradient(135deg, #b04632 0%, #ef7564 100%)',
  'linear-gradient(135deg, #89609e 0%, #b5a0c9 100%)',
  'linear-gradient(135deg, #cd5a91 0%, #e89cba 100%)',
  'linear-gradient(135deg, #4bbf6b 0%, #8fdfab 100%)',
  'linear-gradient(135deg, #00aecc 0%, #5dd4e8 100%)',
  'linear-gradient(135deg, #838c91 0%, #b3bac0 100%)',
];

const BOARD_ICONS = [
  '📋', '🎯', '🚀', '💡', '📊', '🗂️', '📝', '⚡',
  '🎨', '🔧', '📦', '🏗️', '🎮', '🛒', '📱', '💻',
  '🌐', '📈', '🧩', '🏆', '❤️', '🔥', '✨', '🌟',
];

const WORKSPACE_ICONS = ['💼', '🏠', '📚', '🎯', '�', '🎨', '⚡', '📋', '🗂️', '🌟', '🏢', '📊', '📈', '💻', '🖥️', '📝', '📅', '👥', '🤝', '📌', '🏗️', '⏰'];

interface Props {
  workspaces: Workspace[];
  onOpenBoard: (boardId: string) => void;
  onCreateBoard: (workspaceId: string, title: string, color: string, icon?: string) => void;
  onDeleteBoard: (workspaceId: string, boardId: string) => void;
  onToggleStar: (boardId: string) => void;
  onCreateWorkspace: (title: string, icon: string) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  onRenameWorkspace: (workspaceId: string, newTitle: string, newIcon?: string) => void;
}

export default function BoardsListPage({
  workspaces,
  onOpenBoard,
  onCreateBoard,
  onDeleteBoard,
  onToggleStar,
  onCreateWorkspace,
  onDeleteWorkspace,
  onRenameWorkspace,
}: Props) {
  const [openWorkspaceId, setOpenWorkspaceId] = useState<string | null>(null);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(WORKSPACE_ICONS[0]);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'board' | 'workspace'; id: string } | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editWsTitle, setEditWsTitle] = useState('');
  const [editWsIcon, setEditWsIcon] = useState('');
  const [editWsIconMode, setEditWsIconMode] = useState<'preset' | 'url'>('preset');
  const [editWsIconUrl, setEditWsIconUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoardIcon, setSelectedBoardIcon] = useState<string>('');
  const [boardIconUrl, setBoardIconUrl] = useState('');
  const [iconMode, setIconMode] = useState<'preset' | 'url'>('preset');
  const [wsIconMode, setWsIconMode] = useState<'preset' | 'url'>('preset');
  const [wsIconUrl, setWsIconUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((showCreateBoard || showCreateWorkspace) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCreateBoard, showCreateWorkspace]);

  useEffect(() => {
    if (editingWorkspace && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [editingWorkspace]);

  const openWorkspace = workspaces.find((w) => w.id === openWorkspaceId) || null;

  const allBoards = workspaces.flatMap((w) => w.boards);
  const starredBoards = allBoards.filter((b) => b.starred);
  const totalBoards = allBoards.length;

  const handleCreateBoard = () => {
    const trimmed = newTitle.trim();
    if (!trimmed || !openWorkspaceId) return;
    const icon = iconMode === 'url' ? boardIconUrl.trim() : selectedBoardIcon;
    onCreateBoard(openWorkspaceId, trimmed, selectedColor, icon || undefined);
    setNewTitle('');
    setShowCreateBoard(false);
    setSelectedColor(BOARD_COLORS[0]);
    setSelectedBoardIcon('');
    setBoardIconUrl('');
    setIconMode('preset');
  };

  const handleCreateWorkspace = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const icon = wsIconMode === 'url' ? wsIconUrl.trim() : selectedIcon;
    onCreateWorkspace(trimmed, icon || WORKSPACE_ICONS[0]);
    setNewTitle('');
    setShowCreateWorkspace(false);
    setSelectedIcon(WORKSPACE_ICONS[0]);
    setWsIconMode('preset');
    setWsIconUrl('');
  };

  const handleEditWorkspace = () => {
    if (!editingWorkspace) return;
    const trimmed = editWsTitle.trim();
    if (!trimmed) return;
    const icon = editWsIconMode === 'url' ? editWsIconUrl.trim() : editWsIcon;
    onRenameWorkspace(editingWorkspace.id, trimmed, icon || undefined);
    setEditingWorkspace(null);
  };

  const openEditModal = (ws: Workspace) => {
    setEditingWorkspace(ws);
    setEditWsTitle(ws.title);
    const isUrl = ws.icon.startsWith('http://') || ws.icon.startsWith('https://');
    if (isUrl) {
      setEditWsIconMode('url');
      setEditWsIconUrl(ws.icon);
      setEditWsIcon(WORKSPACE_ICONS[0]);
    } else {
      setEditWsIconMode('preset');
      setEditWsIcon(ws.icon);
      setEditWsIconUrl('');
    }
  };

  const findWorkspaceForBoard = (boardId: string) =>
    workspaces.find((w) => w.boards.some((b) => b.id === boardId));

  const filteredWorkspaces = searchQuery.trim()
    ? workspaces.filter(
        (ws) =>
          ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ws.boards.some((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : workspaces;

  // ============ Inside a workspace ============
  if (openWorkspace) {
    return (
      <div className="boards-page">
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />

        <header className="boards-page-header">
          <div className="boards-page-header-inner">
            <button className="boards-back-btn" onClick={() => setOpenWorkspaceId(null)}>
              <ArrowLeft size={16} />
              <span>Буцах</span>
            </button>
            <div className="header-divider" />
            <span className="workspace-header-icon">
              {openWorkspace.icon.startsWith('http://') || openWorkspace.icon.startsWith('https://') ? (
                <img src={openWorkspace.icon} alt="" className="workspace-header-icon-img" onError={(e) => { (e.target as HTMLImageElement).replaceWith(document.createTextNode('📁')); }} />
              ) : (
                openWorkspace.icon
              )}
            </span>
            <div className="header-title-group">
              <h1>{openWorkspace.title}</h1>
              <span className="header-subtitle">{openWorkspace.boards.length} самбар</span>
            </div>
            <div className="header-spacer" />
            <button
              className="header-create-btn"
              onClick={() => { setShowCreateBoard(true); setNewTitle(''); setSelectedBoardIcon(''); setBoardIconUrl(''); setIconMode('preset'); }}
            >
              <Plus size={15} />
              <span>Шинэ самбар</span>
            </button>
          </div>
        </header>

        <div className="boards-page-content">
          {/* Starred in this workspace */}
          {openWorkspace.boards.some((b) => b.starred) && (
            <section className="boards-section">
              <div className="section-header">
                <Star size={15} className="section-icon star" />
                <h2>Дуртай</h2>
              </div>
              <div className="boards-grid">
                {openWorkspace.boards.filter((b) => b.starred).map((board) => (
                  <BoardTile
                    key={board.id}
                    board={board}
                    onOpen={() => onOpenBoard(board.id)}
                    onToggleStar={() => onToggleStar(board.id)}
                    onDelete={() => setConfirmDelete({ type: 'board', id: board.id })}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="boards-section">
            <div className="section-header">
              <LayoutGrid size={15} className="section-icon" />
              <h2>Бүх самбарууд</h2>
              <span className="section-count">{openWorkspace.boards.length}</span>
            </div>
            <div className="boards-grid">
              {openWorkspace.boards.map((board) => (
                <BoardTile
                  key={board.id}
                  board={board}
                  onOpen={() => onOpenBoard(board.id)}
                  onToggleStar={() => onToggleStar(board.id)}
                  onDelete={() => setConfirmDelete({ type: 'board', id: board.id })}
                />
              ))}
              <button
                className="board-tile board-tile-create"
                onClick={() => { setShowCreateBoard(true); setNewTitle(''); setSelectedBoardIcon(''); setBoardIconUrl(''); setIconMode('preset'); }}
              >
                <div className="create-tile-icon">
                  <Plus size={20} />
                </div>
                <span>Шинэ самбар үүсгэх</span>
              </button>
            </div>
          </section>

          {openWorkspace.boards.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>Самбар байхгүй байна</h3>
              <p>Энэ ангилалд самбар нэмэхийн тулд "Шинэ самбар" дарна уу</p>
            </div>
          )}
        </div>

        {showCreateBoard && (
          <CreateModal title="Шинэ самбар үүсгэх" onClose={() => setShowCreateBoard(false)}>
            <div
              className="create-board-preview"
              style={{ background: BOARD_GRADIENTS[BOARD_COLORS.indexOf(selectedColor)] || selectedColor }}
            >
              {(selectedBoardIcon || boardIconUrl) && (
                <span className="create-board-preview-icon">
                  {iconMode === 'url' && boardIconUrl ? (
                    <img src={boardIconUrl} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    selectedBoardIcon
                  )}
                </span>
              )}
              <span className="create-board-preview-title">{newTitle || 'Самбарын нэр'}</span>
            </div>
            <div className="create-board-body">
              <label className="create-board-label">Самбарын нэр <span className="required">*</span></label>
              <input
                ref={inputRef}
                className="create-board-input"
                placeholder="Жишээ нь: Q2 зорилтууд"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBoard();
                  if (e.key === 'Escape') setShowCreateBoard(false);
                }}
              />
              <label className="create-board-label">Арын өнгө</label>
              <div className="create-board-colors">
                {BOARD_COLORS.map((color, i) => (
                  <button
                    key={color}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ background: BOARD_GRADIENTS[i] }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
              <label className="create-board-label">Дүрс (icon)</label>
              <div className="board-icon-mode-tabs">
                <button
                  className={`board-icon-tab ${iconMode === 'preset' ? 'active' : ''}`}
                  onClick={() => setIconMode('preset')}
                >
                  <Image size={13} /> Бэлэн
                </button>
                <button
                  className={`board-icon-tab ${iconMode === 'url' ? 'active' : ''}`}
                  onClick={() => setIconMode('url')}
                >
                  <Link size={13} /> Линкээр
                </button>
              </div>
              {iconMode === 'preset' ? (
                <div className="board-icon-picker">
                  <button
                    className={`board-icon-option ${selectedBoardIcon === '' ? 'selected' : ''}`}
                    onClick={() => setSelectedBoardIcon('')}
                    title="Дүрсгүй"
                  >
                    <X size={14} />
                  </button>
                  {BOARD_ICONS.map((icon) => (
                    <button
                      key={icon}
                      className={`board-icon-option ${selectedBoardIcon === icon ? 'selected' : ''}`}
                      onClick={() => setSelectedBoardIcon(icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="board-icon-url-input">
                  <input
                    className="create-board-input"
                    placeholder="https://example.com/icon.png"
                    value={boardIconUrl}
                    onChange={(e) => setBoardIconUrl(e.target.value)}
                  />
                  {boardIconUrl && (
                    <div className="board-icon-url-preview">
                      <img
                        src={boardIconUrl}
                        alt="preview"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              )}
              <button className="create-board-submit" disabled={!newTitle.trim()} onClick={handleCreateBoard}>
                Үүсгэх
              </button>
            </div>
          </CreateModal>
        )}

        {confirmDelete?.type === 'board' && (
          <ConfirmModal
            message="Энэ самбарыг устгахдаа итгэлтэй байна уу?"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => {
              onDeleteBoard(openWorkspace.id, confirmDelete.id);
              setConfirmDelete(null);
            }}
          />
        )}
      </div>
    );
  }

  // ============ Main: Workspace list ============
  return (
    <div className="boards-page">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <header className="boards-page-header">
        <div className="boards-page-header-inner">
          <div className="header-logo">
            <Sparkles size={18} />
          </div>
          <div className="header-title-group">
            <h1>Ажлын орчин</h1>
          </div>
          <div className="header-spacer" />
          <div className="header-search">
            <Search size={14} />
            <input
              placeholder="Хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="header-create-btn"
            onClick={() => { setShowCreateWorkspace(true); setNewTitle(''); setWsIconMode('preset'); setWsIconUrl(''); setSelectedIcon(WORKSPACE_ICONS[0]); }}
          >
            <Plus size={15} />
            <span>Шинэ ангилал</span>
          </button>
        </div>
      </header>

      <div className="boards-page-content">
        {/* Quick stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(102, 126, 234, 0.15)', color: '#8b9cf7' }}>
              <FolderOpen size={18} />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-number">{workspaces.length}</span>
              <span className="stat-card-label">Ангилал</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(78, 205, 196, 0.15)', color: '#4ecdc4' }}>
              <LayoutGrid size={18} />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-number">{totalBoards}</span>
              <span className="stat-card-label">Самбар</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(255, 214, 0, 0.12)', color: '#ffd600' }}>
              <Star size={18} />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-number">{starredBoards.length}</span>
              <span className="stat-card-label">Дуртай</span>
            </div>
          </div>
        </div>

        {/* Starred boards */}
        {starredBoards.length > 0 && (
          <section className="boards-section">
            <div className="section-header">
              <Star size={15} className="section-icon star" />
              <h2>Дуртай самбарууд</h2>
              <span className="section-count">{starredBoards.length}</span>
            </div>
            <div className="boards-grid">
              {starredBoards.map((board) => (
                <BoardTile
                  key={board.id}
                  board={board}
                  onOpen={() => onOpenBoard(board.id)}
                  onToggleStar={() => onToggleStar(board.id)}
                  onDelete={() => {
                    const ws = findWorkspaceForBoard(board.id);
                    if (ws) setConfirmDelete({ type: 'board', id: board.id });
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Workspaces */}
        <section className="boards-section">
          <div className="section-header">
            <FolderOpen size={15} className="section-icon" />
            <h2>Ангилалууд</h2>
            <span className="section-count">{filteredWorkspaces.length}</span>
          </div>
          <div className="workspaces-grid">
            {filteredWorkspaces.map((ws) => (
              <div key={ws.id} className="workspace-card" onClick={() => setOpenWorkspaceId(ws.id)}>
                <div className="workspace-card-top">
                  <div className="workspace-icon-wrap">
                    {ws.icon.startsWith('http://') || ws.icon.startsWith('https://') ? (
                      <img src={ws.icon} alt="" className="workspace-icon-img" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span className="workspace-icon">{ws.icon}</span>
                    )}
                  </div>
                  <div className="workspace-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="ws-action-btn"
                      title="Засах"
                      onClick={() => openEditModal(ws)}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="ws-action-btn danger"
                      title="Устгах"
                      onClick={() => setConfirmDelete({ type: 'workspace', id: ws.id })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="workspace-card-body">
                  <span className="workspace-title">{ws.title}</span>
                  <span className="workspace-meta">
                    <Clock size={11} />
                    {ws.boards.length} самбар
                  </span>
                </div>
                <div className="workspace-card-footer">
                  {ws.boards.length > 0 ? (
                    <div className="board-mini-tiles">
                      {ws.boards.slice(0, 4).map((b) => {
                        const gradient = BOARD_GRADIENTS[BOARD_COLORS.indexOf(b.color)] || b.color;
                        return (
                          <div
                            key={b.id}
                            className="board-mini-tile"
                            style={{ background: gradient }}
                            title={b.title}
                          >
                            <span>{b.title}</span>
                          </div>
                        );
                      })}
                      {ws.boards.length > 4 && (
                        <div className="board-mini-more">+{ws.boards.length - 4}</div>
                      )}
                    </div>
                  ) : (
                    <span className="workspace-empty-hint">Самбар нэмэх</span>
                  )}
                  <div className="workspace-open-btn">
                    <span>Нээх</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWorkspaces.length === 0 && searchQuery && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>Олдсонгүй</h3>
              <p>"{searchQuery}" гэсэн хайлтаар ангилал олдсонгүй</p>
            </div>
          )}
        </section>
      </div>

      {showCreateWorkspace && (
        <CreateModal title="Шинэ ангилал үүсгэх" onClose={() => setShowCreateWorkspace(false)}>
          <div className="create-workspace-preview">
            <span className="create-workspace-preview-icon">
              {wsIconMode === 'url' && wsIconUrl ? (
                <img src={wsIconUrl} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                selectedIcon
              )}
            </span>
            <span className="create-workspace-preview-title">{newTitle || 'Ангилалын нэр'}</span>
          </div>
          <div className="create-board-body">
            <label className="create-board-label">Ангилалын нэр <span className="required">*</span></label>
            <input
              ref={inputRef}
              className="create-board-input"
              placeholder="Жишээ нь: Ажил, Хувийн, Сургууль..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateWorkspace();
                if (e.key === 'Escape') setShowCreateWorkspace(false);
              }}
            />
            <label className="create-board-label">Дүрс сонгох</label>
            <div className="board-icon-mode-tabs">
              <button
                className={`board-icon-tab ${wsIconMode === 'preset' ? 'active' : ''}`}
                onClick={() => setWsIconMode('preset')}
              >
                <Image size={13} /> Бэлэн
              </button>
              <button
                className={`board-icon-tab ${wsIconMode === 'url' ? 'active' : ''}`}
                onClick={() => setWsIconMode('url')}
              >
                <Link size={13} /> Линкээр
              </button>
            </div>
            {wsIconMode === 'preset' ? (
              <div className="icon-picker">
                {WORKSPACE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            ) : (
              <div className="board-icon-url-input">
                <input
                  className="create-board-input"
                  placeholder="https://example.com/icon.png"
                  value={wsIconUrl}
                  onChange={(e) => setWsIconUrl(e.target.value)}
                />
                {wsIconUrl && (
                  <div className="board-icon-url-preview">
                    <img
                      src={wsIconUrl}
                      alt="preview"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            )}
            <button className="create-board-submit" disabled={!newTitle.trim()} onClick={handleCreateWorkspace}>
              Үүсгэх
            </button>
          </div>
        </CreateModal>
      )}

      {editingWorkspace && (
        <CreateModal title="Ангилал засах" onClose={() => setEditingWorkspace(null)}>
          <div className="create-workspace-preview">
            <span className="create-workspace-preview-icon">
              {editWsIconMode === 'url' && editWsIconUrl ? (
                <img src={editWsIconUrl} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                editWsIcon
              )}
            </span>
            <span className="create-workspace-preview-title">{editWsTitle || 'Ангилалын нэр'}</span>
          </div>
          <div className="create-board-body">
            <label className="create-board-label">Ангилалын нэр <span className="required">*</span></label>
            <input
              ref={renameRef}
              className="create-board-input"
              placeholder="Ангилалын нэр"
              value={editWsTitle}
              onChange={(e) => setEditWsTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditWorkspace();
                if (e.key === 'Escape') setEditingWorkspace(null);
              }}
            />
            <label className="create-board-label">Дүрс сонгох</label>
            <div className="board-icon-mode-tabs">
              <button
                className={`board-icon-tab ${editWsIconMode === 'preset' ? 'active' : ''}`}
                onClick={() => setEditWsIconMode('preset')}
              >
                <Image size={13} /> Бэлэн
              </button>
              <button
                className={`board-icon-tab ${editWsIconMode === 'url' ? 'active' : ''}`}
                onClick={() => setEditWsIconMode('url')}
              >
                <Link size={13} /> Линкээр
              </button>
            </div>
            {editWsIconMode === 'preset' ? (
              <div className="icon-picker">
                {WORKSPACE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    className={`icon-option ${editWsIcon === icon ? 'selected' : ''}`}
                    onClick={() => setEditWsIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            ) : (
              <div className="board-icon-url-input">
                <input
                  className="create-board-input"
                  placeholder="https://example.com/icon.png"
                  value={editWsIconUrl}
                  onChange={(e) => setEditWsIconUrl(e.target.value)}
                />
                {editWsIconUrl && (
                  <div className="board-icon-url-preview">
                    <img
                      src={editWsIconUrl}
                      alt="preview"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            )}
            <button className="create-board-submit" disabled={!editWsTitle.trim()} onClick={handleEditWorkspace}>
              Хадгалах
            </button>
          </div>
        </CreateModal>
      )}

      {confirmDelete?.type === 'workspace' && (
        <ConfirmModal
          message="Энэ ангилалыг доторх бүх самбартай нь устгахдаа итгэлтэй байна уу?"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            onDeleteWorkspace(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
      {confirmDelete?.type === 'board' && (
        <ConfirmModal
          message="Энэ самбарыг устгахдаа итгэлтэй байна уу?"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            const ws = findWorkspaceForBoard(confirmDelete.id);
            if (ws) onDeleteBoard(ws.id, confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}

// ============ Sub-components ============

function BoardTile({
  board,
  onOpen,
  onToggleStar,
  onDelete,
}: {
  board: BoardMeta;
  onOpen: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
}) {
  const gradient = BOARD_GRADIENTS[BOARD_COLORS.indexOf(board.color)] || board.color;
  const isUrl = board.icon && (board.icon.startsWith('http://') || board.icon.startsWith('https://'));
  return (
    <div className="board-tile" style={{ background: gradient }} onClick={onOpen}>
      <div className="board-tile-overlay" />
      {board.icon && (
        <div className="board-tile-icon">
          {isUrl ? (
            <img src={board.icon} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span>{board.icon}</span>
          )}
        </div>
      )}
      <div className="board-tile-content">
        <span className="board-tile-title">{board.title}</span>
      </div>
      <div className="board-tile-actions">
        <button
          className="board-tile-action"
          title={board.starred ? 'Дуртайгаас хасах' : 'Дуртайд нэмэх'}
          onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
        >
          <Star size={13} fill={board.starred ? '#f2d600' : 'none'} color={board.starred ? '#f2d600' : '#fff'} />
        </button>
        <button
          className="board-tile-action danger"
          title="Устгах"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function CreateModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Баталгаажуулах</h3>
          <button className="modal-close" onClick={onCancel}><X size={16} /></button>
        </div>
        <div className="create-board-body">
          <p className="confirm-text">{message}</p>
          <div className="confirm-actions">
            <button className="btn-secondary" onClick={onCancel}>Цуцлах</button>
            <button className="btn-danger" onClick={onConfirm}><Trash2 size={13} /> Устгах</button>
          </div>
        </div>
      </div>
    </div>
  );
}
