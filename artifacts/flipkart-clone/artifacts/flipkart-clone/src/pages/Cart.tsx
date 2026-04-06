import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, Tag, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/store/cartStore";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, count } = useCart();

  const savings = items.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
  const deliveryCharge = total > 499 ? 0 : 40;
  const finalAmount = total + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center" data-testid="cart-empty">
          <ShoppingBag className="w-24 h-24 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty!</h2>
          <p className="text-gray-400 mb-6">Add items to it now.</p>
          <Link href="/">
            <button className="bg-[#2874f0] text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 transition-colors" data-testid="button-shop-now">
              Shop Now
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-3">
            <div className="bg-white rounded shadow-sm p-4">
              <h1 className="text-lg font-bold text-gray-800 mb-1" data-testid="text-cart-title">
                My Cart ({count} {count === 1 ? "item" : "items"})
              </h1>
              <p className="text-xs text-gray-500">Select All Items</p>
            </div>

            {items.map((item) => (
              <div key={item.id} className="bg-white rounded shadow-sm p-4" data-testid={`cart-item-${item.id}`}>
                <div className="flex gap-4">
                  <Link href={`/product/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-contain bg-gray-50 rounded cursor-pointer hover:opacity-90 transition-opacity"
                      data-testid={`img-cart-${item.id}`}
                    />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/product/${item.id}`}>
                      <h3 className="text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer line-clamp-2 mb-1" data-testid={`text-cart-name-${item.id}`}>
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mb-2">{item.brand}</p>

                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-base font-bold text-gray-900" data-testid={`text-cart-price-${item.id}`}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{(item.originalPrice * item.quantity).toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-green-600">{item.discount}% off</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold" data-testid={`text-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div className="bg-white rounded shadow-sm p-4">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Apply Coupon"
                  className="flex-1 text-sm outline-none text-gray-700"
                  data-testid="input-coupon"
                />
                <button className="text-[#2874f0] font-semibold text-sm hover:text-blue-700" data-testid="button-apply-coupon">
                  APPLY
                </button>
              </div>
            </div>
          </div>

          {/* Price Details */}
          <div className="md:col-span-1">
            <div className="bg-white rounded shadow-sm p-4 sticky top-20" data-testid="price-summary">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
                Price Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({count} items)</span>
                  <span data-testid="text-price-total">₹{items.reduce((sum, i) => sum + i.originalPrice * i.quantity, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span data-testid="text-savings">- ₹{savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className={deliveryCharge === 0 ? "text-green-600" : ""} data-testid="text-delivery-charge">
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3 mt-1">
                  <span>Total Amount</span>
                  <span data-testid="text-final-amount">₹{finalAmount.toLocaleString()}</span>
                </div>
                <p className="text-green-600 text-xs font-medium">
                  You will save ₹{savings.toLocaleString()} on this order
                </p>
              </div>

              <Link href="/checkout">
                <button
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
                  data-testid="button-place-order"
                >
                  PLACE ORDER
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>

              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
                <span>Safe and Secure Payments. Easy returns.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
