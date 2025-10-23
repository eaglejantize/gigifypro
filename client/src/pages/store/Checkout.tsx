import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type CartItem = {
  slug: string;
  variantId: string | null;
  qty: number;
  name: string;
  variantName: string | null;
  imageUrl: string;
  unitCents: number;
};

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to complete your checkout",
      });
      setLocation("/auth/login?redirect=/store/checkout");
    }
  }, [user, setLocation, toast]);

  useEffect(() => {
    const stored = localStorage.getItem("gigify-cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
    // Pre-fill email with user's email if logged in
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const total = cart.reduce((sum, item) => sum + (item.unitCents * item.qty), 0);

  const handleCheckout = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create payment intent
      const items = cart.map(item => ({
        slug: item.slug,
        variantId: item.variantId || undefined,
        qty: item.qty,
      }));

      const intentRes = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items, email }),
      });

      if (!intentRes.ok) {
        const error = await intentRes.json();
        throw new Error(error.message || "Failed to create payment intent");
      }

      const intentData = await intentRes.json() as { clientSecret: string; totalCents: number };

      // Confirm order (in production, this would happen after Stripe payment succeeds)
      const confirmRes = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items,
          email,
          clientSecret: intentData.clientSecret,
        }),
      });

      if (!confirmRes.ok) {
        const error = await confirmRes.json();
        throw new Error(error.message || "Failed to confirm order");
      }

      const confirmData = await confirmRes.json() as { ok: boolean; orderId: string };

      if (confirmData.ok) {
        // Clear cart
        localStorage.removeItem("gigify-cart");
        
        toast({
          title: "Order placed successfully!",
          description: `Order #${confirmData.orderId.slice(0, 8)}`,
        });

        // Redirect to store
        setLocation("/store");
      }
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl p-6 space-y-6" data-testid="page-checkout-empty">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button onClick={() => setLocation("/store")} data-testid="button-back-to-store">
              Back to Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6" data-testid="page-checkout">
      <h1 className="text-3xl font-bold" data-testid="text-checkout-title">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Enter your email to receive order confirmation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>

              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium">Payment Information</p>
                <p className="text-sm text-muted-foreground">
                  This is a demo checkout. No real payment will be processed.
                  In production, Stripe payment would be integrated here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm" data-testid={`item-summary-${index}`}>
                    <span>
                      {item.qty}x {item.name}
                      {item.variantName && ` (${item.variantName})`}
                    </span>
                    <span className="font-medium">
                      ${((item.unitCents * item.qty) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span data-testid="text-checkout-total">
                    ${(total / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
                disabled={loading || !email}
                data-testid="button-place-order"
              >
                {loading ? (
                  <>
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
