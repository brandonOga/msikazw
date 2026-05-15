import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Toaster } from 'sonner';
import { StoreProvider } from './context/StoreContext';

export const RootLayout = () => {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#009739] selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
        <Toaster position="top-center" richColors />
      </div>
    </StoreProvider>
  );
};