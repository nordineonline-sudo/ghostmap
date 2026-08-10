# GhostMap – Copilot Instructions

GhostMap is a React Native (Expo 54) GPS tracking app for cyclists and walkers with ghost-race functionality.

## Tech Stack

- React Native 0.81 + Expo 54 + React 19
- TypeScript 5.9 (strict mode)
- Zustand 5.0 for state management
- Leaflet.js via react-native-webview for maps
- expo-sqlite for local persistence
- expo-keep-awake for screen wake lock
- React Navigation 7 (Stack + Bottom Tabs)

## Key Rules

- Always use functional components with hooks — no class components
- Write all code in TypeScript with strict typing
- Centralize shared types in `src/types/index.ts`
- Use Zustand stores (one per domain) in `src/stores/`
- Keep screens in `src/screens/`, reusable UI in `src/components/`
- Utility functions go in `src/utils/`
- User settings (keepAwake, defaultZoom, colors, icons) are persisted in `customStore`
- On Android (edge-to-edge enabled), never anchor floating menus/buttons flush to screen edges — use `useSafeAreaInsets` and avoid the bottom system gesture bar. Main tab navigation uses a floating, auto-hiding hamburger menu (`HamburgerMenu`) instead of a bottom tab bar
- Respond in the same language as the user's message
