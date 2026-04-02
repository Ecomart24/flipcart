import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  CheckCircle, MapPin, CreditCard, Smartphone, ChevronRight,
  Lock, ShieldCheck, Truck, Package, ArrowLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart, clearCart } from "@/store/cartStore";

type Step = "address" | "payment" | "otp";

interface Address {
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  address: string;
  addressType: "Home" | "Work" | "Other";
}

interface PaymentMethod {
  type: "upi" | "card" | "netbanking" | "cod";
  upiId?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
  cardName?: string;
  bank?: string;
}

const STATES = [
  "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala",
  "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal"
];

const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Yes Bank"];

export default function Checkout() {
  const { items, total } = useCart();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [completed, setCompleted] = useState<Step[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Step 1: Address
  const [address, setAddress] = useState<Address>({
    name: "", phone: "", pincode: "", city: "", state: "", address: "", addressType: "Home"
  });
  const [addressErrors, setAddressErrors] = useState<Partial<Address>>({});

  // Step 2: Payment
  const [payment, setPayment] = useState<PaymentMethod>({ type: "upi", upiId: "" });
  const [paymentError, setPaymentError] = useState("");

  // Step 3: OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const savings = items.reduce((sum, i) => sum + (i.originalPrice - i.price) * i.quantity, 0);
  const deliveryCharge = total > 499 ? 0 : 40;
  const finalAmount = total + deliveryCharge;

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "address", label: "Delivery Address", icon: <MapPin className="w-4 h-4" /> },
    { key: "payment", label: "Payment", icon: <CreditCard className="w-4 h-4" /> },
    { key: "otp", label: "OTP Verification", icon: <Smartphone className="w-4 h-4" /> },
  ];

  const validateAddress = () => {
    const errors: Partial<Address> = {};
    if (!address.name.trim()) errors.name = "Name is required";
    if (!/^\d{10}$/.test(address.phone)) errors.phone = "Enter valid 10-digit phone number";
    if (!/^\d{6}$/.test(address.pincode)) errors.pincode = "Enter valid 6-digit pincode";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.state) errors.state = "State is required";
    if (!address.address.trim()) errors.address = "Address is required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    if (payment.type === "upi") {
      if (!payment.upiId || !/^[\w.-]+@[\w.-]+$/.test(payment.upiId)) {
        setPaymentError("Enter a valid UPI ID (e.g. name@bank)");
        return false;
      }
    } else if (payment.type === "card") {
      if (!payment.cardNumber || payment.cardNumber.replace(/\s/g, "").length < 16) {
        setPaymentError("Enter a valid 16-digit card number");
        return false;
      }
      if (!payment.cardExpiry || !/^\d{2}\/\d{2}$/.test(payment.cardExpiry)) {
        setPaymentError("Enter expiry in MM/YY format");
        return false;
      }
      if (!payment.cardCVV || payment.cardCVV.length < 3) {
        setPaymentError("Enter valid CVV");
        return false;
      }
      if (!payment.cardName?.trim()) {
        setPaymentError("Enter card holder name");
        return false;
      }
    } else if (payment.type === "netbanking") {
      if (!payment.bank) {
        setPaymentError("Select a bank");
        return false;
      }
    }
    setPaymentError("");
    return true;
  };

  const handleAddressNext = () => {
    if (validateAddress()) {
      setCompleted([...completed, "address"]);
      setCurrentStep("payment");
      // Auto-send OTP info
      setOtpSent(false);
    }
  };

  const handlePaymentNext = () => {
    if (validatePayment()) {
      setCompleted([...completed, "payment"]);
      setCurrentStep("otp");
      setOtpSent(true);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }
    // Demo: accept any 6-digit OTP, or "123456" as the correct one
    setOtpVerifying(true);
    setTimeout(() => {
      setOtpVerifying(false);
      if (enteredOtp === "000000") {
        setOtpError("Invalid OTP. Please try again.");
      } else {
        clearCart();
        setOrderPlaced(true);
      }
    }, 1500);
  };

  const resendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpSent(true);
    document.getElementById("otp-0")?.focus();
  };

  const formatCard = (val: string) => {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    return val.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  };

  // Order success
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center" data-testid="order-success">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-500 mb-2">Your order has been placed and is being processed.</p>
            <p className="text-sm text-gray-400 mb-6">
              Order ID: <span className="font-semibold text-gray-700">FK{Date.now().toString().slice(-8)}</span>
            </p>

            {/* Order summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-700">Order Summary</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Delivery Address</span>
                  <span className="font-medium text-gray-800">{address.name}, {address.city}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="font-medium text-gray-800 capitalize">{payment.type === "upi" ? "UPI" : payment.type === "card" ? "Card" : payment.type === "netbanking" ? "Net Banking" : "Cash on Delivery"}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-blue-200 pt-2 mt-2">
                  <span>Total Paid</span>
                  <span>₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <Truck className="w-4 h-4 text-green-500" />
              <span>Expected delivery by <strong>{new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}</strong></span>
            </div>

            <Link href="/">
              <button className="bg-[#2874f0] text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 transition-colors" data-testid="button-continue-shopping">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty. Add some products first!</p>
          <Link href="/">
            <button className="bg-[#2874f0] text-white px-6 py-2 rounded font-semibold">Shop Now</button>
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
          {/* Left: Steps */}
          <div className="md:col-span-2 space-y-3">
            {/* Stepper */}
            <div className="bg-white rounded shadow-sm p-4">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const isCompleted = completed.includes(step.key);
                  const isCurrent = currentStep === step.key;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center" data-testid={`step-${step.key}`}>
                      <div className="flex items-center w-full">
                        {/* Line before */}
                        {index > 0 && (
                          <div className={`flex-1 h-0.5 ${isCompleted || completed.includes(steps[index - 1].key) ? "bg-[#2874f0]" : "bg-gray-200"}`} />
                        )}
                        {/* Circle */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted ? "bg-[#2874f0] text-white" :
                          isCurrent ? "bg-[#2874f0] text-white ring-4 ring-blue-100" :
                          "bg-gray-200 text-gray-400"
                        }`}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
                        </div>
                        {/* Line after */}
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 ${isCompleted ? "bg-[#2874f0]" : "bg-gray-200"}`} />
                        )}
                      </div>
                      <span className={`mt-2 text-xs font-medium text-center ${isCurrent || isCompleted ? "text-[#2874f0]" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 1: Address */}
            <div className={`bg-white rounded shadow-sm transition-all ${currentStep === "address" ? "block" : "hidden"}`} data-testid="step-address-content">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2874f0]" />
                <h2 className="text-base font-bold text-gray-800">Delivery Address</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      data-testid="input-name"
                    />
                    {addressErrors.name && <p className="text-red-500 text-xs mt-1">{addressErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "") })}
                      placeholder="10-digit mobile number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      data-testid="input-phone"
                    />
                    {addressErrors.phone && <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Address (House No, Street, Area) *</label>
                  <textarea
                    rows={2}
                    value={address.address}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    placeholder="House No., Building, Street, Area"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    data-testid="input-address"
                  />
                  {addressErrors.address && <p className="text-red-500 text-xs mt-1">{addressErrors.address}</p>}
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Pincode *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder="6-digit pincode"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      data-testid="input-pincode-checkout"
                    />
                    {addressErrors.pincode && <p className="text-red-500 text-xs mt-1">{addressErrors.pincode}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="City"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      data-testid="input-city"
                    />
                    {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">State *</label>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                      data-testid="select-state"
                    >
                      <option value="">Select State</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {addressErrors.state && <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Address Type</label>
                  <div className="flex gap-3">
                    {(["Home", "Work", "Other"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAddress({ ...address, addressType: type })}
                        className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                          address.addressType === type
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                        data-testid={`button-addr-type-${type.toLowerCase()}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddressNext}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded transition-colors flex items-center gap-2"
                  data-testid="button-address-continue"
                >
                  DELIVER HERE
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className={`bg-white rounded shadow-sm transition-all ${currentStep === "payment" ? "block" : "hidden"}`} data-testid="step-payment-content">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2874f0]" />
                <h2 className="text-base font-bold text-gray-800">Payment Method</h2>
                <Lock className="w-4 h-4 text-gray-400 ml-auto" />
                <span className="text-xs text-gray-400">100% Secure</span>
              </div>
              <div className="flex">
                {/* Payment options sidebar */}
                <div className="w-40 border-r border-gray-100 flex flex-col">
                  {[
                    { key: "upi", label: "UPI", icon: "🔄" },
                    { key: "card", label: "Credit/Debit Card", icon: "💳" },
                    { key: "netbanking", label: "Net Banking", icon: "🏦" },
                    { key: "cod", label: "Cash on Delivery", icon: "💰" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setPayment({ type: opt.key as PaymentMethod["type"] }); setPaymentError(""); }}
                      className={`text-left px-3 py-3 text-sm border-l-2 transition-all ${
                        payment.type === opt.key
                          ? "border-l-blue-500 bg-blue-50 text-blue-700 font-semibold"
                          : "border-l-transparent text-gray-600 hover:bg-gray-50"
                      }`}
                      data-testid={`button-payment-${opt.key}`}
                    >
                      <span className="mr-1">{opt.icon}</span>
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Payment form area */}
                <div className="flex-1 p-4">
                  {payment.type === "upi" && (
                    <div className="space-y-4" data-testid="payment-upi">
                      <p className="text-sm font-semibold text-gray-700">Pay with UPI</p>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">UPI ID *</label>
                        <input
                          type="text"
                          value={payment.upiId || ""}
                          onChange={(e) => setPayment({ ...payment, upiId: e.target.value })}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          data-testid="input-upi-id"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {["PhonePe", "Google Pay", "Paytm", "BHIM"].map((app) => (
                          <span key={app} className="border border-gray-200 rounded px-3 py-1 text-xs text-gray-600 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {payment.type === "card" && (
                    <div className="space-y-4" data-testid="payment-card">
                      <p className="text-sm font-semibold text-gray-700">Credit / Debit Card</p>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number *</label>
                        <input
                          type="text"
                          value={payment.cardNumber || ""}
                          onChange={(e) => setPayment({ ...payment, cardNumber: formatCard(e.target.value) })}
                          placeholder="0000 0000 0000 0000"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono tracking-wider"
                          data-testid="input-card-number"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry (MM/YY) *</label>
                          <input
                            type="text"
                            value={payment.cardExpiry || ""}
                            onChange={(e) => setPayment({ ...payment, cardExpiry: formatExpiry(e.target.value) })}
                            placeholder="MM/YY"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            data-testid="input-card-expiry"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">CVV *</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={payment.cardCVV || ""}
                            onChange={(e) => setPayment({ ...payment, cardCVV: e.target.value.replace(/\D/g, "") })}
                            placeholder="•••"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            data-testid="input-card-cvv"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Name on Card *</label>
                        <input
                          type="text"
                          value={payment.cardName || ""}
                          onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                          placeholder="As printed on card"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          data-testid="input-card-name"
                        />
                      </div>
                    </div>
                  )}

                  {payment.type === "netbanking" && (
                    <div className="space-y-4" data-testid="payment-netbanking">
                      <p className="text-sm font-semibold text-gray-700">Net Banking</p>
                      <div className="grid grid-cols-2 gap-2">
                        {BANKS.map((bank) => (
                          <button
                            key={bank}
                            onClick={() => setPayment({ ...payment, bank })}
                            className={`border rounded p-2 text-xs text-left transition-all ${
                              payment.bank === bank
                                ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                            data-testid={`button-bank-${bank.replace(/\s/g, "-").toLowerCase()}`}
                          >
                            🏦 {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {payment.type === "cod" && (
                    <div className="space-y-3" data-testid="payment-cod">
                      <p className="text-sm font-semibold text-gray-700">Cash on Delivery</p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-xs text-yellow-800">
                          Pay when your order is delivered. Please keep exact change ready.
                          COD charges of ₹{deliveryCharge === 0 ? "0" : "40"} may apply.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span>Your order is protected by Flipkart Buyer Protection</span>
                      </div>
                    </div>
                  )}

                  {paymentError && (
                    <p className="text-red-500 text-xs mt-2" data-testid="text-payment-error">{paymentError}</p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setCurrentStep("address")}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      data-testid="button-payment-back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handlePaymentNext}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded transition-colors flex items-center gap-2"
                      data-testid="button-payment-continue"
                    >
                      CONTINUE
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: OTP */}
            <div className={`bg-white rounded shadow-sm transition-all ${currentStep === "otp" ? "block" : "hidden"}`} data-testid="step-otp-content">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#2874f0]" />
                <h2 className="text-base font-bold text-gray-800">OTP Verification</h2>
                <ShieldCheck className="w-4 h-4 text-green-500 ml-auto" />
                <span className="text-xs text-green-600">Secure Payment</span>
              </div>
              <div className="p-6 max-w-md">
                {otpSent && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-green-700">
                      An OTP has been sent to <strong>+91 {address.phone || "XXXXXXXXXX"}</strong>
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      (Demo: Enter any 6-digit code to proceed, except 000000)
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-6">
                  Enter the 6-digit OTP sent to your registered mobile number to confirm payment of{" "}
                  <strong>₹{finalAmount.toLocaleString()}</strong>
                </p>

                {/* OTP Input boxes */}
                <div className="flex gap-3 mb-6" data-testid="otp-input-group">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-lg focus:outline-none transition-all ${
                        digit
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      data-testid={`input-otp-${i}`}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-red-500 text-sm mb-4" data-testid="text-otp-error">{otpError}</p>
                )}

                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                  <span>Didn't receive OTP?</span>
                  <button
                    onClick={resendOtp}
                    className="text-blue-600 font-semibold hover:underline"
                    data-testid="button-resend-otp"
                  >
                    Resend OTP
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep("payment")}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    data-testid="button-otp-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpVerifying || otp.join("").length < 6}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold px-8 py-3 rounded transition-colors flex items-center gap-2"
                    data-testid="button-verify-otp"
                  >
                    {otpVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        VERIFY & PAY
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded shadow-sm sticky top-20" data-testid="checkout-summary">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2" data-testid={`summary-item-${item.id}`}>
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-contain bg-gray-50 rounded flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="p-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 text-xs">
                  <span>You save</span>
                  <span>₹{savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-green-600" : ""}>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span data-testid="text-checkout-total">₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust signals */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="w-3 h-3" />
                  <span>Safe & Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Buyer Protection Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
