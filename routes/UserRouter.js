const express = require('express');
const bcrypt = require('bcryptjs'); // Importamos bcryptjs para cifrar la contraseña
const pool = require('../config/db'); // Importamos el pool para la base de datos


const UserRouter = express.Router(); // Inicializamos el router


// Crear un nuevo usuario (incluyendo cifrado de contraseña)
UserRouter.post('/users', async (req, res) => {
    const { name, email, picture, password } = req.body;
  
    // Verificar si se ha proporcionado la contraseña
    if (!password) {
      return res.status(400).json({ message: 'La contraseña es requerida' });
    }
  
    try {
      // Cifrar la contraseña usando bcryptjs
      const hashedPassword = await bcrypt.hash(password, 10); // El '10' es el número de rondas de sal
  
      // Guardar el usuario con la contraseña cifrada
      const result = await pool.query(
        'INSERT INTO users (name, email, picture, password) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, picture, hashedPassword]
      );
  
      res.json(result.rows[0]); // Retornamos el usuario creado
    } catch (error) {
      console.error('Error creando usuario:', error);
      res.status(500).json({ message: 'Error creando usuario' });
    }
  });


// Obtener un usuario por su ID
UserRouter.get('/users/:id', async (req, res) => {
    const { id } = req.params;
  
    try {

      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      res.json(result.rows[0]); // Retornamos el usuario encontrado
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ message: 'Error obteniendo usuario' });
    }
});
  
  module.exports = UserRouter;