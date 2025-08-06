# Mark-my-todos
Custom Todo list manager using local serveur.

**Mark-my-todos** is designed for users who prefer a single-page todo list. I personally used a ``todo.md`` file for all my work-related tasks, but it eventually became unmanageable. So I switched to a custom solution: a ``todo.json`` file that stores all todo elements, paired with a frontend built using Vue.js + TypeScript, and Bun as the runtime.

## Features
- Single-page interface using [Vue.js](https://vuejs.org/).
- ~~Searching motor with tag support~~ (*planned feature*).
- Multi-level organization: priorities, project categories, etc.
- Fully local and self-hosted.

## Project Setup
First, install [bun](https://bun.sh/) if you haven't already.

Then clone the repository and install dependencies:
```sh
git clone https://github.com/ArcadeCode/mark-my-todos.git
cd ./mark-my-todos/
bun install
```

### Run in Development Mode (with Hot Reload)
```sh
bun dev
```
> This will launch two servers:
> - Backend (API): <http://localhost:3000>
> - Frontend (UI): <http://localhost:5173>
> You can also start only one of them with ``bun frontend`` or ``bun backend``.

### Build for production
There are two independent builds, because Vite (the frontend bundler) cannot be minified as a standalone executable:
```sh
bun run build         # Build the backend
bun run vite build    # Build the frontend
```

## Roadmap
In future versions this stuff will be added :
- [ ] Custom `build.sh` script to compile both backend and frontend and produce a unified executable.
- [ ] Search engine (using [fuse.js](https://www.fusejs.io/))
- [ ] Project tags custom database (to add more informations about your projects into the app)