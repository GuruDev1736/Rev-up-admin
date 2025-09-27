"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // for password toggle

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://api.revupbikes.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.STS === "200") {
        localStorage.setItem("token", data.CONTENT.token);
        router.push("/dashboard");
      } else {
        alert(data.MSG);
      }
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* LEFT SIDE (Form) */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-10">
            <div className="w-8 h-8 bg-black rounded-full"></div>
            <span className="font-bold text-lg">RevUp Admin</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-left">
            Welcome Back 👋
          </h2>
          <p className="text-gray-500 mb-8 text-left">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forget password */}
            <div className="text-right">
              <a href="#" className="text-sm text-gray-600 hover:text-black">
                Forgot password?
              </a>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Sign in
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-gray-500 mt-6 text-center">
            Don’t have an account?
            <a href="#" className="font-semibold text-black hover:underline">
              Sign Up
            </a>
          </p>
        </div>

        {/* RIGHT SIDE (Illustration + Text) */}
        <div className="hidden md:flex w-1/2 bg-gray-900 text-white items-center justify-center relative p-8">
          <div className="text-center">
            <img
              src="/login-illustration.png" // replace with your illustration
              alt="Illustration"
              className="mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold mb-2">
              Manage your Business Anywhere
            </h3>
            <p className="text-gray-400 text-sm">
              You can manage your admin dashboard on the go with RevUp Bikes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
