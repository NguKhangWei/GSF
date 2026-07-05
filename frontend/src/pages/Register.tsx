import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";

export default function Register() {
  const { register, loading, error, clearError } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/account";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      });
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
          Create your account
        </h1>

        {error && (
          <div className="mb-6 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="First name"
              value={firstName}
              onChange={setFirstName}
              autoComplete="given-name"
              required
            />
            <Field
              label="Last name"
              value={lastName}
              onChange={setLastName}
              autoComplete="family-name"
              required
            />
          </div>
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
            label="Phone (optional)"
            type="tel"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(v) => {
              clearError();
              setPassword(v);
            }}
            autoComplete="new-password"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center !py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-sm text-gsf-white/60">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from: redirectTo }}
            className="text-gold-light hover:text-gold underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  required,
  minLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
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
        minLength={minLength}
        className="w-full rounded-sm bg-forest-light/60 border border-white/10 px-4 py-3 text-gsf-white placeholder-gsf-white/30 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
      />
    </label>
  );
}
