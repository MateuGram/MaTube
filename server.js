const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Создаем папки если их нет
const uploadsDir = path.join(__dirname, 'uploads');
const thumbsDir = path.join(__dirname, 'thumbs');

(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(thumbsDir, { recursive: true });
    console.log('📁 Папки созданы');
  } catch (err) {
    console.log('📁 Папки уже существуют');
  }
})();

// Статические файлы
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));
app.use('/thumbs', express.static(thumbsDir));

// База данных в памяти
let videos = [
  {
    id: '1',
    title: 'Как создать видеохостинг за 5 минут',
    description: 'Полное руководство по созданию современного видеохостинга',
    views: 12450,
    likes: 890,
    comments: 45,
    duration: '15:30',
    uploadDate: new Date(Date.now() - 86400000).toISOString(),
    channel: 'TechMaster',
    channelAvatar: 'TM',
    thumbnail: '/thumbs/thumb1.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    tags: ['технологии', 'программирование']
  },
  {
    id: '2',
    title: 'Neon дизайн в веб-разработке',
    description: 'Создаем потрясающие неоновые эффекты на чистом CSS',
    views: 8921,
    likes: 654,
    comments: 32,
    duration: '22:15',
    uploadDate: new Date(Date.now() - 172800000).toISOString(),
    channel: 'DesignPro',
    channelAvatar: 'DP',
    thumbnail: '/thumbs/thumb2.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    tags: ['дизайн', 'CSS', 'web']
  },
  {
    id: '3',
    title: 'Искусственный интеллект 2024',
    description: 'Новейшие разработки в области ИИ и машинного обучения',
    views: 21567,
    likes: 1890,
    comments: 124,
    duration: '28:42',
    uploadDate: new Date(Date.now() - 259200000).toISOString(),
    channel: 'AI Insights',
    channelAvatar: 'AI',
    thumbnail: '/thumbs/thumb3.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    tags: ['искусственный интеллект', 'технологии']
  }
];

let comments = [
  { id: '1', videoId: '1', user: 'Алексей', text: 'Отличное видео!', timestamp: new Date().toISOString() },
  { id: '2', videoId: '1', user: 'Мария', text: 'Спасибо за урок!', timestamp: new Date().toISOString() },
  { id: '3', videoId: '2', user: 'Иван', text: 'Очень крутой дизайн!', timestamp: new Date().toISOString() }
];

// Генерация ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// API: Получить все видео
app.get('/api/videos', (req, res) => {
  res.json(videos);
});

// API: Получить одно видео
app.get('/api/videos/:id', (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Видео не найдено' });
  res.json(video);
});

// API: Загрузить видео (упрощенная версия без multer)
app.post('/api/upload', async (req, res) => {
  try {
    const { title, description, channel, videoUrl, thumbnail } = req.body;
    
    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Название и URL видео обязательны' });
    }
    
    const newVideo = {
      id: generateId(),
      title,
      description: description || '',
      views: 0,
      likes: 0,
      comments: 0,
      duration: '10:00',
      uploadDate: new Date().toISOString(),
      channel: channel || 'Аноним',
      channelAvatar: (channel || 'А').charAt(0).toUpperCase(),
      thumbnail: thumbnail || `/thumbs/thumb${Math.floor(Math.random() * 5) + 1}.jpg`,
      videoUrl: videoUrl,
      tags: []
    };
    
    videos.unshift(newVideo);
    console.log('✅ Видео добавлено:', newVideo.title);
    
    res.status(201).json(newVideo);
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API: Лайк видео
app.post('/api/videos/:id/like', (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Видео не найдено' });
  
  video.likes++;
  res.json(video);
});

// API: Комментарии
app.get('/api/videos/:id/comments', (req, res) => {
  const videoComments = comments.filter(c => c.videoId === req.params.id);
  res.json(videoComments);
});

app.post('/api/videos/:id/comments', (req, res) => {
  const { user, text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Текст комментария обязателен' });
  }
  
  const newComment = {
    id: generateId(),
    videoId: req.params.id,
    user: user || 'Аноним',
    text,
    timestamp: new Date().toISOString()
  };
  
  comments.push(newComment);
  
  // Обновляем счетчик комментариев
  const video = videos.find(v => v.id === req.params.id);
  if (video) {
    video.comments++;
  }
  
  res.status(201).json(newComment);
});

// API: Поиск
app.get('/api/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  
  if (!query) {
    return res.json(videos);
  }
  
  const results = videos.filter(video => 
    video.title.toLowerCase().includes(query) ||
    video.description.toLowerCase().includes(query) ||
    video.channel.toLowerCase().includes(query) ||
    (video.tags && video.tags.some(tag => tag.toLowerCase().includes(query)))
  );
  
  res.json(results);
});

// API: Тренды
app.get('/api/trending', (req, res) => {
  const trending = [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  res.json(trending);
});

// Главный маршрут
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`
  🚀 MaTube запущен!
  📍 Порт: ${PORT}
  🌐 Откройте: http://localhost:${PORT}
  
  📹 Доступно видео: ${videos.length}
  💬 Комментарии: ${comments.length}
  
  🔧 API Endpoints:
  • GET  /api/videos          - все видео
  • GET  /api/videos/:id      - одно видео
  • POST /api/upload          - загрузить видео
  • POST /api/videos/:id/like - лайк видео
  • GET  /api/search?q=       - поиск видео
  `);
});    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Только видео файлы!'));
  }
});

