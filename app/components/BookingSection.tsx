import { HiOutlineSparkles } from "react-icons/hi";
import BookingDynamicLoader from "./BookingDynamicLoader";

export default function BookingSection() {
  return (
    <section
      id="booking"
      className="w-full py-20 md:py-28 bg-slate-50 border-b border-slate-100 flex flex-col items-center"
    >
      {/* Content boundary */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-4">
            <HiOutlineSparkles size={14} />
            Book Your Experience
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reserve Your Getaway
          </h2>

          <p className="text-slate-500 text-xs mt-2">
            Secure your spot in minutes. We&apos;ll confirm within 2 hours with a personal call.
          </p>
        </div>

        {/* Dynamic loader for form (ssr: false) */}
        <div className="w-full">
          <BookingDynamicLoader />
        </div>
      </div>
    </section>
  );
}
