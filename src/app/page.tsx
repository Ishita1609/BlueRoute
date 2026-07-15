import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  MapPin,
  Phone,
  Mail,
  Shield,
  Clock,
  BarChart3,
  Package,
  ArrowRight,
  Route,
  ClipboardCheck,
  Linkedin,
  MessageCircle,
} from "lucide-react";

interface Service {
  title: string;
  description: string;
  features: string[];
  image: string;
}

const SERVICES: Service[] = [
  {
    title: "Road Freight",
    description: "Reliable truck and tempo transportation services across Uttar Pradesh with dependable and timely deliveries.",
    features: ["Door-to-door delivery", "Real-time tracking"],
    image: "/images/logistics-warehouse.jpg",
  },
  {
    title: "Rail Cargo",
    description: "Cost-effective rail freight for bulk shipments across India's extensive railway network.",
    features: ["Daily train manifests", "Bulk discount rates", "Pan-India coverage"],
    image: "/images/logistics-rail.jpg",
  },
  {
    title: "Air Cargo",
    description: "Fastest transit for time-critical shipments, with airport-to-airport and door-to-door options.",
    features: ["Express delivery", "Fragile handling", "Priority processing"],
    image: "/images/logistics-air-cargo.png",
  },
];

const WHY_US = [
  { icon: Shield, title: "100% Safe", desc: "Every shipment is insured and handled with utmost care." },
  { icon: Clock, title: "On Time", desc: "Industry-leading on-time delivery rate of 98.5%." },
  { icon: BarChart3, title: "Transparent", desc: "Live tracking, digital ledgers, and real-time reports." },
  { icon: MapPin, title: "Pan India", desc: "Network spanning 20+ cities across North India." },
];

// Always fetch fresh from the Office table — never statically cached, so a
// new office created in the ERP Settings page appears here immediately.
export const dynamic = "force-dynamic";

const CONTACT_INFO = [
  { icon: Phone, label: "Call Us", value: "9834579432" },
  { icon: Mail, label: "Email Us", value: "ops@blueroutelogistics.com" },
  { icon: MapPin, label: "Head Office", value: "Kanpur, Uttar Pradesh" },
];

