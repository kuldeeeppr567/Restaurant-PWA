import { useState, useEffect } from 'react';
import { loadDemoData, resetDemoData } from '../../db/seedData.ts';

export default function SettingsPage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleLoadDemo = async () => {
    if (!window.confirm('This will replace ALL existing data with demo data. Continue?')) return;
    setLoadingDemo(true);
    try {
      await loadDemoData();
      alert('Demo data loaded successfully!');
    } catch (err) {
      alert('Failed to load demo data: ' + (err instanceof Error ? err.message : String(err)));
    }
    setLoadingDemo(false);
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'WARNING: This will permanently delete ALL data (menu items, tables, orders, payments). This cannot be undone. Are you sure?'
      )
    )
      return;
    if (!window.confirm('Are you REALLY sure? All data will be lost.')) return;
    setResetting(true);
    try {
      await resetDemoData();
      alert('All data has been reset.');
    } catch (err) {
      alert('Failed to reset data: ' + (err instanceof Error ? err.message : String(err)));
    }
    setResetting(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Status */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">Status</h2>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <p className="text-sm text-gray-600">
          App Version: 1.0.0
        </p>
      </div>

      {/* PWA Install */}
      {deferredPrompt && (
        <div className="border rounded-lg p-4 mb-4 bg-blue-50">
          <h2 className="font-bold text-lg mb-2">Install App</h2>
          <p className="text-sm text-gray-600 mb-3">
            Install this app on your device for the best experience.
          </p>
          <button
            onClick={handleInstall}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Install PWA
          </button>
        </div>
      )}

      {/* Demo Data */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">Demo Data</h2>
        <p className="text-sm text-gray-600 mb-3">
          Load sample menu items, tables, orders, and payment history. This will replace all
          existing data.
        </p>
        <button
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loadingDemo ? 'Loading...' : 'Load Demo Data'}
        </button>
      </div>

      {/* Reset */}
      <div className="border rounded-lg p-4 mb-4 border-red-300 bg-red-50">
        <h2 className="font-bold text-lg mb-2 text-red-700">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-3">
          Permanently delete all data including menu items, tables, sessions, orders, and payments.
          This action cannot be undone.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {resetting ? 'Resetting...' : 'Reset All Data'}
        </button>
      </div>

      {/* Storage Info */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">Storage</h2>
        <p className="text-sm text-gray-600">
          All data is stored locally in your browser using IndexedDB. Data is not synced to any
          server. Clearing browser data will erase all restaurant data.
        </p>
      </div>

      {/* Warning */}
      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-300">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a local-only PWA. All data lives in this browser on this
          device. There is no cloud backup or sync.
        </p>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}
