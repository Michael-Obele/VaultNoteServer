### Detailed Plan for VaultNoteServer Transformation

**Goal:** Transform the SvelteKit repository into a server for a mobile app, focusing on `+server.ts` routes, migrating authentication from Drizzle to Prisma (SQLite/Turso), and displaying all routes on the homepage.

#### Phase 1: Initial Setup and Prisma Integration

1.  **Install Prisma and Dependencies:**
    *   Add Prisma to the project.
    *   Install `@prisma/client` and `prisma`.

2.  **Configure Prisma for SQLite (Turso):**
    *   Create [`prisma/schema.prisma`](prisma/schema.prisma).
    *   Define the `datasource` to use `sqlite`.
    *   Use the existing Turso `DATABASE_URL` environment variable for the connection.

3.  **Define Prisma Schema:**
    *   Translate the existing Drizzle schema (`src/lib/server/db/schema.ts`) into [`prisma/schema.prisma`](prisma/schema.prisma). This includes `User` and `Session` models with their respective fields and relations.
    *   Ensure `id` fields are properly defined (e.g., `String @id @default(uuid())` for consistency with how Lucia usually generates IDs, or `String @id` and let Lucia handle the ID generation if it's based on SHA256 as currently). We will use `String @id` and let Lucia manage the ID generation based on the existing `sha256` implementation.

4.  **Generate Prisma Client:**
    *   Run `prisma generate` to create the Prisma client.

5.  **Initialize Prisma Client:**
    *   Create a new file (e.g., [`src/lib/server/db/prisma.ts`](src/lib/server/db/prisma.ts)) to instantiate and export the Prisma client. This will replace the Drizzle `db` export.

#### Phase 2: Migrate Authentication to Prisma

1.  **Update Lucia Configuration:**
    *   Modify [`src/lib/server/auth.ts`](src/lib/server/auth.ts) to use the new Prisma client instead of the Drizzle `db` instance.
    *   Adjust `Lucia` adapter calls to use the Prisma adapter (e.g., `PrismaAdapter` from `@lucia-auth/adapter-prisma`).
    *   Re-evaluate existing `createSession`, `validateSessionToken`, `invalidateSession` functions to ensure they correctly interact with Prisma.

2.  **Refactor Drizzle-Specific Code:**
    *   Remove [`drizzle.config.ts`](drizzle.config.ts), [`src/lib/server/db/index.ts`](src/lib/server/db/index.ts), and [`src/lib/server/db/schema.ts`](src/lib/server/db/schema.ts) (or rename them as `_old` for reference during migration).
    *   Clean up any Drizzle-specific imports or logic across the codebase.

3.  **Update Login/Sign-up Routes:**
    *   Review and update [`src/routes/demo/lucia/login/+page.server.ts`](src/routes/demo/lucia/login/+page.server.ts) and any related server files (`+page.server.ts` files in the `src/routes/demo/lucia/` directory) to use the new Lucia-Prisma authentication functions.
    *   Ensure user creation and session management align with the Prisma schema.

#### Phase 3: Route Management and Display

1.  **Develop Route Discovery Script:**
    *   Create a server utility (e.g., [`src/lib/server/utils/route-scanner.ts`](src/lib/server/utils/route-scanner.ts) or a new `+server.ts` endpoint) that scans the `src/routes` directory for `+server.ts` files.
    *   This script will dynamically identify all server-side routes.
    *   Consider how to extract the route path from the file path (e.g., `/api/users` from `src/routes/api/users/+server.ts`).

2.  **Create a `+server.ts` Endpoint for Routes:**
    *   Implement a new `+server.ts` file (e.g., [`src/routes/api/routes/+server.ts`](src/routes/api/routes/+server.ts)) that exposes the discovered routes.
    *   This endpoint will call the route discovery script and return a JSON list of available server routes.

3.  **Modify Homepage to Display Routes:**
    *   Update [`src/routes/+page.svelte`](src/routes/+page.svelte) to fetch the list of routes from the new `/api/routes` endpoint.
    *   Display these routes in a user-friendly format on the homepage, potentially as clickable links.

#### Phase 4: Refinement and Testing

1.  **Testing Authentication:**
    *   Verify that login, logout, and session validation work correctly with the new Prisma setup.
    *   Test user registration.

2.  **Testing Route Discovery:**
    *   Ensure the route discovery script accurately identifies `+server.ts` files.
    *   Verify the `/api/routes` endpoint returns the correct data.

3.  **General Clean-up:**
    *   Remove any unused Drizzle dependencies or configuration.
    *   Ensure all environment variables are correctly configured for Prisma.

### Workflow Diagram

```mermaid
graph TD
    A[Start Task] --> B(Understand Existing Drizzle/Lucia Setup);
    B --> C{User Clarification: Prisma DB};
    C -- SQLite (Turso) --> D[Phase 1: Prisma Integration];

    D --> D1(Install Prisma);
    D1 --> D2(Configure Prisma Schema for SQLite);
    D2 --> D3(Define User/Session Models in schema.prisma);
    D3 --> D4(Generate Prisma Client);
    D4 --> D5(Initialize Prisma Client);

    D --> E[Phase 2: Authentication Migration];
    E --> E1(Update Lucia Config with Prisma Adapter);
    E1 --> E2(Refactor Drizzle Calls to Prisma);
    E2 --> E3(Remove Drizzle Files);
    E3 --> E4(Update Login/Signup Routes for Prisma);

    E --> F[Phase 3: Route Management];
    F --> F1(Develop Route Discovery Script);
    F1 --> F2(Create /api/routes/+server.ts Endpoint);
    F2 --> F3(Update Homepage to Display Routes);

    F --> G[Phase 4: Refinement & Testing];
    G --> G1(Test Authentication Flow);
    G1 --> G2(Test Route Discovery);
    G2 --> G3(Clean Up);
    G3 --> H[Task Complete];