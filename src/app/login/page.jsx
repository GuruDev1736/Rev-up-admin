"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // for password toggle
import Link from "next/link";
import { loginUser } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await loginUser({ email, password });
      if (data.STS === "200") {
        // Check if user has ROLE_MASTER_ADMIN
        if (data.CONTENT && data.CONTENT.userRole === "ROLE_MASTER_ADMIN") {
          // Store authentication data in sessionStorage for better security
          // Session will be cleared when browser/tab is closed
          sessionStorage.setItem("token", data.CONTENT.token);
          sessionStorage.setItem("userId", data.CONTENT.userId);
          sessionStorage.setItem("userName", data.CONTENT.userName);
          sessionStorage.setItem("fullName", data.CONTENT.fullName);
          sessionStorage.setItem("userRole", data.CONTENT.userRole);
          sessionStorage.setItem("userProfilePic", data.CONTENT.userProfilePic);
          
          router.push("/overview");
        } else {
          setErrorMsg("Access Denied. Only Master Admin can access this dashboard.");
        }
      } else {
        setErrorMsg("Invalid credentials, please try again.");
      }
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffafa]">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* LEFT SIDE (Form) */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-10">
            <img 
              src="/logo.jpg" 
              alt="RevUp Logo" 
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="font-bold text-xl text-gray-900">RevUp Admin</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-left">
            Welcome Back 👋
          </h2>
          <p className="text-gray-600 mb-8 text-left">
            Login to access your admin dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#f02521] focus:border-[#f02521] outline-none text-gray-900 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#f02521] focus:border-[#f02521] outline-none pr-12 text-gray-900 transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#f02521] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forget password */}
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-[#f02521] transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDE (Illustration + Text) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#f02521] to-[#f85d5d] text-white items-center justify-center relative p-8">
          <div className="text-center">
            <div className="mb-8">
              {/* Bike Icon/Illustration */}
              <div className="w-48 h-48 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-32 h-32 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">
              Manage Your Business Anywhere
            </h3>
            <p className="text-white/90 text-base leading-relaxed max-w-sm mx-auto">
              Access your RevUp Bikes admin dashboard on the go. Monitor sales, manage inventory, and track orders seamlessly.
            </p>
            <div className="mt-8 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
