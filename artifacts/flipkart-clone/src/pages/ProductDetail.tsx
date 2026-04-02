import { useState } from "react";
import { Link, useParams } from "wouter";
import { Star, ShoppingCart, Zap, Heart, Share2, ChevronRight, CheckCircle, Truck, RefreshCw, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { addToCart } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === Number(id));
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState("");
  const [wishlist, setWishlist] = useState(false);
  const [mainImg, setMainImg] = useState(0);
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-700">Product not found</h2>
          <Link href="/">
            <button className="mt-4 bg-[#2874f0] text-white px-6 py-2 rounded text-sm font-medium">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);

  const images = [product.image, product.image, product.image];

  const handleAddToCart = () => {
    addToCart(product);
    toast({ title: "Added to Cart", description: `${product.name} has been added to your cart.` });
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryMsg(`Delivery available to ${pincode} — arrives by ${new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}`);
    } else {
      setDeliveryMsg("Please enter a valid 6-digit pincode.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-2 text-xs text-gray-500 flex items-center gap-1">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/?category=${product.category}`} className="hover:text-blue-600">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 line-clamp-1">{product.name}</span>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="bg-white rounded shadow-sm">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Image Section */}
            <div className="md:col-span-2 border-r border-gray-100">
              <div className="sticky top-20">
                <div className="p-4">
                  {/* Main Image */}
                  <div className="relative mb-3">
                    <img
                      src={images[mainImg]}
                      alt={product.name}
                      className="w-full h-80 object-contain bg-gray-50 rounded"
                      data-testid="img-product-main"
                    />
                    <button
                      onClick={() => setWishlist(!wishlist)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      data-testid="button-wishlist"
                    >
                      <Heart className={`w-5 h-5 ${wishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </button>
                    <button className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow" data-testid="button-share">
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  {/* Thumbnails */}
                  <div className="flex gap-2 justify-center">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setMainImg(i)}
                        className={`w-14 h-14 rounded border-2 overflow-hidden transition-all ${mainImg === i ? "border-blue-500" : "border-gray-200"}`}
                        data-testid={`button-thumbnail-${i}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded transition-colors"
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      ADD TO CART
                    </button>
                    <button
                      disabled={!product.inStock}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#fb641b] hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded transition-colors"
                      data-testid="button-buy-now"
                      onClick={() => {
                        if (product.inStock) {
                          addToCart(product);
                          window.location.href = import.meta.env.BASE_URL + "checkout";
                        }
                      }}
                    >
                      <Zap className="w-5 h-5" />
                      BUY NOW
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="md:col-span-3 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                  <h1 className="text-xl font-medium text-gray-800 mb-2" data-testid="text-product-name">{product.name}</h1>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 bg-green-600 text-white text-sm px-2 py-0.5 rounded">
                  <span>{product.rating}</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
                <span className="text-sm text-gray-500">{product.reviews.toLocaleString()} Ratings & Reviews</span>
              </div>

              {/* Price */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900" data-testid="text-product-price">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-lg font-semibold text-green-600">
                    {product.discount}% off
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Stock status */}
              <div className="mb-4">
                {product.inStock ? (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    In Stock
                  </div>
                ) : (
                  <p className="text-red-500 font-medium">Currently Unavailable</p>
                )}
              </div>

              {/* Highlights */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Highlights</h3>
                <ul className="space-y-1.5">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Offers */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Available Offers</h3>
                <div className="space-y-2">
                  {[
                    { tag: "Bank Offer", text: "10% off on HDFC Bank Credit Card, up to ₹1500" },
                    { tag: "Bank Offer", text: "5% Cashback on Flipkart Axis Bank Card" },
                    { tag: "Special Price", text: "Get extra ₹2000 off (price inclusive of cashback/coupon)" },
                    { tag: "No Cost EMI", text: "Starting ₹{Math.floor(product.price / 12).toLocaleString()}/month" },
                  ].map((offer, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0">{offer.tag}</span>
                      <span className="text-gray-600">{offer.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery check */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter pincode"
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:border-blue-500"
                    data-testid="input-pincode"
                  />
                  <button
                    onClick={checkDelivery}
                    className="text-blue-600 font-semibold text-sm hover:text-blue-700"
                    data-testid="button-check-delivery"
                  >
                    Check
                  </button>
                </div>
                {deliveryMsg && <p className="mt-2 text-xs text-gray-600" data-testid="text-delivery-msg">{deliveryMsg}</p>}
              </div>

              {/* Service badges */}
              <div className="flex gap-6">
                {[
                  { icon: <Truck className="w-5 h-5 text-blue-600" />, text: "Free Delivery" },
                  { icon: <RefreshCw className="w-5 h-5 text-green-600" />, text: "7 Days Return" },
                  { icon: <Shield className="w-5 h-5 text-orange-500" />, text: "Warranty" },
                ].map((s) => (
                  <div key={s.text} className="flex flex-col items-center gap-1">
                    {s.icon}
                    <span className="text-xs text-gray-500 text-center">{s.text}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-4 bg-white rounded shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
