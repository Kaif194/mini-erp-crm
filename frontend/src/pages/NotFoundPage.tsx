import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="inline-flex p-4 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full mb-4">
          <HelpCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100">404</h1>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The operations module or page link you requested does not exist or has been relocated.
        </p>
        <Link to="/dashboard">
          <Button leftIcon={<Home className="w-4 h-4" />}>Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};
