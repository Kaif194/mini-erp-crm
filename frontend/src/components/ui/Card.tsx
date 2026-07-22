import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm p-5 transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 hover:shadow' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
