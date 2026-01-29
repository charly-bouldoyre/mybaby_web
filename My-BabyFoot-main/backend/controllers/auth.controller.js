const userService = require('../services/user.service');

const authController = {
    /**
     * Inscription d'un nouvel utilisateur
     */
    register: async (req, res) => {
        try {
            const user = await userService.register(req.body);
            res.status(201).json(user);
        } catch (error) {
            console.error('Erreur inscription:', error);
            res.status(400).json({ error: error.message });
        }
    },

    /**
     * Connexion utilisateur
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userService.login(email, password);
            res.json(user);
        } catch (error) {
            console.error('Erreur connexion:', error);
            res.status(401).json({ error: error.message });
        }
    },

    /**
     * Déconnexion (Placeholder)
     */
    logout: async (req, res) => {
        // Logique de déconnexion si nécessaire (ex: invalidation token)
        res.status(200).json({ message: 'Déconnexion réussie' });
    }
};

module.exports = authController;
