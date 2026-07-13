import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { StoreProvider } from './context/StoreContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardHeader, HEADER_H } from './components/DashboardHeader';

export const BuyerLayout = () => {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: HEADER_H }}>
        <DashboardHeader role="buyer" />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
      <Toaster position="top-center" richColors />
    </StoreProvider>
  );
};
