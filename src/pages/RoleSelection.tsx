import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, ChefHat, CircleAlert, Receipt, UtensilsCrossed, Wallet } from 'lucide-react';
import { loadDemoData, resetDemoData } from '../db/seedData.ts';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

type Language = 'en' | 'hi';
type RoleKey = 'waiter' | 'kitchen' | 'cashier' | 'admin';

interface RoleCard {
  key: RoleKey;
  icon: ReactNode;
  path: string;
}

const roles: RoleCard[] = [
  { key: 'waiter', icon: <UtensilsCrossed size={22} />, path: '/waiter/tables' },
  { key: 'kitchen', icon: <ChefHat size={22} />, path: '/kitchen' },
  { key: 'cashier', icon: <Wallet size={22} />, path: '/cashier' },
  { key: 'admin', icon: <BarChart3 size={22} />, path: '/admin/menu' },
];

const languageStorageKey = 'restaurant-pwa-language';

const copy = {
  en: {
    languageLabel: 'Language',
    title: 'Restaurant POS',
    subtitle: 'Premium command center for service, kitchen, and billing workflows',
    onlineStatus: 'Live sync available',
    offlineStatus: 'Offline mode active',
    roles: {
      waiter: { title: 'Waiter', description: 'Take orders and serve tables' },
      kitchen: { title: 'Kitchen', description: 'Manage food preparation' },
      cashier: { title: 'Cashier', description: 'Handle billing and payments' },
      admin: { title: 'Owner/Admin', description: 'Menu management and analytics' },
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
    languageLabel: 'भाषा',
    title: 'रेस्टोरेंट POS',
    subtitle: 'सेवा, रसोई और बिलिंग वर्कफ़्लो के लिए प्रीमियम कमांड सेंटर',
    onlineStatus: 'लाइव सिंक उपलब्ध है',
    offlineStatus: 'ऑफलाइन मोड सक्रिय है',
    roles: {
      waiter: { title: 'वेटर', description: 'ऑर्डर लें और टेबल सर्विस संभालें' },
      kitchen: { title: 'रसोई', description: 'भोजन तैयारी को मैनेज करें' },
      cashier: { title: 'कैशियर', description: 'बिलिंग और पेमेंट संभालें' },
      admin: { title: 'मालिक / एडमिन', description: 'मेन्यू मैनेजमेंट और एनालिटिक्स' },
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
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    return window.localStorage.getItem(languageStorageKey) === 'hi' ? 'hi' : 'en';
  });
  const [loading, setLoading] = useState(false);
  const text = copy[language];

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem(languageStorageKey, nextLanguage);
  };

  const handleLoadDemo = async () => {
    if (!window.confirm(text.loadDemoConfirm)) return;
    setLoading(true);
    try {
      await loadDemoData();
      alert(text.loadDemoSuccess);
    } catch (err) {
      alert(text.loadDemoError + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm(text.resetDemoConfirm)) return;
    setLoading(true);
    try {
      await resetDemoData();
      alert(text.resetDemoSuccess);
    } catch (err) {
      alert(text.resetDemoError + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="role-hero">
        <div className="role-logo"><Receipt size={28} /></div>
        <h1 className="page-title">{text.title}</h1>
        <p className="page-subtitle">{text.subtitle}</p>
        <div style={{ width: '100%', maxWidth: 240, margin: '16px auto 0', textAlign: 'left' }}>
          <label htmlFor="language-select" style={{ fontWeight: 600, marginBottom: '8px' }}>
            {text.languageLabel}
          </label>
          <select
            id="language-select"
            value={language}
            aria-label={text.languageLabel}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
        <p style={{ marginTop: '10px' }}>
          <span className={isOnline ? 'online-indicator' : 'offline-indicator'}>
            {isOnline ? text.onlineStatus : text.offlineStatus}
          </span>
        </p>
      </div>

      <div className="role-grid">
        {roles.map((r) => (
          <motion.div
            key={r.key}
            className="card role-card"
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
        <CircleAlert size={16} style={{ display: 'inline', marginRight: "6px", verticalAlign: '-2px' }} />
        {text.footer}
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handleLoadDemo} disabled={loading}>
          {loading ? text.loadingDemo : text.loadDemo}
        </button>
        <button className="btn btn-secondary" onClick={handleResetDemo} disabled={loading}>
          {loading ? text.resettingDemo : text.resetDemo}
        </button>
      </div>
    </div>
  );
}
