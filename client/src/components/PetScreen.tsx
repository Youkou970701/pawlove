import { useState } from 'react';
import { Pet } from '../types';

interface Props {
  pet: Pet;
  onInteract: (type: string, value?: number) => void;
  coupleCode: string;
}

const stageEmojis: Record<string, string> = {
  egg: '🥚',
  puppy: '🐶',
  adult: '🐕',
};

export default function PetScreen({ pet, onInteract, coupleCode }: Props) {
  const [tab, setTab] = useState<'pet' | 'home' | 'album' | 'diary'>('pet');
  const [petAnim, setPetAnim] = useState(false);

  const handleInteract = (type: string) => {
    setPetAnim(true);
    onInteract(type);
    setTimeout(() => setPetAnim(false), 600);
  };

  const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1 text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold" style={{ color }}>{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full stat-bar rounded-full transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paw-cream flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400">房间</div>
          <div className="font-bold text-paw-dark">{coupleCode}</div>
        </div>
        <div className="flex items-center gap-1 text-paw-pink">
          <span>❤️</span>
          <span className="text-sm font-bold">{pet.stage === 'puppy' ? '幼犬期' : '成犬期'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {tab === 'pet' && (
          <div className="max-w-sm mx-auto">
            {/* Pet Display */}
            <div className="text-center mb-6">
              <div className={`text-8xl mb-3 inline-block ${petAnim ? 'pet-bounce' : ''}`}>
                {stageEmojis[pet.stage] || '🐕'}
              </div>
              <div className="text-xl font-bold text-paw-dark">
                {pet.name || '未命名的小狗'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {pet.hatchedAt ? `破壳 ${Math.floor((Date.now() - new Date(pet.hatchedAt).getTime()) / 86400000)} 天` : ''}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
              <StatBar label="饱食度" value={pet.hunger} color="#FF8FAB" />
              <StatBar label="快乐值" value={pet.happiness} color="#FB6F92" />
              <StatBar label="清洁度" value={pet.cleanliness} color="#A78BFA" />
              <StatBar label="精力值" value={pet.energy} color="#34D399" />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleInteract('feed')}
                className="bg-white border-2 border-orange-100 text-orange-500 py-4 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex flex-col items-center gap-1"
              >
                <span className="text-2xl">🍖</span>
                <span>喂食</span>
              </button>
              <button
                onClick={() => handleInteract('play')}
                className="bg-white border-2 border-pink-100 text-paw-pink py-4 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex flex-col items-center gap-1"
              >
                <span className="text-2xl">🎾</span>
                <span>玩耍</span>
              </button>
              <button
                onClick={() => handleInteract('clean')}
                className="bg-white border-2 border-purple-100 text-purple-500 py-4 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex flex-col items-center gap-1"
              >
                <span className="text-2xl">🛁</span>
                <span>清洁</span>
              </button>
              <button
                onClick={() => handleInteract('sleep')}
                className="bg-white border-2 border-green-100 text-green-500 py-4 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex flex-col items-center gap-1"
              >
                <span className="text-2xl">🌙</span>
                <span>睡觉</span>
              </button>
            </div>
          </div>
        )}

        {tab === 'home' && (
          <div className="max-w-sm mx-auto text-center py-10">
            <div className="text-6xl mb-4">🏠</div>
            <div className="text-lg font-bold text-gray-700 mb-2">温馨小屋</div>
            <div className="text-sm text-gray-400">功能开发中，后续可装扮属于你们的小屋~</div>
          </div>
        )}

        {tab === 'album' && (
          <div className="max-w-sm mx-auto text-center py-10">
            <div className="text-6xl mb-4">📸</div>
            <div className="text-lg font-bold text-gray-700 mb-2">双人相册</div>
            <div className="text-sm text-gray-400">记录你们的甜蜜瞬间</div>
          </div>
        )}

        {tab === 'diary' && (
          <div className="max-w-sm mx-auto text-center py-10">
            <div className="text-6xl mb-4">📔</div>
            <div className="text-lg font-bold text-gray-700 mb-2">心情日记</div>
            <div className="text-sm text-gray-400">写下今天的心情</div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bg-white border-t border-gray-100 px-6 py-3 flex justify-around">
        <button onClick={() => setTab('pet')} className={`flex flex-col items-center gap-1 ${tab === 'pet' ? 'text-paw-pink' : 'text-gray-400'}`}>
          <span className="text-xl">❤️</span>
          <span className="text-xs">宠物</span>
        </button>
        <button onClick={() => setTab('home')} className={`flex flex-col items-center gap-1 ${tab === 'home' ? 'text-paw-pink' : 'text-gray-400'}`}>
          <span className="text-xl">🏠</span>
          <span className="text-xs">小屋</span>
        </button>
        <button onClick={() => setTab('album')} className={`flex flex-col items-center gap-1 ${tab === 'album' ? 'text-paw-pink' : 'text-gray-400'}`}>
          <span className="text-xl">📸</span>
          <span className="text-xs">相册</span>
        </button>
        <button onClick={() => setTab('diary')} className={`flex flex-col items-center gap-1 ${tab === 'diary' ? 'text-paw-pink' : 'text-gray'}`}>
          <span className="text-xl">📔</span>
          <span className="text-xs">日记</span>
        </button>
      </div>
    </div>
  );
}
