# Opengaz : plateforme logistique d'énergie

## 1. Résumé du projet

Opengaz est une plateforme logistique complète conçue pour digitaliser et optimiser la chaîne d'approvisionnement du gaz domestique. En connectant directement les consommateurs, les revendeurs et les livreurs via une interface intuitive, opengaz résout les problématiques d'inefficacité, d'imprécision des adresses et de gestion de stock rencontrées sur le marché.

Le système repose sur une architecture moderne utilisant react native pour le frontend mobile, node.js et express pour le backend, et postgresql comme moteur de données. Il intègre des fonctionnalités avancées telles que la géolocalisation automatique, la gestion des stocks en temps réel et un système de workflows asynchrones.

## 2. Vue d'ensemble de l'architecture

Opengaz adopte une architecture modulaire et distribuée. La plateforme se divise en trois zones logiques principales :

*   **Frontend mobile (expo / react native) :** l'application native offrant des parcours optimisés par profil (consommateur, revendeur, livreur).
*   **Backend (node.js / express) :** une api robuste sécurisée par jwt, gérant la logique métier, la persistance des données via prisma, et l'intégration de cloudinary pour les médias.
*   **Administration :** une interface web dédiée aux administrateurs pour la gestion et la modération des partenaires.

Pour une compréhension approfondie de l'architecture, veuillez consulter les documents suivants dans le dossier `docs/` :
*   `backend_architecture_plan.md` : détails sur la structuration du backend et les choix technologiques.
*   `configuration-des-routes.md` : guide exhaustif sur le routage et la hiérarchie des écrans.

## 3. Fonctionnalités clés par profil

L'application est segmentée par rôles afin de proposer une interface contextuelle et efficace.

### 3.1 Profil consommateur
Le parcours consommateur est orienté vers la rapidité de commande et la précision de la localisation.
*   **Authentification sécurisée :** inscription validée par code otp.
*   **Géolocalisation automatique :** détection de position pour filtrer les vendeurs à proximité.
*   **Workflow de commande :** sélection de bouteille -> panier -> confirmation -> tracking.
*   **Notation :** système d'évaluation post-livraison pour assurer la qualité.

### 3.2 Profil revendeur
Le revendeur dispose d'un outil de pilotage pour sa gestion quotidienne.
*   **Dashboard dynamique :** suivi des ventes, des commandes en cours et alertes de stock.
*   **Gestion de disponibilité :** contrôle instantané de l'état de la boutique (ouvert/fermé).
*   **Gestion des stocks :** décrémentation automatique lors des commandes, avec possibilité de mise à jour manuelle (ventes au comptoir).

### 3.3 Profil livreur
Le livreur assure le dernier kilomètre logistique.
*   **Validation administrative :** parcours d'onboarding sécurisé.
*   **Gestion des missions :** acceptation de commandes prêtes pour livraison.
*   **Tracking de livraison :** guidage vers le revendeur puis vers le client final.

Pour un détail complet des fonctionnalités, consultez `docs/guide_utilisateur_complet.md`.

## 4. Stack technologique (détails techniques)

Le projet repose sur des standards industriels éprouvés :

*   **Runtime :** node.js (typescript).
*   **Frontend mobile :** expo, react native.
*   **Styling :** nativewind (tailwind css) pour une interface réactive et moderne.
*   **Orm :** prisma, garantissant la cohérence des transactions (atomicité).
*   **Base de données :** postgresql (hébergé sur neon).
*   **Intégrations :**
    *   **Cloudinary :** gestion des médias (images des boutiques).
    *   **Google auth :** authentification oauth2.
    *   **Expo location :** système de géolocalisation.

## 5. Démarrage et installation

### Prérequis
*   node.js (version 18 ou supérieure recommandée).
*   npm ou yarn.
*   Un compte neon (pour la base de données).
*   Un compte cloudinary (pour le stockage d'images).

### Installation
1. Cloner le repository.
2. Installer les dépendances racine : `npm install`.
3. Configurer les variables d'environnement (`.env`) en vous référant aux fichiers `.env.example` dans le backend et à la documentation `docs/deployment_environment.md`.
4. Lancer le backend : `cd backend && npm run dev`.
5. Lancer le frontend : `npm run start` (depuis la racine).

## 6. Structure du projet

```text
/
├── app/              # frontend mobile (expo router)
├── backend/          # api express (typescript/prisma)
├── docs/             # documentation détaillée
├── components/       # composants ui partagés
├── services/         # logique métier et api clients
└── ...
```

## 7. Référentiel documentaire

Pour garantir la pérennité du projet, toute nouvelle fonctionnalité doit être documentée. le dossier `docs/` est la référence absolue.

| Document | Description |
| :--- | :--- |
| `docs/guide_utilisateur.md` | guide utilisateur non technique par profil. |
| `docs/configuration_routes.md` | manuel technique de navigation. |

## 8. Workflow de développement

Le projet suit une approche de développement structurée :
1.  **Recherche :** analyse des besoins et des contraintes.
2.  **Stratégie :** définition de l'approche technique.
3.  **Execution (plan-act-validate) :** développement itératif avec tests rigoureux.

Toute modification structurelle doit être validée par une mise à jour des documents correspondants dans le dossier `docs/`.
=======
# OpenGaz

<div align="center">
  <img src="https://media.istockphoto.com/id/1066419604/fr/vectoriel/standard-pictogam-de-symbole-dinflammabilit%C3%A9-signe-avant-coureur-du-syst%C3%A8me-g%C3%A9n%C3%A9ral.jpg?s=612x612&w=0&k=20&c=UdcvWrbz3JYNByP7cFk1UjcOgaiR5cm0-3pyRbaj-aQ=" alt="OpenGaz Banner">
  
  <p align="center">
    <strong>  Machine de géolocalisation de points de gaz </strong>
  </p>

</div>







---

| Pour les consommateurs | Pour les revendeurs | Pour les admins |
|------------------------|---------------------|-----------------|
| ✅ Carte interactive des points de vente | ✅ Dashboard de gestion de stock | ✅ Validation des revendeurs |
| ✅ Recherche par géolocalisation | ✅ Mise à jour des stocks en temps réel | ✅ Modération des contenus |
| ✅ Filtrage par type de gaz | ✅ Statistiques de vente | ✅ Gestion des utilisateurs |
| ✅ Favoris et alertes stock | ✅ Notifications Avancées | ✅ Analytics globales |
