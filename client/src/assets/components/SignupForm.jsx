import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
  const [name, setName] = useState(""); // New state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const notifyError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const notifySuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }), // Include name
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        notifySuccess("Signup successful! You can now log in.");
        // onSignupSuccess();
        navigate("/login");
      } else {
        notifyError("Signup failed: " + data.message);
      }
    } catch (err) {
      console.error("Signup error:", err);
      notifyError("Server error. Try again later.");
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-12 rounded-3xl shadow-2xl border border-gray-700">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-indigo-400">IIITA Help Desk</h1>
        <h2 className="text-2xl font-medium text-gray-300 mt-4">Create an Account</h2>
      </div>

      <form onSubmit={handleSignup} className="space-y-6">
        <div>
          <label className="block text-base font-medium text-gray-300 mb-1">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-5 py-3 bg-gray-900 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
          />
        </div>

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

        <div>
          <label className="block text-base font-medium text-gray-300 mb-1">Password</label>
          <input
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-5 py-3 bg-gray-900 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 cursor-pointer text-white font-semibold py-3 text-lg rounded-xl hover:bg-indigo-700 transition duration-200"
        >
          Sign Up
        </button>
      </form>

      <div className="text-sm text-center text-gray-400 mt-8">
        Already have an account?{" "}
        <a href="/login" className="text-indigo-400 hover:underline font-medium">
          Login
        </a>
      </div>

      <p className="text-xs text-center text-gray-500 mt-3">
        Use your IIITA email address to register.
      </p>
    </div>
  );
};

export default SignupForm;
