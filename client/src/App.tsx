import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppLocaleProvider } from "./contexts/AppLocaleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AccountPage from "./pages/AccountPage";
import ConsultationPage from "./pages/ConsultationPage";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={LandingPage} />
      <Route path={"/chart"} component={Home} />
      <Route path={"/pricing"} component={PricingPage} />
      <Route path={"/consultation"} component={ConsultationPage} />
      <Route path={"/account"} component={AccountPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AppLocaleProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppLocaleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
