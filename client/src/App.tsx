import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Feed from "@/pages/Feed";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import PostTask from "@/pages/PostTask";
import ListingDetail from "@/pages/ListingDetail";
import Profile from "@/pages/Profile";
import Inbox from "@/pages/Inbox";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Store from "@/pages/store/Store";
import ProductDetail from "@/pages/store/ProductDetail";
import Cart from "@/pages/store/Cart";
import Checkout from "@/pages/store/Checkout";
import KnowledgeHub from "@/pages/KnowledgeHub";
import ArticleDetail from "@/pages/ArticleDetail";
import Services from "@/pages/Services";
import AdminServices from "@/pages/admin/AdminServices";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/feed" component={Feed} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/post" component={PostTask} />
      <Route path="/listing/:id" component={ListingDetail} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/store" component={Store} />
      <Route path="/store/product/:slug" component={ProductDetail} />
      <Route path="/store/cart" component={Cart} />
      <Route path="/store/checkout" component={Checkout} />
      <Route path="/knowledge" component={KnowledgeHub} />
      <Route path="/knowledge/article/:slug" component={ArticleDetail} />
      <Route path="/services" component={Services} />
      <Route path="/admin/services" component={AdminServices} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
