<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Todo, type TodoStatus } from '#shared/interfaces/Todo';

const name = ref('');
const description = ref('');
const project = ref('');
const priority = ref(5);
const dueDate = ref('');
const haveDueDate = ref(false);
const status = ref<TodoStatus>('todo');

const emit = defineEmits<{
    (e: 'todo-created', todo: Todo | null): void;
    (e: 'todo-updated', todo: Todo | null): void;
}>();

const props = defineProps({
    todoId: {
        type: String,
        required: false, // = peut être undefined
    },
});

async function getTodoFromId(): Promise<Todo | null> {
    try {
        if (props.todoId) {
            const response = await fetch('/api/todos/get');
            let todos = await response.json();
            const todoMap: Record<string, Todo> = Object.fromEntries(
                todos.map((todo: Todo) => [todo.id, todo]),
            );
            return todoMap[props.todoId] ?? null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des todos:', error);
        return null;
    }
}

function abandonTodo(): void {
    console.log('Emitting abandon signal');
    emit('todo-created', null);
}

function createTodo(): Todo {
    const todo = new Todo({
        title: name.value,
        description: description.value,
        project: project.value,
        tags: [],
        priority: priority.value,
        due_date: haveDueDate.value && dueDate.value ? new Date(dueDate.value).toISOString() : null,
        status: status.value,
    });

    if (props.todoId) {
        console.log('Todo updated:', todo);
        emit('todo-updated', todo);
        return todo;
    } else {
        console.log('Todo created:', todo);
        emit('todo-created', todo);
        return todo;
    }
}

onMounted(async () => {
    if (props.todoId) {
        const todo = await getTodoFromId();
        if (todo) {
            name.value = todo.title ?? '';
            description.value = todo.description ?? '';
            project.value = todo.project ?? '';
            priority.value = todo.priority ?? 5;
            status.value = todo.status ?? 'todo';
            if (todo.due_date) {
                haveDueDate.value = true;
                // Conversion ISO → format local for <input type="datetime-local">
                dueDate.value = new Date(todo.due_date).toISOString().slice(0, 16);
            }
        }
    }
});
</script>

<template>
    <div class="form-container">
        <h2>Définissez le Todo</h2>

        <label>
            Nom du Todo :
            <input v-model="name" type="text" />
        </label>

        <label>
            Description :
            <input v-model="description" type="text" />
        </label>

        <label>
            Projet lié :
            <input v-model="project" type="text" autocomplete="on" />
        </label>

        <label>
            Priorité :
            <input v-model.number="priority" type="number" min="0" max="10" />
        </label>

        <label>
            <input v-model="haveDueDate" type="checkbox" />
            Ajouter une date limite
        </label>

        <label v-if="haveDueDate">
            Date limite :
            <input v-model="dueDate" type="datetime-local" />
        </label>

        <label>
            Statut :
            <select v-model="status">
                <option value="todo">À faire</option>
                <option value="in-progress">En cours</option>
                <option value="done">Fait</option>
            </select>
        </label>

        <button class="addTodoButton" @click="createTodo">Ajouter le Todo</button>
        <button class="abandonTodo" @click="abandonTodo">Annuler</button>
    </div>
</template>

<style scoped>
label,
h2 {
    color: #333;
}

.form-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #fafafa;
    font-family: Arial, sans-serif;

    /* Fixing position to be of top of everything */
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.form-container h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 1rem;
    font-size: 1rem;
}

input,
select {
    display: block;
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}
input:focus,
select:focus {
    outline: none;
    border-color: #333;
    box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.9);
}

button.addTodoButton {
    margin-top: 1rem;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    background-color: #007acc;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button.addTodoButton:hover {
    background-color: #005fa3;
}

button.abandonTodo {
    margin: 1rem 2px;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    background-color: #cc0030;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button.abandonTodo:hover {
    background-color: #8d0031;
}
</style>
