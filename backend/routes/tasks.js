const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/tasks -> listar todas las tareas (ordenadas por fecha de creación)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al listar tareas:', err);
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
});

// POST /api/tasks -> crear una nueva tarea
router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'El título de la tarea es obligatorio' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      [title.trim(), false]
    );
    const [rows] = await pool.query('SELECT id, title, completed, created_at FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error al crear tarea:', err);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// PUT /api/tasks/:id -> actualizar una tarea (título y/o estado completado)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    const newTitle = title !== undefined ? title : existing[0].title;
    const newCompleted = completed !== undefined ? completed : existing[0].completed;

    await pool.query(
      'UPDATE tasks SET title = ?, completed = ? WHERE id = ?',
      [newTitle, newCompleted, id]
    );
    const [rows] = await pool.query('SELECT id, title, completed, created_at FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar tarea:', err);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// DELETE /api/tasks/:id -> eliminar una tarea
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar tarea:', err);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

module.exports = router;
