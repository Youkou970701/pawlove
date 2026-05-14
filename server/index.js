const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const STATIC_DIR = path.join(__dirname, '..', 'client', 'dist');

let data = { couples: {} };

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getDefaultTasks() {
  return [
    { id: 'good_morning', text: '互相说一句早安', completed: false, reward: 15 },
    { id: 'share_weather', text: '分享今天的天气', completed: false, reward: 10 },
    { id: 'exchange_photo', text: '交换一张今日照片', completed: false, reward: 20 },
  ];
}

function resetDailyTasks(couple) {
  const today = new Date().toISOString().split('T')[0];
  if (couple.lastTaskDate !== today) {
    couple.dailyTasks = getDefaultTasks();
    couple.lastTaskDate = today;
    return true;
  }
  return false;
}

function createPet() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    stage: 'egg',
    name: null,
    warmth: 0,
    hunger: 100,
    happiness: 100,
    cleanliness: 100,
    energy: 100,
    hatchedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

loadData();

const app = express();
const httpServer = createServer(app);

// CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  path: '/socket.io'
});

// REST API
app.post('/api/couple', (req, res) => {
  const code = generateCode();
  const pet = createPet();
  const couple = {
    id: Date.now().toString(),
    code,
    createdAt: new Date().toISOString(),
    pet,
    tasks: [],
    answers: [],
    photos: [],
    diaries: [],
    dailyTasks: getDefaultTasks(),
    lastTaskDate: new Date().toISOString().split('T')[0],
  };
  data.couples[code] = couple;
  saveData();
  res.json(couple);
});

app.get('/api/couple/:code', (req, res) => {
  const couple = data.couples[req.params.code];
  if (!couple) return res.status(404).json({ error: 'Not found' });
  resetDailyTasks(couple);
  saveData();
  res.json(couple);
});

// Socket.io real-time
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (code) => {
    socket.join(code);
    console.log(`${socket.id} joined room ${code}`);
  });

  socket.on('interact', ({ code, type, value }) => {
    const couple = data.couples[code];
    if (!couple || !couple.pet) return;

    const pet = couple.pet;

    if (pet.stage === 'egg') {
      if (type === 'warmth') {
        const newWarmth = Math.min(100, pet.warmth + (value || 5));
        pet.warmth = newWarmth;
        if (newWarmth >= 100) {
          pet.stage = 'puppy';
          pet.hatchedAt = new Date().toISOString();
        }
      } else if (type === 'name') {
        pet.name = value;
      }
    } else {
      switch (type) {
        case 'feed':
          pet.hunger = Math.min(100, pet.hunger + 20);
          pet.energy = Math.min(100, pet.energy + 5);
          break;
        case 'play':
          pet.happiness = Math.min(100, pet.happiness + 15);
          pet.energy = Math.max(0, pet.energy - 10);
          pet.hunger = Math.max(0, pet.hunger - 5);
          break;
        case 'clean':
          pet.cleanliness = Math.min(100, pet.cleanliness + 25);
          pet.happiness = Math.min(100, pet.happiness + 5);
          break;
        case 'sleep':
          pet.energy = Math.min(100, pet.energy + 30);
          pet.happiness = Math.max(0, pet.happiness - 2);
          break;
        case 'warmth':
          pet.warmth = Math.min(100, pet.warmth + (value || 5));
          break;
        case 'name':
          pet.name = value;
          break;
      }
    }

    pet.updatedAt = new Date().toISOString();
    saveData();
    io.to(code).emit('petUpdated', pet);
  });

  socket.on('taskComplete', ({ code, taskId }) => {
    const couple = data.couples[code];
    if (!couple) return;

    resetDailyTasks(couple);
    const task = couple.dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    task.completed = true;

    const pet = couple.pet;
    if (pet) {
      if (pet.stage === 'egg') {
        pet.warmth = Math.min(100, pet.warmth + task.reward);
        if (pet.warmth >= 100 && pet.stage === 'egg') {
          pet.stage = 'puppy';
          pet.hatchedAt = new Date().toISOString();
        }
      } else {
        pet.happiness = Math.min(100, pet.happiness + task.reward);
      }
      pet.updatedAt = new Date().toISOString();
    }

    saveData();
    io.to(code).emit('taskCompleted', { taskId, pet });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Stat decay + evolution every minute
setInterval(() => {
  for (const code of Object.keys(data.couples)) {
    const couple = data.couples[code];
    const pet = couple.pet;
    if (!pet || pet.stage === 'egg') continue;

    pet.hunger = Math.max(0, pet.hunger - 1);
    pet.happiness = Math.max(0, pet.happiness - 1);
    pet.cleanliness = Math.max(0, pet.cleanliness - 1);
    pet.energy = Math.min(100, pet.energy + 0.5);
    pet.updatedAt = new Date().toISOString();

    if (pet.stage === 'puppy') {
      const daysSinceHatch = (Date.now() - new Date(pet.hatchedAt).getTime()) / 86400000;
      const avgStats = (pet.hunger + pet.happiness + pet.cleanliness + pet.energy) / 4;
      if (daysSinceHatch >= 3 || avgStats >= 90) {
        pet.stage = 'adult';
        io.to(code).emit('petEvolved', { stage: 'adult', pet });
      }
    }

    io.to(code).emit('petUpdated', pet);
  }
  saveData();
}, 60000);

// Serve frontend static files (for production)
if (fs.existsSync(STATIC_DIR)) {
  app.use(express.static(STATIC_DIR));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(STATIC_DIR, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`PawLove server running on port ${PORT}`);
});
