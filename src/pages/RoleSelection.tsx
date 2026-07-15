import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleAlert, Receipt } from 'lucide-react';
import { loadDemoData, resetDemoData } from '../db/seedData.ts';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

const OrderIcon3D = () => (
  <svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="ord-dome-g" x1="0.2" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#eff6ff" />
        <stop offset="100%" stopColor="#bfdbfe" />
      </linearGradient>
      <linearGradient id="ord-plate-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#dbeafe" />
        <stop offset="100%" stopColor="#93c5fd" />
      </linearGradient>
      <linearGradient id="ord-handle-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <filter id="ord-drop" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1e40af" floodOpacity="0.22" />
      </filter>
    </defs>
    <ellipse cx="40" cy="66" rx="22" ry="4" fill="#1e40af" opacity="0.1" />
    <ellipse cx="40" cy="61" rx="22" ry="6.5" fill="url(#ord-plate-g)" filter="url(#ord-drop)" />
    <ellipse cx="40" cy="59.5" rx="18" ry="4.5" fill="white" opacity="0.35" />
    <path d="M18 59 C18 36 26 21 40 19 C54 21 62 36 62 59 Z" fill="url(#ord-dome-g)" filter="url(#ord-drop)" />
    <path d="M51 59 C51 38 56 26 62 24 L62 59 Z" fill="#93c5fd" opacity="0.22" />
    <path d="M24 52 Q25 32 34 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65" />
    <rect x="37.5" y="13" width="5" height="7" rx="2.5" fill="url(#ord-handle-g)" />
    <ellipse cx="40" cy="13" rx="5.5" ry="2.5" fill="#60a5fa" />
    <path d="M30 17 Q28 12 30 7" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
    <path d="M40 14 Q38 9 40 5" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
    <path d="M50 17 Q52 12 50 7" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
  </svg>
);

const KitchenIcon3D = () => (
  <svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="kit-hat-g" x1="0.25" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#f9fafb" />
        <stop offset="100%" stopColor="#e5e7eb" />
      </linearGradient>
      <linearGradient id="kit-band-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
      <linearGradient id="kit-flame-g" x1="0.3" y1="1" x2="0.7" y2="0">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.75" />
      </linearGradient>
      <filter id="kit-drop" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#78350f" floodOpacity="0.18" />
      </filter>
      <filter id="kit-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <ellipse cx="40" cy="67" rx="22" ry="4" fill="#78350f" opacity="0.1" />
    <rect x="14" y="53" width="52" height="11" rx="5.5" fill="url(#kit-band-g)" filter="url(#kit-drop)" />
    <rect x="17" y="55" width="46" height="6" rx="3" fill="#fde68a" opacity="0.45" />
    <path d="M21 53 C19 31 27 17 40 15 C53 17 61 31 59 53 Z" fill="url(#kit-hat-g)" filter="url(#kit-drop)" />
    <ellipse cx="40" cy="19" rx="17" ry="11" fill="white" opacity="0.88" />
    <path d="M26 36 Q28 22 36 18" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
    <path d="M52 53 C52 32 57 22 59 20 L59 53 Z" fill="#d1d5db" opacity="0.3" />
    <path d="M34 70 Q30 61 35 56 Q34 64 39 61 Q35 55 40 49 Q46 56 43 62 Q48 59 46 68 Q43 73 40 71 Q37 72 34 70 Z" fill="url(#kit-flame-g)" filter="url(#kit-glow)" />
    <path d="M38 68 Q36 63 38 60 Q39.5 63 41.5 61 Q40.5 65 40 68 Z" fill="#fef3c7" opacity="0.85" />
  </svg>
);

