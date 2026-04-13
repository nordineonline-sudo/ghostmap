---
description: "Use when creating or modifying Zustand stores, state management, or store-related logic."
applyTo: "src/stores/**"
---
# Zustand Store Conventions

## Structure d'un store
- Un fichier par domaine dans `src/stores/` (ex: `gpsStore.ts`, `routeStore.ts`)
- Nommage du hook : `useXxxStore` (ex: `useGPSStore`, `useThemeStore`)
- Interface typée pour le state + actions dans le même fichier

```ts
interface XxxState {
  // ─── State ───────────────────────────────
  value: string;

  // ─── Actions ─────────────────────────────
  doSomething: () => void;
}

export const useXxxStore = create<XxxState>((set, get) => ({
  value: '',
  doSomething: () => set({ value: 'done' }),
}));
```

## Règles
- Utiliser `create<StateInterface>((set, get) => ({...}))` de Zustand
- Mutations directes via `set()` — pas de middleware immer sauf besoin complexe
- Sélecteurs granulaires dans les composants : `useStore((s) => s.property)` — jamais `useStore()` sans sélecteur
- Séparer les sections avec des commentaires tirets : `// ─── Section ─────`
- Logique async directement dans les actions du store (pas de thunks externes)
- `get()` pour accéder au state courant dans une action
