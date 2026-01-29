const db = require('../config/db');

/**
 * Service pour gérer les babyfoots, lieux et modèles via PostgreSQL
 */
const babyfootService = {

    // --- LIEUX ---

    /**
     * Récupère tous les lieux avec des filtres optionnels
     * @param {Object} filters - { ville, recherche (nom ou adresse) }
     */
    getAllLieux: async (filters = {}) => {
        let query = 'SELECT * FROM Lieux WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (filters.ville) {
            query += ` AND ville ILIKE $${paramIndex}`;
            params.push(`%${filters.ville}%`);
            paramIndex++;
        }

        if (filters.recherche) {
            query += ` AND (nom_lieu ILIKE $${paramIndex} OR adresse ILIKE $${paramIndex})`;
            params.push(`%${filters.recherche}%`);
            paramIndex++;
        }

        // On peut trier par nom par défaut
        query += ' ORDER BY nom_lieu ASC';

        const { rows } = await db.query(query, params);
        return rows;
    },

    /**
     * Récupère un lieu par son ID
     */
    getLieuById: async (id) => {
        const query = 'SELECT * FROM Lieux WHERE id_lieu = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    /**
     * Crée un nouveau lieu
     * @param {Object} data - { nom_lieu, adresse, ville, code_postal, pays, id_utilisateur, xcoord, ycoord }
     */
    createLieu: async (data) => {
        const query = `
            INSERT INTO Lieux (nom_lieu, adresse, ville, code_postal, pays, id_utilisateur, xcoord, ycoord)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            data.nom_lieu,
            data.adresse,
            data.ville,
            data.code_postal,
            data.pays || 'France',
            data.id_utilisateur, // Peut être null si non lié à un user spécifique, mais la FK existe.
            data.xcoord || null,
            data.ycoord || null
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },


    // --- MODELES ---

    /**
     * Récupère tous les modèles de babyfoot
     */
    getAllModeles: async () => {
        const query = 'SELECT * FROM Modeles ORDER BY marque, nom_modele';
        const { rows } = await db.query(query);
        return rows;
    },


    // --- BABYFOOTS ---

    /**
     * Récupère les babyfoots avec jointure sur Lieux et Modeles
     * @param {Object} filters - { ville, modele_id }
     */
    getAllBabyfoots: async (filters = {}) => {
        // On fait des jointures pour avoir les infos lisibles du lieu et du modèle
        let query = `
            SELECT 
                b.id_babyfoot, 
                b.prix, 
                b.nombre,
                m.id_modele, m.nom_modele, m.marque, m.taille, m.matière, m.couleur,
                l.id_lieu, l.nom_lieu, l.adresse, l.ville, l.code_postal
            FROM Babyfoots b
            JOIN Modeles m ON b.id_modele = m.id_modele
            JOIN Lieux l ON b.id_lieu = l.id_lieu
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.ville) {
            query += ` AND l.ville ILIKE $${paramIndex}`;
            params.push(`%${filters.ville}%`);
            paramIndex++;
        }

        if (filters.modele_id) {
            query += ` AND m.id_modele = $${paramIndex}`;
            params.push(filters.modele_id);
            paramIndex++;
        }

        query += ' ORDER BY l.ville, l.nom_lieu';

        const { rows } = await db.query(query, params);
        return rows;
    },

    /**
     * Récupère un babyfoot par ID avec ses détails
     */
    getBabyfootById: async (id) => {
        const query = `
            SELECT 
                b.id_babyfoot, 
                b.prix, 
                b.nombre,
                m.id_modele, m.nom_modele, m.marque,
                l.id_lieu, l.nom_lieu, l.adresse, l.ville
            FROM Babyfoots b
            JOIN Modeles m ON b.id_modele = m.id_modele
            JOIN Lieux l ON b.id_lieu = l.id_lieu
            WHERE b.id_babyfoot = $1
        `;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    /**
     * Ajoute un babyfoot dans un lieu
     */
    createBabyfoot: async (data) => {
        const query = `
            INSERT INTO Babyfoots (id_modele, id_lieu, prix, nombre)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            data.id_modele,
            data.id_lieu,
            data.prix || 'Gratuit',
            data.nombre || 1
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
};

module.exports = babyfootService;
