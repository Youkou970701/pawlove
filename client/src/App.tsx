import { useEffect, useState } from 'react';
import { AppProvider, useAppState } from './store';
import { io, Socket } from 'socket.io-client';
import WelcomeScreen from './components/WelcomeScreen';
import EggScreen from './components/EggScreen';
import PetScreen from './components/PetScreen';
import { Pet } from './types';

let socket: Socket | null = null;

function AppInner() {
  const { state, dispatch } = useAppState();
  const { couple, pet } = state;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCode = localStorage.getItem('pawlove_code');
    if (savedCode) {
      fetchCouple(savedCode);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (couple?.code) {
      if (!socket) {
        socket = io(window.location.origin, { path: '/socket.io' });
        socket.on('connect', () => {
          dispatch({ type: 'SET_CONNECTED', payload: true });
          socket?.emit('join', couple.code);
        });
        socket.on('disconnect', () => dispatch({ type: 'SET_CONNECTED', payload: false }));
        socket.on('petUpdated', (updatedPet: Pet) => {
          dispatch({ type: 'UPDATE_PET', payload: updatedPet });
        });
        socket.on('petEvolved', ({ pet: evolvedPet }) => {
          if (evolvedPet) {
            dispatch({ type: 'SET_PET', payload: evolvedPet });
            alert('🎉 你的小狗长大啦！进入成犬期！');
          }
        });
        socket.on('taskCompleted', ({ taskId, pet: updatedPet }) => {
          if (updatedPet) dispatch({ type: 'UPDATE_PET', payload: updatedPet });
        });
      } else {
        socket.emit('join', couple.code);
      }
    }
    return () => {
      socket?.off('petUpdated');
    };
  }, [couple?.code]);

  const fetchCouple = async (code: string) => {
    try {
      const res = await fetch(`/api/couple/${code}`);
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: 'SET_COUPLE', payload: data });
        if (data.pet) dispatch({ type: 'SET_PET', payload: data.pet });
        localStorage.setItem('pawlove_code', code);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createCouple = async () => {
    const res = await fetch('/api/couple', { method: 'POST' });
    const data = await res.json();
    dispatch({ type: 'SET_COUPLE', payload: data });
    if (data.pet) dispatch({ type: 'SET_PET', payload: data.pet });
    localStorage.setItem('pawlove_code', data.code);
  };

  const joinCouple = async (code: string) => {
    await fetchCouple(code);
  };

  const interact = (type: string, value?: string | number) => {
    if (!couple?.code || !socket) return;
    socket.emit('interact', { code: couple.code, type, value });
  };

  const completeTask = (taskId: string) => {
    if (!couple?.code || !socket) return;
    socket.emit('taskComplete', { code: couple.code, taskId });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paw-cream">
        <div className="text-paw-pink text-xl font-bold animate-pulse">加载中...</div>
      </div>
    );
  }

  if (!couple) {
    return <WelcomeScreen onCreate={createCouple} onJoin={joinCouple} />;
  }

  if (!pet || pet.stage === 'egg') {
    return <EggScreen pet={pet} onInteract={interact} onTaskComplete={completeTask} coupleCode={couple.code} dailyTasks={couple.dailyTasks || []} />;
  }

  return <PetScreen pet={pet} onInteract={interact} coupleCode={couple.code} />;
}

function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;