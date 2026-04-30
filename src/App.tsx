import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();
const AdminEditor = lazy(() => import("./pages/AdminEditor.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const PageFallback = () => <div className="min-h-screen bg-background" aria-hidden />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<AdminEditor />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/:slug" element={<ProjectDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
