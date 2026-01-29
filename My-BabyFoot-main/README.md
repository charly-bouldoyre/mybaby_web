# My-BabyFoot

Présentation du projet

MyBaby est une application web permettant de localiser des babyfoots, organiser des matchs, et gérer un classement des joueurs via un système ELO.

Le projet est conçu comme une Single Page Application (SPA) avec une architecture claire séparant le frontend, le backend et la base de données.

🧱 Architecture générale

mybaby/

│

├── frontend/        # Interface utilisateur

├── backend/         # API + logique métier

├── database/        # Scripts SQL

├── docs/            # Documentation (MCD, MLD, MPD, SCRUM)

└── .env             # Variables d’environnement (non versionnées)



🎨 Frontend

Le frontend est développé en HTML, CSS et JavaScript vanilla. Il fonctionne comme une SPA grâce à un routeur maison dans main.js.

frontend/

│

├── index.html          # Point d’entrée unique

├── main.js             # Navigation SPA + chargement dynamique

│

├── pages/              # Pages principales

├── components/         # Composants réutilisables

├── services/           # Communication avec l’API backend

└── assets/             # CSS, images, icônes



🧠 Backend

Le backend est une API REST développée en Node.js / Express avec une architecture en couches.

backend/
│

├── routes/        # Définition des endpoints

├── controllers/   # Réception des requêtes

├── services/      # Logique métier

├── models/        # Modèles de données (ORM)

├── db.js          # Connexion PostgreSQL + PostGIS

└── server.js      # Lancement du serveur



🗄️ Base de données

La base de données utilise PostgreSQL avec l’extension PostGIS pour la géolocalisation.

database/

│

├── init.sql      # Création des tables

├── seed.sql      # Données de test

└── postgis.sql   # Activation PostGIS



🚀 Lancement du projet

1️⃣ Frontend

Ouvrir simplement :

frontend/index.html

(ou via un serveur local type Live Server)


2️⃣ Backend
cd backend
npm install
npm start

3️⃣ Base de données

Créer une base PostgreSQL

Exécuter :

postgis.sql

init.sql

seed.sql


🔐 Variables d’environnement (.env)

Le fichier .env contient :

URL de la base de données

Mot de passe

Clé JWT

⚠️ Ce fichier ne doit jamais être partagé ou push sur Git.


👥 Équipe

Projet réalisé dans un cadre pédagogique.
