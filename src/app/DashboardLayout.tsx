import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { StoreProvider } from './context/StoreContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardHeader, HEADER_H } from './components/DashboardHeader';

export { HEADER_H as SELLER_HEADER_H };

export const DashboardLayout = () => {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-white" style={{ paddingTop: HEADER_H }}>
        <DashboardHeader role="seller" />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
      <Toaster position="top-center" richColors />
    </StoreProvider>
  );
};
