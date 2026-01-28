'use client';

import { useState } from 'react';
import { ConnectionStatus } from '@/lib/peer';

interface P2PShareProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: () => Promise<string>;
  onJoinRoom: (code: string) => Promise<void>;
  onDisconnect: () => void;
  connectionStatus: ConnectionStatus;
  roomCode: string | null;
  isHost: boolean;
}

export default function P2PShare({
  isOpen,
  onClose,
  onCreateRoom,
  onJoinRoom,
  onDisconnect,
  connectionStatus,
  roomCode,
  isHost,
}: P2PShareProps) {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    try {
      await onCreateRoom();
    } catch {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (joinCode.length !== 6) {
      setError('Code must be 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onJoinRoom(joinCode.toUpperCase());
    } catch {
      setError('Failed to join room. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (roomCode) {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusColors: Record<ConnectionStatus, string> = {
    disconnected: 'bg-gray-400',
    connecting: 'bg-yellow-400 animate-pulse',
    connected: 'bg-green-500',
    error: 'bg-red-500',
  };

  const statusText: Record<ConnectionStatus, string> = {
    disconnected: 'Waiting for peer',
    connecting: 'Connecting...',
    connected: 'Connected',
    error: 'Connection error',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-background border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-xl font-medium mb-1">Share List</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Sync todos in real-time with another device
        </p>

        {/* Connected State */}
        {roomCode && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {statusText[connectionStatus]}
              </span>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg mb-4">
              <span className="text-2xl font-mono tracking-widest flex-1 text-center">
                {roomCode}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
              {isHost
                ? 'Share this code with your peer'
                : 'Connected to shared list'}
            </p>

            <button
              onClick={onDisconnect}
              className="w-full py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Not Connected State */}
        {!roomCode && (
          <>
            {/* Create Room */}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full btn-primary mb-4 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            </div>

            {/* Join Room */}
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="Enter code"
                className="input-field flex-1 font-mono text-center tracking-widest uppercase"
                maxLength={6}
              />
              <button
                onClick={handleJoin}
                disabled={loading || joinCode.length !== 6}
                className="btn-secondary disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Info */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400 text-center">
            Direct peer-to-peer connection. Your data never touches a server.
          </p>
        </div>
      </div>
    </div>
  );
}
