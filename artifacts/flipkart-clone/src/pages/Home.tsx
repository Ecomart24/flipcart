import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Star,
  Tag,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products, subCategories } from "@/data/products";
import { addToCart } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating: High to Low", value: "rating" },
  { label: "Discount: High to Low", value: "discount" },
];

const PRICE_RANGES = [
  { label: "Under Rs.200", min: 0, max: 200 },
  { label: "Rs.200 - Rs.350", min: 200, max: 350 },
  { label: "Rs.350 - Rs.500", min: 350, max: 500 },
  { label: "Above Rs.500", min: 500, max: Infinity },
];

const TICKER_TEXT =
  "MIN 70% OFF ON FASHION  -  EXTRA Rs.5000 OFF ON MOBILES  -  UP TO 80% OFF ON APPLIANCES  -  TOP BRANDS AT LOWEST PRICES  -  FREE DELIVERY ON ALL ORDERS  -  BIG BILLION DAYS SALE IS LIVE  -  UP TO 90% OFF ON ELECTRONICS  -";

const HERO_SLIDES = [
  {
    titleTop: "Extra Rs.5000",
    titleBottom: "OFF Mobiles",
    subtitle: "No Cost EMI - Exchange Offer - Bank Discounts",
    cta: "Shop Mobiles",
    bg: "from-[#003a78] via-[#0d5fc4] to-[#2e77e5]",
    href: "/?category=Mobiles",
  },
  {
    titleTop: "Top Deals",
    titleBottom: "ON Electronics",
    subtitle: "Lowest prices from top brands for limited time",
    cta: "Explore Electronics",
    bg: "from-[#00448f] via-[#176bd1] to-[#5294f8]",
    href: "/?category=Electronics",
  },
  {
    titleTop: "Up To 70% Off",
    titleBottom: "On Fashion",
    subtitle: "Trending styles, ethnic wear and daily essentials",
    cta: "Shop Fashion",
    bg: "from-[#044a96] via-[#1d73d5] to-[#64a3ff]",
    href: "/?category=Fashion",
  },
];

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0"));
}

function SaleBadge({ pct }: { pct: number }) {
  return (
    <div className="absolute top-2 right-2 z-10 rounded bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight text-white">
      <div className="text-[9px] font-semibold">SALE</div>
      <div className="text-[11px] font-extrabold">{pct}%</div>
      <div className="text-[9px]">OFF</div>
    </div>
  );
}

