import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Box, Lock, Mail, ShieldAlert } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@minierp.com',
      password: 'Password123!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRole = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Dynamic background accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-8 backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/30 mb-4">
            <Box className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Mini ERP + CRM Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Wholesale & Distribution Operations Management</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center gap-3 text-red-300 text-xs">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            placeholder="admin@minierp.com"
            type="email"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            type="password"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={isLoading}>
            Sign In to Portal
          </Button>
        </form>

        {/* Demo Quick-Login Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-700/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Test Accounts (Click to Fill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickRole('admin@minierp.com')}
              className="p-2 bg-slate-900/60 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition text-left"
            >
              <span className="font-bold text-blue-400 block">Admin</span>
              <span className="text-[10px] text-slate-400">admin@minierp.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('sales1@minierp.com')}
              className="p-2 bg-slate-900/60 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition text-left"
            >
              <span className="font-bold text-emerald-400 block">Sales</span>
              <span className="text-[10px] text-slate-400">sales1@minierp.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('warehouse1@minierp.com')}
              className="p-2 bg-slate-900/60 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition text-left"
            >
              <span className="font-bold text-amber-400 block">Warehouse</span>
              <span className="text-[10px] text-slate-400">warehouse1@minierp.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('accounts1@minierp.com')}
              className="p-2 bg-slate-900/60 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition text-left"
            >
              <span className="font-bold text-purple-400 block">Accounts</span>
              <span className="text-[10px] text-slate-400">accounts1@minierp.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
