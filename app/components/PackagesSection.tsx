"use client";

import Image from "next/image";
import { FiUsers, FiClock } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

interface PackageCardProps {
  id: string;
  image: string;
  imageAlt: string;
  tag: string;
  title: string;
  description: string;
  duration: string;
  capacity: string;
  price: string;
}

function PackageCard({
  image,
  imageAlt,
  tag,
  title,
  description,
  duration,
  capacity,
  price,
}: PackageCardProps) {
  const handleBook = () => {
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <article className="w-full flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
      {/* Top Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/50 rounded-full uppercase">
            {tag}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-6 justify-between">
        <div>
          {/* Package Title */}
          <h3 className="font-display text-xl font-bold text-slate-900 leading-tight mb-2">
            {title}
          </h3>
          
          {/* Brief Description */}
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            {description}
          </p>
        </div>

        <div>
          {/* Duration & Capacity */}
          <div className="flex items-center gap-4 text-slate-500 text-xs font-medium mb-5 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5">
              <FiClock className="text-emerald-600 text-sm" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiUsers className="text-emerald-600 text-sm" />
              <span>{capacity}</span>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="text-sm font-semibold text-slate-400">From</span>
            <span className="text-xl font-bold text-emerald-700">{price}</span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleBook}
            className="w-full py-3 px-4 font-semibold text-sm rounded-xl transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            Book This Package
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PackagesSection() {
  const PACKAGES: PackageCardProps[] = [
    {
      id: "boat-safari",
      tag: "Premium Safari",
      image: "/boat-safari.png",
      imageAlt: "Luxury pontoon boat gliding on Bolgoda Lake at sunset",
      title: "Exclusive Bolgoda Boat Safari",
      description: "Glide across the peaceful waters of Bolgoda Lake on a premium private pontoon. Experience stunning views, spot local wildlife, and capture the perfect sunset.",
      duration: "2 Hours",
      capacity: "Up to 12 Guests",
      price: "Rs. 15,000 / Group",
    },
    {
      id: "family-package",
      tag: "All-Inclusive",
      image: "/family-package.png",
      imageAlt: "Family enjoying lakeside farmhouse retreat with traditional Sri Lankan buffet",
      title: "Ultimate Family Day-Out",
      description: "Spend a relaxing day by the lakeside. Package includes full-day access to our private pool, outdoor lawn games, a scenic boat ride, and a traditional buffet lunch.",
      duration: "8 Hours",
      capacity: "Min 5 - Max 20 Guests",
      price: "Rs. 3,500 / Person",
    },
    {
      id: "sunset-canopy",
      tag: "Luxury Setup",
      image: "/sunset-canopy.png",
      imageAlt: "Intimate lakeside picnic canopy dining setup during sunset golden hour",
      title: "Lakeside Sunset Canopy",
      description: "An intimate, beautifully styled lakeside canopy setup. Perfect for romantic high tea, anniversaries, or private celebrations with scenic sunset views.",
      duration: "3 Hours",
      capacity: "2 - 6 Guests",
      price: "Rs. 12,500 / Group",
    },
  ];

  return (
    <section
      id="packages"
      className="w-full bg-slate-50 border-b border-slate-200"
    >
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-16 flex flex-col items-center text-center">
        
        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-4">
            <HiSparkles className="text-sm" />
            Curated Lakeside Escapes
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Choose Your <span className="text-emerald-700">Perfect Getaway</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-xl">
            Immerse yourself in the tranquility of Bolgoda Lake. Handcrafted nature experiences with luxury details.
          </p>
        </div>

        {/* Package Grid */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-stretch">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} {...pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
