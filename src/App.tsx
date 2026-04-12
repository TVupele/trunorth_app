import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { VendorRoute } from "@/components/VendorRoute";
import { TutorRoute } from "@/components/TutorRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Wallet from "@/pages/Wallet";
import Travel from "@/pages/Travel";
import Tutoring from "@/pages/Tutoring";
import Emergency from "@/pages/Emergency";
import Donations from "@/pages/Donations";
import Marketplace from "@/pages/Marketplace";
import Events from "@/pages/Events";
import ReligiousServices from "@/pages/ReligiousServices";
import AIAssistant from "@/pages/AIAssistant";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import VendorDashboard from "@/pages/VendorDashboard";
import TutorDashboard from "@/pages/TutorDashboard";
import AuthToken from "@/pages/AuthToken";
import MobileHome from "@/pages/MobileHome";
import MobileWallet from "@/pages/MobileWallet";
import MobileAdmin from "@/pages/MobileAdmin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <a
        href="#/"
        className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoute>
);

const AdminLayout = () => (
  <AdminRoute>
    <Layout>
      <Outlet />
    </Layout>
  </AdminRoute>
);

const VendorLayout = () => (
  <VendorRoute>
    <Layout>
      <Outlet />
    </Layout>
  </VendorRoute>
);

const TutorLayout = () => (
  <TutorRoute>
    <Layout>
      <Outlet />
    </Layout>
  </TutorRoute>
);

const App = () => {
  const { initAuth, isLoading } = useAuth();

  useEffect(() => {
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/token" element={<AuthToken />} />
              <Route element={<ProtectedLayout />}>
                <Route path={ROUTE_PATHS.HOME} element={<Home />} />
                <Route path={ROUTE_PATHS.WALLET} element={<Wallet />} />
                <Route path={ROUTE_PATHS.TRAVEL} element={<Travel />} />
                <Route path={ROUTE_PATHS.TUTORING} element={<Tutoring />} />
                <Route path={ROUTE_PATHS.EMERGENCY} element={<Emergency />} />
                <Route path={ROUTE_PATHS.DONATIONS} element={<Donations />} />
                <Route path={ROUTE_PATHS.MARKETPLACE} element={<Marketplace />} />
                <Route path={ROUTE_PATHS.EVENTS} element={<Events />} />
                <Route
                  path={ROUTE_PATHS.RELIGIOUS_SERVICES}
                  element={<ReligiousServices />}
                />
                <Route path={ROUTE_PATHS.AI_ASSISTANT} element={<AIAssistant />} />
                <Route path={ROUTE_PATHS.PROFILE} element={<Profile />} />
                <Route path={ROUTE_PATHS.SETTINGS} element={<Settings />} />
              </Route>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
              <Route element={<VendorLayout />}>
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              </Route>
              <Route element={<TutorLayout />}>
                <Route path="/tutor/dashboard" element={<TutorDashboard />} />
              </Route>
              <Route path={ROUTE_PATHS.MOBILE_HOME} element={<MobileHome />} />
              <Route path={ROUTE_PATHS.MOBILE_WALLET} element={<MobileWallet />} />
              <Route path={ROUTE_PATHS.MOBILE_ADMIN} element={<MobileAdmin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;