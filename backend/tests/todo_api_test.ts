// import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
// import { Todo } from '../Todo';
// import { readTodos, writeTodos, addTodo } from '../services/todo.service';

// const TEST_DATA_PATH = './backend/data/test_todo.json';
// const BASE_URL = 'http://localhost:3000';

// // Données de test
// const mockTodos = [
//     {
//         id: 'test-uuid-1',
//         title: 'Test Todo 1',
//         description: 'Description du premier test',
//         project: 'TestProject',
//         tags: ['test', 'important'],
//         priority: 5,
//         due_date: '2025-12-31',
//         status: 'todo' as const,
//         created_at: '2025-07-25T10:00:00Z',
//         updated_at: '2025-07-25T10:00:00Z',
//     },
//     {
//         id: 'test-uuid-2',
//         title: 'Test Todo 2',
//         description: 'Description du deuxième test',
//         project: 'TestProject',
//         tags: ['test'],
//         priority: 3,
//         due_date: null,
//         status: 'in-progress' as const,
//         created_at: '2025-07-25T11:00:00Z',
//         updated_at: '2025-07-25T11:30:00Z',
//     },
// ];

// const newTodoData = {
//     // Don't have an ID, the backend server will give it one.
//     title: 'Nouveau Todo de Test',
//     description: 'Un nouveau todo créé pendant les tests',
//     project: 'TestProject',
//     tags: ['nouveau', 'test'],
//     priority: 7,
//     due_date: '2025-08-15',
//     status: 'todo' as const,
//     // Optional created_at, updated_at
// };

// describe('Todo API Tests', () => {
//     beforeEach(async () => {
//         // Sauvegarder les données de test avant chaque test
//         const testTodos = mockTodos.map((data) => new Todo(data));
//         await writeTodos(testTodos, TEST_DATA_PATH);
//     });

//     afterEach(async () => {
//         // Nettoyer les données de test après chaque test
//         const file = Bun.file(TEST_DATA_PATH);
//         if (await file.exists()) {
//             await Bun.write(TEST_DATA_PATH, JSON.stringify([], null, 2));
//         }
//     });

//     describe('GET /api/todos/get', () => {
//         test('devrait retourner la liste complète des todos', async () => {
//             console.log('Contenu réel du fichier juste avant le test :');
//             console.log(await readTodos(TEST_DATA_PATH));

//             const response = await fetch(`${BASE_URL}/api/todos/get`);

//             expect(response.status).toBe(200);
//             expect(response.headers.get('content-type')).toContain('application/json');

//             const todos = await response.json(); // We remind, than todos need to be a Todo[] parsed as json

//             expect(Array.isArray(todos)).toBe(true);
//             expect(todos.length).toBe(2);

//             // Vérifier la structure du premier todo
//             const firstTodo = todos[0];
//             expect(firstTodo).toHaveProperty('id');
//             expect(firstTodo).toHaveProperty('title');
//             expect(firstTodo).toHaveProperty('description');
//             expect(firstTodo).toHaveProperty('project');
//             expect(firstTodo).toHaveProperty('tags');
//             expect(firstTodo).toHaveProperty('priority');
//             expect(firstTodo).toHaveProperty('status');
//         });

//         test("devrait retourner un tableau vide si aucun todo n'existe", async () => {
//             // Vider le fichier de test
//             await writeTodos([], TEST_DATA_PATH);

//             const response = await fetch(`${BASE_URL}/api/todos/get`);

//             expect(response.status).toBe(200);
//             const todos = await response.json();
//             expect(Array.isArray(todos)).toBe(true);
//             expect(todos.length).toBe(0);
//         });
//     });

//     describe('POST /api/todos/add', () => {
//         test('devrait créer un nouveau todo avec succès', async () => {
//             const response = await fetch(`${BASE_URL}/api/todos/add`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(newTodoData),
//             });

//             expect(response.status).toBe(201);
//             expect(response.headers.get('content-type')).toContain('application/json');

//             const createdTodo = await response.json();

//             // Vérifier que le todo a été créé avec les bonnes données
//             expect(createdTodo.title).toBe(newTodoData.title);
//             expect(createdTodo.description).toBe(newTodoData.description);
//             expect(createdTodo.project).toBe(newTodoData.project);
//             expect(createdTodo.tags).toEqual(newTodoData.tags);
//             expect(createdTodo.priority).toBe(newTodoData.priority);
//             expect(createdTodo.status).toBe(newTodoData.status);

//             // Vérifier que l'ID et les timestamps ont été générés
//             expect(createdTodo.id).toBeDefined();
//             expect(typeof createdTodo.id).toBe('string');
//             expect(createdTodo.created_at).toBeDefined();
//             expect(createdTodo.updated_at).toBeDefined();

//             // Vérifier que le todo a bien été ajouté à la liste
//             const allTodos = await readTodos(TEST_DATA_PATH);
//             expect(allTodos.length).toBe(3); // 2 initiaux + 1 nouveau
//         });

//         test('devrait rejeter les données invalides', async () => {
//             const invalidTodoData = {
//                 title: '', // Titre vide
//                 description: 'Description valide',
//                 project: 'TestProject',
//                 tags: 'invalid-tags', // Devrait être un array
//                 priority: 'not-a-number', // Devrait être un number
//                 status: 'invalid-status', // Status invalide
//             };

//             const response = await fetch(`${BASE_URL}/api/todos/add`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(invalidTodoData),
//             });

//             expect(response.status).not.toBe(201);
//         });

