import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  priceCents: number;
  variants: { id: string; name: string; priceCents: number }[];
};

export default function ProductCard({ product }: { product: Product }) {
  const price = (product.priceCents / 100).toFixed(2);
  
  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2" data-testid={`card-product-${product.slug}`}>
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="h-48 w-full object-cover"
        data-testid={`img-product-${product.slug}`}
      />
      <CardHeader>
        <CardTitle className="text-lg" data-testid={`text-product-name-${product.slug}`}>
          {product.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xl font-bold" data-testid={`text-price-${product.slug}`}>
          ${price}
        </div>
        <Button 
          asChild 
          className="w-full"
          data-testid={`button-view-product-${product.slug}`}
        >
          <Link href={`/store/product/${product.slug}`}>
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
