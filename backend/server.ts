import app from './routes';

// Bun expose une API native pour créer un serveur HTTP
// Hono expose un handler compatible avec Bun (Request -> Response)

const port = 3000;

console.log(`Server running on http://localhost:${port}`);

Bun.serve({
    port,
    fetch: app.fetch, // passe directement le handler Hono
});
