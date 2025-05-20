# LinkedIn Warm Intros

Une application web moderne pour gérer vos connexions LinkedIn et identifier des opportunités d'introductions qualifiées. Cette application aide les utilisateurs à découvrir des connexions potentielles à travers leurs réseaux et similarités professionnelles.

## Vue d'ensemble du projet

LinkedIn Warm Intros est une application React single-page qui permet aux utilisateurs de :

- Gérer des sessions de connexions LinkedIn distinctes
- Visualiser et filtrer leurs connexions LinkedIn existantes
- Identifier des prospects potentiels grâce à un système de scoring de similarité
- Trouver des chemins d'introduction qualifiés à travers leur réseau

L'application utilise des pratiques modernes de développement web, notamment des contexts React pour la gestion d'état, des routes protégées, et une intégration API RESTful avec authentification Supabase.

## Architecture et logique fonctionnelle

### Système de gestion de contexte

L'application est construite autour de trois contexts React principaux qui gèrent l'état global :

1. **AuthContext** ([`/src/contexts/AuthContext.tsx`](./src/contexts/AuthContext.tsx))
   - Gère l'authentification utilisateur via Supabase
   - Fournit des fonctions pour la connexion/déconnexion
   - Maintient l'état d'authentification (`isAuthenticated`, `isLoading`)
   - Stocke les informations de l'utilisateur et de la session

2. **SessionContext** ([`/src/contexts/SessionContext.tsx`](./src/contexts/SessionContext.tsx))
   - Gère les différentes sessions de travail
   - Permet de créer, sélectionner, modifier et supprimer des sessions
   - Stocke les métadonnées de session (nombre de connexions, profils, etc.)

3. **ProfileContext** ([`/src/contexts/ProfileContext.tsx`](./src/contexts/ProfileContext.tsx))
   - Gère les profils LinkedIn importés
   - Fournit des fonctions pour filtrer et rechercher des profils

### Flux de navigation et fonctionnalités

1. **Authentification** ([`/src/pages/LoginPage.tsx`](./src/pages/LoginPage.tsx))
   - Permet aux utilisateurs de se connecter avec email/mot de passe
   - Redirection automatique vers la page d'accueil si déjà authentifié
   - Protection des routes via [`ProtectedRoute`](./src/components/auth/ProtectedRoute.tsx)

2. **Page d'accueil** ([`/src/pages/WelcomPage.tsx`](./src/pages/WelcomPage.tsx))
   - Page de bienvenue expliquant les fonctionnalités principales
   - Point d'entrée vers le dashboard

3. **Dashboard** ([`/src/pages/DashboardPage.tsx`](./src/pages/DashboardPage.tsx))
   - Centre de contrôle principal pour l'utilisateur
   - Permet d'importer des connexions LinkedIn (fichier CSV ou URL)
   - Affiche des statistiques sur les sessions actuelles
   - Suivi en temps réel du traitement des importations

4. **Gestion des sessions** ([`/src/components/session/SessionSelector.tsx`](./src/components/session/SessionSelector.tsx))
   - Interface pour créer, sélectionner et supprimer des sessions
   - Chaque session représente un ensemble indépendant de connexions LinkedIn

5. **Analyse des connexions** ([`/src/pages/ConnectionsPage.tsx`](./src/pages/ConnectionsPage.tsx))
   - Visualisation détaillée des connexions LinkedIn importées
   - Filtrage et recherche avancés
   - Système de scoring de similarité pour identifier les connexions les plus pertinentes
   - Mise en évidence des entreprises et formations partagées

6. **Identification de prospects** ([`/src/pages/ProspectsPage.tsx`](./src/pages/ProspectsPage.tsx))
   - Analyse des prospects potentiels basée sur le réseau de l'utilisateur
   - Algorithme de scoring pour prioriser les prospects les plus prometteurs

## Techniques et technologies utilisées

### Front-end

