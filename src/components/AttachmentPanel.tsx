import { useState, useRef } from 'react';
import Popover from './Popover';

interface Props {
  onAttach: (file: { name: string; url: string }) => void;
  onClose: () => void;
  onBack?: () => void;
}

export default function AttachmentPanel({ onAttach, onClose, onBack }: Props) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onAttach({ name: file.name, url });
      onClose();
    }
  };

  const handleLink = () => {
    if (!linkUrl) return;
    onAttach({ name: linkName || linkUrl, url: linkUrl });
    onClose();
  };

  return (
    <Popover title="Attach" onClose={onClose} onBack={onBack}>
      <span className="pop-label">Attach a file from your computer</span>
      <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={handleFile} />
      <button className="pop-btn" style={{ marginBottom: 16 }} onClick={() => fileRef.current?.click()}>
        Choose a file
      </button>

      <hr style={{ border: 'none', borderTop: '1px solid #3a3f44', margin: '8px 0 12px' }} />

      <span className="pop-label">Search or paste a link</span>
      <div className="pop-row">
        <input className="pop-input" placeholder="Paste any link here..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
      </div>
      <div className="pop-row">
        <span className="pop-label">Display text (optional)</span>
        <input className="pop-input" placeholder="Text to display" value={linkName} onChange={(e) => setLinkName(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="pop-btn" style={{ flex: 1 }} onClick={handleLink}>Insert</button>
        <button className="pop-btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </Popover>
  );
}
