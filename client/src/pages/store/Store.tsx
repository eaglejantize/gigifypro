import { useQuery } from "@tanstack/react-query";
import ProductCard, { Product } from "@/components/store/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function StorePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/store/products"],
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
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
    <div className="mx-auto max-w-6xl p-6 space-y-6" data-testid="page-store">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-store-title">
          Uniforms & Accessories
        </h1>
        <p className="text-muted-foreground">
          Professional gear for gig workers - look the part and stand out from the crowd
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No products available at the moment
        </div>
      )}
    </div>
  );
}
