# ✅ Project TODO – Mark-my-todos

This document summarizes the current progress, pending tasks, and future improvements planned for the **Mark-my-todos** application.

---

## 🔌 Essential API Endpoints

| Endpoint                           | Status            | Notes                            |
|------------------------------------|-------------------|----------------------------------|
| `GET /api/todos`                   | ✅ Completed      | Fully functional                |
| `POST /api/todos/add`              | ✅ Completed      | Fully functional                |
| `DELETE /api/todos/remove/{index}` | ✅ Completed      | Fully functional but *          |
| `PUT /api/todos/edit/{index}`      | ❌ Pending        | Implementation required         |

> * = For now if an ID who doesn't follow UUIDv4 format, this will return a 404 but it will be best to send 402 for this.

---

## 🧪 Tests

| Test                  | Status       |
|-----------------------|--------------|
| Get todos             | ✅ Completed |
| Add todo              | ✅ Completed |
| Remove todo           | ✅ Completed |
| Edit todo             | ❌ Pending   |

---

## 🎨 Vue.js Interface

- [X] Display todos list
- [X] Add new todo
- [ ] Remove todo (to implement)
- [ ] Edit todo (to implement)

---

## 🧹 Project Cleanup & Enhancements

- [ ] Add badges from [shields.io](https://shields.io) to README for build status, coverage, etc.
- [ ] Automate testing workflow with GitHub Actions
- [ ] Refactor `Todo.ts` by decomposing it into a dedicated `./todo/` directory, splitting logic into files like `sanitize.ts`, `class.ts`, `validate.ts`, etc.
- [ ] Implement path aliases for cleaner imports, e.g., `#shared`, `#services`
- [ ] Optimize logo size and styling (currently too large)
- [ ] Edited logger.xxx to read file name and put it into the log without need of a `context` attribut.

---

*This TODO list will be updated regularly to reflect ongoing progress and new priorities.*