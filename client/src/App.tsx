import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/components/LocaleProvider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ToolPage from "@/pages/ToolPage";

import "./i18n/config";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/:locale" component={HomePage} />
      <Route path="/:locale/:toolId" component={ToolPage} />
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
