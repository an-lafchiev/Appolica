# 💼 Appolica GoCardless + Xero

A **Next.js** application that integrates with **GoCardless (Nordigen)** and **Xero** to automate banking and accounting workflows

---

## 📦 Installation & Setup

### ✅ Prerequisites

- **Node.js v22.11.0** (recommended)
- **npm** as the package manager
- API credentials for:
  - **GoCardless/Nordigen**
  - **Xero**
- Local SQLite database setup via Prisma

---

### 📁 Environment Variables

Create two environment files in your project root:

#### `.env.local`

```env
# GoCardless (Nordigen) API
NORDIGEN_BASE_URL=
SECRET_ID=
SECRET_KEY=

# Application base URL
APP_URL=http://localhost:3000

# Xero API credentials
XERO_CLIENT_ID=
XERO_SECRET=

# Cron authorization
CRON_SECRET=
```

#### `.env`

```env
DATABASE_URL="file:./dev.db"
```

## 🛠️ Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependancies**

   ```bash
   npm install
   ```

3. **Apply database migrations**

   ```bash
   npm run prisma:migrate
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

## ⏰ Cron Job Setup (Vercel)

To automate backend tasks (e.g., syncing transactions), you can use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs/overview). Here's how to configure it:

### 1. Add `vercel.json` to your project root:

```json
{
  "cron": [
    {
      "path": "/api/cron",
      "schedule": "0 9 * * *",
      "headers": {
        "x-cron-authorization": "YOUR_SECRET"
      }
    }
  ]
}
```
