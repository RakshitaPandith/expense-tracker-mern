import React, { useState } from "react";
import { signupStyles } from "../assets/dummyStyles";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";

const Signup = ({
  API_URL = "https://expense-tracker-mern-fwfw.onrender.com",
  onSignup,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch user profile after signup if the backend returns a token
  const fetchProfile = async (token) => {
    if (!token) return null;

    const res = await axios.get(`${API_URL}/api/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  };

  // Save login information
  const persistAuth = (profile, token) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    try {
      if (token) {
        storage.setItem("token", token);
      }

      if (profile) {
        storage.setItem("user", JSON.stringify(profile));
      }
    } catch (err) {
      console.error("Storage error:", err);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/user/register`,
        {
          name,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data || {};

      const token = data.token ?? null;

      let profile = data.user ?? null;

      // If backend returns user data directly
      if (!profile) {
        const copy = { ...data };

        delete copy.token;
        delete copy.user;

        if (Object.keys(copy).length) {
          profile = copy;
        }
      }

      // If we received a token but not user information,
      // try to fetch the profile
      if (!profile && token) {
        try {
          profile = await fetchProfile(token);
        } catch (fetchErr) {
          console.warn(
            "Could not fetch profile after signup token:",
            fetchErr
          );

          profile = null;
        }
      }

      // Fallback profile
      if (!profile) {
        profile = {
          name,
          email,
        };
      }

      // Save authentication information
      persistAuth(profile, token);

      // Notify App.jsx if onSignup was provided
      if (typeof onSignup === "function") {
        try {
          onSignup(profile, rememberMe, token);
        } catch (callErr) {
          console.warn("onSignup threw:", callErr);
          navigate("/");
        }
      } else {
        navigate("/");
      }

      // Clear password
      setPassword("");
    } catch (err) {
      console.error(
        "Signup error:",
        err?.response || err
      );

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({
          api: err.response.data.message,
        });
      } else {
        setErrors({
          api:
            err.message ||
            "An unexpected error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={signupStyles.pageContainer}>
      <div className={signupStyles.cardContainer}>

        {/* Header */}
        <div className={signupStyles.header}>

          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className={signupStyles.backButton}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* User icon */}
          <div className={signupStyles.avatar}>
            <User className="w-10 h-10 text-white" />
          </div>

          <h1 className={signupStyles.headerTitle}>
            Create Account
          </h1>

          <p className={signupStyles.headerSubtitle}>
            Join ExpenseTracker to manage your finances
          </p>
        </div>

        {/* Form */}
        <div className={signupStyles.formContainer}>

          {/* API error */}
          {errors.api && (
            <div className={signupStyles.errorContainer}>
              <div className={signupStyles.errorIcon}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <span className={signupStyles.errorText}>
                {errors.api}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="mb-6">
              <label
                htmlFor="name"
                className={signupStyles.label}
              >
                Full Name
              </label>

              <div className={signupStyles.inputContainer}>
                <div className={signupStyles.inputIcon}>
                  <User className="w-5 h-5" />
                </div>

                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className={`${signupStyles.input} ${
                    errors.name
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                  placeholder="John Doe"
                />
              </div>

              {errors.name && (
                <p className={signupStyles.fieldError}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className={signupStyles.label}
              >
                Email Address
              </label>

              <div className={signupStyles.inputContainer}>
                <div className={signupStyles.inputIcon}>
                  <Mail className="w-5 h-5" />
                </div>

                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className={`${signupStyles.input} ${
                    errors.email
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                  placeholder="your@example.com"
                />
              </div>

              {errors.email && (
                <p className={signupStyles.fieldError}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className={signupStyles.label}
              >
                Password
              </label>

              <div className={signupStyles.inputContainer}>
                <div className={signupStyles.inputIcon}>
                  <Lock className="w-5 h-5" />
                </div>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className={`${signupStyles.passwordInput} ${
                    errors.password
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className={
                    signupStyles.passwordToggle
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className={signupStyles.fieldError}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div
              className={
                signupStyles.checkboxContainer
              }
            >
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
                className={signupStyles.checkbox}
              />

              <label
                htmlFor="remember"
                className={
                  signupStyles.checkboxLabel
                }
              >
                Remember Me
              </label>
            </div>

            {/* Create Account button */}
            <button
              type="submit"
              className={`${signupStyles.button} ${
                isLoading
                  ? signupStyles.buttonDisabled
                  : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className={signupStyles.spinner}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2-647z"
                    ></path>
                  </svg>

                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign in */}
          <div className={signupStyles.signInContainer}>
            <p className={signupStyles.signInText}>
              Already have an account?{" "}
              <Link
                to="/login"
                className={signupStyles.signInLink}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;