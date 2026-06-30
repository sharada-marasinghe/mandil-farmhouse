"use client";

import { useState } from "react";
import { FiPhone, FiMail, FiMapPin, FiClock, FiCheckCircle, FiSend } from "react-icons/fi";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API request submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Header Hero */}
        <section className="bg-white border-b border-slate-200 py-16 md:py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
              Contact <span className="text-[#00966B] italic font-serif">Us</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Have questions about customized charters, menu options, or booking? Reach out to us and we will get back to you shortly.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Left Column - Contact Details */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 flex-1">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Resort Information
                </h3>

                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <FiPhone className="text-base" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</h4>
                      <p className="text-slate-900 font-semibold text-sm mt-1">
                        <a href="tel:+94779911825" className="hover:text-emerald-600 transition-colors">
                          +94 77 991 1825
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <FiMail className="text-base" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</h4>
                      <p className="text-slate-900 font-semibold text-sm mt-1">
                        <a href="mailto:info@mandilfarmhouse.com" className="hover:text-emerald-600 transition-colors">
                          info@mandilfarmhouse.com
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <FiMapPin className="text-base" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</h4>
                      <p className="text-slate-900 font-medium text-xs leading-relaxed mt-1">
                        Bolgoda Lake, Panadura, Western Province, Sri Lanka
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <FiClock className="text-base" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hours</h4>
                      <p className="text-slate-905 font-medium text-xs leading-relaxed mt-1">
                        Open Daily: 7:00 AM – 7:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col justify-center">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                      <FiCheckCircle size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-905">Message Received!</h3>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting Mandil Farmhouse. We have received your inquiry and our team will get in touch with you shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 py-2.5 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Send a Message
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Name */}
                      <div className="space-y-2">
                        <label htmlFor="inquiryName" className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          id="inquiryName"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label htmlFor="inquiryPhone" className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                          Phone Number
                        </label>
                        <input
                          id="inquiryPhone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+94 77 123 4567"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="inquiryEmail" className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        id="inquiryEmail"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label htmlFor="inquiryMessage" className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                        Message / Details
                      </label>
                      <textarea
                        id="inquiryMessage"
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about your event, date, guest count, or questions..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#00966B] hover:bg-[#007c58] text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit Message</span>
                          <FiSend className="text-xs" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