// Middleware
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

// База данных в памяти (в продакшене заменить на реальную БД)
let videos = [
  {
    id: '1',
    title: 'Как создать видеохостинг за 5 минут',
    description: 'Полное руководство по созданию современного видеохостинга',
    views: 12450,
    likes: 890,
    comments: 45,
    duration: '15:30',
    uploadDate: new Date(Date.now() - 86400000).toISOString(),
    channel: 'TechMaster',
    channelAvatar: 'TM',
    thumbnail: 'https://picsum.photos/seed/vid1/640/360',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: '2',
    title: 'Neon дизайн в веб-разработке',
    description: 'Создаем потрясающие неоновые эффекты на чистом CSS',
    views: 8921,
    likes: 654,
    comments: 32,
    duration: '22:15',
    uploadDate: new Date(Date.now() - 172800000).toISOString(),
    channel: 'DesignPro',
    channelAvatar: 'DP',
    thumbnail: 'https://picsum.photos/seed/vid2/640/360',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: '3',
    title: 'Искусственный интеллект 2024',
    description: 'Новейшие разработки в области ИИ и машинного обучения',
    views: 21567,
    likes: 1890,
    comments: 124,
    duration: '28:42',
    uploadDate: new Date(Date.now() - 259200000).toISOString(),
    channel: 'AI Insights',
    channelAvatar: 'AI',
    thumbnail: 'https://picsum.photos/seed/vid3/640/360',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

let comments = [
  { id: '1', videoId: '1', user: 'Алексей', text: 'Отличное видео!', timestamp: new Date().toISOString() },
  { id: '2', videoId: '1', user: 'Мария', text: 'Спасибо за урок!', timestamp: new Date().toISOString() },
  { id: '3', videoId: '2', user: 'Иван', text: 'Очень крутой дизайн!', timestamp: new Date().toISOString() }
];

// API Маршруты
// Получить все видео
app.get('/api/videos', (req, res) => {
  res.json(videos);
});

// Получить одно видео
app.get('/api/videos/:id', (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Видео не найдено' });
  res.json(video);
});

// Загрузить видео
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const newVideo = {
      id: uuidv4(),
      title: req.body.title || 'Без названия',
      description: req.body.description || '',
      views: 0,
      likes: 0,
      comments: 0,
      duration: req.body.duration || '00:00',
      uploadDate: new Date().toISOString(),
      channel: req.body.channel || 'Аноним',
      channelAvatar: (req.body.channel || 'А').charAt(0),
      thumbnail: req.body.thumbnail || `https://picsum.photos/seed/${Date.now()}/640/360`,
      videoUrl: `/uploads/${req.file.filename}`
    };

    videos.unshift(newVideo); // Добавляем в начало
    
    // Уведомляем всех через WebSocket
    io.emit('new-video', newVideo);
    
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Лайк видео
app.post('/api/videos/:id/like', (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Видео не найдено' });
  
  video.likes++;
  io.emit('video-updated', video);
  res.json(video);
});

// Комментарии
app.get('/api/videos/:id/comments', (req, res) => {
  const videoComments = comments.filter(c => c.videoId === req.params.id);
  res.json(videoComments);
});

app.post('/api/videos/:id/comments', (req, res) => {
  const newComment = {
    id: uuidv4(),
    videoId: req.params.id,
    user: req.body.user || 'Аноним',
    text: req.body.text,
    timestamp: new Date().toISOString()
  };
  
  comments.push(newComment);
  
  // Обновляем счетчик комментариев у видео
  const video = videos.find(v => v.id === req.params.id);
  if (video) {
    video.comments++;
    io.emit('video-updated', video);
  }
  
  io.emit('new-comment', newComment);
  res.status(201).json(newComment);
});

// Поиск видео
app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  if (!query) return res.json(videos);
  
  const results = videos.filter(video => 
    video.title.toLowerCase().includes(query) ||
    video.description.toLowerCase().includes(query) ||
    video.channel.toLowerCase().includes(query)
  );
  
  res.json(results);
});

// Получить популярные видео
app.get('/api/trending', (req, res) => {
  const trending = [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  res.json(trending);
});

// WebSocket соединения
io.on('connection', (socket) => {
  console.log('Новое соединение:', socket.id);
  
  socket.on('view', (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      video.views++;
      io.emit('video-updated', video);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Соединение закрыто:', socket.id);
  });
});

// Главный маршрут
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Создаем папку uploads если нет
async function init() {
  try {
    await fs.mkdir('./uploads', { recursive: true });
    console.log('Папка uploads создана');
  } catch (err) {
    console.log('Папка uploads уже существует');
  }
}

// Запуск сервера
server.listen(PORT, async () => {
  await init();
  console.log(`
  🚀 MaTube запущен!
  📍 Порт: ${PORT}
  🌐 Откройте: http://localhost:${PORT}
  
  📹 Загружено видео: ${videos.length}
  💬 Комментарии: ${comments.length}
  🔌 WebSocket: готов к подключениям
  `);
});
