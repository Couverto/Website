# 🍽️ Couverto - Service management, simplified.

**Couverto** is a modern service management software designed specifically for independent restaurant owners. It focuses on essential features to help restaurateurs focus on their craft, not on complex tools.

---

## 🚀 Key Features

- **📅 Real-time Reservation Management**: Receive and manage your reservations instantly from any device. Automatic confirmations and reminders included.
- **🏗️ Interactive Floor Plan**: Visualize your dining room at a glance. Manage table occupancy and seating with a simple drag-and-drop interface.
- **👥 Centralized Customer File**: Keep track of your regulars, their preferences, and allergies in one click.
- **📊 Admin Dashboard**: Monitor your restaurant's performance with key statistics and logs.
- **🌍 Multi-language Support**: Fully localized in English and French (i18n).
- **🌙 Dark/Light Mode**: Aesthetic and comfortable interface for any lighting condition.

---

## 🛠️ Tech Stack

Built with the **MERN** stack for reliability and performance:

- **Frontend**: React (Vite), TailwindCSS, ShadCN UI, Axios, i18next.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Real-time**: WebSockets for live status updates.
- **Auth**: JWT-based authentication + Google OAuth via Firebase.
- **Dev Tools**: Husky, Prettier, Unit Testing (Vitest).

---

## 🚦 Quick Start

### 📋 Requirements

- **Node.js**: v22.x+
- **pnpm**: v10.x+
- **MongoDB**: v8.0+

### 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/teovlt/Couverto.git
   cd Couverto
   ```

2. **Setup Backend**

   - Navigate to `server/`
   - Create `.env` (see `.env.example`)

   ```bash
   pnpm install
   pnpm dev
   ```

3. **Setup Frontend**

   - Navigate to `client/`
   - Create `.env` (see `.env.example`)

   ```bash
   pnpm install
   pnpm dev
   ```

4. **Access the App**
   Open [http://localhost:5173](http://localhost:5173).

---

## 🛡️ Administrative Setup

1. **Register** a new user. The first user created is automatically assigned the **Administrator** role.
2. Access the **Dashboard** to manage users, logs, and global application configuration (Name, accent color, etc.).

---

## 🧪 Testing & Quality

```bash
# In server directory
pnpm run test        # Run unit tests
pnpm run coverage    # Generate coverage report
```

Husky ensures code quality with pre-commit hooks for linting and formatting.

---

## 🤝 Contributing

Contributions are welcome! Please follow the standard fork/PR workflow and ensure your code is commented and matches the style conventions.

---

👨‍💻 **Author**: [Téo Villet](https://github.com/teovlt)
