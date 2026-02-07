const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для обслуживания статических файлов
app.use(express.static(__dirname));

// Основной маршрут
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Маршрут для API (пример)
app.get('/api/videos', (req, res) => {
  const videos = [
    { id: 1, title: "Новые технологии 2024", views: "1.2M", duration: "10:25", thumbnail: "https://picsum.photos/seed/vid1/320/180" },
    { id: 2, title: "Искусственный интеллект в жизни", views: "890K", duration: "15:42", thumbnail: "https://picsum.photos/seed/vid2/320/180" },
    { id: 3, title: "Космос: новые открытия", views: "2.3M", duration: "22:18", thumbnail: "https://picsum.photos/seed/vid3/320/180" },
    { id: 4, title: "Программирование будущего", views: "540K", duration: "18:05", thumbnail: "https://picsum.photos/seed/vid4/320/180" },
    { id: 5, title: "Градиенты в дизайне", views: "320K", duration: "12:37", thumbnail: "https://picsum.photos/seed/vid5/320/180" },
    { id: 6, title: "Neon эффекты в CSS", views: "410K", duration: "14:20", thumbnail: "https://picsum.photos/seed/vid6/320/180" }
  ];
  res.json(videos);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
});
