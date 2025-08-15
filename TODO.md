# ✅ Project TODO – Mark-my-todos

This document summarizes the current progress, pending tasks, and future improvements planned for the **Mark-my-todos** application.

---

## 🔌 Essential API Endpoints

| Endpoint                           | Status            | Notes                            |
|------------------------------------|-------------------|----------------------------------|
| `GET /api/todos`                   | ✅ Completed      | Fully functional                |
| `POST /api/todos/add`              | ✅ Completed      | Fully functional                |
| `DELETE /api/todos/remove/{index}` | ✅ Completed      | Fully functional but *          |
| `PUT /api/todos/edit/{index}`      | ✅ Completed      | Fully functional but *          |

> * = For now if an ID who doesn't follow UUIDv4 format, this will return a 404 but it will be best to send 402 for this.

---

## 🧪 Tests

| Test                  | Status       |
|-----------------------|--------------|
| Get todos             | ✅ Completed |
| Add todo              | ✅ Completed |
| Remove todo           | ✅ Completed |
| Edit todo             | ✅ Completed |

---

## 🎨 Vue.js Interface

- [X] Display todos list
- [X] Add new todo
- [X] Remove todo
- [ ] Edit todo (to implement)

---

## 🧹 Project Cleanup & Enhancements

- [ ] Add badges from [shields.io](https://shields.io) to README for build status, coverage, etc.
- [ ] Automate testing workflow with GitHub Actions
- [ ] Refactor `Todo.ts` by decomposing it into a dedicated `./todo/` directory, splitting logic into files like `sanitize.ts`, `class.ts`, `validate.ts`, etc.
- [ ] Implement path aliases for cleaner imports, e.g., `#shared`, `#services`
    - [X] `#shared`
    - [ ] `#services`
- [ ] Re-organizing CSS stylesheets and put all in assets/
- [ ] Use real RESTful architecture for all end-points and regroup all end-point around `api/todos/:id`
- [ ] Optimize logo size and styling (currently too large)
- [ ] Edited `logger` to read file name and put it into the log without need of a `context` attribut.
- [ ] Adding a `forceCreation` parameter to `add`. For now add cannot generate for nowhere a new DB.
---

*This TODO list will be updated regularly to reflect ongoing progress and new priorities.*