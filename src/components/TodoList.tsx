'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Todo,
  getTodos,
  saveTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
} from '@/lib/storage';
import { p2pSync, ConnectionStatus, SyncMessage } from '@/lib/peer';
import ThemeToggle from './ThemeToggle';
import P2PShare from './P2PShare';

type Filter = 'all' | 'active' | 'completed';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [mounted, setMounted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle incoming P2P messages
  const handleP2PMessage = useCallback((message: SyncMessage) => {
    switch (message.type) {
      case 'sync':
        // Merge todos: combine both lists, prefer newer by createdAt
        setTodos((currentTodos) => {
          const merged = new Map<string, Todo>();

          // Add current todos
          currentTodos.forEach((t) => merged.set(t.id, t));

          // Merge incoming todos
          message.todos.forEach((t) => {
            const existing = merged.get(t.id);
            if (!existing || t.createdAt > existing.createdAt) {
              merged.set(t.id, t);
            }
          });

          const newTodos = Array.from(merged.values()).sort(
            (a, b) => b.createdAt - a.createdAt
          );
          saveTodos(newTodos);
          return newTodos;
        });
        break;

      case 'add':
        setTodos((currentTodos) => {
          if (currentTodos.some((t) => t.id === message.todo.id)) {
            return currentTodos;
          }
          const newTodos = [message.todo, ...currentTodos];
          saveTodos(newTodos);
          return newTodos;
        });
        break;

      case 'toggle':
        setTodos((currentTodos) => {
          const newTodos = currentTodos.map((t) =>
            t.id === message.id ? { ...t, completed: message.completed } : t
          );
          saveTodos(newTodos);
          return newTodos;
        });
        break;

      case 'delete':
        setTodos((currentTodos) => {
          const newTodos = currentTodos.filter((t) => t.id !== message.id);
          saveTodos(newTodos);
          return newTodos;
        });
        break;

      case 'clear-completed':
        setTodos((currentTodos) => {
          const newTodos = currentTodos.filter((t) => !t.completed);
          saveTodos(newTodos);
          return newTodos;
        });
        break;
    }
  }, []);

  useEffect(() => {
    setTodos(getTodos());
    setMounted(true);

    // Set up P2P handlers
    p2pSync.setMessageHandler(handleP2PMessage);
    p2pSync.setStatusHandler((status) => {
      setConnectionStatus(status);

      // When connected, sync todos
      if (status === 'connected') {
        const currentTodos = getTodos();
        p2pSync.sendTodos(currentTodos);
      }
    });

    return () => {
      p2pSync.disconnect();
    };
  }, [handleP2PMessage]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newTodos = addTodo(input);
    setTodos(newTodos);

    // Sync new todo
    const addedTodo = newTodos[0];
    p2pSync.sendAdd(addedTodo);

    setInput('');
    inputRef.current?.focus();
  };

  const handleToggle = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    setTodos(toggleTodo(id));
    p2pSync.sendToggle(id, !todo.completed);
  };

  const handleDelete = (id: string) => {
    setTodos(deleteTodo(id));
    p2pSync.sendDelete(id);
  };

  const handleClearCompleted = () => {
    setTodos(clearCompleted());
    p2pSync.sendClearCompleted();
  };

  const handleCreateRoom = async () => {
    const code = await p2pSync.createRoom();
    setRoomCode(code);
    setIsHost(true);
    return code;
  };

  const handleJoinRoom = async (code: string) => {
    await p2pSync.joinRoom(code);
    setRoomCode(code);
    setIsHost(false);
  };

  const handleDisconnect = () => {
    p2pSync.disconnect();
    setRoomCode(null);
    setIsHost(false);
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

  const statusColors: Record<ConnectionStatus, string> = {
    disconnected: 'bg-gray-400',
    connecting: 'bg-yellow-400 animate-pulse',
    connected: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-light tracking-tight">void</h1>
              {roomCode && (
                <div className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]}`} title={connectionStatus} />
              )}
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {activeCount === 0
                ? 'All clear'
                : `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowShare(true)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
              title="Share list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {connectionStatus === 'connected' && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              )}
            </button>
            <ThemeToggle />
          </div>
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

      <P2PShare
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onDisconnect={handleDisconnect}
        connectionStatus={connectionStatus}
        roomCode={roomCode}
        isHost={isHost}
      />
    </div>
  );
}
