import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import Vault from "@/pages/vault";
import SharedPassword from "@/pages/shared-password";
import NotFound from "@/pages/not-found";
import { InstallPrompt } from "./components/install-prompt";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Vault} />
      <Route path="/share/:linkId" component={SharedPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize theme
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <InstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;