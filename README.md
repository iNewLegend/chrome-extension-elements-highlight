# ElementsHighlight — Chrome extension starter for element highlighting and notes

A React + Vite + Tailwind + shadcn/ui powered Chrome extension that lets you highlight DOM elements on any visited page and lays the groundwork for adding contextual notes. Clean architecture, Shadow DOM isolation, and a fast monorepo setup with pnpm.


https://github.com/user-attachments/assets/0652d566-3fc5-4011-8357-bc4d1b87ddee


## Features
- Element highlighter overlay injected via content script
- Shadow DOM isolation for styles and UI
- Popup UI with shadcn/ui and Tailwind
- Background service worker with storage, messaging, and auto-reload on new builds
- Dev-friendly: watch builds and auto-prepare an installable extension folder
- Type-safe codebase with React 18 and TypeScript
- State with Zustand, themes via next-themes

## Tech stack
- Vite 5, React 18, TypeScript
- Tailwind CSS 3, shadcn/ui, Radix primitives
- Chrome Extension Manifest V3 (service worker)
- pnpm workspaces monorepo

## Monorepo layout
- apps/frontend: extension source
  - src/core/content-script: injects Shadow/Userland DOM roots and mounts the highlighter UI
  - src/core/background-script: service worker, storage, messaging, build info watcher
  - src/core/extension-popup: popup React UI
  - src/components, src/hooks, src/stores: reusable UI and state
  - scripts/prepare-extension.js: prepares `apps/frontend/extension` folder for loading in Chrome
  - manifest.json: base extension manifest copied into prepared build
- templates/chrome-extension: starter template (for reference)

## Getting started
Prereqs: pnpm 8+

- Install
  pnpm install

- Development (watch mode)
  cd apps/frontend
  pnpm watch

This runs two Vite builds (popup/background and content script) and a watcher that prepares `apps/frontend/extension/`.

- Load in Chrome
  1) Open chrome://extensions
  2) Enable Developer mode
  3) Load unpacked → select apps/frontend/extension

- Build for production
  cd apps/frontend
  pnpm build

Outputs are prepared in apps/frontend/extension.

## Usage
- Inspector Mode: Hold SHIFT and hover to see the cursor and element highlight.
- Create Note (scaffolded): With inspector active, select an element (SHIFT + Click) to open the note UI and overlay. The note UI and overlay are isolated via Shadow DOM for style safety.

## Scripts (apps/frontend)
- pnpm watch: Dev builds popup/background and content script, prepares extension folder
- pnpm build: Clean, typecheck, build all bundles, generate icons/cursor, prepare extension
- pnpm clean: Remove dist and extension artifacts

## How it works
- Content script mounts two isolated roots:
  - Shadow root for internal UI
  - Userland root (also shadowed) for overlays interacting with the page
- Tailwind is configured with important selectors to ensure styles apply only inside the mounted roots.
- The background worker writes and tracks a build-info.json; on change, it broadcasts updates and reloads the extension, speeding up iteration.

## Customization
- Update `apps/frontend/manifest.json` for name, permissions, and description.
- UI components live under `apps/frontend/src/components/ui` and follow shadcn/ui patterns.
- Tailwind config at `apps/frontend/tailwind.config.cjs`.
- Vite entry points are defined in `apps/frontend/vite.config.ts`.

## License
MIT
