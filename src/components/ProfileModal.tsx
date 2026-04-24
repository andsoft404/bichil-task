import { useState, useRef } from 'react';
import { X, Camera, User } from 'lucide-react';
import type { UserProfile } from '../types/board';
import './ProfileModal.css';

interface Props {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ProfileModal({ profile, onSave, onClose }: Props) {
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const initials = getInitials(name) || profile.initials;
  const showImage = !!avatarUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({
      ...profile,
      name: trimmedName,
      initials: getInitials(trimmedName) || profile.initials,
      avatarUrl: avatarUrl || undefined,
    });
    onClose();
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-modal-header">
          <span>Профайл засах</span>
          <button className="profile-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Avatar preview */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
            {showImage ? (
              <img
                src={avatarUrl}
                alt={name}
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-initials" style={{ background: profile.color }}>
                {initials || <User size={28} />}
              </div>
            )}
            <div className="profile-avatar-overlay" title="Зураг солих">
              <Camera size={18} />
            </div>
          </div>
          <div className="profile-avatar-id">ID: {profile.id}</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <div className="profile-modal-body">
          {/* Name */}
          <label className="profile-label">Нэр</label>
          <input
            ref={nameInputRef}
            className="profile-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Нэрээ оруулна уу"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
          />

          {/* Photo upload row */}
          <label className="profile-label">Профайл зураг</label>
          <div className="profile-upload-row">
            <button className="profile-upload-btn" onClick={() => fileInputRef.current?.click()}>
              <Camera size={14} />
              {showImage ? 'Зураг солих' : 'Зураг оруулах'}
            </button>
            {showImage && (
              <button className="profile-remove-btn" onClick={handleRemovePhoto}>
                <X size={13} /> Устгах
              </button>
            )}
          </div>

          <button
            className="profile-save-btn"
            disabled={!name.trim()}
            onClick={handleSave}
          >
            Хадгалах
          </button>
        </div>
      </div>
    </div>
  );
}
