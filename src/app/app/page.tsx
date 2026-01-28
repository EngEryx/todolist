'use client';

import { useState } from 'react';
import PinGate from '@/components/PinGate';
import TodoList from '@/components/TodoList';

export default function AppPage() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <PinGate onSuccess={() => setAuthenticated(true)} />;
  }

  return <TodoList />;
}
