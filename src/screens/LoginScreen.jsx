import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useTenant } from "../tenants/useTenant";

export default function LoginScreen() {
  const { signIn, signUp } = useUser();
  const tenant = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirectPath = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
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
          {isSignUp ? "Create Genesis Account" : "Welcome Back"}
        </h2>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
          {isSignUp ? "Sign up to manage tickets and profile details" : "Login to reserve your tickets securely"}
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} style={{
        background: "#1e1e1e",
        padding: 30,
        borderRadius: 28,
        border: "1px solid #2e2e2e",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>
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

        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
          {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </form>

      {/* Switch mode */}
      <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#94a3b8" }}>
        {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
        <span
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg("");
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
