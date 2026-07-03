import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useTenant } from "../tenants/useTenant";
import { supabase } from "../utils/supabaseClient";

export default function LoginScreen() {
  const { signIn, signUp } = useUser();
  const tenant = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  useEffect(() => {
    // Check if redirect link has recovery token
    if (window.location.hash && window.location.hash.includes("type=recovery")) {
      setIsResetPassword(true);
    }
  }, []);

  const rules = [
    { id: "len", label: "At least 8 characters", test: password.length >= 8 },
    { id: "upper", label: "At least one uppercase letter (A-Z)", test: /[A-Z]/.test(password) },
    { id: "lower", label: "At least one lowercase letter (a-z)", test: /[a-z]/.test(password) },
    { id: "num", label: "At least one number (0-9)", test: /[0-9]/.test(password) },
    { id: "special", label: "At least one special char (e.g. !@#$)", test: /[^A-Za-z0-9]/.test(password) }
  ];

  const strengthScore = rules.filter(r => r.test).length;
  const isPasswordValid = strengthScore === rules.length;

  const getStrengthText = () => {
    if (!password) return "";
    switch (strengthScore) {
      case 1: return "Very Weak";
      case 2: return "Weak";
      case 3: return "Fair";
      case 4: return "Strong";
      case 5: return "Very Strong";
      default: return "";
    }
  };

  const redirectPath = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (isSignUp) {
      if (!isPasswordValid) {
        setErrorMsg("Please ensure your password meets all strength requirements.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      navigate(redirectPath);
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login",
      });
      if (error) throw error;

      setSuccessMsg("Password reset email sent! Check your inbox for instructions.");
    } catch (err) {
      setErrorMsg(err.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isPasswordValid) {
      setErrorMsg("Please ensure your password meets all strength requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccessMsg("Password updated successfully! Redirecting you to home...");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  let formTitle = "Welcome Back";
  let formSubtitle = "Login to reserve your tickets securely";
  let submitAction = handleSubmit;

  if (isResetPassword) {
    formTitle = "Reset Your Password";
    formSubtitle = "Choose a strong password to secure your account";
    submitAction = handleResetSubmit;
  } else if (isForgotPassword) {
    formTitle = "Recover Your Account";
    formSubtitle = "Enter your email to receive password reset instructions";
    submitAction = handleForgotPasswordSubmit;
  } else if (isSignUp) {
    formTitle = "Create Genesis Account";
    formSubtitle = "Sign up to manage tickets and profile details";
    submitAction = handleSubmit;
  }

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#121212", // Pure black theme
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Brand Logo/Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
          color: "#121212",
          fontSize: 32,
          fontWeight: "900",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: "0 10px 25px rgba(212,175,55,0.3)"
        }}>
          G
        </div>
        <h2 style={{ fontSize: 24, fontWeight: "900", margin: 0, letterSpacing: "-0.03em" }}>
          {formTitle}
        </h2>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
          {formSubtitle}
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={submitAction} style={{
        background: "#1e1e1e",
        padding: 30,
        borderRadius: 28,
        border: "1px solid #2e2e2e",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>
        {successMsg && (
          <div style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 12,
            padding: "12px 16px",
            color: "#059669",
            fontSize: 13,
            fontWeight: "600"
          }}>
            ✓ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fee2e2",
            borderRadius: 12,
            padding: "12px 16px",
            color: "#ef4444",
            fontSize: 13,
            fontWeight: "600"
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {isSignUp && (
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid #333",
                background: "#121212",
                color: "#fff",
                fontSize: 14,
              }}
            />
          </div>
        )}

        {!isResetPassword && (
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid #333",
                background: "#121212",
                color: "#fff",
                fontSize: 14,
              }}
            />
          </div>
        )}

        {!isForgotPassword && (
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>
              {isResetPassword ? "New Password" : "Password"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  borderRadius: 14,
                  border: "1px solid #333",
                  background: "#121212",
                  color: "#fff",
                  fontSize: 14,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {(isSignUp || isResetPassword) && password && (
              <>
                <div style={{ display: "flex", gap: 4, marginTop: 8, height: 6 }}>
                  {[1, 2, 3, 4, 5].map((level) => {
                    let color = "#333";
                    if (strengthScore >= level) {
                      if (strengthScore <= 2) color = "#ef4444";
                      else if (strengthScore === 3) color = "#f97316";
                      else if (strengthScore === 4) color = "#eab308";
                      else color = "#22c55e";
                    }
                    return (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          backgroundColor: color,
                          borderRadius: 3,
                          transition: "background-color 0.2s ease"
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Password Strength:</span>
                  <span style={{ 
                    fontSize: 11, 
                    fontWeight: "bold",
                    color: strengthScore <= 2 ? "#ef4444" : strengthScore === 3 ? "#f97316" : strengthScore === 4 ? "#eab308" : "#22c55e"
                  }}>
                    {getStrengthText()}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                  {rules.map((rule) => (
                    <div key={rule.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <span style={{
                        color: rule.test ? "#22c55e" : "#64748b",
                        transition: "color 0.2s"
                      }}>
                        {rule.test ? "✓" : "○"}
                      </span>
                      <span style={{
                        color: rule.test ? "#e2e8f0" : "#64748b",
                        transition: "color 0.2s"
                      }}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {(isSignUp || isResetPassword) && (
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>
              {isResetPassword ? "Confirm New Password" : "Confirm Password"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  borderRadius: 14,
                  border: "1px solid #333",
                  background: "#121212",
                  color: "#fff",
                  fontSize: 14,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {confirmPassword && (
              <div style={{ 
                fontSize: 12, 
                marginTop: 6, 
                color: password === confirmPassword ? "#22c55e" : "#ef4444",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                <span>{password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}</span>
              </div>
            )}
          </div>
        )}

        {!isSignUp && !isForgotPassword && !isResetPassword && (
          <div style={{ textAlign: "right", marginTop: -10 }}>
            <span
              onClick={() => {
                setIsForgotPassword(true);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              style={{
                color: "#d4af37",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: "600",
                textDecoration: "underline"
              }}
            >
              Forgot Password?
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            background: isLoading ? "#4a4a4a" : "#d4af37",
            color: isLoading ? "#bbb" : "#121212",
            border: "none",
            padding: "16px",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: "800",
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: isLoading ? "none" : "0 8px 20px rgba(212,175,55,0.2)",
            marginTop: 10,
            transition: "0.2s"
          }}
        >
          {isLoading 
            ? "Please wait..." 
            : isResetPassword 
              ? "Update Password" 
              : isForgotPassword 
                ? "Send Reset Link" 
                : isSignUp 
                  ? "Create Account" 
                  : "Sign In"}
        </button>
      </form>

      {/* Switch mode */}
      <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#94a3b8" }}>
        {isResetPassword ? (
          <span
            onClick={() => {
              setIsResetPassword(false);
              setErrorMsg("");
              setSuccessMsg("");
              setPassword("");
              setConfirmPassword("");
            }}
            style={{ color: "#d4af37", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
          >
            Go to Sign In
          </span>
        ) : isForgotPassword ? (
          <span
            onClick={() => {
              setIsForgotPassword(false);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            style={{ color: "#d4af37", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
          >
            Back to Sign In
          </span>
        ) : (
          <>
            {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <span
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
                setSuccessMsg("");
                setPassword("");
                setConfirmPassword("");
                setShowPassword(false);
              }}
              style={{
                color: "#d4af37",
                fontWeight: "700",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </span>
          </>
        )}
      </div>

      {/* Back to Home */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <span
          onClick={() => navigate("/")}
          style={{ fontSize: 12, color: "#64748b", cursor: "pointer", textDecoration: "underline" }}
        >
          Go Back to Home
        </span>
      </div>
    </div>
  );
}
