import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

// Content embedded by the build-time prerender (vite-plugins/prerender.ts):
// seed the cache so the page renders immediately, then refetch live data as usual.
const prerendered = typeof window !== "undefined" ? (window as any).__SEO_DATA__ : undefined;
if (prerendered?.sections) queryClient.setQueryData(["sections", false], prerendered.sections);
if (prerendered && "settings" in prerendered) queryClient.setQueryData(["site_settings"], prerendered.settings);

const AdminEditor = lazy(() => import("./pages/AdminEditor.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const PageFallback = () => <div className="min-h-screen bg-background" aria-hidden />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Cookieless Vercel Web Analytics; admin pages are not counted */}
        <Analytics beforeSend={(event) => (new URL(event.url).pathname.startsWith("/admin") ? null : event)} />
        <BrowserRouter>
          <LanguageProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tr" element={<Index />} />
                <Route path="/de" element={<Index />} />
                <Route path="/admin" element={<AdminEditor />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/tr/:slug" element={<ProjectDetail />} />
                <Route path="/de/:slug" element={<ProjectDetail />} />
                <Route path="/:slug" element={<ProjectDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
