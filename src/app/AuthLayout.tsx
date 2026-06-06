import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { StoreProvider } from './context/StoreContext';

// Auth pages — completely bare, no header or footer
export const AuthLayout = () => {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-center" richColors />
    </StoreProvider>
  );
};
