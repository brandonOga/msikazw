import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { DomainGuard } from './components/DomainGuard';

export default function App() {
  return (
    <DomainGuard>
      <RouterProvider router={router} />
    </DomainGuard>
  );
}