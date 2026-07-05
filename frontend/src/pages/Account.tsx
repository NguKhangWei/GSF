import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";
import * as customerApi from "../lib/customerApi";
import type {
  CustomerAddress,
  CustomerOrder,
  AddressInput,
} from "../lib/customerApi";
import { fmtMoney } from "../lib/checkoutApi";
import { MY_STATES } from "../lib/states";

type Tab = "profile" | "addresses" | "orders";

export default function Account() {
  const { customer, initializing, logout, updateProfile } = useCustomer();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  // Auth guard — bounce to login once the session check has settled.
  useEffect(() => {
    if (!initializing && !customer) {
      navigate("/login", { replace: true, state: { from: "/account" } });
    }
  }, [initializing, customer, navigate]);

  if (initializing || !customer) {
    return (
      <div className="min-h-screen bg-forest pt-32 pb-20 px-6 text-center text-gsf-white/60">
        Loading…
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "addresses", label: "Addresses" },
    { id: "orders", label: "Orders" },
  ];

  return (
    <div className="min-h-screen bg-forest pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="section-eyebrow">My Account</p>
            <h1 className="section-title font-display text-gsf-white">
              Hello, {customer.first_name || customer.email}
            </h1>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="btn-ghost !text-gsf-white/70 hover:!text-gold-light"
          >
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-white/10 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 -mb-px text-xs font-mono uppercase tracking-[0.18em] border-b-2 transition-colors ${
                tab === t.id
                  ? "border-gold text-gold-light"
                  : "border-transparent text-gsf-white/50 hover:text-gsf-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <ProfilePanel
            customer={customer}
            onSave={updateProfile}
          />
        )}
        {tab === "addresses" && <AddressPanel />}
        {tab === "orders" && <OrdersPanel />}
      </div>
    </div>
  );
}

/* ─────────────────────────── Profile ─────────────────────────── */

function ProfilePanel({
  customer,
  onSave,
}: {
  customer: customerApi.Customer;
  onSave: (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(customer.first_name || "");
  const [lastName, setLastName] = useState(customer.last_name || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErr(null);
    try {
      await onSave({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      });
      setSaved(true);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-lg space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First name" value={firstName} onChange={setFirstName} />
        <Input label="Last name" value={lastName} onChange={setLastName} />
      </div>
      <Input
        label="Email"
        value={customer.email}
        onChange={() => {}}
        disabled
      />
      <Input label="Phone" value={phone} onChange={setPhone} type="tel" />

      {err && <p className="text-sm text-red-300">{err}</p>}
      {saved && <p className="text-sm text-gold-light">Profile updated.</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary !py-3 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

/* ─────────────────────────── Addresses ─────────────────────────── */

function AddressPanel() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setAddresses(await customerApi.listAddresses());
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    try {
      await customerApi.deleteAddress(id);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not delete address.");
    }
  };

  if (loading)
    return <p className="text-gsf-white/50 text-sm">Loading addresses…</p>;

  return (
    <div className="space-y-6">
      {err && <p className="text-sm text-red-300">{err}</p>}

      {addresses.length === 0 && !showForm && (
        <p className="text-gsf-white/50 text-sm">
          You haven't saved any addresses yet.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="rounded-sm border border-white/10 bg-forest-mid p-5 text-sm text-gsf-white/80"
          >
            <p className="text-gsf-white font-medium">
              {a.first_name} {a.last_name}
            </p>
            <p>{a.address_1}</p>
            {a.address_2 && <p>{a.address_2}</p>}
            <p>
              {a.city}{a.province ? `, ${a.province}` : ""} {a.postal_code}
            </p>
            <p className="uppercase text-xs tracking-wider text-gsf-white/50 mt-1">
              {a.country_code}
            </p>
            {a.phone && <p className="mt-1">{a.phone}</p>}
            <button
              onClick={() => remove(a.id)}
              className="mt-3 text-xs font-mono uppercase tracking-[0.16em] text-red-300/80 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <AddressForm
          onCancel={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            await load();
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary !py-3"
        >
          Add address
        </button>
      )}
    </div>
  );
}

function AddressForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<AddressInput>({
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "my",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof AddressInput) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await customerApi.createAddress(form);
      onSaved();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not save address.");
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-sm border border-white/10 bg-forest-mid p-6 space-y-4 max-w-lg"
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="First name" value={form.first_name || ""} onChange={set("first_name")} />
        <Input label="Last name" value={form.last_name || ""} onChange={set("last_name")} />
      </div>
      <Input label="Address" value={form.address_1 || ""} onChange={set("address_1")} />
      <Input label="Apartment, suite, etc. (optional)" value={form.address_2 || ""} onChange={set("address_2")} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" value={form.city || ""} onChange={set("city")} />
        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-[0.18em] text-gsf-white/50 mb-2">
            State
          </span>
          <select
            required
            value={form.province || ""}
            onChange={(e) => set("province")(e.target.value)}
            className="w-full rounded-sm bg-forest-light/60 border border-white/10 px-4 py-3 text-gsf-white outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
          >
            <option value="" disabled>Select state…</option>
            {MY_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <Input label="Postcode" value={form.postal_code || ""} onChange={set("postal_code")} />
      <Input label="Phone" value={form.phone || ""} onChange={set("phone")} type="tel" />

      {err && <p className="text-sm text-red-300">{err}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary !py-3 disabled:opacity-60">
          {saving ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost !text-gsf-white/70"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────── Orders ─────────────────────────── */

function OrdersPanel() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOrders(await customerApi.listOrders());
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <p className="text-gsf-white/50 text-sm">Loading orders…</p>;
  if (err) return <p className="text-sm text-red-300">{err}</p>;
  if (orders.length === 0)
    return (
      <p className="text-gsf-white/50 text-sm">
        You haven't placed any orders yet.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="text-xs font-mono uppercase tracking-[0.16em] text-gsf-white/50 border-b border-white/10">
            <th className="py-3 pr-4">Order</th>
            <th className="py-3 pr-4">Date</th>
            <th className="py-3 pr-4">Items</th>
            <th className="py-3 pr-4 text-right">Total</th>
            <th className="py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="text-gsf-white/80">
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-white/5">
              <td className="py-3 pr-4 text-gsf-white">
                #{o.display_id ?? o.id.slice(-6)}
              </td>
              <td className="py-3 pr-4">
                {new Date(o.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 pr-4">
                {(o.items || []).reduce((n, i) => n + i.quantity, 0)}
              </td>
              <td className="py-3 pr-4 text-right">{fmtMoney(o.total)}</td>
              <td className="py-3 text-right">
                <span className="capitalize text-gold-light">
                  {o.status || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────── Input ─────────────────────────── */

function Input({
  label,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
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
        disabled={disabled}
        className="w-full rounded-sm bg-forest-light/60 border border-white/10 px-4 py-3 text-gsf-white placeholder-gsf-white/30 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-50"
      />
    </label>
  );
}