export default async function LandingPage() {
  const offices = await prisma.office.findMany({
    where: { isActive: true },
    orderBy: { city: "asc" },
  });

  return (
    <div className="min-h-screen bg-ink-50 font-sans">
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="leading-tight">
              <p className="text-3xl font-black tracking-tight text-yale">BlueRoute Logistics</p>
            </div>
            <div className="hidden items-center gap-8 text-sm font-medium text-ink-600 md:flex">
              <a href="#services" className="transition-colors hover:text-navy-700">Services</a>
              <a href="#why-us" className="transition-colors hover:text-navy-700">Why Us</a>
              <a href="#tracking" className="transition-colors hover:text-navy-700">Track Shipment</a>
              <a href="#offices" className="transition-colors hover:text-navy-700">Offices</a>
              <a href="#contact" className="transition-colors hover:text-navy-700">Contact</a>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-yale px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-yale-dark"
            >
              Login to ERP
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO — full-bleed logistics photography, strong Yale Blue overlay ─── */}
      <section className="relative isolate flex min-h-[55vh] items-center overflow-hidden md:min-h-[85vh] lg:min-h-[90vh]">
        <Image
          src="/images/hero-background.png"
          alt="Freight ship, train and truck moving cargo containers at a port at sunset"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,77,146,0.88) 0%, rgba(15,77,146,0.72) 40%, rgba(15,77,146,0.32) 100%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 md:py-20">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-cream" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-wider text-cream md:text-sm">
                20+ Years of Trusted Freight Across North India
              </p>
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl md:mt-6 md:text-6xl lg:text-7xl">
              Connecting Businesses.
              <br />
              Delivering Trust.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-200 md:mt-6 md:text-lg">
              BlueRoute Logistics offers reliable road, rail and air freight services
              across Jaipur, Delhi, Lucknow, Kanpur and beyond.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-9 md:gap-4">
              <a
                href="#tracking"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-yale transition-colors duration-300 hover:bg-cream md:px-8 md:py-3.5"
              >
                Track Shipment
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center rounded-lg border border-white px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10 md:px-8 md:py-3.5"
              >
                Get a Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS — floating panel, overlapping the hero's bottom edge ─── */}
      <section className="relative px-4 pb-8 md:pb-14">
        <div className="relative z-10 mx-auto -mt-10 max-w-5xl rounded-[2rem] border border-ink-100 bg-white px-4 py-5 shadow-2xl shadow-navy-900/10 sm:-mt-16 sm:px-5 sm:py-6 md:px-12 md:py-9">
          <div className="grid grid-cols-2 gap-2 text-center sm:gap-5 md:grid-cols-4 md:gap-8">
            {[
              { label: "Cities", value: "75+" },
              { label: "Shipments/Month", value: "5000+" },
              { label: "Years of Experience", value: "20+" },
              { label: "Clients", value: "500+" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xl font-bold tabular-nums text-navy-900 sm:text-2xl md:text-3xl">{s.value}</div>
                <div className="mt-1 text-[11px] font-medium leading-tight text-ink-500 sm:text-xs md:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES — white, photography-led, no icons/glass/carousel ─── */}
      <section id="services" className="bg-white px-4 py-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-2xl md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-yale md:text-sm">What We Offer</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 md:text-4xl">Our Services</h2>
            <p className="mt-2 text-sm text-ink-600 md:mt-3 md:text-base">
              Complete multi-modal logistics solutions, built on decades of operational experience.
            </p>
          </div>
          {/* Mobile/tablet — horizontally swipeable cards, snap-to-card */}
          <div
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [&::-webkit-scrollbar]:hidden md:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="w-[78%] shrink-0 snap-center overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm sm:w-[45%]"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="80vw"
                    className="object-cover saturate-[0.85]"
                  />
                  <div className="absolute inset-0 bg-yale/15" />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{s.description}</p>
                  <ul className="mt-2.5 space-y-1.5 border-t border-ink-100 pt-2.5">
                    {s.features.slice(0, 2).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-ink-700">
                        <span className="size-1 shrink-0 rounded-full bg-yale" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-ink-400 md:hidden">Swipe to see all services →</p>

          {/* Desktop — unchanged 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-8">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-yale hover:shadow-xl"
              >
                <div className="relative h-52 w-full">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover saturate-[0.85]"
                  />
                  <div className="absolute inset-0 bg-yale/15" />
                </div>
                <div className="p-5 md:p-7">
                  <h3 className="text-lg font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.description}</p>
                  <ul className="mt-3 space-y-2 border-t border-ink-100 pt-3 md:mt-4 md:pt-4">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-ink-700">
                        <span className="size-1 shrink-0 rounded-full bg-yale" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US — premium split layout, Yale Blue design language ─── */}
      <section id="why-us" className="bg-white px-4 py-12 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:gap-16 lg:grid-cols-[45%_1fr]">
          <div className="relative h-[420px] overflow-hidden rounded-lg lg:h-[480px]">
            <Image
              src="/images/logistics-highway-network.png"
              alt="Aerial view of BlueRoute Logistics trucks moving across a connected highway network"
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover saturate-[0.85]"
            />
            <div className="absolute inset-0 bg-yale/15" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-yale md:text-sm">Why BlueRoute Logistics</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 md:text-4xl">Why Choose BlueRoute Logistics</h2>
            <p className="mt-3 max-w-lg text-sm text-ink-600 md:mt-4 md:text-base">
              Fifteen years of dependable freight operations have earned the trust of businesses across North
              India — built on transparency, safety and consistent delivery performance.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-6 md:mt-10 md:gap-x-8 md:gap-y-8">
              {WHY_US.map((f) => (
                <div key={f.title}>
                  <f.icon className="size-5 text-yale" strokeWidth={1.75} />
                  <h3 className="mt-2 font-bold text-ink-900 sm:mt-3">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{f.desc}</p>
                </div>
              ))}
            </div>
            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-yale px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-yale-dark md:mt-10 md:px-8 md:py-3.5"
            >
              Request a Quote
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── TRACKING — minimal enterprise lookup, no card, no imagery ─── */}
      <section id="tracking" className="bg-[#F5F8FC] px-4 py-10 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold tracking-tight text-ink-900 md:text-3xl">Shipment Tracking</h2>
          <p className="mt-2 text-ink-600">Already have your LR Number?</p>

          <div className="mx-auto mt-5 flex max-w-2xl flex-col gap-3 sm:flex-row md:mt-8">
            <input
              type="text"
              placeholder="Enter LR Number (e.g. LR240709384)"
              className="flex-1 rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm text-ink-900 shadow-sm focus:border-yale focus:outline-none focus:ring-2 focus:ring-yale/20 md:py-3.5"
            />
            <Link
              href="/tracking"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yale px-8 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-cream hover:text-yale md:py-3.5"
            >
              Track Shipment
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 md:mt-10">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-600">
              <Clock className="size-4 text-yale" strokeWidth={1.75} />
              Real-time Status
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-ink-600">
              <Route className="size-4 text-yale" strokeWidth={1.75} />
              Delivery Timeline
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-ink-600">
              <ClipboardCheck className="size-4 text-yale" strokeWidth={1.75} />
              Proof of Delivery
            </div>
          </div>
        </div>
      </section>

      {/* ─── OFFICES — light, split layout, Yale Blue design language ─── */}
      <section id="offices" className="bg-white px-4 py-12 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:gap-16 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-yale md:text-sm">Our Network</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 md:text-4xl">Our Offices</h2>
            <p className="mt-3 text-sm text-ink-600 md:text-base">Visit us at any of our locations across North India</p>
            <div className="mt-6 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-5 md:mt-10">
              {offices.map((o) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-ink-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-yale hover:shadow-lg sm:p-5"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-yale/10 text-yale">
                    <MapPin className="size-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-2.5 text-base font-semibold text-ink-900 sm:mt-3">{o.city}</h3>
                  {o.address && <p className="mt-1.5 text-sm text-ink-600">{o.address}</p>}
                  {o.phone && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-ink-600">
                      <Phone className="size-3" /> {o.phone}
                    </p>
                  )}
                </div>
              ))}
              {offices.length === 0 && (
                <p className="text-sm text-ink-500">No offices to display yet.</p>
              )}
            </div>
          </div>
          <div className="relative order-first h-[420px] overflow-hidden rounded-lg lg:order-last lg:h-[480px]">
            <Image
              src="/images/logistics-office-exterior.png"
              alt="BlueRoute Logistics office and distribution centre exterior with loading dock"
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover saturate-[0.85]"
            />
            <div className="absolute inset-0 bg-yale/15" />
          </div>
        </div>
      </section>

      {/* ─── CONTACT — calm, minimal, Yale Blue design language ─── */}
      <section id="contact" className="bg-white px-4 py-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-yale md:text-sm">Get in Touch</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 md:text-4xl">
              Let&apos;s Move Your Business Forward
            </h2>
            <p className="mt-3 text-sm text-ink-600 md:mt-4 md:text-base">
              Have a shipment to plan or a question about our services? Reach out and our team will respond
              within one business day.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:mt-16 md:gap-8 lg:grid-cols-2 lg:items-start">
            <div className="grid gap-5">
              {CONTACT_INFO.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 shadow-sm md:p-6"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-yale/10 text-yale">
                    <c.icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-ink-400">{c.label}</div>
                    <div className="mt-0.5 font-semibold text-ink-900">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-lg shadow-navy-900/5 md:p-8">
              <h3 className="text-lg font-bold text-ink-900">Send us a message</h3>
              <div className="mt-4 space-y-3 md:mt-6 md:space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-yale focus:outline-none focus:ring-2 focus:ring-yale/20"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-yale focus:outline-none focus:ring-2 focus:ring-yale/20"
                />
                <textarea
                  rows={4}
                  placeholder="Your message..."
                  className="w-full resize-none rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-yale focus:outline-none focus:ring-2 focus:ring-yale/20"
                />
                <button className="w-full rounded-lg bg-yale py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-yale-dark">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER — premium enterprise footer, Yale Blue ─── */}
      <footer className="bg-yale">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-14">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-8 lg:grid-cols-4 md:gap-y-10">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Package className="size-5 text-cream" strokeWidth={1.75} />
                </div>
                <span className="text-xl font-bold text-white">BlueRoute Logistics</span>
              </div>
              <p className="mt-3 text-sm text-white/60">Connecting Businesses. Delivering Trust.</p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-cream">Services</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70 md:mt-4 md:space-y-2.5">
                <li><a href="#services" className="transition-colors hover:text-white">Road Freight</a></li>
                <li><a href="#services" className="transition-colors hover:text-white">Rail Cargo</a></li>
                <li><a href="#services" className="transition-colors hover:text-white">Air Cargo</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-cream">Quick Links</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70 md:mt-4 md:space-y-2.5">
                <li><a href="#why-us" className="transition-colors hover:text-white">Why BlueRoute Logistics</a></li>
                <li><a href="#tracking" className="transition-colors hover:text-white">Track Shipment</a></li>
                <li><a href="#offices" className="transition-colors hover:text-white">Offices</a></li>
                <li><Link href="/login" className="transition-colors hover:text-white">Staff Login</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-cream">Contact</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70 md:mt-4 md:space-y-2.5">
                <li>98375290756</li>
                <li>ops@blueroutelogistics.com</li>
                <li>Kanpur Office</li>
              </ul>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-5 sm:flex-row md:mt-10 md:pt-6">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
              <p>© {new Date().getFullYear()} BlueRoute Logistics. All rights reserved.</p>
              <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-white">Terms</a>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" aria-label="LinkedIn" className="text-white/70 transition-colors hover:text-white">
                <Linkedin className="size-4" strokeWidth={1.75} />
              </a>
              <a href="#" aria-label="WhatsApp" className="text-white/70 transition-colors hover:text-white">
                <MessageCircle className="size-4" strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
