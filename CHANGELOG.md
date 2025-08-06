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
  - `POST /api/todos/replace`: Replace the entire JSON database.

#### Frontend
- Set up the Vue.js + Vite.js + TypeScript stack.
- Implemented the `TodoView` component.
- Added an API handler to communicate with the backend.