function DealCard({ product }: { product: typeof products[0] }) {
  const { toast } = useToast();

  return (
    <div className="flex h-full flex-col bg-white">
      <Link href={`/product/${product.id}`}>
        <div className="relative flex h-52 cursor-pointer items-center justify-center overflow-hidden bg-white px-4">
          <SaleBadge pct={product.discount} />
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop";
            }}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 pt-2">
        <Link href={`/product/${product.id}`}>
          <p className="mb-2 min-h-[2.8rem] cursor-pointer line-clamp-2 text-[13px] text-gray-700 hover:text-blue-600">
            {product.name}
          </p>
        </Link>

        <div className="mb-2 flex items-center gap-1">
          <span className="flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">
            {product.rating}
            <Star className="h-2.5 w-2.5 fill-white" />
          </span>
          <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="mb-3 flex flex-wrap items-baseline gap-1.5">
          <span className="text-xl font-bold text-gray-900">Rs.{product.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">Rs.{product.originalPrice.toLocaleString()}</span>
          <span className="text-xs font-semibold text-green-600">{product.discount}% off</span>
        </div>

        <button
          onClick={() => {
            addToCart(product);
            toast({ title: "Added to Cart", description: product.name });
          }}
          className="mt-auto flex items-center justify-center gap-1 rounded bg-[#ff9f00] py-2 text-xs font-semibold text-white transition-colors hover:bg-[#f39200]"
        >
          <ShoppingCart className="h-3 w-3" />
          Add to Cart
        </button>
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

  const [hh, mm, ss] = useCountdown(7 * 3600 + 59 * 60 + 53);
  const isHome = !searchQuery && !categoryFilter;

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setActiveSubCat(subCatFilter);
  }, [subCatFilter]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (nextQuery: string) => {
    setQuery(nextQuery);
    const url = new URL(window.location.href);

    if (nextQuery) {
      url.searchParams.set("search", nextQuery);
    } else {
      url.searchParams.delete("search");
    }

    url.searchParams.delete("category");
    url.searchParams.delete("sub");
    window.history.pushState({}, "", url.pathname + url.search);
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const matchSearch =
        query === "" ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        (product.subCategory || "").toLowerCase().includes(query.toLowerCase());

      const matchCategory =
        categoryFilter === "" ||
        product.category === categoryFilter ||
        (categoryFilter === "Fashion" && product.category === "Fashion") ||
        (categoryFilter === "Cosmetics" && product.category === "Cosmetics");

      const matchSubCategory = activeSubCat === "" || product.subCategory === activeSubCat;
      const matchPrice = !priceRange || (product.price >= priceRange.min && product.price <= priceRange.max);
      const matchRating = !selectedRating || product.rating >= selectedRating;

      return matchSearch && matchCategory && matchSubCategory && matchPrice && matchRating;
    });

    switch (sortBy) {
      case "price_asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "discount":
        list = [...list].sort((a, b) => b.discount - a.discount);
        break;
      default:
        break;
    }

    return list;
  }, [query, categoryFilter, activeSubCat, priceRange, selectedRating, sortBy]);

  const dealsProducts = useMemo(
    () => products.filter((product) => product.brand === "Flipkart Sale"),
    [],
  );
  const heroShowcaseProducts = useMemo(
    () => products.filter((product) => ["Mobiles", "Electronics", "Laptops"].includes(product.category)).slice(0, 3),
    [],
  );

  const showSidebar = categoryFilter === "Fashion" || categoryFilter === "Cosmetics";
  const subs = subCategories[categoryFilter] || [];
  const activeSlide = HERO_SLIDES[currentBanner % HERO_SLIDES.length];

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar onSearch={handleSearch} searchQuery={query} />

      {isHome && (
        <>
          <div className="mx-auto w-full max-w-[1540px] px-3 pt-3">
            <div className="overflow-hidden rounded-md border border-blue-200 shadow-md" data-testid="hero-banner">
              <div className="overflow-hidden bg-[#ff6a00] py-1 text-white">
                <div className="flex whitespace-nowrap text-xs font-bold uppercase tracking-wide">
                  {[...Array(3)].map((_, idx) => (
                    <span key={idx} className="shrink-0 px-6">
                      {TICKER_TEXT}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`relative h-[270px] md:h-[320px] bg-gradient-to-r ${activeSlide.bg}`}>
                <div className="absolute left-6 top-1/2 z-10 -translate-y-1/2 md:left-12">
                  <div className="mb-4 inline-flex rounded-full bg-[#ffd400] px-4 py-1 text-xs font-extrabold uppercase tracking-wide text-[#1f2b3d]">
                    Flash Sale
                  </div>
                  <h2 className="mb-2 text-5xl font-extrabold leading-none text-white md:text-7xl">
                    <span className="block">{activeSlide.titleTop}</span>
                    <span className="block text-[#7de7ff]">{activeSlide.titleBottom}</span>
                  </h2>
                  <p className="text-2xl text-blue-100 md:text-3xl">{activeSlide.subtitle}</p>
                  <Link href={activeSlide.href}>
                    <button className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#145dbf] transition-colors hover:bg-[#eef5ff]">
                      {activeSlide.cta}
                    </button>
                  </Link>
                </div>

                <div className="absolute right-14 top-1/2 z-10 hidden -translate-y-1/2 items-end gap-4 lg:flex">
                  {heroShowcaseProducts.map((product, idx) => {
                    const rotate = idx === 0 ? "-rotate-6" : idx === 1 ? "rotate-2" : "-rotate-2";
                    return (
                      <div
                        key={product.id}
                        className={`relative w-40 rounded-2xl bg-white p-3 shadow-2xl ${rotate}`}
                      >
                        <div className="mb-2 h-32 overflow-hidden rounded-lg bg-gray-100">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <p className="line-clamp-1 text-xs font-semibold text-gray-800">{product.brand}</p>
                        <p className="text-sm font-extrabold text-red-600">
                          Rs.{(product.originalPrice - product.price).toLocaleString()} OFF
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pointer-events-none absolute -left-8 top-6 h-20 w-20 rounded-full bg-white/15" />
                <div className="pointer-events-none absolute right-8 top-12 h-10 w-10 rounded-full bg-white/15" />
                <div className="pointer-events-none absolute bottom-8 right-40 h-14 w-14 rounded-full bg-white/12" />

                <button
                  onClick={() =>
                    setCurrentBanner((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                  }
                  className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-[#0d3f7b]/70 p-2 text-white transition-colors hover:bg-[#0d3f7b]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentBanner((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-[#0d3f7b]/70 p-2 text-white transition-colors hover:bg-[#0d3f7b]"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
                  {HERO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentBanner === idx ? "w-7 bg-white" : "w-2 bg-white/55"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mb-8 mt-3 w-full max-w-[1540px] px-3">
            <section className="overflow-hidden rounded-md border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-[#2874f0]" />
                    <h2 className="text-4xl font-extrabold text-gray-900">Deals of the Day</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-500">Ends in</span>
                    {[hh, mm, ss].map((part, idx) => (
                      <span key={idx} className="flex items-center">
                        <span className="min-w-[2.1rem] rounded bg-[#1f2742] px-2 py-1 text-center font-mono text-sm font-bold text-white">
                          {part}
                        </span>
                        {idx < 2 && <span className="mx-1 font-bold text-[#1f2742]">:</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href="/?category=Fashion"
                  className="rounded border border-blue-200 px-3 py-1.5 text-sm font-semibold text-[#2874f0] transition-colors hover:bg-blue-50"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-3 lg:grid-cols-6">
                {dealsProducts.map((product) => (
                  <DealCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      {!isHome && (
        <div className="mx-auto max-w-7xl px-3 py-4">
          <div className="flex gap-4">
            {showSidebar && (
              <aside className="hidden w-56 shrink-0 md:block">
                <div className="sticky top-20 rounded bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-800">Filters</h3>

                  {subs.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-bold uppercase text-gray-500">Category</p>
                      <div className="max-h-52 space-y-1 overflow-y-auto">
                        <button
                          onClick={() => setActiveSubCat("")}
                          className={`block w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                            activeSubCat === ""
                              ? "bg-blue-50 font-semibold text-blue-600"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          All
                        </button>
                        {subs.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setActiveSubCat(sub)}
                            className={`block w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                              activeSubCat === sub
                                ? "bg-blue-50 font-semibold text-blue-600"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="mb-2 text-xs font-bold uppercase text-gray-500">Price Range</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => setPriceRange(null)}
                        className={`block w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                          !priceRange
                            ? "bg-blue-50 font-semibold text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        All Prices
                      </button>
                      {PRICE_RANGES.map((range) => (
                        <button
                          key={range.label}
                          onClick={() => setPriceRange({ min: range.min, max: range.max })}
                          className={`block w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                            priceRange?.min === range.min && priceRange?.max === range.max
                              ? "bg-blue-50 font-semibold text-blue-600"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase text-gray-500">Customer Rating</p>
                    <div className="space-y-1">
                      {[4, 3].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                          className={`flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                            selectedRating === rating
                              ? "bg-blue-50 font-semibold text-blue-600"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {rating} and above
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            <div className="flex-1">
              <div className="rounded bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {categoryFilter
                        ? `${categoryFilter}${activeSubCat ? ` > ${activeSubCat}` : ""}`
                        : `Results for "${query}"`}
                    </h2>
                    <p className="text-xs text-gray-500">{filteredProducts.length} products found</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded border bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
                      data-testid="select-sort"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {(categoryFilter || searchQuery) && (
                      <Link href="/" className="flex items-center gap-0.5 text-xs text-blue-600 hover:underline">
                        <X className="h-3 w-3" />
                        Clear
                      </Link>
                    )}
                  </div>
                </div>

                {showSidebar && subs.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-100 pb-3">
                    <button
                      onClick={() => setActiveSubCat("")}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        activeSubCat === ""
                          ? "border-[#2874f0] bg-[#2874f0] text-white"
                          : "border-gray-300 text-gray-600 hover:border-blue-400"
                      }`}
                    >
                      All
                    </button>
                    {subs.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setActiveSubCat(activeSubCat === sub ? "" : sub)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          activeSubCat === sub
                            ? "border-[#2874f0] bg-[#2874f0] text-white"
                            : "border-gray-300 text-gray-600 hover:border-blue-400"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}

                {filteredProducts.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mb-4 text-5xl">No products</div>
                    <p className="text-gray-500">Try adjusting your filters.</p>
                    <Link href="/">
                      <button className="mt-4 rounded bg-[#2874f0] px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        Back to Home
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 bg-[#172337] text-gray-300">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { title: "ABOUT", links: ["Contact Us", "About Us", "Careers", "Press"] },
              { title: "HELP", links: ["Payments", "Shipping", "Return Policy", "FAQ"] },
              { title: "POLICY", links: ["Cancellation & Returns", "Terms of Use", "Privacy", "Grievance"] },
              { title: "SOCIAL", links: ["Facebook", "Twitter", "YouTube", "Instagram"] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="mb-3 text-sm font-semibold text-white">{section.title}</h4>
                <ul className="space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link} className="cursor-pointer text-xs text-gray-400 hover:text-white">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-600 pt-4 text-center text-xs text-gray-500">
            Copyright 2026 Flipkart Clone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
