import { Switch, Route, useParams } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/components/LocaleProvider";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ToolPage from "@/pages/ToolPage";
import CategoryPage from "@/pages/CategoryPage";
import AllToolsPage from "@/pages/AllToolsPage";
import AboutPage from "@/pages/AboutPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import ContactPage from "@/pages/ContactPage";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

import "./i18n/config";

function ToolPageWrapper() {
  const params = useParams<{ locale: string; toolId: string }>();
  return <ToolPage key={`${params.locale}-${params.toolId}`} />;
}

function Router() {
  useScrollToTop();
  
  return (
    <Switch>
      <Route path="/자리관" component={AdminLogin} />
      <Route path="/자리관/dashboard" component={AdminDashboard} />
      <Route path="/" component={HomePage} />
      <Route path="/:locale" component={HomePage} />
      <Route path="/:locale/all-tools" component={AllToolsPage} />
      <Route path="/:locale/about" component={AboutPage} />
      <Route path="/:locale/privacy" component={PrivacyPage} />
      <Route path="/:locale/terms" component={TermsPage} />
      <Route path="/:locale/contact" component={ContactPage} />
      <Route path="/:locale/category/:categoryId" component={CategoryPage} />
      <Route path="/:locale/:toolId" component={ToolPageWrapper} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocaleProvider>
          <Toaster />
          <Router />
        </LocaleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
