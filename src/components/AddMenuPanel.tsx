import { Tag, Calendar, CheckSquare, Users, Paperclip, ArrowRight } from 'lucide-react';
import Popover from './Popover';

export type PanelName = 'labels' | 'dates' | 'checklist' | 'members' | 'attachment' | 'move';

interface Props {
  onSelect: (panel: PanelName) => void;
  onClose: () => void;
}

const items: { icon: typeof Tag; label: string; panel: PanelName }[] = [
  { icon: Tag, label: 'Labels', panel: 'labels' },
  { icon: Calendar, label: 'Dates', panel: 'dates' },
  { icon: CheckSquare, label: 'Checklist', panel: 'checklist' },
  { icon: Users, label: 'Members', panel: 'members' },
  { icon: Paperclip, label: 'Attachment', panel: 'attachment' },
  { icon: ArrowRight, label: 'Move', panel: 'move' },
];

export default function AddMenuPanel({ onSelect, onClose }: Props) {
  return (
    <Popover title="Add to card" onClose={onClose}>
      <div className="add-menu-list">
        {items.map(({ icon: Icon, label, panel }) => (
          <button key={panel} className="add-menu-item" onClick={() => onSelect(panel)}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </Popover>
  );
}
