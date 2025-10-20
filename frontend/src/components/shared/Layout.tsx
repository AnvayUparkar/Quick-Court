import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default Layout;
