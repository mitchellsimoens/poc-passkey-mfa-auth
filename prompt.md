# AI Prompt

Act as a senior full-stack developer.
Build a secure authentication system using Fastify (Node.js) + React (Vite).
The system should support password authentication, passkeys (WebAuthn), MFA (OTP), JWT-based sessions, and trusted device management.
The backend should use Fastify with MongoDB and the frontend should be a React SPA (Vite).

---

🔹 Backend Requirements (Fastify)

1️⃣ User Authentication (Password + Passkeys + MFA)
 • Users register with a password (hashed with a per-user salt) and optional passkeys.
 • Passwords are stored securely using bcrypt, making them irreversible.
 • Users log in with both their password and passkey.
 • Support Multi-Factor Authentication (MFA) with OTP (Google Authenticator, Authy).
 • Users can generate backup codes as an alternative MFA method.

2️⃣ Passkey Management
 • Users can name each passkey (e.g., “MacBook Pro”, “Work Laptop”).
 • Allow users to view and remove their passkeys.

3️⃣ Trusted Devices
 • Allow users to “Trust This Device” to skip MFA.
 • Store hashed device identifiers in MongoDB.
 • Detect new logins based on IP, device, and location.
 • If a new login is detected, send an email notification.

4️⃣ Session Management (JWT)
 • Use JWT tokens stored in HTTP-only cookies for authentication.
 • Implement access tokens (15 min) and refresh tokens (7 days).
 • Add a /refresh endpoint to renew expired tokens.
 • Add a /logout endpoint to clear JWT cookies and end the session.

5️⃣ Security Enhancements
 • Rate-limit authentication endpoints to prevent brute-force attacks.
 • Store user credentials securely in MongoDB.
 • Send email alerts for new logins.

---

🔹 Frontend Requirements (React + Vite)

1️⃣ User Authentication
 • Users register with a password and optionally create a passkey.
 • Login requires password + passkey.
 • If MFA is enabled, prompt for OTP before completing login.
 • Allow users to use backup codes if they lose their MFA device.

2️⃣ Passkey Management UI
 • Show a list of all registered passkeys with names.
 • Allow users to remove passkeys they no longer need.

3️⃣ Logout & Session Handling
 • Auto-refresh expired JWT tokens using the /refresh endpoint.
 • Implement secure logout by clearing JWT cookies.

4️⃣ Security Dashboard
 • Show login history (IP, device, location).
 • Allow users to remove trusted devices.

---

🔹 Tech Stack

Backend (Fastify)
 • Fastify (Lightweight Node.js framework)
 • MongoDB (User & authentication storage)
 • bcrypt (Password hashing with per-user salt)
 • @simplewebauthn/server (WebAuthn support)
 • Speakeasy (TOTP-based MFA)
 • Nodemailer (Email alerts)
 • jsonwebtoken (JWT) (Session management)
 • fastify/cookie (Secure cookie storage)

Frontend (React + Vite)
 • React (Vite) (Fast client-side SPA)
 • @simplewebauthn/browser (WebAuthn authentication)
 • react-router-dom (Navigation)
 • QR Code Generator (For MFA setup)

---

🔹 Project Structure

```text
/passkey-auth
├── backend/ (Fastify API)
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── ...
├── frontend/ (React Vite App)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PasskeyManager.jsx
│   │   │   ├── SecurityDashboard.jsx
│   │   └── index.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── ...
```

---

🔹 Expected API Endpoints

| Method | Endpoint               | Description                                  |
|--------|------------------------|----------------------------------------------|
| POST   | /register              | Create user account with password            |
| POST   | /register-passkey      | Register a passkey with a name               |
| POST   | /login                 | Verify password and return passkey challenge |
| POST   | /login/verify          | Authenticate passkey login                   |
| POST   | /enable-mfa            | Generate QR code for MFA setup               |
| POST   | /verify-mfa            | Verify OTP during MFA setup                  |
| POST   | /generate-backup-codes | Generate one-time backup codes               |
| GET    | /passkeys              | List registered passkeys                     |
| POST   | /remove-passkey        | Remove a passkey                             |
| POST   | /refresh               | Refresh JWT session                          |
| POST   | /logout                | Logout user and clear JWT                    |

---

🔹 Final Features

✅ Password-based authentication (hashed with per-user salt)
✅ Passkey authentication (WebAuthn)
✅ Multi-Factor Authentication (OTP + Backup Codes)
✅ Named passkeys for easy management
✅ Trusted device support (skip MFA on known devices)
✅ Login tracking & email alerts
✅ JWT session management (tokens, refresh, logout)
✅ Passkey management (list & remove passkeys)
✅ Security dashboard (login history, remove trusted devices)

---

🔹 Example Usage

1️⃣ Registering a User

 1. User enters username, password, and passkey name.
 2. Password is hashed with a per-user salt before storing.
 3. Passkey is created and stored with a custom name.

2️⃣ Logging in with Password + Passkey

 1. User enters username and password.
 2. If password matches, backend sends a WebAuthn challenge.
 3. User authenticates with passkey.
 4. If MFA is enabled, the user enters an OTP.
 5. If “Trust This Device” is checked, MFA is skipped in future logins.

3️⃣ Managing Passkeys

 1. User visits Passkey Manager.
 2. They see a list of all registered passkeys with names.
 3. They can remove any passkey they no longer use.

4️⃣ Session Handling

 1. JWT expires after 15 minutes.
 2. Browser automatically refreshes the token before expiration.
 3. User can logout manually, clearing JWT cookies.

---

🔹 Final Instructions
 • Implement the backend using Fastify with MongoDB.
 • Implement the frontend using React (Vite).
 • Use WebAuthn for passkey authentication.
 • Require password authentication before passkey login.
 • Use JWT for session management with refresh tokens.
 • Allow users to name their passkeys.
 • Add trusted device support to skip MFA.
 • Send email alerts for new logins.
 • Provide passkey management (view & remove keys).
 • Implement a security dashboard for login history.
 • Create all files for server and frontend in a single response.
