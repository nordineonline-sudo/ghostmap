---
description: "Use when writing or modifying TypeScript code, defining types, or naming interfaces."
applyTo: "**/*.ts,**/*.tsx"
---
# TypeScript Style

## Typage strict
- Mode strict activé — ne jamais contourner avec `any` ou `@ts-ignore`
- Préférer les types explicites pour les interfaces publiques et les paramètres de fonctions
- L'inférence de type est OK pour les variables locales et les retours évidents

## Organisation des types
- Types partagés centralisés dans `src/types/index.ts`
- Types locaux (propres à un seul fichier) dans le fichier concerné
- Utiliser `interface` pour les objets, `type` pour les unions et aliases

## Conventions de nommage
- `interface` : PascalCase (`GPSPoint`, `SavedRoute`)
- `type` union/alias : PascalCase (`RouteType`, `PlaybackSpeed`)
- Constantes : camelCase ou UPPER_SNAKE_CASE selon contexte
- Fonctions et variables : camelCase

## Imports
- Utiliser `import type { X }` pour les imports de types purs
- Imports depuis `../types` pour les types partagés
- Pas de `require()` — uniquement des imports ES modules
