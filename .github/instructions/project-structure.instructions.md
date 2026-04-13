---
description: "Use when creating new files, moving code, or modifying the project file structure."
---
# Structure du projet

## Arborescence

```
src/
  components/    → Composants UI réutilisables
  constants/     → Constantes (thème, couleurs, config)
  navigation/    → Configuration de la navigation
  screens/       → Écrans (un fichier par écran)
  stores/        → Zustand stores (un par domaine)
  types/         → Types TypeScript partagés (index.ts)
  utils/         → Fonctions utilitaires pures
```

## Règles de placement
- Nouveau écran → `src/screens/NomScreen.tsx`
- Nouveau composant réutilisable → `src/components/NomComposant.tsx`
- Nouveau store → `src/stores/nomStore.ts`
- Nouvelle fonction utilitaire → `src/utils/nom.ts`
- Nouveau type partagé → ajouter dans `src/types/index.ts`
- Ne pas créer de sous-dossiers dans `screens/` ou `components/` sauf si le nombre de fichiers le justifie
- Pas de fichier barrel (`index.ts`) par dossier — imports directs vers le fichier
