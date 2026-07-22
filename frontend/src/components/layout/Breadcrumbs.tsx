import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || location.pathname === '/dashboard') {
    return null;
  }

  const breadcrumbLabels: Record<string, string> = {
    customers: 'Customers CRM',
    products: 'Products Catalog',
    inventory: 'Inventory Movements',
    challans: 'Sales Challans',
    create: 'New Sales Challan',
    profile: 'User Profile',
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200">
        <Home className="w-3.5 h-3.5" />
        Dashboard
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = breadcrumbLabels[name] || name;

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-slate-800 dark:hover:text-slate-200">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
