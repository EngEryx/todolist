'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Todo,
  getTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
} from '@/lib/storage';
import ThemeToggle from './ThemeToggle';

type Filter = 'all' | 'active' | 'completed';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTodos(getTodos());
    setMounted(true);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos(addTodo(input));
    setInput('');
    inputRef.current?.focus();
  };

  const handleToggle = (id: string) => {
    setTodos(toggleTodo(id));
  };

  const handleDelete = (id: string) => {
    setTodos(deleteTodo(id));
  };

  const handleClearCompleted = () => {
    setTodos(clearCompleted());
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight">void</h1>
            <p className="text-gray-400 text-sm mt-1">
              {activeCount === 0
                ? 'All clear'
                : `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <form onSubmit={handleAdd} className="mb-6">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a task..."
              className="input-field flex-1"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn-primary"
            >
              Add
            </button>
          </div>
        </form>

        {todos.length > 0 && (
          <div className="flex gap-2 mb-6 text-sm">
            {(['all', 'active', 'completed'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                  filter === f
                    ? 'bg-foreground text-background'
                    : 'text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <ul className="space-y-2">
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className="group flex items-center gap-3 p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
                className="todo-checkbox"
              />
              <span
                className={`flex-1 transition-colors ${
                  todo.completed ? 'line-through text-gray-400' : ''
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-foreground transition-all p-1"
                aria-label="Delete task"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {filteredTodos.length === 0 && todos.length > 0 && (
          <p className="text-center text-gray-400 py-12">
            No {filter} tasks
          </p>
        )}

        {todos.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-300 dark:text-gray-700 text-6xl mb-4">+</div>
            <p className="text-gray-400">Add your first task above</p>
          </div>
        )}

        {completedCount > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleClearCompleted}
              className="text-sm text-gray-400 hover:text-foreground transition-colors"
            >
              Clear {completedCount} completed task{completedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
