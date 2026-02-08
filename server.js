const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Статические файлы для VK Mini App
app.use(express.static('public'));

// База данных водителей (в памяти)
let drivers = [
  { 
    id: '1', 
    name: 'Иван Петров', 
    phone: '+79161234567',
    carNumber: 'А123ВС777', 
    carModel: 'Toyota Camry',
    status: 'online',
    lastLocation: 'ул. Ленина, 15',
    lastStatusChange: new Date().toISOString(),
    address: 'Москва, ул. Тверская, 25'
  },
  { 
    id: '2', 
    name: 'Алексей Сидоров', 
    phone: '+79167654321',
    carNumber: 'В456ОР777', 
    carModel: 'Kia Rio',
    status: 'busy',
    lastLocation: 'ул. Пушкина, 10',
    lastStatusChange: new Date().toISOString(),
    address: 'Москва, ул. Арбат, 42'
  }
];

// Генератор ID
function generateId() {
  return Date.now().toString();
}

// API для получения всех водителей
app.get('/api/drivers', (req, res) => {
  res.json(drivers);
});

// API для получения одного водителя по ID
app.get('/api/drivers/:id', (req, res) => {
  const driver = drivers.find(d => d.id === req.params.id);
  if (!driver) {
    return res.status(404).json({ error: 'Водитель не найден' });
  }
  res.json(driver);
});

// API для регистрации нового водителя
app.post('/api/drivers/register', (req, res) => {
  const { name, phone, carNumber, carModel, status, address, lastLocation } = req.body;
  
  if (!name || !phone || !carNumber || !carModel || !address) {
    return res.status(400).json({ 
      error: 'Заполните все обязательные поля' 
    });
  }
  
  const existingDriver = drivers.find(d => 
    d.carNumber.toLowerCase() === carNumber.toLowerCase() || 
    d.phone === phone
  );
  
  if (existingDriver) {
    return res.status(400).json({ 
      error: 'Водитель с таким номером машины или телефоном уже существует' 
    });
  }
  
  const newDriver = {
    id: generateId(),
    name,
    phone,
    carNumber: carNumber.toUpperCase(),
    carModel,
    status: status || 'online',
    lastLocation: lastLocation || address,
    lastStatusChange: new Date().toISOString(),
    address
  };
  
  drivers.push(newDriver);
  io.emit('driver_added', newDriver);
  
  console.log(`✅ Зарегистрирован новый водитель: ${name} (${carNumber})`);
  res.json({ success: true, driver: newDriver });
});

// API для обновления статуса
app.put('/api/drivers/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, lastLocation } = req.body;
  
  const driver = drivers.find(d => d.id === id);
  if (!driver) {
    return res.status(404).json({ error: 'Водитель не найден' });
  }
  
  driver.status = status;
  driver.lastStatusChange = new Date().toISOString();
  
  if (lastLocation) {
    driver.lastLocation = lastLocation;
  }
  
  io.emit('driver_status_updated', driver);
  res.json({ success: true, driver });
});

// API для обновления адреса
app.put('/api/drivers/:id/location', (req, res) => {
  const { id } = req.params;
  const { lastLocation, address } = req.body;
  
  const driver = drivers.find(d => d.id === id);
  if (!driver) {
    return res.status(404).json({ error: 'Водитель не найден' });
  }
  
  if (lastLocation) driver.lastLocation = lastLocation;
  if (address) driver.address = address;
  
  io.emit('driver_location_updated', driver);
  res.json({ success: true, driver });
});

// Корневой маршрут для VK
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Маршрут для приложения водителя
app.get('/driver', (req, res) => {
  res.sendFile(__dirname + '/public/driver.html');
});

// Маршрут для панели логиста
app.get('/dispatcher', (req, res) => {
  res.sendFile(__dirname + '/public/dispatcher.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌍 Веб-интерфейс: http://localhost:${PORT}`);
  console.log(`🚗 Приложение водителя: http://localhost:${PORT}/driver`);
  console.log(`👔 Панель логиста: http://localhost:${PORT}/dispatcher`);
});