//         test('devrait définir created_at et updated_at automatiquement', async () => {
//             const todoWithoutTimestamps = {
//                 ...newTodoData,
//                 // Pas de created_at ni updated_at
//             };

//             const response = await fetch(`${BASE_URL}/api/todos/add`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(todoWithoutTimestamps),
//             });

//             expect(response.status).toBe(201);
//             const createdTodo = await response.json();

//             expect(createdTodo.created_at).toBeDefined();
//             expect(createdTodo.updated_at).toBeDefined();
//             expect(new Date(createdTodo.created_at).getTime()).toBeCloseTo(
//                 new Date().getTime(),
//                 -2, // Tolérance de ~10ms
//             );
//         });
//     });

//     describe('POST /api/todos/replace', () => {
//         test('devrait remplacer complètement la liste des todos', async () => {
//             const replacementTodos = [
//                 {
//                     id: 'replacement-1',
//                     title: 'Todo de remplacement',
//                     description: 'Premier todo de remplacement',
//                     project: 'ReplacementProject',
//                     tags: ['replacement'],
//                     priority: 9,
//                     due_date: '2025-09-01',
//                     status: 'done' as const,
//                     created_at: '2025-07-25T15:00:00Z',
//                     updated_at: '2025-07-25T15:00:00Z',
//                 },
//             ];
//             const response = await fetch(`${BASE_URL}/api/todos/replace?path="${TEST_DATA_PATH}"`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(replacementTodos),
//             });

//             expect(response.status).toBe(201);

//             // Vérifier que la liste a été remplacée
//             const allTodos = await readTodos(TEST_DATA_PATH);
//             expect(allTodos.length).toBe(1);
//             expect(allTodos[0].title).toBe('Todo de remplacement');
//             expect(allTodos[0].project).toBe('ReplacementProject');
//         });

//         test('devrait pouvoir vider complètement la liste', async () => {
//             const response = await fetch(`${BASE_URL}/api/todos/replace?path="${TEST_DATA_PATH}"`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify([]),
//             });

//             expect(response.status).toBe(201);

//             const allTodos = await readTodos(TEST_DATA_PATH);
//             expect(allTodos.length).toBe(0);
//         });
//     });

//     describe('Endpoints inexistants', () => {
//         test('devrait retourner 405 pour les méthodes non supportées', async () => {
//             const response = await fetch(`${BASE_URL}/api/todos/get?path="${TEST_DATA_PATH}"`, {
//                 method: 'DELETE',
//             });

//             expect(response.status).toBe(405);
//             expect(await response.text()).toBe('Not Found or Method Not Allowed');
//         });

//         test('devrait retourner 405 pour les chemins inexistants', async () => {
//             const response = await fetch(`${BASE_URL}/api/todos/nonexistent`);

//             expect(response.status).toBe(405);
//             expect(await response.text()).toBe('Not Found or Method Not Allowed');
//         });
//     });

//     describe("Tests d'intégration", () => {
//         test('workflow complet: ajouter -> lire -> remplacer -> lire', async () => {
//             // 1. Ajouter un nouveau todo
//             const addResponse = await fetch(`${BASE_URL}/api/todos/add?path="${TEST_DATA_PATH}"`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(newTodoData),
//             });
//             expect(addResponse.status).toBe(201);
//             const addedTodo = await addResponse.json();

//             // 2. Lire tous les todos (devrait en avoir 3 maintenant)
//             const getAllResponse = await fetch(
//                 `${BASE_URL}/api/todos/get?path="${TEST_DATA_PATH}"`,
//             );
//             expect(getAllResponse.status).toBe(200);
//             const allTodos = await getAllResponse.json();
//             expect(allTodos.length).toBe(3);

//             // 3. Remplacer par une nouvelle liste
//             const newList = [addedTodo]; // Garder seulement le todo ajouté
//             const replaceResponse = await fetch(
//                 `${BASE_URL}/api/todos/replace?path="${TEST_DATA_PATH}"`,
//                 {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(newList),
//                 },
//             );
//             expect(replaceResponse.status).toBe(201);

//             // 4. Vérifier que la liste a bien été remplacée
//             const finalGetResponse = await fetch(
//                 `${BASE_URL}/api/todos/get?path="${TEST_DATA_PATH}"`,
//             );
//             expect(finalGetResponse.status).toBe(200);
//             const finalTodos = await finalGetResponse.json();
//             expect(finalTodos.length).toBe(1);
//             expect(finalTodos[0].id).toBe(addedTodo.id);
//         });
//     });

//     describe('Tests de validation des données', () => {
//         test('devrait accepter tous les statuts valides', async () => {
//             const validStatuses = ['todo', 'in-progress', 'done'];

//             for (const status of validStatuses) {
//                 const todoData = {
//                     ...newTodoData,
//                     status: status as any,
//                     title: `Test ${status}`,
//                 };

//                 const response = await fetch(`${BASE_URL}/api/todos/add?path="${TEST_DATA_PATH}"`, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(todoData),
//                 });

//                 expect(response.status).toBe(201);
//                 const createdTodo = await response.json();
//                 expect(createdTodo.status).toBe(status);
//             }
//         });

//         test('devrait accepter due_date null', async () => {
//             const todoWithNullDueDate = {
//                 ...newTodoData,
//                 due_date: null,
//             };

//             const response = await fetch(`${BASE_URL}/api/todos/add?path="${TEST_DATA_PATH}"`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(todoWithNullDueDate),
//             });

//             expect(response.status).toBe(201);
//             const createdTodo = await response.json();
//             expect(createdTodo.due_date).toBeNull();
//         });
//     });
// });
