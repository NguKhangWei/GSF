import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";

export default function Login() {
  const { login, loading, error, clearError } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/account";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch {
      /* error surfaced via context */
    }
  };

  return (
    <div className="min-h-screen bg-forest pt-32 pb-20 px-6">
      <div className="max-w-md mx-auto">
        <p className="section-eyebrow">Members</p>
        <h1 className="section-title font-display text-gsf-white mb-8">
          Sign in
        </h1>

        {error && (
          <div className="mb-6 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(v) => {
              clearError();
              setEmail(v);
            }}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(v) => {
              clearError();
              setPassword(v);
            }}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center !py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-sm text-gsf-white/60">
          New to GSF Golf?{" "}
          <Link
            to="/register"
            state={{ from: redirectTo }}
            className="text-gold-light hover:text-gold underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-[0.18em] text-gsf-white/50 mb-2">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-sm bg-forest-light/60 border border-white/10 px-4 py-3 text-gsf-white placeholder-gsf-white/30 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
      />
    </label>
  );
}
