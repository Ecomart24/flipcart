import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { ChevronLeft, ChevronRight, TrendingUp, Zap, Gift, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products, banners, categories } from "@/data/products";

export default function Home() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const searchQuery = params.get("search") || "";
  const categoryFilter = params.get("category") || "";

  const [currentBanner, setCurrentBanner] = useState(0);
  const [query, setQuery] = useState(searchQuery);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      query === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (q: string) => {
    setQuery(q);
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("search", q);
    else url.searchParams.delete("search");
    url.searchParams.delete("category");
    window.history.pushState({}, "", url.pathname + url.search);
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar onSearch={handleSearch} searchQuery={query} />

      {/* Hero Banner */}
      {!searchQuery && !categoryFilter && (
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="relative rounded-lg overflow-hidden" data-testid="hero-banner">
            <div className={`bg-gradient-to-r ${banners[currentBanner].bg} h-48 md:h-64 flex items-center justify-center text-white relative`}>
              <div className="text-center z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-2">{banners[currentBanner].title}</h2>
                <p className="text-lg md:text-xl opacity-90 mb-4">{banners[currentBanner].subtitle}</p>
                <button className="bg-white text-blue-700 font-semibold px-6 py-2 rounded-full hover:bg-blue-50 transition-colors">
                  {banners[currentBanner].cta}
                </button>
              </div>
              {/* Decorative circles */}
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10" />
            </div>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBanner(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? "bg-white w-6" : "bg-white/50"}`}
                  data-testid={`button-banner-dot-${i}`}
                />
              ))}
            </div>
            {/* Arrows */}
            <button
              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-1.5 transition-colors"
              data-testid="button-banner-prev"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-1.5 transition-colors"
              data-testid="button-banner-next"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { icon: <Truck className="w-5 h-5 text-blue-600" />, title: "Free Delivery", sub: "On orders above ₹499" },
              { icon: <Zap className="w-5 h-5 text-orange-500" />, title: "Quick Delivery", sub: "2-day delivery" },
              { icon: <TrendingUp className="w-5 h-5 text-green-600" />, title: "Best Price", sub: "Price guaranteed" },
              { icon: <Gift className="w-5 h-5 text-purple-600" />, title: "Offers & Deals", sub: "Upto 80% off" },
            ].map((badge) => (
              <div key={badge.title} className="bg-white rounded p-3 flex items-center gap-3 shadow-sm">
                <div className="flex-shrink-0">{badge.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{badge.title}</p>
                  <p className="text-xs text-gray-500">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Category chips */}
          <div className="mt-4 bg-white rounded shadow-sm p-4">
            <h2 className="text-base font-bold text-gray-800 mb-3">Shop by Category</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  data-testid={`link-cat-chip-${cat.name.toLowerCase()}`}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
                    {cat.icon}
                  </div>
                  <span className="text-xs text-gray-700 text-center whitespace-nowrap">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-3 py-4">
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800" data-testid="text-section-title">
              {categoryFilter
                ? `${categoryFilter} (${filteredProducts.length})`
                : searchQuery
                ? `Search Results for "${searchQuery}" (${filteredProducts.length})`
                : "Best of Electronics"}
            </h2>
            {(categoryFilter || searchQuery) && (
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                Clear filter
              </Link>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16" data-testid="text-no-results">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try searching for something else</p>
              <Link href="/">
                <button className="mt-4 bg-[#2874f0] text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                  Browse All Products
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#172337] text-gray-300 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">ABOUT</h4>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="hover:text-white cursor-pointer">Contact Us</li>
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">Careers</li>
                <li className="hover:text-white cursor-pointer">Press</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">HELP</h4>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="hover:text-white cursor-pointer">Payments</li>
                <li className="hover:text-white cursor-pointer">Shipping</li>
                <li className="hover:text-white cursor-pointer">Return Policy</li>
                <li className="hover:text-white cursor-pointer">FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">CONSUMER POLICY</h4>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="hover:text-white cursor-pointer">Cancellation & Returns</li>
                <li className="hover:text-white cursor-pointer">Terms of Use</li>
                <li className="hover:text-white cursor-pointer">Privacy</li>
                <li className="hover:text-white cursor-pointer">Grievance Redressal</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">SOCIAL</h4>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="hover:text-white cursor-pointer">Facebook</li>
                <li className="hover:text-white cursor-pointer">Twitter</li>
                <li className="hover:text-white cursor-pointer">YouTube</li>
                <li className="hover:text-white cursor-pointer">Instagram</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-4 text-center text-xs text-gray-500">
            © 2025 Flipkart Clone Demo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