const PaymentIcon3D = () => (
  <svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="pay-back-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="pay-front-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#065f46" />
      </linearGradient>
      <linearGradient id="pay-chip-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef9c3" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
      <filter id="pay-drop" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#064e3b" floodOpacity="0.28" />
      </filter>
    </defs>
    <ellipse cx="40" cy="68" rx="26" ry="4.5" fill="#064e3b" opacity="0.1" />
    <g transform="rotate(8, 40, 44)" filter="url(#pay-drop)">
      <rect x="14" y="24" width="52" height="34" rx="7" fill="url(#pay-back-g)" opacity="0.85" />
      <rect x="14" y="36" width="52" height="10" fill="#047857" opacity="0.4" />
    </g>
    <rect x="10" y="30" width="54" height="35" rx="7" fill="url(#pay-front-g)" filter="url(#pay-drop)" />
    <rect x="10" y="41" width="54" height="10" fill="#059669" opacity="0.45" />
    <rect x="18" y="34" width="15" height="11" rx="2.5" fill="url(#pay-chip-g)" />
    <line x1="18" y1="38" x2="33" y2="38" stroke="#d97706" strokeWidth="0.8" opacity="0.5" />
    <line x1="18" y1="41" x2="33" y2="41" stroke="#d97706" strokeWidth="0.8" opacity="0.5" />
    <line x1="23" y1="34" x2="23" y2="45" stroke="#d97706" strokeWidth="0.8" opacity="0.5" />
    <line x1="28" y1="34" x2="28" y2="45" stroke="#d97706" strokeWidth="0.8" opacity="0.5" />
    <path d="M43 34 Q49 39.5 43 45" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
    <path d="M47 31 Q56 39.5 47 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
    <rect x="14" y="54" width="8" height="4" rx="2" fill="white" opacity="0.4" />
    <rect x="26" y="54" width="8" height="4" rx="2" fill="white" opacity="0.4" />
    <rect x="38" y="54" width="8" height="4" rx="2" fill="white" opacity="0.4" />
    <rect x="50" y="54" width="8" height="4" rx="2" fill="white" opacity="0.4" />
  </svg>
);

const AdminIcon3D = () => (
  <svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="adm-screen-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f5f3ff" />
        <stop offset="100%" stopColor="#ede9fe" />
      </linearGradient>
      <linearGradient id="adm-bar1-g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
      <linearGradient id="adm-bar2-g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#6d28d9" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <linearGradient id="adm-bar3-g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#5b21b6" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <filter id="adm-drop" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4c1d95" floodOpacity="0.2" />
      </filter>
    </defs>
    <ellipse cx="40" cy="68" rx="20" ry="4" fill="#4c1d95" opacity="0.12" />
    <rect x="8" y="10" width="64" height="46" rx="7" fill="url(#adm-screen-g)" filter="url(#adm-drop)" />
    <rect x="8" y="10" width="64" height="46" rx="7" fill="none" stroke="#c4b5fd" strokeWidth="1.5" />
    <rect x="13" y="15" width="54" height="36" rx="3" fill="#1e1b4b" />
    <line x1="13" y1="35" x2="67" y2="35" stroke="#2e2859" strokeWidth="0.7" />
    <line x1="13" y1="25" x2="67" y2="25" stroke="#2e2859" strokeWidth="0.7" />
    <line x1="13" y1="45" x2="67" y2="45" stroke="#2e2859" strokeWidth="0.7" />
    <rect x="19" y="33" width="9" height="16" rx="2" fill="url(#adm-bar1-g)" />
    <rect x="19" y="33" width="9" height="3" rx="1" fill="white" opacity="0.3" />
    <rect x="32" y="21" width="9" height="28" rx="2" fill="url(#adm-bar2-g)" />
    <rect x="32" y="21" width="9" height="3" rx="1" fill="white" opacity="0.3" />
    <rect x="45" y="26" width="9" height="23" rx="2" fill="url(#adm-bar3-g)" />
    <rect x="45" y="26" width="9" height="3" rx="1" fill="white" opacity="0.3" />
    <polyline points="23,37 36,25 49,30 61,20" stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="23" cy="37" r="2" fill="#a78bfa" />
    <circle cx="36" cy="25" r="2" fill="#a78bfa" />
    <circle cx="49" cy="30" r="2" fill="#a78bfa" />
    <circle cx="61" cy="20" r="2" fill="#a78bfa" />
    <rect x="36" y="56" width="8" height="7" rx="2" fill="#c4b5fd" />
    <rect x="28" y="62" width="24" height="4.5" rx="2.5" fill="#ddd6fe" filter="url(#adm-drop)" />
    <ellipse cx="40" cy="66.5" rx="12" ry="2.5" fill="#c4b5fd" opacity="0.3" />
  </svg>
);

