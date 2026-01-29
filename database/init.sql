------------------------------------------------------------
-- SUPPRESSION DES TABLES (ordre sécurisé)
------------------------------------------------------------
DROP TABLE IF EXISTS Roles_Permissions CASCADE;
DROP TABLE IF EXISTS Historique_Elo CASCADE;
DROP TABLE IF EXISTS Journal_Actions CASCADE;
DROP TABLE IF EXISTS Documents CASCADE;
DROP TABLE IF EXISTS Matchs CASCADE;
DROP TABLE IF EXISTS Avis CASCADE;
DROP TABLE IF EXISTS Evenements CASCADE;
DROP TABLE IF EXISTS Babyfoots CASCADE;
DROP TABLE IF EXISTS Lieux CASCADE;
DROP TABLE IF EXISTS Modeles CASCADE;
DROP TABLE IF EXISTS Classement CASCADE;
DROP TABLE IF EXISTS Utilisateurs CASCADE;
DROP TABLE IF EXISTS Roles CASCADE;

------------------------------------------------------------
-- TABLE DES ROLES (référence propre)
------------------------------------------------------------
CREATE TABLE Roles (
    role VARCHAR(20) PRIMARY KEY
);

INSERT INTO Roles(role) VALUES 
('visiteur'),
('joueur'),
('organisateur'),
('admin');

------------------------------------------------------------
-- TABLE UTILISATEURS
------------------------------------------------------------
CREATE TABLE Utilisateurs (
    id_utilisateur SERIAL PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL CHECK (char_length(mot_de_passe) >= 10),
    date_inscription DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Relation propre vers Roles
    role VARCHAR(20) NOT NULL REFERENCES Roles(role),

    peut_moderer BOOLEAN DEFAULT FALSE,

    date_naissance DATE,
    organisme VARCHAR(100),
    nom_organisme VARCHAR(100),
    adresse_organisme VARCHAR(200),
    siret VARCHAR(20),
    est_valide BOOLEAN DEFAULT FALSE,
    photo_profil TEXT,

    nombre_parties INT DEFAULT 0,
    nombre_victoires INT DEFAULT 0,
    nombre_defaites INT DEFAULT 0,

    -- ELO & Stats avancées (Ajouté pour compatibilité data)
    elo_score INT DEFAULT 1500,
    elo_min INT DEFAULT 1500,
    elo_max INT DEFAULT 1500,
    serie_victoires_actuelle INT DEFAULT 0,
    serie_victoires_max INT DEFAULT 0,
    date_derniere_activite TIMESTAMP
);

------------------------------------------------------------
-- TABLE CLASSEMENT
------------------------------------------------------------
CREATE TABLE Classement (
    id_classement SERIAL PRIMARY KEY,
    id_utilisateur INT UNIQUE NOT NULL REFERENCES Utilisateurs(id_utilisateur)
);

------------------------------------------------------------
-- TABLE LIEUX
------------------------------------------------------------
CREATE TABLE Lieux (
    id_lieu SERIAL PRIMARY KEY,
    nom_lieu VARCHAR(50) NOT NULL,
    adresse VARCHAR(100),
    ville VARCHAR(50),
    code_postal VARCHAR(10),
    pays VARCHAR(50),
    position_GPS POINT,
    xcoord FLOAT,
    ycoord FLOAT,
    id_utilisateur INT REFERENCES Utilisateurs(id_utilisateur)
);

------------------------------------------------------------
-- TABLE MODELES
------------------------------------------------------------
CREATE TABLE Modeles (
    id_modele SERIAL PRIMARY KEY,
    nom_modele VARCHAR(50) NOT NULL,
    marque VARCHAR(50),
    taille VARCHAR(50),
    matière VARCHAR(50),
    couleur VARCHAR(50)
);

------------------------------------------------------------
-- TABLE BABYFOOTS
------------------------------------------------------------
CREATE TABLE Babyfoots (
    id_babyfoot SERIAL PRIMARY KEY,
    id_modele INT NOT NULL REFERENCES Modeles(id_modele),
    id_lieu INT NOT NULL REFERENCES Lieux(id_lieu),
    prix VARCHAR(50),
    nombre INT DEFAULT 1
);

