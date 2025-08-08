<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import actionModal from '@/components/todo/actionModal.vue';
import { Todo, type TodoStatus } from '#shared/interfaces/Todo';

// État réactif
const todos = ref<Todo[]>([]);
const expandedTodos = ref(new Set());
const newTodo = reactive(Todo);
const actionModalOpen = ref(false);

// Méthodes utilitaires
const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatDueDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
};

// Actions
const toggleDetails = (todoId: string | undefined) => {
    if (expandedTodos.value.has(todoId)) {
        expandedTodos.value.delete(todoId);
    } else {
        expandedTodos.value.add(todoId);
    }
};

const addTodo = async (newTodo: Todo | null) => {
    if (newTodo == null) {
        console.log('Todo abandoned');
        return;
    }

    const newTodoData = newTodo.toJSON();

    const response = await fetch(`/api/todos/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            newTodoData: { ...newTodoData },
        }),
    });
    //console.log(response.body);

    fetchTodos();
};

const removeTodo = async (index: number) => {
    const todoId = todos.value[index].id;
    expandedTodos.value.delete(todoId);
    todos.value.splice(index, 1);

    const response = await fetch(`/api/todos/remove/${todoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    console.log(response.body);
};

const fetchTodos = async () => {
    try {
        const response = await fetch('/api/todos/get');
        todos.value = await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des todos:', error);
    }
};

// Lifecycle
onMounted(() => {
    fetchTodos();
});
</script>

<template>
    <div class="todo-app">
        <h1>Mark my todos</h1>
        <div class="todo-list">
            <div class="todo-input">
                <button @click="actionModalOpen = true">Ajouter</button>
                <button @click="fetchTodos()">Rafraîchir</button>
            </div>

            <div class="todos-container">
                <div v-for="(todo, index) in todos" :key="todo.id" class="todo-item">
                    <div class="todo-header" @click="toggleDetails(todo.id)">
                        <div class="todo-main">
                            <div class="todo-title">{{ todo.title }}</div>
                            <div class="todo-tags">
                                <span v-if="todo.project" class="project-badge">{{
                                    todo.project
                                }}</span>
                                <span :class="`status-badge status-${todo.status}`">
                                    {{ todo.status as TodoStatus }}
                                </span>
                                <span v-if="todo.priority" class="priority-badge">
                                    Priorité {{ todo.priority }}
                                </span>
                                <span v-for="tag in todo.tags" :key="tag" class="todo-tag">
                                    {{ tag }}
                                </span>
                            </div>
                        </div>

                        <div class="todo-actions">
                            <button class="delete-btn" @click.stop="removeTodo(index)">🗑️</button>
                        </div>
                    </div>

                    <Transition name="expand">
                        <div v-if="expandedTodos.has(todo.id)" class="todo-details">
                            <div class="detail-row">
                                <span class="detail-label">ID:</span>
                                <span class="detail-value">{{ todo.id }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Description:</span>
                                <span class="detail-value">{{
                                    todo.description || 'Aucune description'
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Projet:</span>
                                <span class="detail-value">{{
                                    todo.project || 'Aucun projet'
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Priorité:</span>
                                <span class="detail-value">{{
                                    todo.priority ? `${todo.priority}/10` : 'Non définie'
                                }}</span>
                            </div>
                            <div class="detail-row" v-if="todo.due_date">
                                <span class="detail-label">Échéance:</span>
                                <span class="detail-value date-value">{{
                                    formatDueDate(todo.due_date)
                                }}</span>
                            </div>
                            <div class="detail-row" v-else>
                                <span class="detail-label">Échéance:</span>
                                <span class="detail-value">Aucune échéance</span>
                            </div>

                            <div class="detail-row">
                                <span class="detail-label">Statut:</span>
                                <span class="detail-value">{{ todo.status as TodoStatus }}</span>
                            </div>
                            <div class="detail-row" v-if="todo.created_at">
                                <span class="detail-label">Créé le:</span>
                                <span class="detail-value date-value">{{
                                    formatDate(todo.created_at)
                                }}</span>
                            </div>
                            <div class="detail-row" v-if="todo.updated_at">
                                <span class="detail-label">Modifié le:</span>
                                <span class="detail-value date-value">{{
                                    formatDate(todo.updated_at)
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Tags:</span>
                                <span class="detail-value">{{ todo.tags.join(', ') }}</span>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>

        <actionModal
            v-if="actionModalOpen"
            @todo-created="
                (todo) => {
                    actionModalOpen = false;
                    addTodo(todo);
                }
            "
        />
    </div>
</template>

<style>
.todo-app {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    text-align: center;
}

.todo-input {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.todo-input input {
    width: 200px;
    padding: 10px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.todo-input button {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    margin: 2px 4px;
    cursor: pointer;
}

.todo-input button:hover {
    background: #0056b3;
}

.todo-item {
    background: white;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
}

.todo-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.todo-header {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.todo-main {
    flex: 1;
}

.todo-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
}

.todo-tags {
    color: #666;
    font-size: 14px;
}

.todo-tag {
    background: #e9ecef;
    padding: 2px 8px;
    border-radius: 12px;
    margin-right: 5px;
    display: inline-block;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    margin-right: 10px;
}

.status-todo {
    background: #fff3cd;
    color: #856404;
}
.status-in-progress {
    background: #d4edda;
    color: #155724;
}
.status-done {
    background: #f8d7da;
    color: #721c24;
}

.priority-badge {
    background: #dc3545;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    margin-right: 10px;
}

.todo-actions {
    display: flex;
    align-items: center;
}

.delete-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.delete-btn:hover {
    background: #c82333;
}

.todo-details {
    border-top: 1px solid #eee;
    padding: 15px;
    background: #f8f9fa;
}

.detail-row {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.detail-label {
    font-weight: bold;
    width: 120px;
    color: #666;
}

.detail-value {
    color: #333;
}

.project-badge {
    background: #6f42c1;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
}

.date-value {
    font-family: monospace;
    background: #e9ecef;
    padding: 2px 6px;
    border-radius: 4px;
}

.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
}

.expand-enter-to,
.expand-leave-from {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
}
</style>
