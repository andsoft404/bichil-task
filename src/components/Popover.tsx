import { useEffect, useRef } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import './Popover.css';

interface PopoverProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onBack?: () => void;
}

export default function Popover({ title, children, onClose, onBack }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="popover" ref={ref}>
      <div className="popover-header">
        {onBack && (
          <button className="popover-nav" onClick={onBack}><ArrowLeft size={16} /></button>
        )}
        <span className="popover-title">{title}</span>
        <button className="popover-nav popover-close" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="popover-body">{children}</div>
    </div>
  );
}
