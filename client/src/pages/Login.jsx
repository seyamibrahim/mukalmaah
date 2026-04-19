import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, User as UserIcon, Loader2 } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { motion } from "framer-motion";
import logo from "../assets/logo-removebg-preview.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();
  const logoStyle = {
    filter:
      "brightness(0) saturate(100%) invert(71%) sepia(59%) saturate(1106%) hue-rotate(357deg) brightness(96%) contrast(92%) drop-shadow(0 10px 22px rgba(219, 155, 52, 0.28))",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm sm:max-w-md bg-surface p-6 sm:p-8 rounded-2xl border border-custom shadow-xl"
      >
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Mukalmah logo"
            className="mx-auto mb-4 h-32 sm:h-36 w-auto max-w-48 sm:max-w-64 object-contain"
            style={logoStyle}
          />
          <p className="text-4xl font-semibold text-primary/90 mb-2" dir="rtl">
            مكالمة
          </p>
          <p className="text-muted">Welcome back</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-custom rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-custom rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-muted text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
