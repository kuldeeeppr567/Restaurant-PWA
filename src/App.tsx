import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.tsx';
import RoleSelection from './pages/RoleSelection.tsx';
import TableDashboard from './pages/waiter/TableDashboard.tsx';
import OrderPage from './pages/waiter/OrderPage.tsx';
import ServiceDashboard from './pages/waiter/ServiceDashboard.tsx';
import KitchenDisplay from './pages/kitchen/KitchenDisplay.tsx';
import BillingPage from './pages/cashier/BillingPage.tsx';
import ReceiptPage from './pages/cashier/ReceiptPage.tsx';
import MenuManagement from './pages/admin/MenuManagement.tsx';
import TableConfig from './pages/admin/TableConfig.tsx';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard.tsx';
import SettingsPage from './pages/admin/SettingsPage.tsx';

function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<RoleSelection />} />

        {/* Waiter routes */}
        <Route path="/waiter/tables" element={<AppLayout role="waiter"><TableDashboard /></AppLayout>} />
        <Route path="/waiter/table/:tableId" element={<AppLayout role="waiter"><OrderPage /></AppLayout>} />
        <Route path="/waiter/service" element={<AppLayout role="waiter"><ServiceDashboard /></AppLayout>} />

        {/* Kitchen routes */}
        <Route path="/kitchen" element={<AppLayout role="kitchen"><KitchenDisplay /></AppLayout>} />

        {/* Cashier routes */}
        <Route path="/cashier" element={<AppLayout role="cashier"><BillingPage /></AppLayout>} />
        <Route path="/cashier/receipt/:sessionId" element={<AppLayout role="cashier"><ReceiptPage /></AppLayout>} />

        {/* Admin routes */}
        <Route path="/admin/menu" element={<AppLayout role="admin"><MenuManagement /></AppLayout>} />
        <Route path="/admin/tables" element={<AppLayout role="admin"><TableConfig /></AppLayout>} />
        <Route path="/admin/analytics" element={<AppLayout role="admin"><AnalyticsDashboard /></AppLayout>} />
        <Route path="/admin/settings" element={<AppLayout role="admin"><SettingsPage /></AppLayout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
