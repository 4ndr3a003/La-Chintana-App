# Protezione Civile Project

This project is organized as a monorepo with a client-server architecture.

## Structure

- **client/**: The React frontend application (Vite + Firebase).
- **server/**: The Node.js/Express backend API.

## Getting Started

1.  **Install Dependencies**:
    Run the following command from the root directory to install dependencies for both client and server:
    ```bash
    npm run install:all
    ```

2.  **Development**:
    To run both the client and server in development mode concurrently:
    ```bash
    npm run dev
    ```
    - Client runs on: `http://localhost:5173`
    - Server runs on: `http://localhost:3000`

3.  **Individual Commands**:
    - **Client only**: `npm run dev:client`
    - **Server only**: `npm run dev:server`

## Deployment

- **Client**: `npm run build:client` (Output in `client/dist`)
- **Server**: `npm start` (in `server/` directory)
