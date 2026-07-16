import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadDemoData, resetDemoData } from '../db/seedData.ts';

const OrderIcon3D = () => (
  <svg viewBox="0 0 80 80" width="100" height="100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="ord-glass-g" cx="38%" cy="32%" r="68%" gradientUnits="userSpaceOnUse" fx="30" fy="26">
        <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.88" />
      </radialGradient>
      <filter id="ord-sh" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#1e40af" floodOpacity="0.45" />
      </filter>
    </defs>
    {/* Glass disc */}
    <circle cx="40" cy="40" r="33" fill="url(#ord-glass-g)" filter="url(#ord-sh)" />
    {/* Outer ring */}
    <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
    {/* Top glass sheen */}
    <ellipse cx="38" cy="27" rx="19" ry="9.5" fill="rgba(255,255,255,0.28)" />
    {/* Fork — 3 prongs */}
    <line x1="29" y1="22" x2="29" y2="57" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="25" y1="22" x2="25" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="33" y1="22" x2="33" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M25 31 Q27 37 29 37 Q31 37 33 31" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Knife */}
    <line x1="51" y1="22" x2="51" y2="57" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
    <path d="M51 22 C57 23 58 31 51 38" fill="rgba(255,255,255,0.75)" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
  </svg>
);

const KitchenIcon3D = () => (
  <svg viewBox="0 0 80 80" width="100" height="100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="kit-glass-g" cx="38%" cy="32%" r="68%" gradientUnits="userSpaceOnUse" fx="30" fy="26">
        <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
      </radialGradient>
      <filter id="kit-sh" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#92400e" floodOpacity="0.45" />
      </filter>
    </defs>
    {/* Glass disc */}
    <circle cx="40" cy="40" r="33" fill="url(#kit-glass-g)" filter="url(#kit-sh)" />
    {/* Outer ring */}
    <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
    {/* Top glass sheen */}
    <ellipse cx="38" cy="27" rx="19" ry="9.5" fill="rgba(255,255,255,0.28)" />
    {/* Chef hat dome */}
    <path d="M25 45 C22 37 24 26 32 22 C35 20 36 18 40 18 C44 18 45 20 48 22 C56 26 58 37 55 45 Z"
          fill="rgba(255,255,255,0.92)" />
    {/* Hat dome inner highlight */}
    <path d="M29 43 C27 36 29 27 35 24 C37 22.5 38 21.5 40 21.5 C41 21.5 43 22 45 24"
          fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
    {/* Hat brim */}
    <rect x="22" y="44" width="36" height="7" rx="3.5" fill="rgba(255,255,255,0.92)" />
    {/* Steam lines */}
    <path d="M33 54 Q31.5 58 33 61" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M40 54 Q38.5 58 40 61" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M47 54 Q45.5 58 47 61" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

const PaymentIcon3D = () => (
  <svg viewBox="0 0 80 80" width="100" height="100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
  <svg viewBox="0 0 80 80" width="100" height="100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
const NAVIGATION_ANIMATION_DELAY_MS = 280;
const PARTICLE_TRAVEL_DISTANCE = 58;

const roleIconWrapperStyle = {
  position: 'relative' as const,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const roleGlow: Record<RoleKey, string> = {
  waiter: '37, 99, 235',
  kitchen: '217, 119, 6',
  cashier: '5, 150, 105',
  admin: '124, 58, 237',
};

const particleAngles = [0, 60, 120, 180, 240, 300];

const copy = {
  en: {
    languageLabel: 'Language',
    languageDisabledHint: 'Language selection is unavailable while demo data is updating.',
    title: 'Order Management App',
    subtitle: 'Command Centre',
    roles: {
      waiter: { title: 'Order', description: 'Take orders and serve tables' },
      kitchen: { title: 'Kitchen', description: 'Food Order Status' },
      cashier: { title: 'Payment', description: 'Billing and Payment' },
      admin: { title: 'Admin', description: 'Manage Settings' },
    },
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
    title: 'ऑर्डर मैनेजमेंट ऐप',
    subtitle: 'कमांड सेंटर',
    roles: {
      waiter: { title: 'ऑर्डर', description: 'ऑर्डर और टेबल सर्विस' },
      kitchen: { title: 'किचन', description: 'भोजन तैयारी की सूचना देखें' },
      cashier: { title: 'पेमेंट', description: 'बिलिंग और पेमेंट' },
      admin: { title: 'एडमिन', description: 'सेटिंग मैनेज करें' },
    },
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
  roles: Record<RoleKey, { title: string; description: string }>;
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
  const [language, setLanguage] = useState<Language>(
    () => (window.localStorage.getItem(languageStorageKey) === 'hi' ? 'hi' : 'en')
  );
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [tappedRole, setTappedRole] = useState<RoleKey | null>(null);
  const text = copy[language];
  const isBusy = pendingAction !== null;

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem(languageStorageKey, nextLanguage);
  };

  const handleRoleClick = (r: RoleCard) => {
    setTappedRole(r.key);
    setTimeout(() => navigate(r.path), NAVIGATION_ANIMATION_DELAY_MS);
  };

  const handleLoadDemo = async () => {
    if (isBusy) return;
    if (!window.confirm(text.loadDemoConfirm)) return;
    setPendingAction('load');
    try {
      await loadDemoData(language);
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
      </div>

      <div className="role-grid">
        {roles.map((r) => (
          <motion.button
            key={r.key}
            className={`role-btn role-btn--${r.key}`}
            onClick={() => handleRoleClick(r)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleRoleClick(r)}
            whileHover={{ scale: 1.1, y: -8 }}
            whileTap={{ scale: 0.82, rotateX: 12, rotateY: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          >
            <div style={roleIconWrapperStyle}>
              <div className="role-icon">{r.icon}</div>
              <AnimatePresence>
                {tappedRole === r.key && (
                  <>
                    <motion.div
                      key="glow"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 2.0 }}
                      exit={{ opacity: 0, scale: 2.4 }}
                      transition={{ duration: 0.45 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(${roleGlow[r.key]}, 0.65) 20%, transparent 70%)`,
                        pointerEvents: 'none',
                        zIndex: 0,
                      }}
                    />
                    {particleAngles.map((angle, i) => (
                      <motion.div
                        key={`p-${i}`}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        animate={{
                          opacity: 0,
                          x: Math.cos((angle * Math.PI) / 180) * PARTICLE_TRAVEL_DISTANCE,
                          y: Math.sin((angle * Math.PI) / 180) * PARTICLE_TRAVEL_DISTANCE,
                          scale: 0.4,
                        }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        style={{
                          position: 'absolute',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: `rgba(${roleGlow[r.key]}, 0.95)`,
                          top: '50%',
                          left: '50%',
                          marginTop: -4,
                          marginLeft: -4,
                          pointerEvents: 'none',
                          zIndex: 10,
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>
            <h2>{text.roles[r.key].title}</h2>
          </motion.button>
        ))}
      </div>

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
