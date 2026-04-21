import { useRef } from 'react';
import { Upload } from 'lucide-react';
import Popover from './Popover';

const COVER_COLORS = [
  '#4bce97', '#c4a33b', '#f5a623', '#f87168', '#9f8fef',
  '#579dff', '#4ecdc4', '#8bc34a', '#e91e82', '#757575',
];

const UNSPLASH_PHOTOS = [
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=120&fit=crop',
];

interface Props {
  cover?: string;
  coverSize?: 'full' | 'half';
  onSetCover: (url: string | undefined) => void;
  onSetCoverSize: (size: 'full' | 'half') => void;
  onClose: () => void;
}

export default function CoverPanel({ cover, coverSize = 'half', onSetCover, onSetCoverSize, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSetCover(url);
    }
  };

  return (
    <Popover title="Cover" onClose={onClose}>
      {/* Size selector */}
      <span className="pop-label">Size</span>
      <div className="cover-size-row">
        <button
          className={`cover-size-opt ${coverSize === 'full' ? 'active' : ''}`}
          onClick={() => onSetCoverSize('full')}
        >
          <div className="cover-size-preview full">
            <div className="cover-size-lines" />
          </div>
        </button>
        <button
          className={`cover-size-opt ${coverSize === 'half' ? 'active' : ''}`}
          onClick={() => onSetCoverSize('half')}
        >
          <div className="cover-size-preview half">
            <div className="cover-size-img" />
            <div className="cover-size-lines" />
          </div>
        </button>
      </div>

      {cover && (
        <button className="pop-btn-secondary" style={{ width: '100%', marginBottom: 12 }} onClick={() => onSetCover(undefined)}>
          Remove cover
        </button>
      )}

      {/* Colors */}
      <span className="pop-label">Colors</span>
      <div className="cover-color-grid">
        {COVER_COLORS.map((c) => (
          <button
            key={c}
            className={`cover-color-cell ${cover === c ? 'selected' : ''}`}
            style={{ background: c }}
            onClick={() => onSetCover(c)}
          />
        ))}
      </div>

      {/* Upload */}
      <span className="pop-label" style={{ marginTop: 12, display: 'block' }}>Attachments</span>
      <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handleFile} />
      <button className="pop-btn" style={{ marginBottom: 8 }} onClick={() => fileRef.current?.click()}>
        <Upload size={14} style={{ marginRight: 6 }} />
        Upload a cover image
      </button>

      {/* Unsplash photos */}
      <span className="pop-label">Photos from Unsplash</span>
      <div className="cover-photo-grid">
        {UNSPLASH_PHOTOS.map((url) => (
          <button key={url} className="cover-photo-cell" onClick={() => onSetCover(url)}>
            <img src={url} alt="" />
          </button>
        ))}
      </div>
    </Popover>
  );
}
