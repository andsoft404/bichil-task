import {
  CreditCard,
  Tag,
  Users,
  Image,
  Calendar,
  ArrowRight,
  Copy,
  Link,
  HardDrive,
  Archive,
} from 'lucide-react';
import './CardQuickMenu.css';

export type QuickMenuAction = 'open' | 'labels' | 'members' | 'cover' | 'dates' | 'move' | 'copy' | 'link' | 'mirror' | 'archive';

interface Props {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: QuickMenuAction) => void;
}

const menuItems: { icon: typeof CreditCard; label: string; action: QuickMenuAction }[] = [
  { icon: CreditCard, label: 'Open card', action: 'open' },
  { icon: Tag, label: 'Edit labels', action: 'labels' },
  { icon: Users, label: 'Change members', action: 'members' },
  { icon: Image, label: 'Change cover', action: 'cover' },
  { icon: Calendar, label: 'Edit dates', action: 'dates' },
  { icon: ArrowRight, label: 'Move', action: 'move' },
  { icon: Copy, label: 'Copy card', action: 'copy' },
  { icon: Link, label: 'Copy link', action: 'link' },
  { icon: HardDrive, label: 'Mirror', action: 'mirror' },
  { icon: Archive, label: 'Archive', action: 'archive' },
];

export default function CardQuickMenu({ x, y, onClose, onAction }: Props) {
  return (
    <>
      <div className="quick-menu-overlay" onClick={onClose} />
      <div className="quick-menu" style={{ top: y, left: x }}>
        {menuItems.map((item) => (
          <button
            key={item.action}
            className="quick-menu-item"
            onClick={() => onAction(item.action)}
          >
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
