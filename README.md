# VaultNoteServer

A SvelteKit project designed for managing and exposing server routes. It integrates with Prisma for database management, Tailwind CSS for styling, and utilizes Shadcn-Svelte components for a modern UI. Authentication is handled via Lucia Auth.

## Features

*   SvelteKit for a robust web application framework
*   Tailwind CSS for utility-first styling
*   Shadcn-Svelte components for a customizable UI
*   Prisma ORM for database interactions
*   User authentication via Lucia Auth

## Getting Started

### Prerequisites

*   Node.js (LTS recommended)
*   bun (or yarn/pnpm/npm)
*   SQLite

### Installation

To get a local copy up and running, follow these simple steps.

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/VaultNoteServer.git
    cd VaultNoteServer
    ```
2.  Install dependencies:
    ```bash
    bun install # or npm install or pnpm install
    ```
3.  Set up environment variables:
    Create a `.env` file in the root directory by copying `.env.example` and filling in the necessary values.
    ```bash
    cp .env.example .env
    ```
4.  Database Setup:
    ```bash
    npx prisma migrate dev --name init # or npx prisma db push
    ```

## Developing

Once you've created a project and installed dependencies with `bun install` (or `pnpm install` or `yarn`), start a development server:

```bash
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

To create a production version of your app:

```bash
bun run build
```

You can preview the production build with `bun run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
