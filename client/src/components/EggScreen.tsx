import { useState } from 'react';
import { Pet } from '../types';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  reward: number;
}

interface Props {
  pet: Pet | null;
  onInteract: (type: string, value?: string | number) => void;
  onTaskComplete: (taskId: string) => void;
  coupleCode: string;
  dailyTasks: Task[];
}

export default function EggScreen({ pet, onInteract, onTaskComplete, coupleCode, dailyTasks }: Props) {
  const [copied, setCopied] = useState(false);
  const [showHatch, setShowHatch] = useState(false);

  const warmth = pet?.warmth ?? 0;
  const progress = warmth;

  const copyCode = () => {
    navigator.clipboard.writeText(coupleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWarmth = () => {
    onInteract('warmth', 10);
    if (warmth >= 90) {
      setTimeout(() => setShowHatch(true), 500);
    }
  };

  return (
    <div className="min-h-screen bg-paw-cream flex flex-col items-center px-6 py-8">
      <div className="w-full max-w-sm">
        {/* Room Code */}
        <div className="bg-white rounded-xl p-3 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">房间代码</div>
            <div className="text-xl font-bold text-paw-dark tracking-widest">{coupleCode}</div>
          </div>
          <button onClick={copyCode} className="p-2 rounded-lg bg-paw-light text-paw-dark">
            {copied ? '✅' : '📋'}
          </button>
        </div>

        {/* Egg */}
        <div className="relative flex flex-col items-center mb-8">
          <div className={`text-9xl ${warmth >= 90 ? 'egg-shake warmth-pulse' : warmth > 50 ? 'egg-shake' : ''}`}>
            🥚
          </div>
          {warmth >= 90 && (
            <div className="absolute top-0 right-10 text-4xl animate-bounce">✨</div>
          )}
          <div className="mt-4 text-center">
            <div className="text-lg font-bold text-paw-dark">一颗神秘的蛋</div>
            <div className="text-sm text-gray-500">需要两人的温暖才能孵化</div>
          </div>
        </div>

        {/* Warmth Progress */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-gray-600">温暖值</span>
            <span className="text-sm font-bold text-paw-pink">{progress}%</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-paw-pink stat-bar rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 text-xs text-gray-400 text-center">
            每天完成任务可以增加温暖值，达到 100% 后蛋就会破壳！
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleWarmth}
            className="bg-paw-pink text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🔥</span>
            <span>传递温暖</span>
            <span className="text-xs opacity-80">+10 温暖值</span>
          </button>
          <button
            onClick={() => onInteract('warmth', 5)}
            className="bg-white text-paw-dark py-4 rounded-xl font-bold shadow-md border-2 border-paw-light active:scale-95 transition-transform flex flex-col items-center gap-1"
          >
            <span className="text-2xl">💫</span>
            <span>甜蜜互动</span>
            <span className="text-xs text-gray-400">+5 温暖值</span>
          </button>
        </div>

        {/* Daily Tasks */}
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <div className="font-bold text-gray-700 mb-3">今日任务</div>
          <div className="space-y-3">
            {dailyTasks.map((task, index) => (
              <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl ${task.completed ? 'bg-gray-50' : 'bg-paw-cream'}`}>
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold ${task.completed ? 'bg-gray-300' : 'bg-paw-pink'}`}>
                  {task.completed ? '✓' : index + 1}
                </div>
                <div className={`flex-1 text-sm ${task.completed ? 'text-gray-400 line-through' : ''}`}>{task.text}</div>
                {task.completed ? (
                  <span className="text-xs text-gray-400">已完成</span>
                ) : (
                  <button
                    onClick={() => onTaskComplete(task.id)}
                    className="text-xs bg-paw-pink text-white px-3 py-1 rounded-full active:scale-95 transition-transform"
                  >
                    +{task.reward}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400 text-center">
            完成任务可获得温暖值，加速蛋的孵化~
          </div>
        </div>
      </div>

      {/* Hatch Modal */}
      {showHatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full animate-bounce-slow">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-paw-dark mb-2">蛋破了！</h2>
            <p className="text-gray-500 mb-4">一只可爱的小狗宝宝诞生了！给它起个名字吧~</p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="给它起个名字..."
                className="w-full text-center text-lg border-2 border-paw-light rounded-xl py-3 focus:outline-none focus:border-paw-pink text-paw-dark"
                id="pet-name-input"
                maxLength={12}
              />
            </div>
            <button
              onClick={() => {
                const nameInput = document.getElementById('pet-name-input') as HTMLInputElement;
                const name = nameInput?.value?.trim();
                if (name) onInteract('name', name);
                setShowHatch(false);
              }}
              className="w-full bg-paw-pink text-white py-3 rounded-xl font-bold"
            >
              去看看
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
