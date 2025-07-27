import { handleTodoAPI } from './routes.ts';

Bun.serve({
    port: 3000,
    fetch(req) {
        const url = new URL(req.url);
        // Routing plus explicite
        if (
            url.pathname === '/api/todos/get' ||
            url.pathname === '/api/todos/add' ||
            url.pathname === '/api/todos/replace'
        ) {
            return handleTodoAPI(req);
        }

        // Documentation de l'API
        if (url.pathname === '/api/todos' || url.pathname === '/api/todos/') {
            return Response.json({
                message: 'Todo API',
                endpoints: [
                    'GET /api/todos/get - Récupérer tous les todos',
                    'POST /api/todos/add - Ajouter un todo',
                    'POST /api/todos/replace - Remplacer tous les todos',
                ],
            });
        }

        return new Response('Not Found', { status: 404 });
    },
});

console.log('🟢 Server running at http://localhost:3000');
