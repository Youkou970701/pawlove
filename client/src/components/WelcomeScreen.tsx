import { useState } from 'react';

interface Props {
  onCreate: () => void;
  onJoin: (code: string) => void;
}

export default function WelcomeScreen({ onCreate, onJoin }: Props) {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'home' | 'join'>('home');
  const [copied, setCopied] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paw-cream px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-3xl font-bold text-paw-dark mb-2">PawLove</h1>
          <p className="text-gray-500">一起养一只属于你们的小狗</p>
        </div>

        {mode === 'home' ? (
          <div className="space-y-4">
            <button
              onClick={onCreate}
              className="w-full bg-paw-pink text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span>➕</span>
              创建新房间
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-white text-paw-dark py-4 rounded-2xl font-bold text-lg shadow-md border-2 border-paw-light active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              加入已有房间
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <label className="text-sm text-gray-500 block mb-2">输入房间代码</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="如: ABC123"
                className="w-full text-2xl font-bold text-center uppercase tracking-widest border-2 border-paw-light rounded-xl py-3 focus:outline-none focus:border-paw-pink text-paw-dark"
                maxLength={6}
              />
            </div>
            <button
              onClick={() => onJoin(code)}
              disabled={code.length < 4}
              className="w-full bg-paw-pink text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
            >
              加入
            </button>
            <button
              onClick={() => setMode('home')}
              className="w-full text-gray-400 py-2 text-sm"
            >
              返回
            </button>
          </div>
        )}

        <div className="mt-10 text-center text-xs text-gray-400">
          <span>💖</span>
          为异地恋和甜蜜同居而生
        </div>
      </div>
    </div>
  );
}