- **Architecture React moderne**
  - [Hooks React](https://react.dev/reference/react) pour la logique d'état et d'effets
  - Contexts pour la gestion d'état global
  - Composants fonctionnels avec TypeScript

- **Interface utilisateur**
  - [Tailwind CSS](https://tailwindcss.com/) pour un styling utility-first
  - UI responsive avec designs spécifiques pour mobile et desktop
  - Composants d'interface réutilisables

- **Navigation**
  - [React Router v7](https://reactrouter.com/) pour la navigation client-side
  - Routes protégées pour sécuriser l'accès aux contenus authentifiés
  - Redirections intelligentes basées sur l'état d'authentification

- **Gestion de données**
  - Système de cache intelligent pour optimiser les requêtes API
  - Gestion d'état optimisée avec React contexts
  - Synchronisation en temps réel du statut des sessions

### Back-end (interaction)

- **Authentification et stockage**
  - [Supabase Auth](https://supabase.com/docs/guides/auth) pour la gestion utilisateur
  - Session JWT pour les API calls sécurisés

- **API Communication**
  - Client API personnalisé avec gestion d'authentification JWT
  - Requêtes RESTful pour l'interaction avec le backend
  - Gestion des erreurs et retry logic

### Fonctionnalités avancées

- **Scoring de similarité**
  - Algorithme de calcul de similarité entre profils
  - Multiples facteurs analysés : entreprises communes, éducation, titres de poste
  - Explication détaillée des scores de matching

- **Interface utilisateur interactive**
  - [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) pour des effets basés sur le défilement
  - Animation et transitions fluides pour une expérience utilisateur améliorée
  - Gestion optimisée des listes longues de connexions

## Structure détaillée du projet

```
linkedin-warm-intros/
├── public/                   # Ressources statiques
├── src/
│   ├── components/           # Composants UI réutilisables
│   │   ├── auth/             # Composants liés à l'authentification
│   │   │   ├── LoginForm.tsx # Formulaire de connexion
│   │   │   └── ProtectedRoute.tsx # Protège les routes authentifiées
│   │   ├── layout/           # Structure et mise en page
│   │   │   ├── AppLayout.tsx # Layout principal de l'application
│   │   │   └── SessionHeader.tsx # En-tête avec sélecteur de session
│   │   ├── session/          # Gestion des sessions
│   │   │   └── SessionSelector.tsx # Sélection/création de sessions
│   │   └── ui/               # Composants UI de base
│   ├── contexts/             # Providers de context React
│   │   ├── AuthContext.tsx   # Gestion de l'authentification
│   │   ├── ProfileContext.tsx # Gestion des profils LinkedIn
│   │   └── SessionContext.tsx # Gestion des sessions de travail
│   ├── lib/                  # Bibliothèques utilitaires
│   │   └── utils.ts          # Fonctions helpers réutilisables
│   ├── pages/                # Composants de niveau route
│   │   ├── ConnectionsPage.tsx # Page de visualisation des connexions
│   │   ├── DashboardPage.tsx # Tableau de bord principal
│   │   ├── LoginPage.tsx     # Page de connexion
│   │   ├── ProspectsPage.tsx # Page d'analyse des prospects
│   │   └── WelcomPage.tsx    # Page d'accueil après connexion
│   ├── services/             # Intégrations de services externes
│   │   ├── api.ts            # Client API pour le backend
│   │   └── supabase.ts       # Configuration et service Supabase
│   ├── styles/               # Styles CSS globaux et spécialisés
│   │   └── slider.css        # Styles pour les composants de slider
│   ├── types/                # Définitions de types TypeScript
│   └── utils/                # Fonctions utilitaires diverses
│       └── auth.ts           # Utilitaires spécifiques à l'auth
├── App.tsx                   # Composant racine de l'application
├── main.tsx                  # Point d'entrée de l'application
└── index.css                 # Styles globaux CSS
```

## Fonctionnalités principales

1. **Gestion de sessions**
   - Créer des sessions distinctes pour différentes analyses de réseau
   - Basculer facilement entre les sessions
   - Visualiser les statistiques par session (connexions, profils, prospects)

2. **Import de connexions LinkedIn**
   - Upload de fichier CSV exporté depuis LinkedIn
   - Import via URL LinkedIn (traitement côté serveur)
   - Suivi en temps réel du processus d'import et de traitement

3. **Analyse de réseau**
   - Visualisation détaillée des connexions
   - Filtrage multi-critères (entreprise, poste, localisation, etc.)
   - Mise en évidence des connexions partagées et similarités

4. **Scoring de similarité**
   - Calcul de scores basé sur multiples facteurs:
     - Entreprises communes
     - Formations communes
     - Similarité des postes occupés
     - Autres facteurs de matching
   - Visualisation claire des raisons du scoring

5. **Identification de prospects**
   - Analyse algorithmique du réseau pour identifier les prospects prometteurs
   - Recommandation de chemins d'introduction via les connexions existantes
   - Priorisation des prospects selon leur pertinence

## Bibliothèques et technologies

- **Framework Frontend**: [React 19](https://react.dev/) avec [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) pour un développement rapide et des builds optimisés
- **Authentification**: [Supabase Auth](https://supabase.com/docs/guides/auth) pour la gestion utilisateur
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) avec [PostCSS](https://postcss.org/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Gestion des dates**: [date-fns](https://date-fns.org/) pour la manipulation de dates
- **Client API**: Service API personnalisé avec authentification JWT
