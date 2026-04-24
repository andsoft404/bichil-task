import { useState, useRef, useEffect } from 'react';
import { Sparkles, Delete } from 'lucide-react';
import { ALL_SYSTEM_MEMBERS } from '../data/boardData';
import type { UserProfile } from '../types/board';
import './LoginPage.css';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const PAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function LoginPage({ onLogin }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1));
      setError('');
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    setError('');
    if (next.length === 4) {
      submit(next);
    }
  };

  const submit = (code: string) => {
    const member = ALL_SYSTEM_MEMBERS.find((m) => m.id === code);
    if (member) {
      onLogin({
        id: member.id,
        name: member.name,
        initials: member.initials,
        color: member.color,
      });
    } else {
      setShake(true);
      setError('Буруу PIN. Дахин оруулна уу.');
      setTimeout(() => {
        setPin('');
        setShake(false);
      }, 600);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleKey(e.key);
      else if (e.key === 'Backspace') handleKey('⌫');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pin]);

  return (
    <div className="login-page">
      <div className="login-bg-glow login-glow-1" />
      <div className="login-bg-glow login-glow-2" />

      <div className="login-card">
        <div className="login-logo">
          <Sparkles size={24} />
        </div>
        <h1 className="login-title">NewTulv</h1>
        <p className="login-subtitle">4 оронтой PIN оруулна уу</p>

        {/* Dots */}
        <div className={`login-dots ${shake ? 'shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`login-dot ${i < pin.length ? 'filled' : ''}`}
            />
          ))}
        </div>

        {error && <p className="login-error">{error}</p>}

        {/* Numpad */}
        <div className="login-pad">
          {PAD.map((key, idx) => (
            key === '' ? (
              <div key={idx} />
            ) : (
              <button
                key={idx}
                className={`login-pad-btn ${key === '⌫' ? 'login-pad-back' : ''}`}
                onClick={() => handleKey(key)}
                disabled={key !== '⌫' && pin.length >= 4}
              >
                {key === '⌫' ? <Delete size={18} /> : key}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
