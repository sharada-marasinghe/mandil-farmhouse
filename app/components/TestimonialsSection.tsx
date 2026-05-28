"use client";

import { motion } from "framer-motion";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const testimonials = [
  {
    name: "Priya & Rohan",
    location: "Colombo",
    rating: 5,
    text: "Absolutely magical! The sunset boat safari was the highlight of our anniversary weekend. The crew was professional, the pontoon was immaculate, and the views were beyond words. Mandil Farmhouse is a hidden gem.",
    package: "Sunset Boat Safari",
    initials: "PR",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "The Wijesooriya Family",
    location: "Kandy",
    rating: 5,
    text: "We came as a family of 12 for our annual outing. The buffet was incredible — so much authentic Sri Lankan food. Kids loved the pool and the short boat ride was the perfect surprise. Highly recommend!",
    package: "Family Day-Out Package",
    initials: "WF",
    color: "from-teal-500 to-cyan-600",
  },
  {
    name: "Alex & Sarah",
    location: "Australia",
    rating: 5,
    text: "We were visiting Sri Lanka and stumbled upon Mandil Farmhouse. Best decision ever! The lake scenery is stunning, the welcome drink refreshing, and the staff made us feel like royalty. Will be back!",
    package: "2-Hour Boat Safari",
    initials: "AS",
    color: "from-cyan-500 to-emerald-500",
  },
];

const stats = [
  { value: "500+", label: "Happy Guests", suffix: "" },
  { value: "4.9", label: "Google Rating", suffix: "★" },
  { value: "3+", label: "Years of Excellence", suffix: "" },
  { value: "100%", label: "Satisfaction Rate", suffix: "" },
];

export default function TestimonialsSection() {
  return (
    <section
      id="about"
      className="w-full flex flex-col items-center py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#0d2137] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-900/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-emerald-900/15 blur-3xl" />
      </div>

      {/* ── Content boundary — Standardized max-w-6xl container ─────────── */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Stats row — Standardized widths and centering */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20 w-full"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card rounded-2xl border border-white/10 p-6 text-center hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-1">
                {stat.value}<span className="text-gold-400">{stat.suffix}</span>
              </div>
              <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials header — Standardized ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-4">
            <HiSparkles /> Guest Experiences
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Stories from Our <span className="text-gradient">Happy Guests</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl">
            Real experiences from the families and adventurers who made Mandil their favourite escape.
          </p>
        </motion.div>

        {/* Testimonial cards grid — Standardized 3-column tracking ────────── */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 items-stretch mt-12 md:mt-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="glass-card rounded-3xl border border-white/5 hover:border-emerald-500/20 p-6 sm:p-8 flex flex-col justify-between h-full bg-[#0d1f38] transition-all duration-300 w-full"
            >
              <div>
                <FaQuoteLeft className="text-emerald-700 text-2xl flex-shrink-0 mb-4 text-left" />
                <p className="text-slate-300 text-sm leading-relaxed text-left italic mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-0.5 mb-6 justify-start">
                  {[...Array(t.rating)].map((_, j) => (
                    <FaStar key={j} className="text-yellow-400 text-xs" />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full justify-start text-left mt-auto pt-4 border-t border-white/5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {t.initials}
                </div>
                <div className="flex flex-col text-left">
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.location} · {t.package}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
