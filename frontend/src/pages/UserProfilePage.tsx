import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, Key } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="User Profile" description="Your authenticated credentials and system permissions." />

      <Card className="max-w-2xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{user?.name}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Assigned Role</span>
            </div>
            <Badge variant="purple" size="md">
              {user?.role}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Email Address</span>
            </div>
            <span className="font-bold">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">User ID</span>
            </div>
            <span className="font-mono text-slate-500">{user?.id}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button variant="danger" onClick={logout}>
            Sign Out of Session
          </Button>
        </div>
      </Card>
    </div>
  );
};
