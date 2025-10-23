import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CartItem = {
  slug: string;
  variantId: string | null;
  qty: number;
  name: string;
  variantName: string | null;
  imageUrl: string;
  unitCents: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("gigify-cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("gigify-cart", JSON.stringify(newCart));
  };

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    updateCart(newCart);
    toast({ title: "Item removed from cart" });
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].qty = Math.max(1, newCart[index].qty + delta);
    updateCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + (item.unitCents * item.qty), 0);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl p-6 space-y-6" data-testid="page-cart-empty">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button asChild data-testid="button-continue-shopping">
              <Link href="/store">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6" data-testid="page-cart">
      <h1 className="text-3xl font-bold" data-testid="text-cart-title">Shopping Cart</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, index) => (
            <Card key={index} data-testid={`card-cart-item-${index}`}>
              <CardContent className="flex gap-4 p-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                  data-testid={`img-cart-item-${index}`}
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold" data-testid={`text-cart-item-name-${index}`}>
                      {item.name}
                    </h3>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(index, -1)}
                      data-testid={`button-decrease-qty-${index}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center" data-testid={`text-qty-${index}`}>
                      {item.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(index, 1)}
                      data-testid={`button-increase-qty-${index}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="font-bold" data-testid={`text-item-total-${index}`}>
                    ${((item.unitCents * item.qty) / 100).toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    data-testid={`button-remove-item-${index}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span className="font-bold" data-testid="text-cart-total">
                  ${(total / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Shipping calculated at checkout
              </p>
              <Button asChild className="w-full" size="lg" data-testid="button-checkout">
                <Link href="/store/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" data-testid="button-continue-shopping">
                <Link href="/store">
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
