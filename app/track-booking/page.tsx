import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookingTracker from "../components/BookingTracker";

export const metadata: Metadata = {
  title: "Track Your Booking | Mandil Farmhouse, Bolgoda",
  description:
    "Enter your booking number to view your reservation details, check payment status, and download your receipt for Mandil Farmhouse, Bolgoda Lake.",
  keywords:
    "Mandil Farmhouse, booking tracker, receipt, payment status, Bolgoda Lake, Sri Lanka",
};

export default function TrackBookingPage() {
  return (
    <main className="w-full min-h-screen overflow-x-hidden flex flex-col items-center bg-[#0a1628]">
      <Navbar />
      <BookingTracker />
      <Footer />
    </main>
  );
}
