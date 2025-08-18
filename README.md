# 📦 The DECK Mail Intake System

> **This is a secure mail intake and delivery management platform built for The DECK株式会社. The base structure was created by [Matthew Nguyen](https://github.com/matthewnguyen1230), while [I](https://github.com/jdirkx) altered some workflows and implemented OCR (optical character recognition) to assign mail to clients automatically. 

> It enables staff to:**
> - Upload and preview received mail  
> - Assign mail to registered clients  
> - Trigger email notifications  
> - Track user and system actions with audit logs

## 🚀 Tech Stack

| Tool           | Use Case                             |
|----------------|--------------------------------------|
| Next.js        | Web framework (App Router)           |
| NextAuth.js    | Authentication (Google SSO)          |
| Prisma         | PostgreSQL ORM                       |
| Resend API     | Transactional email delivery         |
| Tailwind CSS   | Responsive styling                   |
| JWT + Cookies  | User sessions                        |

## 🔐 Authentication

> - Google Sign In via NextAuth  
> - Only allowlisted emails can log in  
> - Users must identify themselves with a name after first login  
> - **Sessions expire after 30 minutes, no auto-renewal**

```
session: {
  strategy: "jwt",
  maxAge: 1800,
  updateAge: 0,
}
```

## 📁 Project Structure

```
components/         # UI components
lib/                # Server actions (Prisma, auth)
app/api/          # Email API route & Auth (Resend)
app/(public)/       # Login screen
app/(protected)/    # Authenticated pages
  mail-upload/        Upload + notify workflow
  ocr/                Google Vision OCR API worklow
  review/             Send mail workflow
  clients-list/       Manage clients
  settings/           Audit logs
auth.ts             # NextAuth config
prisma/schema.prisma
```

## 🧭 Table of Contents

> - [Tech Stack](#-tech-stack)
> - [Authentication](#-authentication)
> - [Project Structure](#-project-structure)
> - [Key Components](#-key-components)
> - [Mail Flow](#-mail-flow)
> - [Prisma Schema](#-prisma-schema-summary)
> - [Server Actions](#-server-actions-libactionsts)
> - [Sign Out](#-sign-out)
> - [Environment Variables](#-environment-variables)
> - [Useful Commands](#-useful-commands)
> - [TODO / Suggestions](#-todo--suggestions)
> - [Maintainers](#-maintainers)

## 🧩 Key Components

| Component          | Description                                          |
|--------------------|------------------------------------------------------|
| `Navbar`           | Appears after login — navigates users through app    |
| `ProtectedRoute`   | Guards all protected pages, prompts for `userName`   |
| `ClientsList`      | Create, edit, delete clients                         |
| `AuditLogModal*`   | View login and user action logs                      |
| `EmailTemplate`    | HTML email layout using inline CSS                   |
| `context`          | Manages/stores clients, clientlist, uploaded images  |

## 📬 Mail Flow

> 1. Staff uploads envelope scans (Picture file)  
> 2. Image text is extracted via OCR API  
> 3. Images appear grouped by client on review page to send
> 4. Click "submit all" or per client group
> 4. System:  
>    - Saves mail to DB  
>    - Sends email using Resend  
>    - Logs audit trail (SEND_EMAIL)

## 📚 Prisma Schema Summary

> This schema covers client, mail, and audit log storage. See [prisma/schema.prisma](prisma/schema.prisma):

```
model Client {
  id               Int      @id @default(autoincrement())
  name             String
  primaryEmail     String   @unique
  secondaryEmails  String[]
  createdAt        DateTime @default(now())
  mails            Mail[]
}

model Mail {
  id          Int      @id @default(autoincrement())
  clientId    Int
  imageUrls   String[]
  notes       String?
  status      String?  @default("notified")
  urgency     Int?     @default(1)
  receivedAt  DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  email     String
  userName  String
  action    String
  meta      Json?
  createdAt DateTime @default(now())
}
```

## 🛠 Server Actions (`lib/actions.ts`)

> | Function               | Purpose                            |
> |------------------------|-------------------------------------|
> | `getAllClients`        | Load all client records             |
> | `addClient`            | Create client + audit log           |
> | `editClient`           | Update client + audit log           |
> | `deleteClient`         | Remove client + audit log           |
> | `addMailForClient`     | Submit scanned mail info to DB      |
> | `auditLog`             | General-purpose logger              |
> | `getAuditLogs`         | Fetch 100 latest actions            |

## 🔐 Sign Out

> Use the following server action for secure sign-out + redirect:

```tsx
// lib/auth-actions.tsx
export async function signOutAction() {
  await signOut({ redirect: false });
  redirect('/login');
}
```

## 🚨 Environment Variables

> **Check Intern2025 Drive for keys...**
> ```
> DATABASE_URL=postgres://...
> GOOGLE_CLIENT_ID=
> GOOGLE_CLIENT_SECRET=
> AUTHORIZED_EMAILS=email1@example.com,email2@example.com
> AUTH_SECRET=supersecretkey
> RESEND_API_KEY=...
> EMAIL_MOCK_MODE=true
> GOOGLE_CLOUD_VISION_SA_KEY=
> NEXTAUTH_URL="http://localhost:3000"
> ```

## 🔍 Useful Commands

> ```
> # Run app locally
> npm run dev
>
> # Migrate database
> npx prisma migrate dev --name init
>
> # Open Prisma Studio
> npx prisma studio
> ```

## ✅ TODO / Suggestions

> - [ ] CSV export for client list  
> - [ ] Email bounce/error tracking page  
> - [ ] Middleware for route-based protection  
> - [ ] File upload to cloud (S3, Supabase)

## 🧳 Maintainers

> **The DECK 株式会社**  
> For onboarding, production secrets, and deployment instructions, refer to software documents in Intern2025 drive.

**License**: MIT 