------------------------------------------------------------
-- TABLE EVENEMENTS
------------------------------------------------------------
CREATE TABLE Evenements (
    id_evenement SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL REFERENCES Utilisateurs(id_utilisateur),
    id_lieu INT NOT NULL REFERENCES Lieux(id_lieu),
    nom_evenement VARCHAR(50) NOT NULL,
    date_evenement DATE NOT NULL,
    heure_evenement TIME NOT NULL,
    description_evenement TEXT
);

------------------------------------------------------------
-- TABLE AVIS
------------------------------------------------------------
CREATE TABLE Avis (
    id_avis SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL REFERENCES Utilisateurs(id_utilisateur),
    id_lieu INT NOT NULL REFERENCES Lieux(id_lieu),
    note INT CHECK (note BETWEEN 0 AND 5),
    texte TEXT,
    date_avis TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE MATCHS
------------------------------------------------------------
CREATE TABLE Matchs (
    id_match SERIAL PRIMARY KEY,
    id_joueur1 INT NOT NULL REFERENCES Utilisateurs(id_utilisateur),
    id_joueur2 INT NOT NULL REFERENCES Utilisateurs(id_utilisateur),
    id_babyfoot INT NOT NULL REFERENCES Babyfoots(id_babyfoot),
    score_joueur1 INT DEFAULT 0,
    score_joueur2 INT DEFAULT 0,
    date_match DATE NOT NULL,
    heure_match TIME NOT NULL,
    
    -- Nouveaux champs fournis via les INSERTs
    statut_validation VARCHAR(50),
    elo_joueur1_avant INT,
    elo_joueur2_avant INT,
    elo_joueur1_apres INT,
    elo_joueur2_apres INT,
    elo_variation_joueur1 INT,
    elo_variation_joueur2 INT
);

------------------------------------------------------------
-- TABLE HISTORIQUE_ELO (Nouvelle table)
------------------------------------------------------------
CREATE TABLE Historique_Elo (
    id_historique SERIAL PRIMARY KEY,
    id_utilisateur INT REFERENCES Utilisateurs(id_utilisateur),
    id_match INT REFERENCES Matchs(id_match),
    elo_avant INT,
    elo_apres INT,
    variation INT,
    date_changement TIMESTAMP
);

------------------------------------------------------------
-- TABLE DOCUMENTS
------------------------------------------------------------
CREATE TABLE Documents (
    id_document SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL REFERENCES Utilisateurs(id_utilisateur),
    type_document VARCHAR(50) NOT NULL,
    chemin_fichier TEXT NOT NULL,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLE ROLES & PERMISSIONS
------------------------------------------------------------
CREATE TABLE Roles_Permissions (
    id_permission SERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL REFERENCES Roles(role),
    action VARCHAR(50) NOT NULL,
    table_cible VARCHAR(50) NOT NULL
);

-- Permissions par défaut
INSERT INTO Roles_Permissions (role, action, table_cible) VALUES
('visiteur', 'READ', 'Evenements'),
('visiteur', 'READ', 'Classement'),

('joueur', 'CREATE', 'Matchs'),
('joueur', 'READ', 'Matchs'),
('joueur', 'UPDATE', 'Matchs'),
('joueur', 'CREATE', 'Avis'),
('joueur', 'READ', 'Avis'),
('joueur', 'READ', 'Classement'),

('organisateur', 'CREATE', 'Evenements'),
('organisateur', 'UPDATE', 'Evenements'),
('organisateur', 'READ', 'Lieux'),
('organisateur', 'CREATE', 'Lieux'),
('organisateur', 'UPDATE', 'Lieux'),
('organisateur', 'CREATE', 'Babyfoots'),
('organisateur', 'UPDATE', 'Babyfoots'),

('admin', 'CREATE', 'ALL'),
('admin', 'READ', 'ALL'),
('admin', 'UPDATE', 'ALL'),
('admin', 'DELETE', 'ALL');

------------------------------------------------------------
-- TABLE JOURNAL DES ACTIONS
------------------------------------------------------------
CREATE TABLE Journal_Actions (
    id_action SERIAL PRIMARY KEY,
    id_admin INT REFERENCES Utilisateurs(id_utilisateur),
    action TEXT NOT NULL,
    table_cible VARCHAR(50),
    id_enregistrement INT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
