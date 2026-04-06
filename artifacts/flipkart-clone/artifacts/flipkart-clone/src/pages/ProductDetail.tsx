import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Star, ShoppingCart, Zap, Heart, Share2, ChevronRight, CheckCircle, Truck, RefreshCw, Shield, Tag, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { addToCart } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";

const RATINGS_BREAKDOWN = [
  { stars: 5, pct: 58 },
  { stars: 4, pct: 22 },
  { stars: 3, pct: 11 },
  { stars: 2, pct: 5 },
  { stars: 1, pct: 4 },
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const product = products.find((p) => p.id === Number(id));
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [wishlist, setWishlist] = useState(false);
  const [mainImg, setMainImg] = useState(0);
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "qa">("overview");

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-700">Product not found</h2>
          <Link href="/"><button className="mt-4 bg-[#2874f0] text-white px-6 py-2 rounded text-sm font-medium">Back to Home</button></Link>
        </div>
      </div>
    );
  }

  const related = products.filter((p) => (p.subCategory === product.subCategory || p.category === product.category) && p.id !== product.id).slice(0, 8);
  const images = [product.image, product.image, product.image, product.image];

  const handleAddToCart = () => {
    addToCart(product);
    toast({ title: "Added to Cart!", description: `${product.name} added to your cart.` });
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate("/checkout");
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      const date = new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" });
      setDeliveryMsg(`Delivery available to ${pincode} — arrives by ${date}. Free delivery.`);
    } else {
      setDeliveryMsg("Please enter a valid 6-digit pincode.");
    }
  };

  const renderStars = (rating: number, size = "w-4 h-4") => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} className={`${size} ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );

  const isFashion = product.category === "Fashion" || product.category === "Cosmetics";
  const discount = product.discount;
  const savings = product.originalPrice - product.price;

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-2 text-xs text-gray-500 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-blue-600 cursor-pointer">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600 cursor-pointer">{product.category}</Link>
        {product.subCategory && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/?category=${encodeURIComponent(product.category)}&sub=${encodeURIComponent(product.subCategory)}`} className="hover:text-blue-600 cursor-pointer">{product.subCategory}</Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 line-clamp-1 max-w-xs">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-4">
        {/* Main card */}
        <div className="bg-white rounded shadow-sm">
          <div className="grid md:grid-cols-5 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* ── LEFT: Images ── */}
            <div className="md:col-span-2">
              <div className="p-4 md:sticky md:top-20">
                {/* Main image */}
                <div className="relative mb-3 bg-gray-50 rounded-lg overflow-hidden">
                  {product.badge && (
                    <span className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded">{product.badge}</span>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold bg-gray-100 px-4 py-2 rounded-lg">Out of Stock</span>
                    </div>
                  )}
                  <img
                    src={images[mainImg]}
                    alt={product.name}
                    className="w-full h-80 object-contain"
                    data-testid="img-product-main"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button onClick={() => setWishlist(!wishlist)} className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow" data-testid="button-wishlist">
                      <Heart className={`w-5 h-5 ${wishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow" data-testid="button-share">
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 justify-center mb-4">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setMainImg(i)} className={`w-14 h-14 rounded border-2 overflow-hidden transition-all ${mainImg === i ? "border-blue-500" : "border-gray-200 hover:border-gray-300"}`} data-testid={`button-thumbnail-${i}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded transition-colors text-sm"
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    ADD TO CART
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#fb641b] hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold py-3 rounded transition-colors text-sm"
                    data-testid="button-buy-now"
                  >
                    <Zap className="w-5 h-5" />
                    BUY NOW
                  </button>
                </div>

                {/* Trust strip */}
                <div className="flex justify-around mt-4 pt-3 border-t border-gray-100">
                  {[
                    { icon: <Truck className="w-5 h-5 text-blue-600" />, text: "Free\nDelivery" },
                    { icon: <RefreshCw className="w-5 h-5 text-green-600" />, text: "7 Days\nReturn" },
                    { icon: <Shield className="w-5 h-5 text-orange-500" />, text: "1 Year\nWarranty" },
                    { icon: <Tag className="w-5 h-5 text-purple-600" />, text: "Best\nPrice" },
                  ].map((s) => (
                    <div key={s.text} className="flex flex-col items-center gap-1">
                      {s.icon}
                      <span className="text-xs text-gray-500 text-center whitespace-pre-line leading-tight">{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Details ── */}
            <div className="md:col-span-3 p-5">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">{product.brand}</p>
              <h1 className="text-lg font-medium text-gray-900 mb-2 leading-snug" data-testid="text-product-name">{product.name}</h1>

              {/* Rating row */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5 bg-green-600 text-white text-sm px-2.5 py-0.5 rounded">
                  <span className="font-bold">{product.rating}</span>
                  <Star className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab("reviews")}>
                  {product.reviews.toLocaleString()} Ratings & Reviews
                </span>
                {product.inStock ? (
                  <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" /> In Stock
                  </span>
                ) : (
                  <span className="ml-auto text-red-500 text-xs font-semibold">Out of Stock</span>
                )}
              </div>

              {/* Price */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Special Price</p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-gray-900" data-testid="text-product-price">₹{product.price.toLocaleString()}</span>
                  <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="text-base font-bold text-green-600">{discount}% off</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">You save <span className="text-green-600 font-semibold">₹{savings.toLocaleString()}</span> on this item</p>
                <p className="text-xs text-gray-400 mt-0.5">Inclusive of all taxes • Free delivery</p>
              </div>

              {/* Color selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Color: <span className="font-normal text-gray-500">{selectedColor || "Select a color"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${selectedColor === color ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}
                        data-testid={`button-color-${color}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Size: <span className="font-normal text-gray-500">{selectedSize || "Select size"}</span>
                    </p>
                    <button className="text-xs text-blue-600 hover:underline" data-testid="button-size-guide">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-10 rounded border text-sm font-medium transition-all ${selectedSize === size ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}
                        data-testid={`button-size-${size}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Offers */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">Available Offers</p>
                <div className="space-y-2">
                  {[
                    { tag: "Bank Offer", text: "10% instant discount on HDFC Bank Credit Card, up to ₹750" },
                    { tag: "Bank Offer", text: "5% cashback on Flipkart Axis Bank Card" },
                    { tag: "Special Price", text: "Get extra ₹200 off (price inclusive of cashback/coupon)" },
                    { tag: "No Cost EMI", text: `Starting from ₹${Math.max(33, Math.floor(product.price / 3))} per month on eligible cards` },
                  ].map((o, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded">{o.tag}</span>
                      <span className="text-gray-600 text-xs">{o.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery check */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Options</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter pincode"
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:border-blue-500"
                    data-testid="input-pincode"
                  />
                  <button onClick={checkDelivery} className="text-blue-600 font-semibold text-sm hover:text-blue-700" data-testid="button-check-delivery">Check</button>
                </div>
                {deliveryMsg && <p className="mt-2 text-xs text-green-600 font-medium" data-testid="text-delivery-msg">✓ {deliveryMsg}</p>}
                {!deliveryMsg && <p className="mt-2 text-xs text-gray-500">Enter pincode to check delivery availability</p>}
              </div>

              {/* Highlights */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">Highlights</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sold by */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Sold by: <span className="text-blue-600 font-medium cursor-pointer hover:underline">{product.brand} Official Store</span></span>
                <span className="text-green-600">✓ Flipkart Assured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Overview / Reviews / Q&A */}
        <div className="bg-white rounded shadow-sm mt-4">
          <div className="flex border-b border-gray-100">
            {(["overview", "reviews", "qa"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "border-b-2 border-[#2874f0] text-[#2874f0]" : "text-gray-500 hover:text-gray-700"}`}
                data-testid={`tab-${tab}`}
              >
                {tab === "qa" ? "Q & A" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                  {!showFullDesc && product.description.length > 100 && "..."}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-2">
                  {showFullDesc
                    ? `This ${product.name} is brought to you by ${product.brand}, one of the most trusted names in the industry. With its exceptional quality and design, this product has garnered thousands of positive reviews from satisfied customers. Perfect for gifting or personal use, this product comes with all the features you need.`
                    : ""}
                </p>
                <button onClick={() => setShowFullDesc(!showFullDesc)} className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline" data-testid="button-show-more-desc">
                  {showFullDesc ? <><ChevronUp className="w-3.5 h-3.5" />Show Less</> : <><ChevronDown className="w-3.5 h-3.5" />Read More</>}
                </button>

                {/* Specifications */}
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Specifications</h3>
                  <table className="w-full text-xs">
                    <tbody>
                      {[
                        ["Brand", product.brand],
                        ["Category", product.subCategory || product.category],
                        ["Discount", `${product.discount}% off`],
                        ["Availability", product.inStock ? "In Stock" : "Out of Stock"],
                        ...(product.sizes ? [["Available Sizes", product.sizes.join(", ")]] : []),
                        ...(product.colors ? [["Available Colors", product.colors.join(", ")]] : []),
                        ...product.highlights.map((h, i) => [`Feature ${i + 1}`, h]),
                      ].map(([key, val], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                          <td className="py-2 px-3 font-semibold text-gray-600 w-1/3">{key}</td>
                          <td className="py-2 px-3 text-gray-700">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Ratings & Reviews</h3>
                <div className="flex gap-6 mb-6 flex-wrap">
                  {/* Overall rating */}
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-800">{product.rating}</div>
                    <div className="flex justify-center my-1">{renderStars(product.rating)}</div>
                    <p className="text-xs text-gray-500">{product.reviews.toLocaleString()} ratings</p>
                  </div>
                  {/* Breakdown */}
                  <div className="flex-1 space-y-1.5">
                    {RATINGS_BREAKDOWN.map((r) => (
                      <div key={r.stars} className="flex items-center gap-2 text-xs">
                        <span className="w-4 text-right text-gray-600">{r.stars}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="text-gray-500 w-8">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample reviews */}
                <div className="space-y-4">
                  {[
                    { name: "Priya S.", rating: 5, date: "2 days ago", text: "Absolutely love this product! The quality is superb and it arrived in perfect condition. Highly recommend to everyone.", helpful: 42 },
                    { name: "Anjali M.", rating: 4, date: "1 week ago", text: "Good product, fits well and looks exactly like the pictures. Delivery was fast too. Just wish the packaging was a bit better.", helpful: 18 },
                    { name: "Rekha P.", rating: 5, date: "3 days ago", text: "Best purchase I've made this year! Worth every rupee. The fabric quality is amazing and it's very comfortable.", helpful: 35 },
                    { name: "Sunita D.", rating: 3, date: "2 weeks ago", text: "The product is okay. Not as vibrant as the photo but the quality is decent. Customer service was helpful.", helpful: 9 },
                  ].map((r, i) => (
                    <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{r.name[0]}</div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                              <span>{r.rating}</span>
                              <Star className="w-2.5 h-2.5 fill-white" />
                            </div>
                            <span className="text-xs text-gray-400">{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{r.text}</p>
                      <button className="mt-1.5 text-xs text-gray-400 hover:text-gray-600">👍 Helpful ({r.helpful})</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "qa" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Questions & Answers</h3>
                <div className="space-y-4">
                  {[
                    { q: "Is this product authentic?", a: "Yes, this is 100% original product sold by the official brand store." },
                    { q: "What is the return policy?", a: "7-day return policy is applicable. Product must be in original condition with tags intact." },
                    { q: "Can I exchange for a different size?", a: "Yes, size exchange is available within 7 days of delivery. Contact customer support." },
                    { q: "Is gift wrapping available?", a: "Yes, gift wrapping is available for an additional ₹50. Select the option at checkout." },
                  ].map((qa, i) => (
                    <div key={i} className="bg-gray-50 rounded p-3">
                      <p className="text-sm font-medium text-gray-800 mb-1.5">Q: {qa.q}</p>
                      <p className="text-sm text-gray-600">A: {qa.a}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-sm text-blue-600 font-semibold hover:underline">+ Ask a Question</button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="bg-white rounded shadow-sm mt-4 p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Similar Products
              {product.subCategory && <span className="text-sm font-normal text-gray-500 ml-2">in {product.subCategory}</span>}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
