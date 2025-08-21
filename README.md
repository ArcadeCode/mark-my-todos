# Mark-my-todos
![Tests](https://github.com/ArcadeCode/mark-my-todos/actions/workflows/bun-backend-tests.yaml/badge.svg?branch=master)
![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4)
![License](https://img.shields.io/github/license/ArcadeCode/mark-my-todos)
![Bun](https://img.shields.io/badge/runtime-Bun-black?logo=bun&logoColor=white)

**Mark-my-todos** is designed for users who prefer a single-page todo list. I personally used a ``todo.md`` file for all my work-related tasks, but it eventually became unmanageable. So I switched to a custom solution: a ``todo.json`` file that stores all todo elements, paired with a frontend built using Vue.js + TypeScript, and Bun as the runtime.

> [!WARNING]
> Currently, the frontend is only in French, [i18n vue.js plugging](https://vue-i18n.intlify.dev/) will be added later.

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

## 🗺️ Roadmap
Planned features and improvements for upcoming versions:

### 🧱 Features
- [ ] **[v1.1]** Add new api endpoints to have a CRUD management of projects under `api/projects/`
- [ ] **[v1.1]** Add a custom `build.sh` script to compile both the backend and frontend into a single executable.
- [ ] **[v1.2]** Integrate a lightweight search engine using [Fuse.js](https://www.fusejs.io/).
- [ ] **[unplanned]** Implement a custom project tags database to store additional metadata about each project.

---

### 🛡️ Security & ⚙️ Performance
- [ ] **[v1.0.1] Path Injection Vulnerability**  
  Currently, the `path=...` parameter allows writing to arbitrary files, including sensitive ones such as `.lock`, `.vault`, or system files like `/etc/passwd`.  
  **Fix:** Sanitize and strictly validate all paths before performing file operations.

- [ ] **[v1.3] File Rewrite Performance Bottleneck**  
  All services (except `/get`) currently follow the pattern:  
  `read file → edit content → write full file`, resulting in a time complexity of **O(s)** where *s* is the size of the file.  
  This is unacceptable for production environments, even on local services.  
  **Fix planned in v1.2**: Refactor all affected services to support partial updates or streaming writes.