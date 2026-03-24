# Project Overview

This directive provides a high-level overview of the "QR CODE DA FORTUNA" project.

## Goals
- Create a Micro-SaaS for generating and managing QR codes.
- Implement a dashboard for users to track their QR codes.
- Provide various download formats (SVG, PNG).

## Architecture
- **Framework**: Next.js
- **Database/Auth**: Supabase
- **Styling**: Tailwind CSS (initially used, but vanilla CSS preferred for new components as per AGENTE.md)
- **Folder Structure**:
    - `src/app`: Next.js App Router pages.
    - `src/components`: UI components.
    - `src/lib`: Shared libraries and utilities.
    - `directives/`: SOPs for AI agents.
    - `execution/`: Deterministic scripts for task execution.

## Common Tasks
- Running the dev server: `npm run dev`
- Building the project: `npm run build`
