"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaAnchor, FaStar, FaClock, FaUsers, FaSun,
  FaGlassWhiskey, FaSwimmingPool, FaUtensils, FaCheck, FaFire,
} from "react-icons/fa";
import { HiSparkles, HiBadgeCheck } from "react-icons/hi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature { icon: React.ReactNode; text: string; }
interface PriceTier { label: string; value: string; note?: string; }

interface PackageCardProps {
  id: string;
  badge?: string;
  isPopular?: boolean;
  image: string;
  imageAlt: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  features: Feature[];
  pricing: PriceTier[];
  ctaLabel: string;
  delay: number;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: (delay: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const, delay },
  }),
};

// ─── PackageCard ──────────────────────────────────────────────────────────────

function PackageCard({
  id, badge, isPopular, image, imageAlt, tag,
  title, subtitle, description, features, pricing, ctaLabel, delay,
}: PackageCardProps) {
  const handleBook = () =>
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });

  return (
    <motion.article
      id={id}
      custom={delay}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col rounded-3xl overflow-hidden glass-card border border-white/10 hover:border-emerald-500/30 group transition-all duration-500 shadow-2xl hover:shadow-emerald-900/30 w-full"
    >
      {/* Badges */}
      {isPopular && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg">
          <FaFire className="text-[10px]" /> Most Popular
        </div>
      )}
      {badge && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <HiSparkles className="text-[10px]" /> {badge}
        </div>
      )}

      {/* Card image */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ height: "240px", minHeight: "200px", position: "relative" }}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/30 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 rounded-full glass border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
            {tag}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className="text-yellow-400 text-xs" />
          ))}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-6 sm:p-10 justify-between h-full">
        <div>
          <div className="mb-4">
            <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-1.5">
              {subtitle}
            </p>
            <h3 className="font-display text-2xl font-bold text-white leading-tight mb-2">
              {title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-left w-full justify-start text-sm text-slate-300">
                <span className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
                  {f.icon}
                </span>
                <span className="flex-1 leading-normal">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {/* Pricing table */}
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
              <HiBadgeCheck className="text-emerald-500" /> Pricing Structure
            </p>
            <div className="space-y-2">
              {pricing.map((p, i) => (
                <div key={i} className="flex items-center justify-between w-full py-1 border-b border-white/5 last:border-0 last:pb-0 first:pt-0">
                  <span className="text-sm text-slate-400 text-left">{p.label}</span>
                  <div className="text-right">
                    <span className="text-base font-bold text-white">{p.value}</span>
                    {p.note && (
                      <span className="block text-[11px] text-slate-500">{p.note}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="w-full mt-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBook}
              className="w-full py-4 px-6 font-semibold tracking-wide text-sm sm:text-base rounded-xl transition-all duration-300 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white btn-glow flex items-center justify-center gap-2"
            >
              <FaCheck className="text-xs" /> {ctaLabel}
            </motion.button>
            <p className="text-center text-[11px] text-slate-600 mt-2.5">
              ✓ Free cancellation up to 24h before
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────

const boatFeatures: Feature[] = [
  { icon: <FaAnchor />, text: "Luxury 12-seat pontoon or speedboat" },
  { icon: <FaClock />, text: "Flexible 1–4 hour durations" },
  { icon: <FaSun />, text: "Golden-hour sunset safari available" },
  { icon: <FaUsers />, text: "Private charter or shared group" },
  { icon: <FaGlassWhiskey />, text: "Chilled beverages & snacks on board" },
];

const familyFeatures: Feature[] = [
  { icon: <FaGlassWhiskey />, text: "Signature welcome drink on arrival" },
  { icon: <FaUtensils />, text: "Full traditional Sri Lankan buffet lunch" },
  { icon: <FaSwimmingPool />, text: "Unlimited pool access all day" },
  { icon: <FaAnchor />, text: "Complimentary 45-min boat ride included" },
  { icon: <FaSun />, text: "Outdoor games & lakeside picnic setup" },
  { icon: <FaUsers />, text: "Dedicated host — up to 20 guests" },
];

// ─── Section ──────────────────────────────────────────────────────────────────

export default function PackagesSection() {
  return (
    <section
      id="packages"
      className="w-full flex flex-col items-center py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a1628] relative overflow-hidden"
    >
      {/* Top accent rule */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-emerald-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-teal-900/20 blur-3xl" />
      </div>

      {/* ── Content boundary — Standardized max-w-6xl container ─────────── */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">

        {/* ── Section header — Standardized ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-4">
            <HiSparkles /> Featured Experiences
          </div>
          <h2
            id="safaris"
            className="font-display text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Choose Your <span className="text-gradient">Perfect Escape</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl">
            Handcrafted luxury experiences designed to immerse you in the natural
            magic of Bolgoda Lake.
          </p>
        </motion.div>

        {/* ── Package cards grid — Standardized component grid balance ────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full justify-center items-stretch mb-12 md:mb-16">
          <PackageCard
            id="boat-safari-card"
            badge="Premium"
            image="/boat-safari.png"
            imageAlt="Luxury pontoon boat gliding on Bolgoda Lake at sunset"
            tag="Exclusive Safari"
            title="Exclusive Boat Safari"
            subtitle="Premium Water Experience"
            description="Glide across Bolgoda Lake's shimmering waters on our luxury pontoon or speedboat. Spot rare birds, explore hidden coves, and soak in breathtaking sunsets only accessible by water."
            features={boatFeatures}
            pricing={[
              { label: "1 Hour", value: "LKR 8,500", note: "per boat, up to 12 guests" },
              { label: "2 Hours", value: "LKR 15,000", note: "most popular duration" },
              { label: "Sunset Charter (3h)", value: "LKR 22,000", note: "includes refreshments" },
            ]}
            ctaLabel="Book This Safari"
            delay={0.1}
          />
          <PackageCard
            id="family-package-card"
            badge="Best Value"
            isPopular
            image="/family-package.png"
            imageAlt="Family enjoying lakeside farmhouse retreat with traditional Sri Lankan buffet"
            tag="Family Day-Out"
            title="Ultimate Family Day-Out"
            subtitle="All-Inclusive Experience"
            description="The complete Mandil experience — arrive to a warm welcome, feast on an authentic Sri Lankan buffet, splash in the pool, and cruise the lake. Everything your family needs for a perfect day."
            features={familyFeatures}
            pricing={[
              { label: "Adult (12+)", value: "LKR 3,500", note: "per person" },
              { label: "Child (5–11)", value: "LKR 1,800", note: "per child" },
              { label: "Under 5", value: "Free", note: "complimentary entry" },
            ]}
            ctaLabel="Book This Package"
            delay={0.25}
          />
        </div>

        {/* ── Footnote ─────────────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 text-sm text-slate-500"
        >
          All packages include complimentary parking • Group discounts available
          for 15+ guests •{" "}
          <button
            onClick={() =>
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-emerald-500 hover:text-emerald-400 underline underline-offset-2 transition-colors"
          >
            Contact us for custom packages
          </button>
        </motion.p>
      </div>
    </section>
  );
}
