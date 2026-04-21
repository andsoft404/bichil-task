import { useState } from 'react';
import type { BoardMeta, Workspace } from './types/board';
import { initialBoard } from './data/boardData';
import BoardsListPage from './components/BoardsListPage';
import KanbanBoard from './components/KanbanBoard';

let nextBoardId = 10;
let nextWorkspaceId = 10;

const defaultWorkspace: Workspace = {
  id: 'ws-1',
  title: 'Ажил',
  icon: '💼',
  createdAt: '2026-01-01T00:00:00',
  boards: [
    {
      id: initialBoard.id,
      title: initialBoard.title,
      color: '#5c3d8f',
      starred: false,
      createdAt: '2026-01-01T00:00:00',
      columns: initialBoard.columns,
    },
  ],
};

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([defaultWorkspace]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Find active board across all workspaces
  const activeBoard = workspaces
    .flatMap((ws) => ws.boards)
    .find((b) => b.id === activeBoardId) || null;

  const handleCreateWorkspace = (title: string, icon: string) => {
    const newWs: Workspace = {
      id: `ws-${nextWorkspaceId++}`,
      title,
      icon,
      createdAt: new Date().toISOString(),
      boards: [],
    };
    setWorkspaces((prev) => [...prev, newWs]);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspaceId));
  };

  const handleRenameWorkspace = (workspaceId: string, newTitle: string, newIcon?: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        const updated = { ...ws, title: newTitle };
        if (newIcon !== undefined) updated.icon = newIcon;
        return updated;
      })
    );
  };

  const handleCreateBoard = (workspaceId: string, title: string, color: string, icon?: string) => {
    const newBoard: BoardMeta = {
      id: `board-${nextBoardId++}`,
      title,
      color,
      icon,
      starred: false,
      createdAt: new Date().toISOString(),
      columns: [
        { id: `col-${Date.now()}-1`, title: 'Хийх зүйлс', cards: [] },
        { id: `col-${Date.now()}-2`, title: 'Хийж байгаа', cards: [] },
        { id: `col-${Date.now()}-3`, title: 'Дууссан', cards: [] },
      ],
    };
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === workspaceId ? { ...ws, boards: [...ws.boards, newBoard] } : ws
      )
    );
  };

  const handleDeleteBoard = (workspaceId: string, boardId: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === workspaceId
          ? { ...ws, boards: ws.boards.filter((b) => b.id !== boardId) }
          : ws
      )
    );
    if (activeBoardId === boardId) setActiveBoardId(null);
  };

  const handleToggleStar = (boardId: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => ({
        ...ws,
        boards: ws.boards.map((b) =>
          b.id === boardId ? { ...b, starred: !b.starred } : b
        ),
      }))
    );
  };

  const handleBoardChange = (updated: BoardMeta) => {
    setWorkspaces((prev) =>
      prev.map((ws) => ({
        ...ws,
        boards: ws.boards.map((b) => (b.id === updated.id ? updated : b)),
      }))
    );
  };

  if (activeBoard) {
    return (
      <KanbanBoard
        key={activeBoard.id}
        board={activeBoard}
        onBack={() => setActiveBoardId(null)}
        onBoardChange={handleBoardChange}
      />
    );
  }

  return (
    <BoardsListPage
      workspaces={workspaces}
      onOpenBoard={setActiveBoardId}
      onCreateBoard={handleCreateBoard}
      onDeleteBoard={handleDeleteBoard}
      onToggleStar={handleToggleStar}
      onCreateWorkspace={handleCreateWorkspace}
      onDeleteWorkspace={handleDeleteWorkspace}
      onRenameWorkspace={handleRenameWorkspace}
    />
  );
}

export default App

