
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import KitDetail from "./pages/KitDetail";
import ResourceView from "./pages/ResourceView";
import Dashboard from "./pages/admin/Dashboard";
import ManageKits from "./pages/admin/ManageKits";
import ManageResources from "./pages/admin/ManageResources";
import ManageUsers from "./pages/admin/ManageUsers";
import ManagePromoCodes from "./pages/admin/ManagePromoCodes";
import CompanySettings from "./pages/admin/CompanySettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/kits/:kitId" element={<KitDetail />} />
            <Route path="/resources/:resourceId" element={<ResourceView />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/kits" element={<ManageKits />} />
            <Route path="/admin/resources" element={<ManageResources />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/promo-codes" element={<ManagePromoCodes />} />
            <Route path="/admin/settings" element={<CompanySettings />} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;