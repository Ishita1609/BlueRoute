"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Package, BookOpen, Truck, BarChart3, Lock, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Capability {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const CAPABILITIES: Capability[] = [
  { icon: Package, title: "Shipment Booking", desc: "Create and manage freight consignments." },
  { icon: BookOpen, title: "Customer Ledger", desc: "Track balances, invoices and payments." },
  { icon: Truck, title: "Fleet & Dispatch", desc: "Monitor vehicle assignments and movement." },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Access operational reports and business insights." },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ─── LEFT — internal operations portal, warehouse photo, Yale Blue overlay ─── */}
      <div className="relative hidden w-[55%] flex-col overflow-hidden lg:flex">
        <Image
          src="/images/logistics-highway-truck.webp"
          alt="BlueRoute Logistics freight truck on a highway at sunset"
          fill
          sizes="55vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-yale/[0.68]" />

        <div className="relative flex flex-1 flex-col justify-center px-12 xl:px-20">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            BlueRoute Logistics ERP
          </h1>
          <p className="mt-4 text-lg font-medium text-cream">Enterprise Freight Operations</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
            Manage daily logistics operations securely from one workspace.
          </p>

          <div className="mt-14 grid max-w-lg grid-cols-1 gap-8 sm:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="flex items-start gap-3.5">
                <c.icon className="mt-0.5 size-6 shrink-0 text-cream" strokeWidth={1.5} />
                <div>
                  <p className="text-base font-semibold text-white">{c.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative px-12 pb-12 xl:px-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5">
            <Lock className="size-3.5 text-cream" strokeWidth={1.75} />
            <span className="text-xs font-medium text-white/80">Authorized Employees Only</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT — login card ─── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#F8FAFC] px-4 py-8 sm:px-6 md:py-12 lg:w-[45%] lg:flex-none lg:pl-12 lg:pr-20">
        <div className="w-full max-w-[520px]">
          <div className="text-center leading-tight">
            <p className="text-2xl font-black tracking-tight text-yale md:text-3xl">BlueRoute Logistics</p>
          </div>

          <div className="mt-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-sm sm:p-10 md:mt-8">
            <h2 className="text-xl font-bold tracking-tight text-ink-900 md:text-2xl">Sign in to ERP</h2>
            <p className="mt-1.5 text-sm text-ink-600">Secure employee access</p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:mt-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 md:mt-8 md:space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-ink-200 px-4 py-3 text-sm text-ink-900 focus:border-yale focus:outline-none focus:ring-2 focus:ring-yale/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-ink-200 px-4 py-3 pr-12 text-sm text-ink-900 focus:border-yale focus:outline-none focus:ring-2 focus:ring-yale/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-600"
                  >
                    {showPass ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <label className="flex items-center gap-2 text-sm text-ink-600">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-ink-300 text-yale focus:ring-2 focus:ring-yale/20"
                  />
                  Remember me
                </label>
                <a href="#" className="text-sm font-medium text-yale transition-colors hover:text-yale-dark">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-yale py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-yale-dark disabled:opacity-60"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                Login to ERP
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-sm text-ink-500 md:mt-6">
            <Link href="/" className="transition-colors hover:text-yale">← Back to Website</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
