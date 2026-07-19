const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API REST para las tareas
app.use('/api/tasks', tasksRouter);

// Servir el frontend estático (carpeta ../public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Cualquier otra ruta devuelve el index.html (comportamiento típico de SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
