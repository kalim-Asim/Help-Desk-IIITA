const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
import React, { useState } from "react";
import FloatingIcons from "../ui/FloatingIcons";
import useNotify from "../../hooks/useNotify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { notifyError, notifySuccess } = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      notifyError("Email is required!");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch(`${apiUrl}/api/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log(data);
      if (data.success) {
        notifySuccess("Password reset link sent to your email.");
      } else {
        notifyError(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("Error during password reset request:", err);
      notifyError("Server error. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <main className="flex-grow mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
    <FloatingIcons />
    <div className="w-full max-w-2xl bg-gray-800 p-12 rounded-3xl shadow-2xl border border-gray-700">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-indigo-400">Forgot Password</h1>
        <h2 className="text-2xl font-medium text-gray-300 mt-4">
          Enter your email to receive a reset link
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-base font-medium text-gray-300 mb-1">Email Address</label>
          <input
            type="email"
            placeholder="you@iiita.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-3 bg-gray-900 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 cursor-pointer text-white font-semibold py-3 text-lg rounded-xl hover:bg-indigo-700 transition duration-200"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="text-sm text-center text-gray-400 mt-8">
        Remembered your password?{" "}
        <a href="/login" className="text-indigo-400 hover:underline font-medium">
          Log In
        </a>
      </div>

      <p className="text-xs text-center text-gray-500 mt-3">
        Only authorized IIITA users allowed
      </p>
    </div>
    </main>
  );
};

export default ForgotPassword;
