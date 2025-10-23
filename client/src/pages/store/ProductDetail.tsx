import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ProductVariant = { id: string; name: string; priceCents: number };
type ProductFull = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCents: number;
  variants: ProductVariant[];
};

export default function ProductDetailPage() {
  const [, params] = useRoute("/store/product/:slug");
  const [variantId, setVariantId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<ProductFull>({
    queryKey: ["/api/store/products", params?.slug],
    enabled: !!params?.slug,
  });

  // Set initial variant when product loads
  if (product && !variantId && product.variants.length > 0) {
    setVariantId(product.variants[0].id);
  }

  const selectedVariant = product?.variants.find(v => v.id === variantId);
  const displayPrice = selectedVariant 
    ? (selectedVariant.priceCents / 100).toFixed(2)
    : (product?.priceCents || 0 / 100).toFixed(2);

  const addToCart = () => {
    if (!product) return;
    
    const cart = JSON.parse(localStorage.getItem("gigify-cart") || "[]");
    cart.push({
      slug: product.slug,
      variantId: variantId || null,
      qty,
      name: product.name,
      variantName: selectedVariant?.name || null,
      imageUrl: product.imageUrl,
      unitCents: selectedVariant?.priceCents || product.priceCents,
    });
    localStorage.setItem("gigify-cart", JSON.stringify(cart));
    
    toast({
      title: "Added to cart",
      description: `${qty}x ${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ""}`,
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center">
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Button asChild variant="outline">
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6" data-testid="page-product-detail">
      <Button asChild variant="ghost" size="sm" data-testid="button-back-to-store">
        <Link href="/store">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full rounded-lg border"
            data-testid="img-product-detail"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-product-name">
              {product.name}
            </CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-3xl font-bold" data-testid="text-product-price">
              ${displayPrice}
            </div>

            {product.variants.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="variant">Select Size</Label>
                <Select value={variantId} onValueChange={setVariantId}>
                  <SelectTrigger id="variant" data-testid="select-variant">
                    <SelectValue placeholder="Choose size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map(variant => (
                      <SelectItem key={variant.id} value={variant.id} data-testid={`option-variant-${variant.id}`}>
                        {variant.name} - ${(variant.priceCents / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Select value={qty.toString()} onValueChange={(v) => setQty(parseInt(v))}>
                <SelectTrigger id="quantity" data-testid="select-quantity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={addToCart} 
                className="w-full"
                size="lg"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button asChild variant="outline" className="w-full" data-testid="button-view-cart">
                <Link href="/store/cart">
                  View Cart
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
