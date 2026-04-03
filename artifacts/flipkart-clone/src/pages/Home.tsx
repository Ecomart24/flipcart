import { useState, useEffect, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, X, SlidersHorizontal, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products, banners, categories, subCategories } from "@/data/products";
import { addToCart } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating: High to Low", value: "rating" },
  { label: "Discount: High to Low", value: "discount" },
];

const PRICE_RANGES = [
  { label: "Under ₹200", min: 0, max: 200 },
  { label: "₹200 – ₹350", min: 200, max: 350 },
  { label: "₹350 – ₹500", min: 350, max: 500 },
  { label: "Above ₹500", min: 500, max: Infinity },
];

const TOP_CATEGORIES = [
  "Top Offers", "Grocery", "Mobiles", "Fashion", "Electronics", "Home", "Appliances", "Travel", "Beauty"
];

const TICKER_TEXT = "🚀 FREE DELIVERY ON ALL ORDERS  •  🔥 BIG BILLION DAYS SALE IS LIVE  •  ⚡ UP TO 90% OFF ON ELECTRONICS  •  👗 MIN 70% OFF ON FASHION  •  📱 EXTRA ₹5000 OFF ON MOBILES  •  🏠 UP TO 80% OFF ON APPLIANCES  •  🌟 TOP BRANDS AT LOWEST PRICES  •  💄 BEAUTY DEALS STARTING ₹99  •";

function useCountdown(initial: number) {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0"));
}

function SaleBadge({ pct }: { pct: number }) {
  return (
    <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs font-bold rounded px-1.5 py-0.5 leading-tight text-center">
      <div className="text-[10px] font-semibold">SALE</div>
      <div className="text-xs font-extrabold">{pct}%</div>
      <div className="text-[10px]">OFF</div>
    </div>
  );
}

