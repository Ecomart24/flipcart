import { useState, useEffect, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { ChevronLeft, ChevronRight, TrendingUp, Zap, Gift, Truck, SlidersHorizontal, X, ChevronDown, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products, banners, categories, subCategories, Product } from "@/data/products";

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating: High to Low", value: "rating" },
  { label: "Newest First", value: "newest" },
  { label: "Discount: High to Low", value: "discount" },
];

const PRICE_RANGES = [
  { label: "Under ₹200", min: 0, max: 200 },
  { label: "₹200 – ₹350", min: 200, max: 350 },
  { label: "₹350 – ₹500", min: 350, max: 500 },
  { label: "Above ₹500", min: 500, max: Infinity },
];

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
  const [showFilter, setShowFilter] = useState(false);
  const [activeSubCat, setActiveSubCat] = useState(subCatFilter);

  useEffect(() => { setQuery(searchQuery); }, [searchQuery]);
  useEffect(() => { setActiveSubCat(subCatFilter); }, [subCatFilter]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentBanner((p) => (p + 1) % banners.length), 4000);
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
      const matchesSearch = query === "" || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()) || (p.subCategory || "").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
      const matchesSub = activeSubCat === "" || p.subCategory === activeSubCat;
      const matchesPrice = !priceRange || (p.price >= priceRange.min && p.price <= priceRange.max);
      const matchesRating = !selectedRating || p.rating >= selectedRating;
      return matchesSearch && matchesCategory && matchesSub && matchesPrice && matchesRating;
    });

    switch (sortBy) {
      case "price_asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price_desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "discount": list = [...list].sort((a, b) => b.discount - a.discount); break;
      case "newest": list = [...list].sort((a, b) => b.id - a.id); break;
    }
    return list;
  }, [query, categoryFilter, activeSubCat, priceRange, selectedRating, sortBy]);

  const showSidebar = categoryFilter === "Fashion" || categoryFilter === "Cosmetics";
  const subs = subCategories[categoryFilter] || [];

  const fashionProducts = products.filter((p) => p.category === "Fashion").slice(0, 12);
  const cosmeticsProducts = products.filter((p) => p.category === "Cosmetics").slice(0, 12);
  const isHome = !searchQuery && !categoryFilter;

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar onSearch={handleSearch} searchQuery={query} />

      {isHome && (
        <>
          {/* Hero Banner */}
          <div className="max-w-7xl mx-auto px-3 pt-4">
            <div className="relative rounded-lg overflow-hidden" data-testid="hero-banner">
              <div className={`bg-gradient-to-r ${banners[currentBanner].bg} h-52 md:h-72 flex items-center justify-center text-white relative`}>
                <div className="text-center z-10 px-4">
                  <h2 className="text-3xl md:text-5xl font-bold mb-2">{banners[currentBanner].title}</h2>
                  <p className="text-lg md:text-xl opacity-90 mb-4">{banners[currentBanner].subtitle}</p>
                  <button className="bg-white text-blue-700 font-semibold px-6 py-2 rounded-full hover:bg-blue-50 transition-colors">{banners[currentBanner].cta}</button>
                </div>
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10" />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBanner(i)} className={`h-2 rounded-full transition-all ${i === currentBanner ? "bg-white w-6" : "bg-white/50 w-2"}`} />
                ))}
              </div>
              <button onClick={() => setCurrentBanner((p) => (p - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-1.5 transition-colors"><ChevronLeft className="w-5 h-5 text-white" /></button>
              <button onClick={() => setCurrentBanner((p) => (p + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-1.5 transition-colors"><ChevronRight className="w-5 h-5 text-white" /></button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { icon: <Truck className="w-5 h-5 text-blue-600" />, title: "Free Delivery", sub: "On orders above ₹499" },
                { icon: <Zap className="w-5 h-5 text-orange-500" />, title: "Quick Delivery", sub: "2-day delivery" },
                { icon: <TrendingUp className="w-5 h-5 text-green-600" />, title: "Best Price", sub: "Price guaranteed" },
                { icon: <Gift className="w-5 h-5 text-purple-600" />, title: "Offers & Deals", sub: "Upto 80% off" },
              ].map((b) => (
                <div key={b.title} className="bg-white rounded p-3 flex items-center gap-3 shadow-sm">
                  <div className="flex-shrink-0">{b.icon}</div>
                  <div><p className="text-sm font-semibold text-gray-800">{b.title}</p><p className="text-xs text-gray-500">{b.sub}</p></div>
                </div>
              ))}
            </div>

            {/* Category chips */}
            <div className="mt-4 bg-white rounded shadow-sm p-4">
              <h2 className="text-base font-bold text-gray-800 mb-3">Shop by Category</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <Link key={cat.name} href={`/?category=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-2xl">{cat.icon}</div>
                    <span className="text-xs text-gray-700 text-center whitespace-nowrap">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Fashion Section */}
          <div className="max-w-7xl mx-auto px-3 mt-4">
            <div className="bg-white rounded shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">👗 Women's Fashion</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Kurtas, Sarees, Dresses & more from ₹149</p>
                </div>
                <Link href="/?category=Fashion" className="text-sm text-[#2874f0] font-semibold hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {fashionProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>

          {/* Cosmetics Banner strip */}
          <div className="max-w-7xl mx-auto px-3 mt-4">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-6 text-white flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Beauty Deals</p>
                <h3 className="text-2xl font-bold mb-1">💄 Cosmetics up to 70% off</h3>
                <p className="text-sm opacity-90">Lipsticks, Foundations, Skincare & more</p>
              </div>
              <Link href="/?category=Cosmetics">
                <button className="bg-white text-pink-600 font-bold px-5 py-2 rounded-full text-sm hover:bg-pink-50 transition-colors flex-shrink-0">Shop Now</button>
              </Link>
            </div>
          </div>

          {/* Cosmetics Section */}
          <div className="max-w-7xl mx-auto px-3 mt-4">
            <div className="bg-white rounded shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">💄 Ladies Cosmetics</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Lipsticks, Skincare, Hair Care & more from ₹99</p>
                </div>
                <Link href="/?category=Cosmetics" className="text-sm text-[#2874f0] font-semibold hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {cosmeticsProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>

          {/* Electronics */}
          <div className="max-w-7xl mx-auto px-3 mt-4 mb-8">
            <div className="bg-white rounded shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">⚡ Electronics & Gadgets</h2>
                <Link href="/?category=Mobiles" className="text-sm text-[#2874f0] font-semibold hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.filter((p) => ["Mobiles","Laptops","Electronics","TVs","Tablets","Cameras"].includes(p.category)).slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Category / Search Results Page */}
      {!isHome && (
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="flex gap-4">
            {/* Sidebar filters */}
            {showSidebar && (
              <aside className="hidden md:block w-56 flex-shrink-0">
                <div className="bg-white rounded shadow-sm p-4 sticky top-20">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Filters</h3>

                  {/* Sub-categories */}
                  {subs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Category</p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        <button onClick={() => setActiveSubCat("")} className={`block w-full text-left text-xs px-2 py-1 rounded transition-colors ${activeSubCat === "" ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>All</button>
                        {subs.map((s) => (
                          <button key={s} onClick={() => setActiveSubCat(s)} className={`block w-full text-left text-xs px-2 py-1 rounded transition-colors ${activeSubCat === s ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price range */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Price Range</p>
                    <div className="space-y-1.5">
                      <button onClick={() => setPriceRange(null)} className={`block w-full text-left text-xs px-2 py-1 rounded transition-colors ${!priceRange ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>All Prices</button>
                      {PRICE_RANGES.map((r) => (
                        <button key={r.label} onClick={() => setPriceRange({ min: r.min, max: r.max })} className={`block w-full text-left text-xs px-2 py-1 rounded transition-colors ${priceRange?.min === r.min && priceRange?.max === r.max ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{r.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Customer Rating</p>
                    <div className="space-y-1.5">
                      {[4, 3].map((r) => (
                        <button key={r} onClick={() => setSelectedRating(selectedRating === r ? null : r)} className={`flex items-center gap-1.5 w-full text-left text-xs px-2 py-1 rounded transition-colors ${selectedRating === r ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{r}★ & above</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Main content */}
            <div className="flex-1">
              <div className="bg-white rounded shadow-sm p-4">
                {/* Header + Sort */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {categoryFilter
                        ? `${categoryFilter}${activeSubCat ? ` > ${activeSubCat}` : ""}`
                        : `Results for "${query}"`}
                    </h2>
                    <p className="text-xs text-gray-500">{filteredProducts.length} products found</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Mobile filter toggle */}
                    {showSidebar && (
                      <button onClick={() => setShowFilter(!showFilter)} className="md:hidden flex items-center gap-1 text-xs border rounded px-3 py-1.5 text-gray-600">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filters
                      </button>
                    )}
                    {/* Sort */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500 hidden sm:block">Sort by:</span>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 bg-white" data-testid="select-sort">
                        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    {(categoryFilter || searchQuery) && (
                      <Link href="/" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                        <X className="w-3 h-3" />Clear
                      </Link>
                    )}
                  </div>
                </div>

                {/* Active filters */}
                {(activeSubCat || priceRange || selectedRating) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {activeSubCat && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">{activeSubCat} <button onClick={() => setActiveSubCat("")}><X className="w-3 h-3" /></button></span>}
                    {priceRange && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">{priceRange.max === Infinity ? `₹${priceRange.min}+` : `₹${priceRange.min}–₹${priceRange.max}`} <button onClick={() => setPriceRange(null)}><X className="w-3 h-3" /></button></span>}
                    {selectedRating && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">{selectedRating}★+ <button onClick={() => setSelectedRating(null)}><X className="w-3 h-3" /></button></span>}
                  </div>
                )}

                {/* Mobile filter panel */}
                {showFilter && showSidebar && (
                  <div className="md:hidden mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {subs.slice(0, 8).map((s) => (
                        <button key={s} onClick={() => { setActiveSubCat(activeSubCat === s ? "" : s); setShowFilter(false); }} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeSubCat === s ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-category quick filter chips */}
                {showSidebar && subs.length > 0 && (
                  <div className="hidden md:flex gap-2 flex-wrap mb-4 pb-4 border-b border-gray-100">
                    <button onClick={() => setActiveSubCat("")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeSubCat === "" ? "bg-[#2874f0] text-white border-[#2874f0]" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}>All</button>
                    {subs.map((s) => (
                      <button key={s} onClick={() => setActiveSubCat(activeSubCat === s ? "" : s)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeSubCat === s ? "bg-[#2874f0] text-white border-[#2874f0]" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}>{s}</button>
                    ))}
                  </div>
                )}

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16" data-testid="text-no-results">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg">No products found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                    <Link href="/"><button className="mt-4 bg-[#2874f0] text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">Back to Home</button></Link>
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

      {/* Footer */}
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
            © 2025 Flipkart Clone Demo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
