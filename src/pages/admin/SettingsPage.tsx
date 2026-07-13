import { useState, useEffect } from 'react';
import { loadDemoData, resetDemoData } from '../../db/seedData.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';

export default function SettingsPage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { t } = useLanguage();

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
    if (!window.confirm(t.settingsPage.confirmLoad)) return;
    setLoadingDemo(true);
    try {
      await loadDemoData();
      alert(t.settingsPage.loadSuccess);
    } catch (err) {
      alert(t.settingsPage.loadError(err instanceof Error ? err.message : String(err)));
    }
    setLoadingDemo(false);
  };

  const handleReset = async () => {
    if (!window.confirm(t.settingsPage.confirmReset1)) return;
    if (!window.confirm(t.settingsPage.confirmReset2)) return;
    setResetting(true);
    try {
      await resetDemoData();
      alert(t.settingsPage.resetSuccess);
    } catch (err) {
      alert(t.settingsPage.resetError(err instanceof Error ? err.message : String(err)));
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
      <h1 className="text-2xl font-bold mb-6">{t.settingsPage.title}</h1>

      {/* Status */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">{t.settingsPage.statusSection}</h2>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span>{isOnline ? t.settingsPage.onlineText : t.settingsPage.offlineText}</span>
        </div>
        <p className="text-sm text-gray-600">
          {t.settingsPage.appVersion}
        </p>
      </div>

      {/* PWA Install */}
      {deferredPrompt && (
        <div className="border rounded-lg p-4 mb-4 bg-blue-50">
          <h2 className="font-bold text-lg mb-2">{t.settingsPage.installSection}</h2>
          <p className="text-sm text-gray-600 mb-3">
            {t.settingsPage.installDesc}
          </p>
          <button
            onClick={handleInstall}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {t.settingsPage.installBtn}
          </button>
        </div>
      )}

      {/* Demo Data */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">{t.settingsPage.demoSection}</h2>
        <p className="text-sm text-gray-600 mb-3">
          {t.settingsPage.demoDesc}
        </p>
        <button
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loadingDemo ? t.settingsPage.loadingDemoBtn : t.settingsPage.loadDemoBtn}
        </button>
      </div>

      {/* Reset */}
      <div className="border rounded-lg p-4 mb-4 border-red-300 bg-red-50">
        <h2 className="font-bold text-lg mb-2 text-red-700">{t.settingsPage.dangerSection}</h2>
        <p className="text-sm text-red-600 mb-3">
          {t.settingsPage.dangerDesc}
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {resetting ? t.settingsPage.resettingBtn : t.settingsPage.resetBtn}
        </button>
      </div>

      {/* Storage Info */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">{t.settingsPage.storageSection}</h2>
        <p className="text-sm text-gray-600">
          {t.settingsPage.storageDesc}
        </p>
      </div>

      {/* Warning */}
      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-300">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> {t.settingsPage.warningNote}
        </p>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}
