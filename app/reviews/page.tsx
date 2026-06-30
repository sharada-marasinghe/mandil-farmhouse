"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TestimonialsSection from "@/app/components/TestimonialsSection";

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pb-16">
        <div className="w-full bg-white border-b border-slate-200 py-12 md:py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Guest <span className="text-[#00966B] italic font-serif">Reviews</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              Read authentic feedback from families, couples, and travel groups who spent their holidays at Mandil Farmhouse.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8">
          <TestimonialsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
