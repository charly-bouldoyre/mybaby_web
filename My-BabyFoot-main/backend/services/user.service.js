const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');

class UserService {
    /**
     * Inscription d'un nouvel utilisateur
     * @param {Object} userData - Données du formulaire (pseudo, email, password, etc.)
     * @returns {Object} L'utilisateur créé (sans le mot de passe)
     */
    async register(userData) {
        const {
            role,
            pseudo,
            email,
            password,
            // Champs spécifiques Joueur
            date_naissance,
            // Champs spécifiques Organisateur
            nom_responsable, // Mapped to pseudo if role is organizer? User asked "Nom du responsable" -> "pseudo" table field.
            nom_organisme,
            type_organisme, // Mapped to 'organisme'
            adresse_organisme,
            siret,
            // Common
            photo_profil
        } = userData;

        // 0. Validation basique du rôle
        if (!['joueur', 'organisateur'].includes(role)) {
            throw new Error('Rôle invalide.');
        }

        // 1. Vérifier si l'utilisateur existe déjà
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            throw new Error('Cet email est déjà utilisé.');
        }

        // 2. Hasher le mot de passe
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Préparer les données pour le modèle
        const newUser = {
            email,
            mot_de_passe: passwordHash,
            role,
            date_inscription: new Date(),
            photo_profil,
            est_valide: true, // Par défaut true, sauf si logique métier contraire

            // Initialisation stats
            elo_score: 1500,
            elo_min: 1500,
            elo_max: 1500,
            nombre_parties: 0,
            nombre_victoires: 0,
            nombre_defaites: 0
        };

        if (role === 'joueur') {
            newUser.pseudo = pseudo;
            newUser.date_naissance = date_naissance;
        } else if (role === 'organisateur') {
            // "Nom du responsable" -> stocké dans pseudo selon la consigne
            newUser.pseudo = nom_responsable || pseudo;
            newUser.nom_organisme = nom_organisme;
            newUser.organisme = type_organisme; // 'association', 'club', 'entreprise'
            newUser.adresse_organisme = adresse_organisme;
            newUser.siret = siret;
            // Note: Les documents (Attestation, PV) doivent être gérés dans une table à part (Documents)
            // Le Controller devra appeler DocumentService après avoir créé l'utilisateur.
        }

        // 4. Créer l'utilisateur via le modèle
        const createdUser = await userModel.create(newUser);

        // 5. Retourner l'utilisateur sans le mot de passe hashé
        delete createdUser.mot_de_passe;
        return createdUser;
    }

    /**
     * Connexion utilisateur
     * @param {string} email 
     * @param {string} password 
     * @returns {Object} L'utilisateur connecté
     */
    async login(email, password) {
        // 1. Trouver l'utilisateur
        const user = await userModel.findByEmail(email);
        if (!user) {
            throw new Error('Email ou mot de passe incorrect.');
        }

        // 2. Vérifier le mot de passe
        // Note: 'mot_de_passe' est le nom de la colonne dans votre table Utilisateurs
        const isMatch = await bcrypt.compare(password, user.mot_de_passe);
        if (!isMatch) {
            throw new Error('Email ou mot de passe incorrect.');
        }

        // 3. Mettre à jour la date de dernière activité (optionnel mais recommandé par votre schéma)
        await userModel.updateLastActivity(user.id_utilisateur);

        // 4. Retourner l'utilisateur nettoyé
        delete user.mot_de_passe;
        return user;
    }

    /**
     * Récupérer le profil d'un utilisateur
     * @param {number} userId 
     */
    async getProfile(userId) {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error('Utilisateur non trouvé.');
        }
        delete user.mot_de_passe;
        return user;
    }

    /**
     * Récupérer tous les utilisateurs (pour le classement par exemple)
     */
    async getAllUsers() {
        // Peut-être ajouter une pagination ici plus tard
        const users = await userModel.findAll();
        // Nettoyage de sécurité
        return users.map(u => {
            const { mot_de_passe, ...userSafe } = u;
            return userSafe;
        });
    }

    /**
     * Mettre à jour les stats ELO après un match
     * @param {number} userId 
     * @param {number} newElo 
     * @param {boolean} isWin 
     */
    async updateElo(userId, newElo, isWin) {
        const user = await userModel.findById(userId);
        if (!user) return;

        const stats = {
            elo_score: newElo,
            elo_min: Math.min(user.elo_min, newElo),
            elo_max: Math.max(user.elo_max, newElo),
            nombre_parties: user.nombre_parties + 1,
            nombre_victoires: isWin ? user.nombre_victoires + 1 : user.nombre_victoires,
            nombre_defaites: !isWin ? user.nombre_defaites + 1 : user.nombre_defaites,
            date_derniere_activite: new Date()
        };

        // Gestion série de victoires
        if (isWin) {
            stats.serie_victoires_actuelle = user.serie_victoires_actuelle + 1;
            stats.serie_victoires_max = Math.max(user.serie_victoires_max, stats.serie_victoires_actuelle);
        } else {
            stats.serie_victoires_actuelle = 0;
        }

        return await userModel.updateStats(userId, stats);
    }
}

module.exports = new UserService();
