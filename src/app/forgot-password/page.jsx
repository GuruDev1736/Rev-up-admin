"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { sendOtp, verifyOtp, resetPassword } from "@/services/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await sendOtp(email);

      if (data.STS === "200") {
        setSuccessMsg(data.MSG);
        setTimeout(() => {
          setStep(2);
          setSuccessMsg(null);
        }, 1500);
      } else {
        setErrorMsg(data.MSG || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await verifyOtp(email, otp);

      if (data.STS === "200") {
        setSuccessMsg(data.MSG);
        setTimeout(() => {
          setStep(3);
          setSuccessMsg(null);
        }, 1500);
      } else {
        setErrorMsg(data.MSG || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Check password strength
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const data = await resetPassword(email, newPassword);

      if (data.STS === "200") {
        setSuccessMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErrorMsg(data.MSG || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffafa] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        {/* Back to Login Link */}
        <Link
          href="/login"
          className="flex items-center text-gray-600 hover:text-[#f02521] transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Login
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <img 
            src="/logo.jpg" 
            alt="RevUp Logo" 
            className="w-10 h-10 rounded-lg object-cover"
          />
          <span className="font-bold text-xl text-gray-900">RevUp Admin</span>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1
                  ? "bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? "bg-[#f02521]" : "bg-gray-200"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2
                  ? "bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? "bg-[#f02521]" : "bg-gray-200"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 3
                  ? "bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Forgot Password?
            </h2>
            <p className="text-gray-600 mb-6 text-center text-sm">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#f02521] focus:border-[#f02521] outline-none text-gray-900 transition-all placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Verify OTP
            </h2>
            <p className="text-gray-600 mb-6 text-center text-sm">
              Enter the 4-digit OTP sent to <span className="font-semibold">{email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#f02521] focus:border-[#f02521] outline-none text-gray-900 transition-all text-center text-2xl tracking-widest placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-600 hover:text-[#f02521] text-sm transition-colors"
              >
                Didn't receive OTP? Resend
              </button>
            </form>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Reset Password
            </h2>
            <p className="text-gray-600 mb-6 text-center text-sm">
              Enter your new password below
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#f02521] focus:border-[#f02521] outline-none text-gray-900 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#f02521] focus:border-[#f02521] outline-none text-gray-900 transition-all placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm text-center">{successMsg}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}
