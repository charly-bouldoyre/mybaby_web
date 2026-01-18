// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Important pour votre frontend
require('dotenv').config();

const app = express();
app.use(cors()); // Autorise les requêtes depuis votre site web

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } // Nécessaire pour AlwaysData
});

// Route principale pour tester
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ 
      success: true, 
      message: 'Connexion PostgreSQL réussie!',
      time: result.rows[0].time 
    });
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route pour vos babyfoots
app.get('/api/babyfoots', async (req, res) => {
  try {
    // Adaptez cette requête à votre table
    const query = `
      SELECT id, name, address, lat, lng 
      FROM locations 
      WHERE lat IS NOT NULL AND lng IS NOT NULL
    `;
    const result = await pool.query(query);
    
    // Format GeoJSON pour Leaflet
    const geoJson = {
      type: 'FeatureCollection',
      features: result.rows.map(loc => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.lng, loc.lat]
        },
        properties: {
          id: loc.id,
          name: loc.name,
          address: loc.address
        }
      }))
    };
    
    res.json(geoJson);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API en écoute sur http://localhost:${PORT}`);
});
