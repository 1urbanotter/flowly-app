// src/components/AuthForm.tsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import {
  CheckCircle,
  AlertCircle,
  Eye, // <-- Added
  EyeOff, // <-- Added
  Github, // <-- Added (Example)
  Chrome, // <-- Added (Example for Google)
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // <-- Added

// Helper type for validation errors
type ValidationErrors = {
  email?: string;
  password?: string;
};

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false); // <-- Added: Password visibility state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  ); // <-- Added: Validation errors

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    // Basic Email Regex (adjust as needed)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password cannot be empty.";
    } else if (isSignUp && password.length < 6) {
      // Example: Enforce minimum length only on sign up
      errors.password = "Password must be at least 6 characters long.";
    }
    // Add more password complexity rules if desired

    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // --- Auth Handlers ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setValidationErrors({}); // Clear previous validation errors

    // Run validation first
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setLoading(true);

    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (isSignUp) {
        setMessage({
          type: "success",
          text: "Check your email to verify your account!",
        });
        setEmail(""); // Clear form on successful signup message
        setPassword("");
      }
      // For sign-in, the main app will redirect via session change, no message needed here
    } catch (error: any) {
      setMessage({
        type: "error",
        // Use specific Supabase error messages if available
        text: error.message || "Authentication failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Social Login Handler (Example) ---
  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      // Optional: Add redirect options if needed
      // options: {
      //   redirectTo: window.location.origin,
      // },
    });
    if (error) {
      setMessage({
        type: "error",
        text: `Error signing in with ${provider}: ${error.message}`,
      });
      setLoading(false);
    }
    // Supabase handles the redirect flow
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setMessage(null);
    setValidationErrors({}); // Clear validation errors on mode toggle
    // Keep email/password if user toggles back? Optional, clearing is simpler
    // setEmail("");
    // setPassword("");
  };

  // --- Dark Mode Toggle (Placeholder - implement actual logic elsewhere) ---
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    console.warn(
      "Dark mode toggle is basic. Implement proper theme management."
    );
  };

  // --- Tailwind Styles ---
  const inputClasses =
    "w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 disabled:opacity-50"; // Added dark mode, padding right for icon
  const buttonClasses =
    "w-full py-3 rounded-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 transition-all duration-200"; // Added dark mode ring offset
  const primaryButtonClasses = `${buttonClasses} bg-primary text-primary-foreground hover:bg-opacity-90 focus:ring-primary disabled:bg-opacity-70`; // Adjusted disabled style
  const messageClasses = {
    success:
      "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-500/30", // Added dark mode
    error:
      "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-500/30", // Added dark mode
  };
  const socialButtonClasses = `flex-1 ${buttonClasses} text-sm flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-primary`; // Social button style

  return (
    // Added dark mode background
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {/* --- Framer Motion Container --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 bg-card dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-muted dark:border-gray-700" // Added dark mode card styles
      >
        {/* --- Placeholder Dark Mode Toggle --- */}
        {/* <button onClick={toggleDarkMode} className="absolute top-4 right-4 text-xs text-muted-foreground">Toggle Dark</button> */}

        <h2 className="text-3xl font-bold text-center text-foreground dark:text-gray-100">
          {isSignUp ? "Join Flowly" : "Welcome Back"}
        </h2>
        <p className="text-center text-sm text-muted-foreground dark:text-gray-400">
          {isSignUp ? "Create a new account below" : "Sign in to continue"}
        </p>

        {/* --- Message Feedback w/ Animation --- */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center p-3 rounded-lg border ${
                messageClasses[message.type]
              }`}
              role="alert"
            >
              {message.type === "success" ? (
                <CheckCircle
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              <span className="text-sm">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Main Auth Form --- */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`${inputClasses} ${
                validationErrors.email
                  ? "border-red-500 ring-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              aria-label="Email address"
              aria-invalid={!!validationErrors.email}
              aria-describedby={
                validationErrors.email ? "email-error" : undefined
              }
            />
            {/* Validation Error Message */}
            {validationErrors.email && (
              <p
                id="email-error"
                className="mt-1 text-xs text-red-600 dark:text-red-400"
              >
                {validationErrors.email}
              </p>
            )}
          </div>
          {/* Password Input with Visibility Toggle */}
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"} // <-- Toggle type
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              className={`${inputClasses} ${
                validationErrors.password
                  ? "border-red-500 ring-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              aria-label="Password"
              aria-invalid={!!validationErrors.password}
              aria-describedby={
                validationErrors.password ? "password-error" : undefined
              }
            />
            {/* Visibility Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {/* Validation Error Message */}
          {validationErrors.password && (
            <p
              id="password-error"
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {validationErrors.password}
            </p>
          )}

          <button
            type="submit"
            className={primaryButtonClasses}
            disabled={loading}
            aria-label={isSignUp ? "Sign up" : "Sign in"}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                {" "}
                {/* Center spinner */}
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2.75a9.25 9.25 0 11-9.25 9.25A9.26 9.26 0 0112 2.75zm0 1.5a7.75 7.75 0 100 15.5 7.75 7.75 0 000-15.5z"
                    opacity=".2"
                  />
                  <path d="M12 2.75a9.25 9.25 0 018.53 5.81l-1.36.49a7.75 7.75 0 10-7.17 9.2v1.5a9.25 9.25 0 01-.01-17z" />
                </svg>
                Processing...
              </span>
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* --- Divider --- */}
        <div className="relative my-6">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* --- Social Logins --- */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Replace with actual implementation using handleOAuthSignIn */}
          <button
            onClick={() => handleOAuthSignIn("google")}
            className={socialButtonClasses}
            disabled={loading}
            aria-label="Sign in with Google"
          >
            <Chrome className="h-5 w-5" /> Google
          </button>
          <button
            onClick={() => handleOAuthSignIn("github")}
            className={socialButtonClasses}
            disabled={loading}
            aria-label="Sign in with GitHub"
          >
            <Github className="h-5 w-5" /> GitHub
          </button>
        </div>

        {/* --- Toggle Mode --- */}
        <div className="text-center text-sm mt-6">
          <button
            onClick={toggleAuthMode}
            className="text-primary hover:underline font-medium transition-colors"
            aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
            disabled={loading}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
