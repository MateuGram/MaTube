const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname));

// Данные видео
const videos = [
  {
    id: 1,
    title: "Новые технологии 2024",
    views: "1.2M",
    duration: "10:25",
    channel: "TechFuture",
    thumbnail: "https://picsum.photos/seed/vid1/320/180"
  },
  {
    id: 2,
    title: "Искусственный интеллект в жизни",
    views: "890K",
    duration: "15:42",
    channel: "AI Insights",
    thumbnail: "https://picsum.photos/seed/vid2/320/180"
  },
  {
    id: 3,
    title: "Космос: новые открытия",
    views: "2.3M",
    duration: "22:18",
    channel: "Space Explorer",
    thumbnail: "https://picsum.photos/seed/vid3/320/180"
  },
  {
    id: 4,
    title: "Программирование будущего",
    views: "540K",
    duration: "18:05",
    channel: "CodeMaster",
    thumbnail: "https://picsum.photos/seed/vid4/320/180"
  },
  {
    id: 5,
    title: "Градиенты в дизайне",
    views: "320K",
    duration: "12:37",
    channel: "Design Pro",
    thumbnail: "https://picsum.photos/seed/vid5/320/180"
  },
  {
    id: 6,
    title: "Neon эффекты в CSS",
    views: "410K",
    duration: "14:20",
    channel: "Web Artist",
    thumbnail: "https://picsum.photos/seed/vid6/320/180"
  }
];

// API для видео
app.get('/api/videos', (req, res) => {
  res.json(videos);
});

// Главный маршрут
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`MaTube запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
});
