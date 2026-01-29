-- ==========================================================
-- Activation de PostGIS + Ajout des colonnes géométriques
-- ==========================================================

-- 1. Activer l’extension PostGIS (si pas déjà active)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 2. Ajouter une colonne geometry aux lieux (si elle n'existe pas déjà)
ALTER TABLE lieux
ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);

-- 3. Remplir la colonne geom à partir des colonnes xcoord / ycoord
UPDATE lieux
SET geom = ST_SetSRID(ST_MakePoint(xcoord, ycoord), 4326)
WHERE xcoord IS NOT NULL AND ycoord IS NOT NULL;

-- 4. Vérification (optionnelle)
-- SELECT id_lieu, nom_lieu, ST_AsText(geom) FROM lieux LIMIT 10;

-- 5. Index spatial pour accélérer les recherches géographiques
CREATE INDEX IF NOT EXISTS idx_lieux_geom
ON lieux
USING GIST (geom);