type Language = 'en' | 'hi';
type RoleKey = 'waiter' | 'kitchen' | 'cashier' | 'admin';
type PendingAction = 'load' | 'reset' | null;

interface RoleCard {
  key: RoleKey;
  icon: ReactNode;
  path: string;
}

const roles: RoleCard[] = [
  { key: 'waiter', icon: <OrderIcon3D />, path: '/waiter/tables' },
  { key: 'kitchen', icon: <KitchenIcon3D />, path: '/kitchen' },
  { key: 'cashier', icon: <PaymentIcon3D />, path: '/cashier' },
  { key: 'admin', icon: <AdminIcon3D />, path: '/admin/menu' },
];

const languageStorageKey = 'restaurant-pwa-language';
const footerIconStyle = { display: 'inline', marginRight: '6px', verticalAlign: '-2px' } as const;

const copy = {
  en: {
    languageLabel: 'Language',
    languageDisabledHint: 'Language selection is unavailable while demo data is updating.',
    title: 'Restaurant POS',
    subtitle: 'Premium command center for service, kitchen, and billing workflows',
    onlineStatus: 'Live sync available',
    offlineStatus: 'Offline mode active',
    roles: {
      waiter: { title: 'Order', description: 'Take orders and serve tables' },
      kitchen: { title: 'Kitchen', description: 'Food Order Status' },
      cashier: { title: 'Payment', description: 'Billing and Payment' },
      admin: { title: 'Admin', description: 'Manage Settings' },
    },
    footer: 'Demo mode: no authentication enabled.',
    loadDemo: 'Load Demo Data',
    loadingDemo: 'Loading...',
    resetDemo: 'Reset Demo Data',
    resettingDemo: 'Resetting...',
    loadDemoConfirm: 'Load demo data? This will replace all existing data.',
    loadDemoSuccess: 'Demo data loaded successfully!',
    loadDemoError: 'Failed to load demo data: ',
    resetDemoConfirm: 'Reset all data? This will delete everything.',
    resetDemoSuccess: 'All data has been reset.',
    resetDemoError: 'Failed to reset data: ',
  },
  hi: {
    languageLabel: 'भाषा चुनें',
    languageDisabledHint: 'डेमो डेटा अपडेट होने के दौरान भाषा नहीं बदली जा सकती।',
    title: 'रेस्टोरेंट POS',
    subtitle: 'सेवा, रसोई और बिलिंग वर्कफ़्लो के लिए प्रीमियम कमांड सेंटर',
    onlineStatus: 'लाइव सिंक उपलब्ध है',
    offlineStatus: 'ऑफलाइन मोड सक्रिय है',
    roles: {
      waiter: { title: 'ऑर्डर', description: 'ऑर्डर और टेबल सर्विस' },
      kitchen: { title: 'किचन', description: 'भोजन के ऑर्डर की स्थिति देखे' },
      cashier: { title: 'पेमेंट', description: 'बिलिंग और पेमेंट' },
      admin: { title: 'एडमिन', description: 'सेटिंग मैनेज करे' },
    },
    footer: 'डेमो मोड: ऑथेंटिकेशन सक्षम नहीं है।',
    loadDemo: 'डेमो डेटा लोड करें',
    loadingDemo: 'लोड हो रहा है...',
    resetDemo: 'डेमो डेटा रीसेट करें',
    resettingDemo: 'रीसेट हो रहा है...',
    loadDemoConfirm: 'डेमो डेटा लोड करें? इससे मौजूदा सारा डेटा बदल जाएगा।',
    loadDemoSuccess: 'डेमो डेटा सफलतापूर्वक लोड हो गया!',
    loadDemoError: 'डेमो डेटा लोड नहीं हो सका: ',
    resetDemoConfirm: 'सारा डेटा रीसेट करें? इससे सब कुछ हट जाएगा।',
    resetDemoSuccess: 'सारा डेटा रीसेट कर दिया गया है।',
    resetDemoError: 'डेटा रीसेट नहीं हो सका: ',
  },
} satisfies Record<Language, {
  languageLabel: string;
  languageDisabledHint: string;
  title: string;
  subtitle: string;
  onlineStatus: string;
  offlineStatus: string;
  roles: Record<RoleKey, { title: string; description: string }>;
  footer: string;
  loadDemo: string;
  loadingDemo: string;
  resetDemo: string;
  resettingDemo: string;
  loadDemoConfirm: string;
  loadDemoSuccess: string;
  loadDemoError: string;
  resetDemoConfirm: string;
  resetDemoSuccess: string;
  resetDemoError: string;
}>;

