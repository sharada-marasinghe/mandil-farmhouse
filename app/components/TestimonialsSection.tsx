"use client";

import { FiStar } from "react-icons/fi";

const testimonials = [
  {
    name: "Priya & Rohan",
    location: "Colombo",
    rating: 5,
    text: "Absolutely magical! The sunset boat safari was the highlight of our anniversary weekend. The crew was professional, the pontoon was immaculate, and the views were beyond words. Mandil Farmhouse is a hidden gem.",
    package: "Sunset Boat Safari",
    initials: "PR",
  },
  {
    name: "The Wijesooriya Family",
    location: "Kandy",
    rating: 5,
    text: "We came as a family of 12 for our annual outing. The buffet was incredible — so much authentic Sri Lankan food. Kids loved the pool and the short boat ride was the perfect surprise. Highly recommend!",
    package: "Family Day-Out Package",
    initials: "WF",
  },
  {
    name: "Alex & Sarah",
    location: "Australia",
    rating: 5,
    text: "We were visiting Sri Lanka and stumbled upon Mandil Farmhouse. Best decision ever! The lake scenery is stunning, the welcome drink refreshing, and the staff made us feel like royalty. Will be back!",
    package: "2-Hour Boat Safari",
    initials: "AS",
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
      id="testimonials"
      className="w-full bg-white border-b border-slate-100"
    >
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-16 flex flex-col items-center text-center">
        
        {/* Stats Row */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 py-8 bg-slate-50 rounded-2xl my-12 text-center justify-center">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center"
            >
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {stat.value}<span className="text-emerald-500">{stat.suffix}</span>
              </div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight text-center">
            Stories from Our Happy Guests
          </h2>
          <p className="text-slate-500 text-sm mt-3 max-w-xl">
            Real experiences from the families and adventurers who made Mandil their favourite escape.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-stretch">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-50 border border-slate-100 p-6 rounded-xl flex flex-col justify-between hover:shadow-xs transition-shadow duration-200 w-full text-left"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex gap-0.5 mb-4 text-emerald-500">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} className="fill-emerald-500" size={14} />
                  ))}
                </div>
                {/* Quote Text */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              {/* User Metadata */}
              <div className="flex items-center gap-3 border-t border-slate-200/50 pt-4 mt-auto">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-slate-900 font-semibold text-xs leading-none">
                    {t.name}
                  </h4>
                  <span className="text-slate-500 text-[10px] block mt-1 font-medium">
                    {t.location} · {t.package}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
