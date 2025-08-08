<script setup lang="ts">
import { ref } from 'vue';
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
}>();

function abandonTodo(): void {
    console.log('Emitting abandon signal');
    emit('todo-created', null);
}

function createTodo(): Todo {
    //const now = new Date(Date.now()).toISOString();

    const todo = new Todo({
        title: name.value,
        description: description.value,
        project: project.value,
        tags: [],
        priority: priority.value,
        due_date: haveDueDate.value && dueDate.value ? new Date(dueDate.value).toISOString() : null,
        status: status.value,
        //created_at: now,
        //updated_at: now,
    });

    console.log('Todo créé :', todo);
    emit('todo-created', todo);
    return todo; // Doesn't not be used, it only here to calm TS compiler
}
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
            <input v-model="project" type="text" />
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
    max-width: 500px;
    margin: 2rem auto;
    padding: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #fafafa;
    font-family: Arial, sans-serif;
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
