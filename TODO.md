# ✅ Project TODO – Mark-my-todos

This document summarizes the current progress, pending tasks, and future improvements planned for the **Mark-my-todos** application.

## 🛡️ Security & ⚙️ Performance
- [X] Fix path injection vulnerability :
    - Currently, the `path=...` parameter allows writing to arbitrary files, including sensitive ones such as `.lock`, `.vault`, or system files like `/etc/passwd`.  
    - **Fix:** Sanitize and strictly validate all paths before performing file operations.

- [ ] Fix $O(n)$ complexity for writing and reading db with fast JSON stream writer/reader to accomplish an $O(1)$ complexity.

## 🧹 Project Cleanup & Enhancements

- [ ] Add badges from [shields.io](https://shields.io) to README for build status, coverage, etc.
- [X] Automate testing workflow with GitHub Actions
- [ ] Refactor `Todo.ts` by decomposing it into a dedicated `./todo/` directory, splitting logic into files like `sanitize.ts`, `class.ts`, `validate.ts`, etc.
- [ ] Implement path aliases for cleaner imports, e.g., `#shared`, `#services`
    - [X] `#shared`
    - [ ] `#services`
- [ ] Re-organizing CSS stylesheets and put all in assets/
- [ ] Use real RESTful architecture for all end-points and regroup all end-point around `api/todos/:id`
- [ ] Optimize logo size and styling (currently too large)
- [ ] Edited `logger` to read file name and put it into the log without need of a `context` attribut.
- [ ] Adding a `forceCreation` parameter to `add`. For now add cannot generate for nowhere a new DB.
- [ ] Changing `<button>Ajouter le Todo</button>` to say `Éditer le Todo` when `<ActionModal/>` is in edit mode.
- [ ] Adding i18n into the frontend.
- [ ] Adding duplicate button in Todo actions buttons to generate the same Todo data.
---

*This TODO list will be updated regularly to reflect ongoing progress and new priorities.*