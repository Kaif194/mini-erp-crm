import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesChallansPage } from './pages/SalesChallansPage';
import { CreateChallanPage } from './pages/CreateChallanPage';
import { ChallanDetailPage } from './pages/ChallanDetailPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Dashboard Layout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* Customer CRM Module */}
                    <Route
                      path="/customers"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />
                      }
                    >
                      <Route index element={<CustomersPage />} />
                      <Route path=":id" element={<CustomerDetailPage />} />
                    </Route>

                    {/* Products Catalog Module */}
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />

                    {/* Inventory Audit Log Module */}
                    <Route
                      path="/inventory"
                      element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}
                    >
                      <Route index element={<InventoryPage />} />
                    </Route>

                    {/* Sales Challan Module */}
                    <Route path="/challans" element={<SalesChallansPage />} />
                    <Route path="/challans/create" element={<CreateChallanPage />} />
                    <Route path="/challans/:id" element={<ChallanDetailPage />} />

                    {/* User Profile */}
                    <Route path="/profile" element={<UserProfilePage />} />
                  </Route>
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
