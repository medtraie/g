import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "@/lib/i18n";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import LiveMap from "./pages/LiveMap";
import Drivers from "./pages/Drivers";
import Missions from "./pages/Missions";
import Fuel from "./pages/Fuel";
import Maintenance from "./pages/Maintenance";
import Login from "./pages/Login";
import {
  StockPage,
  FinancePage,
  ReportsPage,
  AlertsPage,
  SettingsPage,
} from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/vehicles"
              element={
                <PrivateRoute>
                  <Vehicles />
                </PrivateRoute>
              }
            />
            <Route
              path="/drivers"
              element={
                <PrivateRoute>
                  <Drivers />
                </PrivateRoute>
              }
            />
            <Route
              path="/live-map"
              element={
                <PrivateRoute>
                  <LiveMap />
                </PrivateRoute>
              }
            />
            <Route
              path="/missions"
              element={
                <PrivateRoute>
                  <Missions />
                </PrivateRoute>
              }
            />
            <Route
              path="/fuel"
              element={
                <PrivateRoute>
                  <Fuel />
                </PrivateRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <PrivateRoute>
                  <Maintenance />
                </PrivateRoute>
              }
            />
            <Route
              path="/stock"
              element={
                <PrivateRoute>
                  <StockPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/finance"
              element={
                <PrivateRoute>
                  <FinancePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <ReportsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <PrivateRoute>
                  <AlertsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