export default function RoleSelection() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [language, setLanguage] = useState<Language>(
    () => (window.localStorage.getItem(languageStorageKey) === 'hi' ? 'hi' : 'en')
  );
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const text = copy[language];
  const isBusy = pendingAction !== null;

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem(languageStorageKey, nextLanguage);
  };

  const handleLoadDemo = async () => {
    if (isBusy) return;
    if (!window.confirm(text.loadDemoConfirm)) return;
    setPendingAction('load');
    try {
      await loadDemoData();
      alert(text.loadDemoSuccess);
    } catch (err) {
      alert(text.loadDemoError + (err instanceof Error ? err.message : String(err)));
    } finally {
      setPendingAction(null);
    }
  };

  const handleResetDemo = async () => {
    if (isBusy) return;
    if (!window.confirm(text.resetDemoConfirm)) return;
    setPendingAction('reset');
    try {
      await resetDemoData();
      alert(text.resetDemoSuccess);
    } catch (err) {
      alert(text.resetDemoError + (err instanceof Error ? err.message : String(err)));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="page-container">
      <div className="role-hero">
        <div className="role-logo"><Receipt size={28} /></div>
        <h1 className="page-title">{text.title}</h1>
        {text.subtitle && <p className="page-subtitle">{text.subtitle}</p>}
        <div className="role-language-selector">
          <label htmlFor="language-select" className="role-language-label">
            {text.languageLabel}
          </label>
          <select
            id="language-select"
            value={language}
            aria-label={text.languageLabel}
            aria-describedby={isBusy ? 'language-selector-help' : undefined}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            disabled={isBusy}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
          {isBusy && (
            <p id="language-selector-help" className="sr-only">
              {text.languageDisabledHint}
            </p>
          )}
        </div>
        <p className="role-status-text">
          <span className={isOnline ? 'online-indicator' : 'offline-indicator'}>
            {isOnline ? text.onlineStatus : text.offlineStatus}
          </span>
        </p>
      </div>

      <div className="role-grid">
        {roles.map((r) => (
          <motion.div
            key={r.key}
            className={`card role-card role-card--${r.key}`}
            onClick={() => navigate(r.path)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(r.path)}
          >
            <div className="role-icon">{r.icon}</div>
            <h2>{text.roles[r.key].title}</h2>
            <p className="page-subtitle">{text.roles[r.key].description}</p>
          </motion.div>
        ))}
      </div>

      <p className="role-footer">
        <CircleAlert size={16} style={footerIconStyle} />
        {text.footer}
      </p>

      <div className="role-actions">
        <button className="btn btn-primary" onClick={handleLoadDemo} disabled={isBusy}>
          {pendingAction === 'load' ? text.loadingDemo : text.loadDemo}
        </button>
        <button className="btn btn-secondary" onClick={handleResetDemo} disabled={isBusy}>
          {pendingAction === 'reset' ? text.resettingDemo : text.resetDemo}
        </button>
      </div>
    </div>
  );
}
