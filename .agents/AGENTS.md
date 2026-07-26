# AI Agent Guidelines & Project Instructions (AGENTS.md)

**Project Name:** Full-Stack E-Commerce Platform  
**Workspace Root:** `/home/reyfuu/e-commerce`  
**Primary Tech Stack:** Next.js (TypeScript) + Go (Golang) REST API + PostgreSQL + Redis  

---

## 1. Project Context & Documentation Hierarchy

When working on this repository, all AI agents MUST consult and adhere to the project specifications documented in the following files:

- **[PRD.md](file:///home/reyfuu/e-commerce/PRD.md)**: Product requirements, user roles (Customer/Admin), feature scopes, and roadmap.
- **[Architecture.md](file:///home/reyfuu/e-commerce/Architecture.md)**: System topology, decoupled architecture, component interfaces, JWT auth flow, and JSON API standards.
- **[Design.md](file:///home/reyfuu/e-commerce/Design.md)**: UI/UX design tokens, glassmorphism aesthetics, color palette, wireframes, and responsive user flows.
- **[Schema.md](file:///home/reyfuu/e-commerce/Schema.md)**: Database ERD, table definitions, data types, constraints, and indexing strategy.
- **[Rules.md](file:///home/reyfuu/e-commerce/Rules.md)**: Coding conventions, directory layouts, Git workflow, and verification SOP.

---

## 2. Core Operational Directives for Agents

### 2.1. Codebase Modifications & Architecture Standards
1. **Layered Architecture in Backend (`/backend`)**:
   - `internal/handler`: Responsible for HTTP parsing, request validation, and JSON responses.
   - `internal/service`: Responsible for core business logic and transaction orchestration.
   - `internal/repository`: Responsible for raw SQL / ORM data access to PostgreSQL/Redis.
   - `internal/model`: Struct definitions, DTOs, and database model entities.
2. **Modular Structure in Frontend (`/front-end`)**:
   - Next.js App Router under `src/app`.
   - Reusable UI elements under `src/components/ui`.
   - API service integration layer under `src/services`.
   - TypeScript interface definitions under `src/types`.

### 2.2. Critical Technical Rules
- **No Untyped Code**: Do NOT use `any` in TypeScript. Define explicit types/interfaces.
- **Strict Error Handling**: In Go, handle all errors explicitly (`if err != nil`). Never swallow errors or return silent default values.
- **Aesthetic Excellence**: UI implementations MUST be visually rich, modern, dark-themed with sleek gradients and smooth micro-animations. Avoid generic default browser styles.
- **Schema Alignment**: Any database migration or query change MUST align with [Schema.md](file:///home/reyfuu/e-commerce/Schema.md).

### 2.3. Verification & Quality Assurance
- **Never Declare Success Without Verification**: Always compile and test backend (`go build ./...`) and build/check frontend (`npm run build` / typecheck) before reporting task completion.
