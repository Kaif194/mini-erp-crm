import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ArrowDownUp,
  FileSpreadsheet,
  UserCheck,
  Shield,
  Box,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { label: 'Customers CRM', path: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { label: 'Products Catalog', path: '/products', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { label: 'Inventory Log', path: '/inventory', icon: ArrowDownUp, roles: ['ADMIN', 'WAREHOUSE'] },
    { label: 'Sales Challans', path: '/challans', icon: FileSpreadsheet, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { label: 'User Profile', path: '/profile', icon: UserCheck, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 border-r border-slate-800 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white">MINI ERP</h1>
            <p className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">CRM Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (user && !item.roles.includes(user.role)) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Role Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-800/50">
            <Shield className="w-4 h-4 text-blue-400" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                {user?.role} Role
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
