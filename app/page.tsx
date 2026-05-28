import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PackagesSection from "./components/PackagesSection";
import GallerySection from "./components/GallerySection";
import TestimonialsSection from "./components/TestimonialsSection";
import BookingSection from "./components/BookingSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    /*
     * <main> is the second containment layer (after <body>).
     *
     * w-full          — fills 100% of the body width, never wider.
     * min-h-screen    — ensures the dark background reaches the fold.
     * overflow-x-hidden — redundant safety net: clips anything that
     *                    escapes a child section before it can widen
     *                    the scroll container.
     * flex flex-col   — stacks sections vertically in a flex formatting
     *                   context. items-center centres each section's
     *                   block on the horizontal axis unconditionally —
     *                   this is the master centering signal that every
     *                   child `w-full flex flex-col items-center` section
     *                   inherits and reinforces.
     * bg-[#0a1628]    — fallback colour for any gap between sections.
     */
    <main className="w-full min-h-screen overflow-x-hidden flex flex-col items-center bg-[#0a1628]">
      <Navbar />
      <Hero />
      <PackagesSection />
      <GallerySection />
      <TestimonialsSection />
      <BookingSection />
      <Footer />
    </main>
  );
}
