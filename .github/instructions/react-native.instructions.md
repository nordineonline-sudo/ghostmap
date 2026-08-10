---
description: "Use when creating or modifying React Native screens, components, or navigation. Covers Expo 54, hooks, navigation patterns."
applyTo: "src/screens/**,src/components/**,src/navigation/**"
---
# React Native / Expo Conventions

## Composants
- Toujours des composants fonctionnels avec `export default function NomComposant()`
- Jamais de composants classe
- Hooks React (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) pour la logique
- Imports React explicites : `import React, { useEffect, useState } from 'react'`

## Navigation (React Navigation 7)
- Types de navigation dans `src/types/index.ts` (`RootStackParamList`, `BottomTabParamList`)
- Toujours typer les props de navigation : `NativeStackNavigationProp<RootStackParamList>`
- Utiliser `useNavigation<NavProp>()` avec le hook typé
- Les 3 onglets principaux (Carte, Parcours, Paramètres) utilisent un menu sandwich flottant (`HamburgerMenu`, prop `tabBar` du `Tab.Navigator`) et non la barre d'onglets native, pour éviter tout chevauchement avec la barre système Android
- Le menu sandwich se masque automatiquement après une courte inactivité et à la sélection d'un item

## Styles
- `StyleSheet.create({})` en bas du fichier — pas de styles inline sauf cas trivial
- Couleurs via le thème : `const COLORS = useThemeStore((s) => s.colors)`
- Jamais de couleurs en dur dans les composants
- Les éléments flottants superposés à la carte (boutons, stats) sont ancrés en haut de l'écran avec `useSafeAreaInsets` (jamais en bas, pour ne pas chevaucher la barre de gestes Android)

## Expo
- Utiliser les modules Expo (`expo-location`, `expo-sqlite`, `expo-file-system`) au lieu d'alternatives tierces
- GPS : `Location.Accuracy.BestForNavigation` pour le tracking, `Balanced` pour les requêtes ponctuelles
- Permissions demandées au montage du composant via `useEffect`
