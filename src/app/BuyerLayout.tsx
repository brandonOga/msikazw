import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { StoreProvider } from './context/StoreContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// The buyer dashboard renders its own single-row header (logo + tabs + profile
// menu) inline in BuyerDashboard.tsx, matching the mockup's combined header —
// no separate fixed DashboardHeader here, unlike Seller/Admin layouts.
export const BuyerLayout = () => {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
      <Toaster position="top-center" richColors />
    </StoreProvider>
  );
};
