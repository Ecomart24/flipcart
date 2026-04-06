import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Star, ShoppingCart, Zap } from "lucide-react";
import { Product } from "@/data/products";
import { addToCart } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Link href={`/product/${product.id}`} data-testid={`card-product-${product.id}`}>
      <div className="bg-white rounded border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50">
          {product.badge && (
            <span className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
              {product.badge}
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
              <span className="text-gray-500 font-semibold text-sm bg-gray-100 px-3 py-1 rounded">Out of Stock</span>
            </div>
          )}
          <img
            src={imgError ? "https://via.placeholder.com/300x300?text=Product" : product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`img-product-${product.id}`}
          />
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-1" data-testid={`text-name-${product.id}`}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
              <span>{product.rating}</span>
              <Star className="w-2.5 h-2.5 fill-white" />
            </div>
            <span className="text-xs text-gray-500">({product.reviews.toLocaleString()})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-gray-900" data-testid={`text-price-${product.id}`}>
              ₹{product.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-green-600">
              {product.discount}% off
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-xs font-semibold py-2 rounded transition-colors"
              data-testid={`button-add-cart-${product.id}`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
            <button
              disabled={!product.inStock}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#fb641b] hover:bg-orange-700 disabled:bg-gray-300 text-white text-xs font-semibold py-2 rounded transition-colors"
              data-testid={`button-buy-${product.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.inStock) {
                  addToCart(product);
                  navigate("/checkout");
                }
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
