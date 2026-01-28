export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const TODOS_KEY = 'void_todos';
const PIN_KEY = 'void_pin_hash';

export function getTodos(): Todo[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(TODOS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

export function addTodo(text: string): Todo[] {
  const todos = getTodos();
  const newTodo: Todo = {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  };
  const updated = [newTodo, ...todos];
  saveTodos(updated);
  return updated;
}

export function toggleTodo(id: string): Todo[] {
  const todos = getTodos();
  const updated = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos(updated);
  return updated;
}

export function deleteTodo(id: string): Todo[] {
  const todos = getTodos();
  const updated = todos.filter((todo) => todo.id !== id);
  saveTodos(updated);
  return updated;
}

export function clearCompleted(): Todo[] {
  const todos = getTodos();
  const updated = todos.filter((todo) => !todo.completed);
  saveTodos(updated);
  return updated;
}

export function getPinHash(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PIN_KEY);
}

export function savePinHash(hash: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PIN_KEY, hash);
}

export function hasPin(): boolean {
  return getPinHash() !== null;
}
