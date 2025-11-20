// ...existing code...

# Blivap — Smart Blood Donation Platform

Blivap is a web platform connecting blood donors, recipients, and healthcare organizations to streamline donation scheduling, verification, and notifications.

## Table of contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quickstart](#quickstart)
- [Project structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License & Contact](#license--contact)

## About

Blivap helps ensure a steady, timely, and safe blood supply by providing donor onboarding, appointment scheduling, verification workflows, and real-time alerts.

## Features

- Donor registration, eligibility checks, profile management
- Appointment scheduling and donation history
- Notifications (email / push) and emergency alerts
- Admin dashboard with analytics and verification workflows
- Image uploads (Cloudinary) and secure auth (JWT / cookies)

## Tech stack

- Framework: Next.js 14 / React
- Language: TypeScript
- Styling: Tailwind CSS, ShadCN UI
- State: Pinia / Zustand
- Server: Node.js + Express / NestJS
- Database: MongoDB
- Storage: Cloudinary (Multer for uploads)
- CI/CD: GitHub Actions, deploy via Vercel / Railway / Render
- Config & build: see [package.json](package.json), [next.config.ts](next.config.ts), [tsconfig.json](tsconfig.json)

## Quickstart

Prerequisites

- Node 18+ and Yarn (or npm)

Clone and install

```sh
git clone https://github.com/<your-username>/blivap.git
cd blivap
yarn install
```

Create a .env file (example)

```
NEXT_PUBLIC_API_URL=<your-backend-api-url>
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_UPLOAD_PRESET=<upload-preset>
```

Run dev server

```sh
yarn dev
```

Build for production

```sh
yarn build
yarn start
```

## Project structure (key files)

- [app/page.tsx](app/page.tsx) — main page component (default export: [`Home`](app/page.tsx))
- [app/layout.tsx](app/layout.tsx) — root layout
- [app/globals.css](app/globals.css) — global styles
- [app/Logo/](app/Logo/) — logo component assets
- [public/icons/](public/icons/) — icon assets
- [public/images/](public/images/) — image assets
- [package.json](package.json) — scripts & dependencies
- [next.config.ts](next.config.ts) — Next.js config
- [.env](.env) — local environment variables (not committed)

Refer to these files to iterate on UI, pages, and routing.

## Development notes

- The app uses the Next.js app router and server/client components. See the main page at [app/page.tsx](app/page.tsx).
- Keep secrets out of the repo; use environment variables as above.
- Tailwind classes live inline; global overrides are in [app/globals.css](app/globals.css).

## Deployment

- Common deploy targets: Vercel (recommended), Railway, Render.
- For Dockerized deployment, add a Dockerfile and use your chosen cloud provider's container registry.

## Contributing

- Fork, create a feature branch, and submit a PR.
- Add tests where applicable.
- Follow existing code style and linting rules defined in the repo.

## License & Contact

MIT License © 2025 Blivap

Website: https://www.blivap.com  
Support: support@blivap.com

// ...existing code...
