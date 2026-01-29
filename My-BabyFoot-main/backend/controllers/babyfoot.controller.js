const db = require('../config/db');

const eventService = {

    /**
     * Récupère tous les événements avec filtres optionnels
     * @param {Object} filters - { ville, date_min }
     */
    getAllEvents: async (filters = {}) => {
        let query = `
            SELECT 
                e.*,
                l.nom_lieu, l.ville, l.adresse,
                u.pseudo as organisateur
            FROM Evenements e
            JOIN Lieux l ON e.id_lieu = l.id_lieu
            JOIN Utilisateurs u ON e.id_utilisateur = u.id_utilisateur
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.ville) {
            query += ` AND l.ville ILIKE $${paramIndex}`;
            params.push(`%${filters.ville}%`);
            paramIndex++;
        }

        if (filters.date_min) {
            query += ` AND e.date_evenement >= $${paramIndex}`;
            params.push(filters.date_min);
            paramIndex++;
        }

        query += ' ORDER BY e.date_evenement ASC, e.heure_evenement ASC';

        const { rows } = await db.query(query, params);
        return rows;
    },

    /**
     * Récupère un événement par ID
     */
    getEventById: async (id) => {
        const query = `
            SELECT 
                e.*,
                l.nom_lieu, l.ville, l.adresse,
                u.pseudo as organisateur
            FROM Evenements e
            JOIN Lieux l ON e.id_lieu = l.id_lieu
            JOIN Utilisateurs u ON e.id_utilisateur = u.id_utilisateur
            WHERE e.id_evenement = $1
        `;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    /**
     * Crée un nouvel événement
     */
    createEvent: async (data) => {
        const query = `
            INSERT INTO Evenements (
                id_utilisateur, id_lieu, 
                nom_evenement, date_evenement, heure_evenement, 
                description_evenement
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            data.id_utilisateur,
            data.id_lieu,
            data.nom_evenement,
            data.date_evenement,
            data.heure_evenement,
            data.description_evenement
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    /**
     * Met à jour un événement
     */
    updateEvent: async (id, data) => {
        // Construction dynamique (simple)
        // Note: pour un vrai update partiel, il faudrait une logique plus complexe ou passer tous les champs
        // Ici on suppose qu'on update la description ou la date/heure
        let updateQuery = 'UPDATE Evenements SET';
        const params = [];
        let paramIndex = 1;

        const fields = ['nom_evenement', 'date_evenement', 'heure_evenement', 'description_evenement'];
        let updates = [];

        for (const field of fields) {
            if (data[field] !== undefined) {
                updates.push(` ${field} = $${paramIndex}`);
                params.push(data[field]);
                paramIndex++;
            }
        }

        if (updates.length === 0) return null; // Rien à mettre à jour

        updateQuery += updates.join(',');
        updateQuery += ` WHERE id_evenement = $${paramIndex} RETURNING *`;
        params.push(id);

        const { rows } = await db.query(updateQuery, params);
        return rows[0];
    },

    /**
     * Supprime un événement
     */
    deleteEvent: async (id) => {
        const query = 'DELETE FROM Evenements WHERE id_evenement = $1';
        await db.query(query, [id]);
        return true;
    }
};

module.exports = eventService;
