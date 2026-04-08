# 👻 GhostMap

**GhostMap** est une application mobile de suivi GPS pour le vélo et la marche, avec un mode **Ghost** unique qui permet de se mesurer à ses propres performances passées.

## Fonctionnalités

### 🗺️ Enregistrement GPS
- Suivi en temps réel de la position, vitesse et altitude
- Tracé du parcours sur carte (Carto / OpenStreetMap)
- Statistiques en direct : distance, vitesse, durée
- Boutons compacts en bas à droite (enregistrer + centrer position)

### 📚 Bibliothèque de parcours
- Sauvegarde locale des parcours (SQLite)
- Classification par activité : vélo 🚴 / marche 🚶
- Recherche et filtrage des parcours
- Aperçu avec miniature, statistiques et date

### ▶️ Relecture (Replay)
- Rejouez vos parcours enregistrés
- Vitesses de lecture : ×1, ×2, ×5, ×10
- Marqueur animé sur la carte avec barre de progression
- Statistiques en temps réel pendant la relecture

### 👻 Mode Ghost
- Courez contre votre fantôme (parcours de référence)
- Double tracé : parcours actuel (bleu) vs ghost (gris)
- Indicateur de delta temporel en temps réel (avance/retard)
- Détection automatique du dépassement du ghost 🏆

### 📤 Import / Export (.gmr)
- Export de tous les parcours ou individuellement
- Format propriétaire `.gmr` (GhostMap Record)
- Import avec dédoublonnage automatique
- Partage via le système natif du téléphone

### ⚙️ Paramètres
- Choix du thème : Sombre, Clair, Midnight, Forêt
- Thème persisté entre les sessions
- Les tuiles de carte s'adaptent au thème choisi

## Stack technique

| Technologie | Usage |
|---|---|
| **React Native** 0.81 | Framework mobile |
| **Expo** 54 | Toolchain & build |
| **TypeScript** 5.9 | Typage statique |
| **Zustand** 5 | State management |
| **expo-location** | Suivi GPS |
| **expo-sqlite** | Base de données locale |
| **react-native-maps** | Cartographie OpenStreetMap |
| **React Navigation** 7 | Navigation (Stack + Tabs) |
| **expo-file-system** | Gestion fichiers (export/import) |
| **expo-sharing** | Partage natif |
| **expo-document-picker** | Sélection fichiers (import) |
| **react-native-reanimated** | Animations |

## Architecture

```
src/
├── components/       # Composants réutilisables (FloatingButton, StatsOverlay, etc.)
├── constants/        # Thème et design tokens
├── navigation/       # Stack Navigator + Bottom Tabs
├── screens/          # Écrans de l'application
│   ├── MapScreen         # Carte principale + démarrage enregistrement
│   ├── RecordingScreen   # Écran d'enregistrement en cours
│   ├── SaveRouteScreen   # Sauvegarde du parcours
│   ├── LibraryScreen     # Bibliothèque des parcours
│   ├── ReplayScreen      # Relecture d'un parcours
│   ├── GhostScreen       # Mode compétition contre le ghost
│   └── SettingsScreen    # Paramètres, thèmes, import/export
├── stores/           # Zustand stores (GPS, routes, replay, ghost, theme)
├── types/            # Interfaces TypeScript
└── utils/            # Utilitaires (GPS, base de données)
```

## Installation

```bash
# Cloner le projet
git clone https://github.com/nordineonline-sudo/ghostmap.git
cd ghostmap

# Installer les dépendances
npm install

# Lancer le serveur Expo
npm start
```

## Scripts

| Commande | Description |
|---|---|
| `npm start` | Démarrer le serveur Expo |
| `npm run android` | Lancer sur Android |
| `npm run ios` | Lancer sur iOS |
| `npm run web` | Lancer sur navigateur web |

## Build

Le projet utilise **EAS Build** pour générer les APK :

```bash
# Build de preview (APK)
eas build --profile preview --platform android

# Build de production (APK)
eas build --profile production --platform android
```

## Permissions requises

- **Localisation** (précise + arrière-plan) — suivi GPS des parcours
- **Service de premier plan** (Android) — enregistrement continu

## Version

**0.9.1.0**

## Licence

Projet privé.
