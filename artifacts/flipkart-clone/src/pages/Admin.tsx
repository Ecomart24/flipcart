import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { RefreshCw, ArrowLeft, Lock, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Order,
  ORDER_STORAGE_KEY,
  ORDER_UPDATED_EVENT,
  getOrderStats,
  getOrders,
} from "@/store/orderStore";

const ADMIN_ID = "flipc";
const ADMIN_PASSWORD = "Noida1254";
const ADMIN_SESSION_KEY = "fk_admin_auth";

function formatPayment(order: Order): string {
  if (order.payment.type === "card") {
    return order.payment.cardMasked || `Card **** ${order.payment.cardLast4 || "XXXX"}`;
  }
  if (order.payment.type === "upi") {
    return order.payment.upiIdMasked ? `UPI ${order.payment.upiIdMasked}` : "UPI Masked";
  }
  if (order.payment.type === "netbanking") {
    return order.payment.bank ? `Net Banking (${order.payment.bank})` : "Net Banking";
  }
  return "Cash on Delivery";
}

function maskPhone(phone: string): string {
  if (phone.length < 4) return "XXXX";
  return `XXXXXX${phone.slice(-4)}`;
}

function getStatusClasses(status: Order["status"]): string {
  if (status === "Paid") return "bg-green-100 text-green-700 border-green-200";
  if (status === "COD") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "Pending") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (status === "Refunded") return "bg-purple-100 text-purple-700 border-purple-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const stats = useMemo(() => getOrderStats(orders), [orders]);

  const reloadOrders = () => setOrders(getOrders());

  useEffect(() => {
    if (!isAuthenticated) return;

    const syncOrders = () => setOrders(getOrders());
    syncOrders();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ORDER_STORAGE_KEY) syncOrders();
    };
    const handleOrdersUpdated = () => syncOrders();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") syncOrders();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(ORDER_UPDATED_EVENT, handleOrdersUpdated as EventListener);
    window.addEventListener("focus", syncOrders);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const pollingId = window.setInterval(syncOrders, 2000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(ORDER_UPDATED_EVENT, handleOrdersUpdated as EventListener);
      window.removeEventListener("focus", syncOrders);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(pollingId);
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (adminId === ADMIN_ID && adminPassword === ADMIN_PASSWORD) {
      setLoginError("");
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      } catch {}
      reloadOrders();
      return;
    }
    setLoginError("Invalid admin ID or password.");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminId("");
    setAdminPassword("");
    reloadOrders();
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <Navbar />
        <main className="max-w-md mx-auto px-3 py-10">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Sign In</h1>
              <p className="text-sm text-gray-500 mt-1">Enter admin ID and password to access purchase history.</p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Admin ID</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value.trim())}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter admin ID"
                  data-testid="input-admin-id"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter password"
                  data-testid="input-admin-password"
                />
              </div>

              {loginError && <p className="text-sm text-red-600">{loginError}</p>}

              <button
                type="submit"
                className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-semibold py-2.5 rounded transition-colors"
                data-testid="button-admin-login"
              >
                Sign In
              </button>
            </form>

            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Track purchase history and masked payment records</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Link>
              <button
                onClick={reloadOrders}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                data-testid="button-admin-refresh"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                data-testid="button-admin-logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Orders</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Paid</p>
            <p className="text-xl font-bold text-green-700">{stats.paidOrders}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">COD</p>
            <p className="text-xl font-bold text-blue-700">{stats.codOrders}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Revenue</p>
            <p className="text-xl font-bold text-gray-900">Rs {stats.totalRevenue.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Customers</p>
            <p className="text-xl font-bold text-gray-900">{stats.uniqueCustomers}</p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Purchase History</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No orders found yet. Place a checkout order to see purchase records here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Order</th>
                    <th className="text-left px-4 py-3 font-semibold">Customer</th>
                    <th className="text-left px-4 py-3 font-semibold">Items</th>
                    <th className="text-left px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Payment Method</th>
                    <th className="text-left px-4 py-3 font-semibold">Masked OTP</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{order.orderId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.placedAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.address.name}</p>
                        <p className="text-xs text-gray-500">{maskPhone(order.address.phone)}</p>
                        <p className="text-xs text-gray-500">{order.address.city}, {order.address.state}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">Rs {order.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-gray-700">{formatPayment(order)}</td>
                      <td className="px-4 py-3 text-gray-700">{order.payment.otpMasked || "Not required"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(order.status)}`}
                          data-testid={`status-${order.orderId}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
