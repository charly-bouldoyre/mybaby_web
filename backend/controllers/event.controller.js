const eventService = require('../services/event.service');

const eventController = {

    /**
     * Récupérer tous les événements
     */
    getAllEvents: async (req, res) => {
        try {
            const filters = req.query;
            const events = await eventService.getAllEvents(filters);
            res.status(200).json(events);
        } catch (error) {
            console.error('Erreur récupération événements:', error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Récupérer un événement par ID
     */
    getEventById: async (req, res) => {
        try {
            const { id } = req.params;
            const event = await eventService.getEventById(id);
            if (!event) {
                return res.status(404).json({ message: 'Événement non trouvé' });
            }
            res.status(200).json(event);
        } catch (error) {
            console.error('Erreur récupération événement:', error);
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Créer un événement
     */
    createEvent: async (req, res) => {
        try {
            const eventData = req.body;
            // TODO: Validation (ex: id_lieu et id_utilisateur existent)
            const newEvent = await eventService.createEvent(eventData);
            res.status(201).json(newEvent);
        } catch (error) {
            console.error('Erreur création événement:', error);
            res.status(400).json({ message: error.message });
        }
    },

    /**
     * Mettre à jour un événement
     */
    updateEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedEvent = await eventService.updateEvent(id, updateData);
            if (!updatedEvent) {
                return res.status(404).json({ message: 'Événement non trouvé ou aucune modification' });
            }
            res.status(200).json(updatedEvent);
        } catch (error) {
            console.error('Erreur mise à jour événement:', error);
            res.status(400).json({ message: error.message });
        }
    },

    /**
     * Supprimer un événement
     */
    deleteEvent: async (req, res) => {
        try {
            const { id } = req.params;
            await eventService.deleteEvent(id);
            res.status(200).json({ message: 'Événement supprimé' });
        } catch (error) {
            console.error('Erreur suppression événement:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = eventController;
