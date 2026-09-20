# Initialisation du projet : configurations essentielles et services

Documentation du commit `feat: initialize project with essential configurations and services`.

## Sommaire

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration JavaScript (package.json)](#configuration-javascript-packagejson)
3. [Configuration TypeScript (tsconfig.json)](#configuration-typescript-tsconfigjson)
4. [Configuration Tailwind CSS](#configuration-tailwind-css)
5. [Configuration PostCSS (postcss.config.js)](#configuration-postcss-postcssconfigjs)
6. [Service HTTP (services/http.ts)](#service-http-serviceshttpts)
7. [Service d'authentification (services/auth.service.ts)](#service-dauthentification-servicesauthservicets)
8. [Service de commandes (services/order.service.ts)](#service-de-commandes-servicesorderservicets)
9. [Service de produits (services/product.service.ts)](#service-de-produits-servicesproductservicets)
10. [Service de vendeurs (services/seller.service.ts)](#service-de-vendeurs-servicessellerservicets)
11. [Service d'avis (services/review.service.ts)](#service-davis-servicesreviewservicets)
12. [Utilitaire de validation (utils/validation.ts)](#utilitaire-de-validation-utilsvalidationts)

## Vue d'ensemble

Ce commit pose les fondations du frontend mobile Opengaz (Expo / React Native) :

- les fichiers de configuration du projet (dépendances, scripts, TypeScript, Tailwind CSS) ;
- la couche d'accès aux API backend via Axios, avec gestion automatique du jeton d'authentification ;
- les services métier (authentification, commandes, produits, vendeurs, avis) ;
- l'utilitaire de validation des formulaires basé sur Zod.

L'application cible l'écosystème Expo SDK 57, avec React Native 0.86.3 et NativeWind v4 (Tailwind CSS) pour le style.

## Configuration JavaScript (package.json)

Fichier : `package.json`

### Métadonnées

- `name`: `opengaz`
- `main`: `expo-router/entry` (point d'entrée Expo Router)
- `version`: `1.0.0`
- `private`: true

### Scripts disponibles

| Script | Commande | Description |
| ------ | -------- | ----------- |
| `start` | `expo start` | Démarre le serveur de développement Expo |
| `android` | `expo run:android` | Compile et lance l'application sur Android |
| `ios` | `expo run:ios` | Compile et lance l'application sur iOS |
| `web` | `expo start --web` | Démarre l'application sur le web |
| `lint` | `expo lint` | Analyse statique du code (ESLint) |
| `reset-project` | `node ./scripts/reset-project.js` | Réinitialise le projet de démonstration |

### Dépendances principales

- **Expo SDK 57** : `expo` ~57.0.24, `expo-router` ~57.0.22 (navigation basée sur les fichiers), `expo-secure-store` ~57.0.4 (stockage sécurisé du jeton), `expo-image-picker`, `expo-location`, `expo-font`, `expo-haptics`, etc.
- **React / React Native** : `react` 19.2.3, `react-native` 0.86.3, `react-dom` 19.2.3, `react-native-web`.
- **Navigation** : `@react-navigation/native` ^7.1.8, `@react-navigation/bottom-tabs` ^7.4.0, `@react-navigation/elements` ^2.6.3.
- **Style** : `nativewind` ^4.2.1, `tailwindcss` ^3.4.19, `postcss` ^8.5.6, `autoprefixer` ^10.4.23, `prettier-plugin-tailwindcss`.
- **HTTP** : `axios` ^1.17.0.
- **Validation** : `zod` ^4.4.3.
- **UI et utilitaires** : `lucide-react-native` (icônes), `react-native-toast-message` (notifications), `@gorhom/bottom-sheet` (feuilles), `react-native-reanimated` 4.5.1 + `react-native-worklets` 0.10.1 (animations), `react-native-maps`, `react-native-modal`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`, `react-native-webview`, `expo-auth-session`, `expo-clipboard`, `expo-crypto`, `expo-symbols`, `@react-native-community/datetimepicker`.

### Dépendances de développement

- `typescript` ~6.0.3, `@types/react` ~19.2.4 (support TypeScript).
- `eslint` ^9.25.0 + `eslint-config-expo` ~57.0.2 (linting).
- `@expo/ngrok` (tunnel de développement).

### Fichiers annexes

- `.npmrc` : contient la configuration npm du projet (par exemple `legacy-peer-deps=true` pour la compatibilité des dépendances).
- `.gitignore` : exclut `node_modules`, `.expo`, etc. du contrôle de version.

## Configuration TypeScript (tsconfig.json)

Fichier : `tsconfig.json`

Le projet hérite de la base fournie par Expo (`expo/tsconfig.base`) et ajoute :

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "jsx": "react",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

Points clés :

- Mode `strict` activé : garantit une vérification de types rigoureuse.
- Alias `@/*` : permet d'importer les modules du projet racine sans chemins relatifs longs (exemple : `import api from "@/services/http"`).
- Les fichiers `expo-env.d.ts` et `nativewind-env.d.ts` fournissent les typages générés par Expo et NativeWind.

Vérification manuelle possible via : `npx tsc --noEmit`.

## Configuration Tailwind CSS

Fichier : `tailwind.config.js`

### Contenu analysé

```js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00A3E0",
        secondary: "#ffc74a",
        accent: "#34D399",
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        regular: ["ManropeRegular"],
        bold: ["ManropeBold"],
        extrabold: ["ManropeExtraBold"],
        extralight: ["ManropeExtraLight"],
        semibold: ["ManropeSemiBold"],
        medium: ["ManropeMedium"],
        light: ["ManropeLight"],
        serif: ["Merriweather", "serif"],
        axiforma: ["Axiforma"],
        "font-Axiforma": ["Axiforma"],
      },
    },
  },
  plugins: [],
};
```

### Détails

- **Chemins de contenu** : les classes Tailwind sont recherchées dans `app/` et `components/`.
- **Preset NativeWind** : `nativewind/preset` active les fonctionnalités de Tailwind au sein de NativeWind.
- **Couleurs personnalisées** :
  - `primary` (`#00A3E0`) : couleur principale (bleu).
  - `secondary` (`#ffc74a`) : couleur secondaire (jaune).
  - `accent` (`#34D399`) : vert d'accentuation (succès).
  - Palette `gray` complète, de `gray-50` à `gray-900`.
- **Polices personnalisées** : variantes Manrope (regular, bold, extrabold, extralight, semibold, medium, light), Merriweather (serif) et Axiforma. Elles sont référencées par le nom de la famille et doivent être chargées via `expo-font`.

## Configuration PostCSS (postcss.config.js)

Fichier : `postcss.config.js`

Contenu :

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Ce fichier active les plugins PostCSS nécessaires au traitement des styles :

- `tailwindcss` : transforme les directives Tailwind (`.css` de la feuille de style `global.css`).
- `autoprefixer` : ajoute automatiquement les préfixes navigateur nécessaires aux règles CSS.

Supports de joies : ce fichier est utilisé par Metro (via `metro.config.js` et `global.css`) pour le support des classes Tailwind dans l'application.

## Service HTTP (services/http.ts)

Fichier : `services/http.ts`

### Rôle

- Créer et exporter l'instance Axios centralisée utilisée par tous les services.
- Gérer automatiquement le jeton d'authentification (Bearer) stocké de façon sécurisée.

### URL de base

```ts
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://opengaz-backend.onrender.com/api";
```

- L'URL peut être surchargée via la variable d'environnement `EXPO_PUBLIC_API_URL`.
- Par défaut, le backend déployé (Render) est utilisé.

### Configuration Axios

- `baseURL`: `API_BASE_URL`.
- `timeout`: 30 secondes.
- `headers`: `Content-Type: application/json`.

### Intercepteur de requêtes

- Lit le jeton dans le stockage sécurisé via `SecureStore.getItemAsync("userToken")`.
- Si un jeton existe, l'ajoute à l'en-tête `Authorization: Bearer <token>` de chaque requête.
- Les erreurs de lecture du stockage sont ignorées (le jeton est simplement omis).

### Export par défaut

`api` (instance Axios configurée) est le module unique à importer dans les services métier.

## Service d'authentification (services/auth.service.ts)

Fichier : `services/auth.service.ts`

### Types exportés

- `Role`: `"CONSUMER" | "SELLER" | "DELIVERY" | "ADMIN"`.
- `User`: informations complètes de l'utilisateur (email, rôle, nom, téléphone, adresse, quartier, point de repère, coordonnées GPS, documents CNIB, boutique, gammes de gaz, horaires, etc.).
- `LoginResponse`: `{ token, user }`.
- `SignupResponse`: `{ message, otp? }`.

### Méthodes

| Méthode | Endpoint | Description |
| ------- | -------- | ----------- |
| `signupConsumer(data)` | `POST /auth/signup` | Inscription client (rôle CONSUMER) |
| `signupSeller(data)` | `POST /auth/signup` | Inscription vendeur (rôle SELLER) |
| `signupDelivery(data)` | `POST /auth/signup` | Inscription livreur (rôle DELIVERY, mot de passe temporaire généré côté client) |
| `verifyOtp(email, otp)` | `POST /auth/verify-otp` | Vérification du code OTP d'inscription |
| `verifyResetOtp(email, otp)` | `POST /auth/verify-reset-otp` | Vérification du code OTP de réinitialisation |
| `resendOtp(email)` | `POST /auth/resend-code` | Renvoi d'un code OTP |
| `login(email, password)` | `POST /auth/login` | Connexion, renvoie le jeton et l'utilisateur |
| `getMe()` | `GET /auth/me` | Récupère l'utilisateur courant |
| `forgotPassword(email)` | `POST /auth/forgot-password` | Demande de réinitialisation de mot de passe |
| `resetPassword(payload)` | `POST /auth/reset-password` | Réinitialisation du mot de passe |
| `updateProfileImage(image)` | `PATCH /auth/profile-image` | Met à jour l'image de profil / de boutique |
| `updateProfile(payload)` | `PATCH /auth/profile` | Met à jour les informations du profil |
| `updateShopStatus(isOpen)` | `PATCH /auth/shop-status` | Ouvre ou ferme la boutique |

### Particularités

- Le mot de passe des livreurs est généré localement (temporaire) : l'administrateur fournit le mot de passe final lors de la validation du compte.
- Toutes les routes (sauf l'inscription initiale) dépendent du jeton Bearer ajouté par l'intercepteur du service HTTP.

## Service de commandes (services/order.service.ts)

Fichier : `services/order.service.ts`

### Types exportés

- `OrderStatus`: `PENDING | PREPARING | READY_FOR_DELIVERY | IN_DELIVERY | DELIVERED | COMPLETED | CANCELLED`.
- `OrderItem`: article d'une commande (produit, quantité, prix, produit détaillé avec sa catégorie de gaz).
- `OrderActor`: acteur d'une commande (vendeur, client ou livreur).
- `OrderReview`: avis rattaché à une commande.
- `Order`: commande complète (statut, montant total, acteurs, articles, avis, dates).
- `CreateOrderItem`: `{ productId, quantity }`.

### Méthodes

| Méthode | Endpoint | Description |
| ------- | -------- | ----------- |
| `getSellerOrders()` | `GET /orders/seller` | Commandes du vendeur courant |
| `getConsumerOrders()` | `GET /orders/consumer` | Commandes du client courant |
| `getAvailableOrders()` | `GET /orders/delivery/available` | Commandes disponibles pour les livreurs |
| `getMyDeliveryOrders()` | `GET /orders/delivery/my-orders` | Commandes attribuées au livreur courant |
| `getOrderDetails(orderId)` | `GET /orders/:id` | Détails d'une commande |
| `createOrder(sellerId, items)` | `POST /orders` | Crée une commande |
| `updateStatus(orderId, status)` | `PATCH /orders/:id/status` | Met à jour un statut générique |
| `validateOrder(orderId)` | `POST /orders/:id/validate` | Valide la commande (vendeur) |
| `markAsReady(orderId)` | `POST /orders/:id/ready` | Marque la commande prête à la livraison |
| `confirmCompleted(orderId)` | `POST /orders/:id/completed` | Confirme la commande comme terminée |
| `confirmDelivered(orderId)` | `POST /orders/:id/delivered` | Confirme la livraison |
| `assignOrder(orderId)` | `POST /orders/:id/assign` | Attribue la commande au livreur courant |
| `clearHistory()` | `DELETE /orders/consumer/history` | Efface l'historique client |
| `clearSellerHistory()` | `DELETE /orders/seller/history` | Efface l'historique vendeur |

### Cycle de vie d'une commande

1. `PENDING` : commande créée par le client.
2. `PREPARING` : le vendeur prépare la commande.
3. `READY_FOR_DELIVERY` : la commande est prête et visible pour les livreurs.
4. `IN_DELIVERY` : un livreur a accepté et transporte la commande.
5. `DELIVERED` : la commande est livrée.
6. `COMPLETED` : la commande est achevée et notée par le client.
7. `CANCELLED` : commande annulée.

## Service de produits (services/product.service.ts)

Fichier : `services/product.service.ts`

### Types exportés

- `GasCategory`: catégorie de gaz (nom, marque, poids, prix, URL d'image).
- `Product`: produit d'un vendeur (stock, catégorie, vendeur associé).

### Méthodes

| Méthode | Endpoint | Description |
| ------- | -------- | ----------- |
| `getAllProducts()` | `GET /products` | Tous les produits disponibles |
| `getMyProducts()` | `GET /products/me` | Produits du vendeur courant |
| `updateStock(productId, stock)` | `PATCH /products/:id/stock` | Met à jour le stock d'un produit |

## Service de vendeurs (services/seller.service.ts)

Fichier : `services/seller.service.ts`

### Type exporté

- `Seller`: vendeur avec les informations de boutique (nom, image, description, téléphone, horaires, statut ouvert/fermé, gammes de gaz, coordonnées GPS, note et nombre d'avis).

### Méthodes

| Méthode | Endpoint | Description |
| ------- | -------- | ----------- |
| `getAllSellers()` | `GET /sellers` | Récupère la liste des vendeurs |

## Service d'avis (services/review.service.ts)

Fichier : `services/review.service.ts`

### Type exporté

- `Review`: avis (note, commentaire, commande associée, vendeur, client, date).

### Méthodes

| Méthode | Endpoint | Description |
| ------- | -------- | ----------- |
| `createReview(orderId, rating, comment?)` | `POST /reviews` | Crée un avis sur une commande |

## Utilitaire de validation (utils/validation.ts)

Fichier : `utils/validation.ts`

### Rôle

Définir les schémas de validation des formulaires avec Zod afin de valider les saisies avant tout appel API.

### Contenu

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### Détails

- `loginSchema` : valide la connexion.
  - `email` : chaîne au format email valide (message d'erreur « Adresse email invalide »).
  - `password` : chaîne d'au moins 8 caractères (message « Le mot de passe doit contenir au moins 8 caractères »).
- `LoginInput` : type TypeScript inféré automatiquement depuis le schéma.

### Utilisation type

```ts
import { loginSchema } from "@/utils/validation";

const result = loginSchema.safeParse({ email, password });
if (!result.success) {
  // Afficher result.error.issues
}
```