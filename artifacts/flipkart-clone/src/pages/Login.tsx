import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      if (!phone && !email) {
        setError("Enter your email or phone number");
        return;
      }
      if (!password) {
        setError("Enter your password");
        return;
      }
      setSuccess("Logged in successfully! (Demo)");
      setTimeout(() => setLocation("/"), 1500);
    } else {
      if (!email) {
        setError("Enter your email address");
        return;
      }
      if (!phone || phone.length < 10) {
        setError("Enter a valid phone number");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      // Send registration email with contact details
      try {
        const response = await fetch('http://localhost:3001/api/send-registration-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: email.split('@')[0], // Extract name from email
            email: email,
            phone: phone
          })
        });

        const result = await response.json();
        if (result.success) {
          console.log('Registration email sent successfully');
        } else {
          console.error('Failed to send registration email:', result.message);
        }
      } catch (error) {
        console.error('Error sending registration email:', error);
      }

      setSuccess("Account created! Redirecting...");
      setTimeout(() => setLocation("/"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden grid md:grid-cols-5">
          {/* Left panel - Blue */}
          <div className="md:col-span-2 bg-[#2874f0] p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2" data-testid="text-login-heading">
                {mode === "login" ? "Login" : "Create Account"}
              </h2>
              <p className="text-blue-200 text-sm">
                Get access to your Orders, Wishlist and Recommendations
              </p>
            </div>
            <div className="hidden md:block">
              <img
                src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"
                alt="Shopping illustration"
                className="w-full max-w-xs mx-auto opacity-80"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          </div>

          {/* Right panel - Form */}
          <div className="md:col-span-3 p-8">
            {/* Toggle */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className={`pb-3 px-4 text-sm font-semibold transition-all ${mode === "login" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500 hover:text-gray-700"}`}
                data-testid="button-tab-login"
              >
                Login
              </button>
              <button
                onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                className={`pb-3 px-4 text-sm font-semibold transition-all ${mode === "register" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500 hover:text-gray-700"}`}
                data-testid="button-tab-register"
              >
                New User? Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    data-testid="input-email"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {mode === "login" ? "Email or Phone Number *" : "Mobile Number *"}
                </label>
                <input
                  type={mode === "login" ? "text" : "tel"}
                  maxLength={mode === "register" ? 10 : undefined}
                  value={phone}
                  onChange={(e) => setPhone(mode === "register" ? e.target.value.replace(/\D/g, "") : e.target.value)}
                  placeholder={mode === "login" ? "Email or 10-digit mobile" : "10-digit mobile number"}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  data-testid="input-phone"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 pr-10"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm" data-testid="text-login-error">{error}</p>
              )}
              {success && (
                <p className="text-green-600 text-sm font-medium" data-testid="text-login-success">{success}</p>
              )}

              <p className="text-xs text-gray-500">
                By continuing, you agree to Flipkart's{" "}
                <span className="text-blue-600 cursor-pointer hover:underline">Terms of Use</span> and{" "}
                <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>.
              </p>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
                data-testid="button-submit"
              >
                {mode === "login" ? "Login" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </button>

              {mode === "login" && (
                <button
                  type="button"
                  className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded transition-colors hover:bg-gray-50 text-sm"
                  data-testid="button-request-otp"
                >
                  Request OTP
                </button>
              )}
            </form>

            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Safe, secure and encrypted login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
