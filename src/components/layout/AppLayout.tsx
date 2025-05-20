import React from 'react';
import { Outlet } from 'react-router-dom';
import SessionHeader from './SessionHeader';
import { SessionProvider } from '../../contexts/SessionContext';

const AppLayout: React.FC = () => {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <SessionHeader />
        <main className="flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </SessionProvider>
  );
};

export default AppLayout;