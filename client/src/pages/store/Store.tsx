import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard, { Product } from "@/components/store/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Shirt, Shield, Wrench } from "lucide-react";

const CATEGORIES = [
  { key: "all", label: "All Products", icon: ShoppingBag },
  { key: "apparel", label: "Apparel", icon: Shirt },
  { key: "safety_gear", label: "Safety Gear", icon: Shield },
  { key: "tools_kits", label: "Tools & Kits", icon: Wrench },
];

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/store/products"],
  });

  const products = useMemo(() => {
    if (!allProducts) return [];
    if (selectedCategory === "all") return allProducts;
    return allProducts.filter(p => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6" data-testid="page-store">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-store-title">
            G PRO Store
          </h1>
          <p className="text-muted-foreground">
            Professional gear for gig workers - look the part and stand out from the crowd
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {products.length} {products.length === 1 ? 'Product' : 'Products'}
        </Badge>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2" data-testid="category-filters">
        {CATEGORIES.map(category => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.key;
          
          return (
            <Button
              key={category.key}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.key)}
              data-testid={`button-category-${category.key}`}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </Button>
          );
        })}
      </div>
      
      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>No products available in this category</p>
        </div>
      )}
    </div>
  );
}
