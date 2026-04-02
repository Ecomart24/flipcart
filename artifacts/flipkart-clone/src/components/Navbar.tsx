import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User, MapPin, ChevronDown, Menu, X } from "lucide-react";
import { useCart } from "@/store/cartStore";
import { categories } from "@/data/products";

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export default function Navbar({ onSearch, searchQuery = "" }: NavbarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { count } = useCart();
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearch);
    } else {
      setLocation(`/?search=${encodeURIComponent(localSearch)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 py-2">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold italic text-white" data-testid="logo">
                Flipkart
              </span>
              <span className="text-[10px] text-yellow-300 flex items-center gap-0.5">
                <span className="italic">Explore</span>
                <span className="not-italic">Plus</span>
                <span className="text-yellow-300">+</span>
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl" data-testid="search-form">
            <div className="flex items-center bg-white rounded overflow-hidden">
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search for products, brands and more"
                className="flex-1 px-4 py-2 text-gray-800 text-sm outline-none"
                data-testid="input-search"
              />
              <button
                type="submit"
                className="bg-[#2874f0] px-4 py-2 hover:bg-blue-700 transition-colors"
                data-testid="button-search"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>

          {/* Right Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" data-testid="link-login">
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-200 transition-colors">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Login</span>
              </div>
            </Link>
            <Link href="/cart" data-testid="link-cart">
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-200 transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm font-medium">Cart</span>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" data-testid="cart-count">
                    {count}
                  </span>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-1 text-sm cursor-pointer hover:text-yellow-200 transition-colors">
              <span>Become a Seller</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-sm cursor-pointer hover:text-yellow-200 transition-colors">
              <span>More</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/cart" data-testid="link-cart-mobile" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="button-mobile-menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div className="hidden md:block border-t border-blue-500">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex items-center gap-8 overflow-x-auto py-1.5 text-sm whitespace-nowrap">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center gap-1 text-white hover:text-yellow-200 transition-colors py-0.5 cursor-pointer"
                data-testid={`link-category-${cat.name.toLowerCase()}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1a5fd4] px-4 py-3 flex flex-col gap-3">
          <Link href="/login" className="flex items-center gap-2 text-sm" data-testid="link-login-mobile">
            <User className="w-4 h-4" />
            <span>Login</span>
          </Link>
          <Link href="/?category=Mobiles" className="text-sm" onClick={() => setMobileMenuOpen(false)}>Mobiles</Link>
          <Link href="/?category=Laptops" className="text-sm" onClick={() => setMobileMenuOpen(false)}>Laptops</Link>
          <Link href="/?category=Electronics" className="text-sm" onClick={() => setMobileMenuOpen(false)}>Electronics</Link>
          <Link href="/?category=TVs" className="text-sm" onClick={() => setMobileMenuOpen(false)}>TVs</Link>
        </div>
      )}
    </header>
  );
}
