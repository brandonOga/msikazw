import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Toaster } from 'sonner';
import { StoreProvider } from './context/StoreContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Scrolls to top on every page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export const RootLayout = () => {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#009739] selection:text-white flex flex-col">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
        <CartDrawer />
        <Toaster position="top-center" richColors />
      </div>
    </StoreProvider>
  );
};