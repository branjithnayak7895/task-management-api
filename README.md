# 📚 Week 10: Enterprise Task Management API & Dashboard

A commercial-grade backend and frontend application built using **Node.js**, **Express.js**, **MongoDB Atlas**, and **Mongoose ODM**. It provides JWT authentication, user-scoped task management, a Kanban board, task sharing, time tracking, audit logs, JSON import/export, rate limiting, and 15+ professional features.

---

## 🎯 15 Professional Enterprise Features

| # | Enterprise Feature | Technical Description & Endpoint |
|---|---|---|
| **1** | **Dynamic Kanban Board View** | Drag/toggle layout rendering tasks across `To Do`, `In Progress`, and `Completed` columns |
| **2** | **Toast Notifications & Sound Alerts** | Real-time animated toast popups for user actions and task status alerts |
| **3** | **Relative Due Date Countdowns** | Dynamic badges (`Due in 2 days`, `Overdue by 1 day`, `Due today`) |
| **4** | **Task Sharing & Collaboration** | `POST /api/tasks/:id/share` allowing task sharing with other users via email |
| **5** | **Estimated vs Actual Time Tracking** | Log `estimatedHours` and `actualHours` with variance metrics |
| **6** | **Pin / Star Favorite Tasks** | `PATCH /api/tasks/:id/pin` to pin high-priority tasks to the top |
| **7** | **Task Audit Activity Log** | `GET /api/tasks/:id/activity` tracking creation, status edits, and subtask history |
| **8** | **JSON Task Backup Import** | `POST /api/tasks/import` for bulk importing JSON task arrays |
| **9** | **Multi-Format Reports (JSON, CSV, MD)**| One-click export to JSON, CSV, or formatted Markdown report files |
| **10**| **Power User Hotkeys** | Shortcuts: `Ctrl+N` (New task), `Ctrl+F` (Search), `Ctrl+R` (Refresh) |
| **11**| **Subtasks Checklist** | Embedded subtask arrays with completion progress bars |
| **12**| **Multi-Tag Classification** | `tags: [String]` support with `#tag` pills and tag search |
| **13**| **Analytics Aggregation Pipeline** | `GET /api/tasks/stats` computing total, completed, pending, overdue counts, and hours |
| **14**| **Bulk Batch Operations** | `PATCH /api/tasks/bulk-complete` and `DELETE /api/tasks/bulk-delete` |
| **15**| **Floating Theme Switcher** | 6 preset themes docked in top-right floating corner bar with `localStorage` memory |

---

## 🔌 API Endpoint Documentation

### User Authentication & Profile (`/api/users`)

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/users/register` | Public | Register new user account |
| `POST` | `/api/users/login` | Public | Authenticate user & get JWT |
| `GET` | `/api/users/profile` | Protected | Get user profile |
| `PUT` | `/api/users/profile` | Protected | Update name & email |
| `PUT` | `/api/users/password` | Protected | Change password |

### Enterprise Task Endpoints (`/api/tasks`)

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | Protected | Fetch tasks (owned + shared) with sorting & filtering |
| `POST` | `/api/tasks` | Protected | Create new task |
| `GET` | `/api/tasks/stats` | Protected | MongoDB aggregation analytics pipeline |
| `PATCH` | `/api/tasks/:id/pin` | Protected | Pin/unpin task to top of list |
| `POST` | `/api/tasks/:id/share` | Protected | Share task with another user email |
| `GET` | `/api/tasks/:id/activity` | Protected | Fetch task audit activity log |
| `POST` | `/api/tasks/import` | Protected | Import JSON task backup array |
| `PATCH` | `/api/tasks/bulk-complete` | Protected | Bulk complete tasks |
| `DELETE` | `/api/tasks/bulk-delete` | Protected | Bulk delete completed tasks |

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run automated integration tests
npm test
```
Access the dashboard at `http://localhost:5000`.
