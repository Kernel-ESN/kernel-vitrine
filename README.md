# Kernel Consulting — website and listings platform

Website of Kernel Consulting, an IT engineering company based in Niamey, Niger, together with a public platform for job offers and calls for tenders.

- **Website:** the company's services (DevOps, data, cloud, cybersecurity) and a catalogue of packaged offers, with monthly or annual pricing. The offers include websites, domain names and email, hosting, AI integration and workflow automation.
- **Listings platform:** jobs and calls for tenders in Niger.
  - Candidates search, filter, save listings, set email alerts and apply online with a stored CV.
  - Organisations publish and manage their listings from an employer space.
  - Moderators validate every listing and verify every organisation.

This repository is the Angular frontend. The API lives in [kernel-backend](https://github.com/Kernel-ESN/kernel-backend).

## Quick start

You only need **Node.js 22 or 24** (20.19+ also works). No backend, database or account is required: by default the app runs entirely in the browser on built-in sample data.

```bash
git clone https://github.com/Kernel-ESN/kernel-vitrine.git
cd kernel-vitrine
npm ci
npm start
```

Open http://localhost:4200.

To try the signed-in areas, open http://localhost:4200/connexion and sign in with one of these sample accounts. Any password of 8 characters or more works.

| Account | Role |
|---|---|
| `candidat@example.org` | Candidate: profile, CV, applications, saved listings, alerts |
| `employeur@example.org` | Employer: publish, close, republish and duplicate listings |
| `moderateur@example.org` | Moderator: review listings and organisations |

## Commands

| Command | What it does |
|---|---|
| `npm start` | Development server with hot reload, sample data |
| `npm run start:api` | Development server connected to the real API on `localhost:8080` (see below) |
| `npm test` | Unit and component tests (Vitest, jsdom) |
| `npm run lint` | ESLint, including module boundary rules |
| `npm run build` | Production build with static prerendering into `dist/kernel-vitrine/browser` |

## Running with the real API

1. Start [kernel-backend](https://github.com/Kernel-ESN/kernel-backend) by following its README. This needs Java 21 and Docker or Podman for PostgreSQL.
2. Run `npm run start:api` in this repository.

The dev server sends `/api` calls to `http://localhost:8080` through `proxy.conf.json`. The backend's `dev` profile creates the same three sample accounts, with the password `motdepasse`.

## Technical overview

- **Framework:** Angular 21 with standalone components, signals, zoneless change detection and `OnPush` everywhere.
- **Rendering:** static prerendering of every public route at build time, with hydration in the browser and View Transitions between pages.
- **Data access:** each feature exposes an abstract API, with two implementations. The sample one runs in the browser and is used by default; the HTTP one calls the real API. Pages never know which one they use: the build configuration (`environment.ts` / `environment.api.ts`) picks it.
- **UI:** a design system built from the Kernel brand charter (Sora and JetBrains Mono fonts, Lucide icons). Interactive widgets use Angular CDK for keyboard and focus handling.
- **Quality:**
  - semantic HTML and keyboard navigation;
  - mobile first, with 44 px touch targets;
  - an initial bundle budget enforced at build time.

```
src/app/
├── core/       app-wide services: layout (header, footer), HTTP, SEO, navigation
├── shared/     reusable UI: page hero, panels, table of contents, icons, form fields
└── features/   one folder per area, each split into pages/, ui/, data-access/, models/, state/
    ├── showcase/   public website: home, services, offers, method, about, contact, legal
    ├── listings/   listings search, detail pages, organisations
    ├── auth/       sign-in and registration
    ├── account/    candidate space and applications
    ├── employer/   employer space and publishing
    ├── alerts/     email alerts
    └── admin/      moderation
```

ESLint enforces the dependency direction: `core` and `shared` never import from `features`, and features only import from each other where explicitly allowed.

## Requirements

- Node.js `^20.19`, `^22.12` or `24+` (`.nvmrc` provided: run `nvm use`)
- npm 10 or later

## Contact

Kernel Consulting, Niamey, Niger: [github.com/Kernel-ESN](https://github.com/Kernel-ESN)
