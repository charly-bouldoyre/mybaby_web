// .github/scripts/fetch-data.js
const { Pool } = require('pg');
const fs = require('fs');

async function fetchData() {
  console.log('🔗 Connexion à PostgreSQL...');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'postgresql-bdemba.alwaysdata.net',
    database: process.env.DB_NAME || 'bdemba_mybaby',
    user: process.env.DB_USER || 'bdemba',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Requête adaptée à TA structure de données
    const query = `
      SELECT 
        l.id_lieu,
        l.nom_lieu,
        l.adresse,
        l.ville,
        l.code_postal,
        l.pays,
        l.xcoord as lng,
        l.ycoord as lat,
        m.marque,
        m.nom_modele,
        b.prix,
        b.nombre
      FROM Lieux l
      JOIN Babyfoots b ON l.id_lieu = b.id_lieu
      JOIN Modeles m ON b.id_modele = m.id_modele
      WHERE l.xcoord IS NOT NULL 
      AND l.ycoord IS NOT NULL
      ORDER BY l.id_lieu
    `;
    
    console.log('📡 Exécution de la requête...');
    const result = await pool.query(query);
    
    console.log(`✅ ${result.rows.length} babyfoots trouvés`);
    
    // Convertir en GeoJSON (format idéal pour Leaflet)
    const geojson = {
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(row.lng), parseFloat(row.lat)]
        },
        properties: {
          id: row.id_lieu,
          nom: row.nom_lieu,
          adresse: `${row.adresse || ''} ${row.code_postal || ''} ${row.ville || ''}`.trim(),
          marque: row.marque,
          modele: row.nom_modele,
          prix: row.prix,
          nombre: row.nombre
        }
      }))
    };
    
    // Créer le dossier data s'il n'existe pas
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data');
    }
    
    // Sauvegarder le fichier JSON
    fs.writeFileSync(
      './data/babyfoots.json',
      JSON.stringify(geojson, null, 2)  // null, 2 pour un beau formatage
    );
    
    console.log('💾 Données sauvegardées dans data/babyfoots.json');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);  // Échec du workflow
  } finally {
    await pool.end();
  }
}

fetchData();
