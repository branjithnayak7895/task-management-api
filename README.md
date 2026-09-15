# 🚀 Enterprise Task Management SaaS API & Dashboard

A commercial-grade RESTful API and interactive web application built with **Node.js**, **Express.js**, **MongoDB (Mongoose ODM)**, and **JWT Authentication**. Developed by **B Ranjith Nayak**.

---

## 🌟 Key Features

* 🔐 **Authentication & Security**: JWT Bearer Tokens, password hashing with bcrypt, profile management, and password updates.
* 📁 **Projects & Workspaces**: Organize tasks into project workspaces with custom icons, color coding, and target completion dates.
* 🏃 **Agile Sprints & Burndown Analytics**: Group tasks into sprints with automated burndown metrics.
* 🎯 **Eisenhower Priority Matrix (2x2)**: Visualize tasks across Urgent/Important quadrants (Do First, Schedule, Delegate, Eliminate).
* 📅 **Gantt Chart & Timeline**: Graphical project schedule timeline visualization.
* ⏱️ **Task Time Tracker**: Real-time timer logging start/stop intervals and actual hours variance.
* 👥 **Teams & Workload Heatmap**: Role-based team management (Leaders, Developers, Designers) and capacity utilization analytics.
* 🔔 **Real-Time Notifications Feed**: Notification drawer with unread badge counters.
* 📜 **Global System Audit Trail**: System-wide activity logs tracking IP addresses and user actions.
* ⚡ **Automated Webhook Dispatcher**: Register and test webhook events for external integrations.
* 🖥️ **Interactive Developer CLI Terminal**: Built-in terminal window (`antigravity@task-cli:~$`) supporting custom shell commands.
* 🎨 **Dynamic Theme System**: 6 curated glassmorphism themes (Midnight Indigo, Cyberpunk Neon, Emerald Matrix, Sunset Crimson, Royal Amethyst, Pristine Light).
* 🔊 **Web Audio Sound Effects**: Synthesized audio chimes for task completions, timers, and alerts.
* 💾 **Full Database Backup & Restore**: Download full JSON database snapshots and restore state anytime.

---

## 🛠️ Technology Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB Atlas / Mongoose ODM (with automatic in-memory fallback for local development)
* **Authentication**: JSON Web Tokens (JWT), Bcrypt password hashing
* **Documentation**: OpenAPI 3.0 (Swagger Spec)
* **Frontend**: HTML5, Vanilla JavaScript, CSS Glassmorphism, Web Audio API

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/branjithnayak7895/task-management-api.git
cd task-management-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser to view the interactive dashboard!

### 4. Run automated integration test suite
```bash
npm test
```

---

## 📄 API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Register a new user | Public |
| `POST` | `/api/users/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/api/users/profile` | View user profile | Private |
| `GET` | `/api/tasks` | List tasks (supports search, sort, filter, pagination) | Private |
| `POST` | `/api/tasks` | Create a new task | Private |
| `PATCH` | `/api/tasks/:id/pin` | Pin/unpin high-priority task | Private |
| `POST` | `/api/tasks/:id/time/start` | Start live task timer | Private |
| `POST` | `/api/tasks/:id/time/stop` | Stop task timer & calculate hours | Private |
| `GET` | `/api/tasks/eisenhower` | Fetch Eisenhower 2x2 priority matrix | Private |
| `GET` | `/api/tasks/gantt` | Fetch Gantt timeline items | Private |
| `GET` | `/api/tasks/backup` | Download JSON database backup snapshot | Private |
| `GET` | `/api/projects` | List projects & workspaces | Private |
| `GET` | `/api/notifications` | Fetch unread notifications drawer | Private |
| `GET` | `/api/audit-logs` | Fetch system audit trail | Private |
| `GET` | `/api/system/health` | System health check & diagnostic ping | Public |
| `GET` | `/api/docs` | OpenAPI 3.0 / Swagger JSON specification | Public |

---

## 👨‍💻 Author

**B Ranjith Nayak**
* GitHub: [@branjithnayak7895](https://github.com/branjithnayak7895)
