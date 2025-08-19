# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2025-07-25

### Added
#### Backend
- Added a Bun server to handle the Todo API:
  - `GET /api/todos/get`: Retrieve the JSON file.
  - `POST /api/todos/add`: Add a new todo entry.
  - `POST /api/todos/remove/:id`: Replace an entry of the database.
  - `PUT /api/todos/edit/:id`: Edit an entry of the database.
- Added an interface for entries : `shared/interfaces/Todo.ts`
- Added logger : `shared/utils/logger.ts`

#### Frontend
- Set up the Vue.js + Vite.js + TypeScript stack.
- Implemented the `TodoView` view.
- Implemented relate to `TodoView` components :
  - `actionModal.vue` (windows to create a new Todo or editing an already created)
- Added an API handler to communicate with the backend and a shared folder.