function DealCard({ product }: { product: typeof products[0] }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <Link href={`/product/${product.id}`}>
        <div className="relative pt-[100%] bg-gray-50 overflow-hidden cursor-pointer">
          <SaleBadge pct={product.discount} />
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop"; }}
          />
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/product/${product.id}`}>
          <p className="text-xs text-gray-700 line-clamp-2 min-h-[2.5rem] hover:text-blue-600 cursor-pointer mb-2">{product.name}</p>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <span className="flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
            {product.rating}<Star className="w-2.5 h-2.5 fill-white" />
          </span>
          <span className="text-xs text-gray-400">({(product.reviews / 1000).toFixed(1)}k)</span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-2 flex-wrap">
          <span className="font-bold text-gray-900 text-sm">₹{product.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
          <span className="text-xs text-green-600 font-semibold">{product.discount}% off</span>
        </div>
        <div className="flex gap-1.5 mt-auto">
          <button
            onClick={() => { addToCart(product); toast({ title: "Added to Cart", description: product.name }); }}
            className="flex-1 flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded transition-colors"
          >
            <ShoppingCart className="w-3 h-3" /> Add to Cart
          </button>
          <button
            onClick={() => { addToCart(product); navigate("/checkout"); }}
            className="flex-1 flex items-center justify-center gap-1 bg-[#fb641b] hover:bg-orange-700 text-white text-xs font-semibold py-2 rounded transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const searchQuery = params.get("search") || "";
  const categoryFilter = params.get("category") || "";
  const subCatFilter = params.get("sub") || "";

  const [currentBanner, setCurrentBanner] = useState(0);
  const [query, setQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [activeSubCat, setActiveSubCat] = useState(subCatFilter);
  const [activeTopCat, setActiveTopCat] = useState("");
  const [, navigate] = useLocation();

  const [hh, mm, ss] = useCountdown(6 * 3600 + 59 * 60 + 41);

  useEffect(() => { setQuery(searchQuery); }, [searchQuery]);
  useEffect(() => { setActiveSubCat(subCatFilter); }, [subCatFilter]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentBanner((p) => (p + 1) % banners.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("search", q); else url.searchParams.delete("search");
    url.searchParams.delete("category");
    url.searchParams.delete("sub");
    window.history.pushState({}, "", url.pathname + url.search);
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch = query === "" || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase()) || (p.subCategory || "").toLowerCase().includes(query.toLowerCase());
      const matchCat = categoryFilter === "" || p.category === categoryFilter || (categoryFilter === "Fashion" && p.category === "Fashion") || (categoryFilter === "Cosmetics" && p.category === "Cosmetics");
      const matchSub = activeSubCat === "" || p.subCategory === activeSubCat;
      const matchPrice = !priceRange || (p.price >= priceRange.min && p.price <= priceRange.max);
      const matchRating = !selectedRating || p.rating >= selectedRating;
      return matchSearch && matchCat && matchSub && matchPrice && matchRating;
    });
    switch (sortBy) {
      case "price_asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price_desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "discount": list = [...list].sort((a, b) => b.discount - a.discount); break;
    }
    return list;
  }, [query, categoryFilter, activeSubCat, priceRange, selectedRating, sortBy]);

  const showSidebar = categoryFilter === "Fashion" || categoryFilter === "Cosmetics";
  const subs = subCategories[categoryFilter] || [];
  const isHome = !searchQuery && !categoryFilter;

  const dealsProducts = products.filter((p) => p.category === "Fashion" || p.category === "Cosmetics").slice(0, 12);
  const fashionProducts = products.filter((p) => p.category === "Fashion").slice(0, 12);
  const cosmeticsProducts = products.filter((p) => p.category === "Cosmetics").slice(0, 12);

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar onSearch={handleSearch} searchQuery={query} />

      {/* ── Scrolling Ticker ── */}
      <div className="bg-orange-500 overflow-hidden py-1.5">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite]">
          {[...Array(3)].map((_, ri) => (
            <span key={ri} className="text-white text-xs font-semibold px-8 flex-shrink-0">{TICKER_TEXT}</span>
          ))}
        </div>
      </div>

      {/* ── Top Category Nav ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {TOP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTopCat(cat === activeTopCat ? "" : cat);
                  if (cat === "Fashion" || cat === "Beauty") navigate(`/?category=${cat === "Beauty" ? "Cosmetics" : cat}`);
                  else if (cat === "Mobiles" || cat === "Electronics") navigate(`/?category=${cat}`);
                  else navigate("/");
                }}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTopCat === cat ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isHome && (
        <>
          {/* ── Hero Banner ── */}
          <div className="max-w-7xl mx-auto px-3 pt-3">
            <div className="relative rounded-lg overflow-hidden shadow-md" data-testid="hero-banner">
              <div className={`bg-gradient-to-r ${banners[currentBanner].bg} h-56 md:h-72 relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center px-8 md:px-16 z-10">
                  <div className="max-w-sm">
                    <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-extrabold px-3 py-1 rounded mb-3 uppercase tracking-wide">⚡ Flash Sale</div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2">
                      {banners[currentBanner].title}
                    </h2>
                    <p className="text-white/80 text-sm mb-1">{banners[currentBanner].subtitle}</p>
                    <p className="text-white/60 text-xs mb-4">No Cost EMI · Exchange Offer · Bank Discounts</p>
                    <button className="bg-white text-blue-700 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-blue-50 transition-colors shadow">
                      {banners[currentBanner].cta} →
                    </button>
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute right-0 top-0 bottom-0 w-2/5 flex items-center justify-center gap-3 pr-6">
                  {[0, 1].map((i) => (
                    <div key={i} className={`relative ${i === 0 ? "w-28 h-36 md:w-36 md:h-44" : "w-24 h-32 md:w-28 md:h-36"}`}>
                      <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
                        <img
                          src={products[i + 1]?.image}
                          alt=""
                          className="w-full h-full object-cover opacity-90"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap shadow">
                        {products[i + 1]?.originalPrice ? `₹${products[i + 1].originalPrice.toLocaleString()} OFF` : "SALE"}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Background circles */}
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute left-1/2 -bottom-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
              </div>
              {/* Banner controls */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBanner(i)} className={`h-2 rounded-full transition-all ${i === currentBanner ? "bg-white w-6" : "bg-white/50 w-2"}`} />
                ))}
              </div>
              <button onClick={() => setCurrentBanner((p) => (p - 1 + banners.length) % banners.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-1.5 transition-colors z-20">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => setCurrentBanner((p) => (p + 1) % banners.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-1.5 transition-colors z-20">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* ── Deals of the Day ── */}
          <div className="max-w-7xl mx-auto px-3 mt-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-extrabold text-gray-900">Deals of the Day</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 font-medium">Ends In</span>
                    {[hh, mm, ss].map((v, i) => (
                      <span key={i} className="flex items-center">
                        <span className="bg-gray-900 text-white font-mono font-bold text-sm px-2 py-1 rounded min-w-[2rem] text-center">{v}</span>
                        {i < 2 && <span className="text-gray-700 font-bold mx-0.5">:</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href="/?category=Fashion" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1 border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors">
                  VIEW ALL <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 divide-x divide-y divide-gray-100">
                {dealsProducts.map((p) => <DealCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>

          {/* ── Category chips ── */}
          <div className="max-w-7xl mx-auto px-3 mt-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-base font-bold text-gray-800 mb-3">Shop by Category</h2>
              <div className="flex gap-4 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <Link key={cat.name} href={`/?category=${encodeURIComponent(cat.name === "Footwear" ? "Fashion" : cat.name)}&sub=${cat.name === "Footwear" ? "Footwear" : ""}`} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-2xl border-2 border-transparent hover:border-blue-200 transition-colors">{cat.icon}</div>
                    <span className="text-xs text-gray-700 text-center whitespace-nowrap font-medium">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Women's Fashion Section ── */}
          <div className="max-w-7xl mx-auto px-3 mt-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">👗 Women's Fashion</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Kurtas, Sarees, Dresses & more from ₹149</p>
                </div>
                <Link href="/?category=Fashion" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1 border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors">
                  VIEW ALL <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 divide-x divide-y divide-gray-100">
                {fashionProducts.map((p) => <DealCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>

          {/* ── Cosmetics Banner Strip ── */}
          <div className="max-w-7xl mx-auto px-3 mt-4">
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-lg p-6 text-white flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest bg-white/20 inline-block px-2 py-0.5 rounded mb-2">Beauty Deals</div>
                <h3 className="text-2xl font-extrabold mb-1">💄 Up to 70% OFF on Cosmetics</h3>
                <p className="text-sm text-pink-100">Lipsticks, Foundations, Skincare, Haircare & more</p>
              </div>
              <Link href="/?category=Cosmetics">
                <button className="bg-white text-pink-600 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-pink-50 transition-colors flex-shrink-0 shadow">Shop Now →</button>
              </Link>
            </div>
          </div>

          {/* ── Ladies Cosmetics Section ── */}
          <div className="max-w-7xl mx-auto px-3 mt-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">💄 Ladies Cosmetics</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Top brands from ₹99 — Lipstick, Skincare & more</p>
                </div>
                <Link href="/?category=Cosmetics" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1 border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors">
                  VIEW ALL <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 divide-x divide-y divide-gray-100">
                {cosmeticsProducts.map((p) => <DealCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>

          {/* ── Electronics Section ── */}
          <div className="max-w-7xl mx-auto px-3 mt-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">📱 Electronics & Gadgets</h2>
                </div>
                <Link href="/?category=Mobiles" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1 border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors">
                  VIEW ALL <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-100">
                {products.filter((p) => ["Mobiles","Laptops","Electronics","TVs","Tablets","Cameras"].includes(p.category)).slice(0, 8).map((p) => <DealCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Category / Search Results ── */}
      {!isHome && (
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="flex gap-4">
            {/* Sidebar */}
            {showSidebar && (
              <aside className="hidden md:block w-56 flex-shrink-0">
                <div className="bg-white rounded shadow-sm p-4 sticky top-20">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase">Filters</h3>
                  {subs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Category</p>
                      <div className="space-y-1 max-h-52 overflow-y-auto">
                        <button onClick={() => setActiveSubCat("")} className={`block w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${activeSubCat === "" ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>All</button>
                        {subs.map((s) => (
                          <button key={s} onClick={() => setActiveSubCat(s)} className={`block w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${activeSubCat === s ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Price Range</p>
                    <div className="space-y-1">
                      <button onClick={() => setPriceRange(null)} className={`block w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${!priceRange ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>All Prices</button>
                      {PRICE_RANGES.map((r) => (
                        <button key={r.label} onClick={() => setPriceRange({ min: r.min, max: r.max })} className={`block w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${priceRange?.min === r.min && priceRange?.max === r.max ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{r.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Customer Rating</p>
                    <div className="space-y-1">
                      {[4, 3].map((r) => (
                        <button key={r} onClick={() => setSelectedRating(selectedRating === r ? null : r)} className={`flex items-center gap-1.5 w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${selectedRating === r ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{r}★ & above
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Main grid */}
            <div className="flex-1">
              <div className="bg-white rounded shadow-sm p-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {categoryFilter ? `${categoryFilter}${activeSubCat ? ` › ${activeSubCat}` : ""}` : `Results for "${query}"`}
                    </h2>
                    <p className="text-xs text-gray-500">{filteredProducts.length} products found</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 bg-white" data-testid="select-sort">
                      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {(categoryFilter || searchQuery) && (
                      <Link href="/" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                        <X className="w-3 h-3" />Clear
                      </Link>
                    )}
                  </div>
                </div>

                {/* Sub-category chips */}
                {showSidebar && subs.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-4 pb-3 border-b border-gray-100">
                    <button onClick={() => setActiveSubCat("")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeSubCat === "" ? "bg-[#2874f0] text-white border-[#2874f0]" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}>All</button>
                    {subs.map((s) => (
                      <button key={s} onClick={() => setActiveSubCat(activeSubCat === s ? "" : s)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeSubCat === s ? "bg-[#2874f0] text-white border-[#2874f0]" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}>{s}</button>
                    ))}
                  </div>
                )}

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-gray-500">No products found. Try adjusting your filters.</p>
                    <Link href="/"><button className="mt-4 bg-[#2874f0] text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700">Back to Home</button></Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="bg-[#172337] text-gray-300 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {[
              { title: "ABOUT", links: ["Contact Us", "About Us", "Careers", "Press"] },
              { title: "HELP", links: ["Payments", "Shipping", "Return Policy", "FAQ"] },
              { title: "POLICY", links: ["Cancellation & Returns", "Terms of Use", "Privacy", "Grievance"] },
              { title: "SOCIAL", links: ["Facebook", "Twitter", "YouTube", "Instagram"] },
            ].map((s) => (
              <div key={s.title}>
                <h4 className="text-white font-semibold mb-3 text-sm">{s.title}</h4>
                <ul className="space-y-1.5">{s.links.map((l) => <li key={l} className="text-xs text-gray-400 hover:text-white cursor-pointer">{l}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-600 pt-4 text-center text-xs text-gray-500">
            © 2025 Flipkart Clone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
