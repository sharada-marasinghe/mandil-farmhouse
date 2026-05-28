"use client";

// ─── Why this file exists ─────────────────────────────────────────────────────
// Next.js 16 enforces that `next/dynamic` with `{ ssr: false }` must live
// inside a Client Component — calling it from a Server Component is a build
// error. This thin wrapper owns that boundary.
//
// Pattern:
//   Server Component (BookingSection)
//     └─ Client Component (BookingDynamicLoader)   ← you are here
//          └─ dynamic() { ssr: false }
//               └─ BookingForm  (client-only, DatePicker safe)
// ─────────────────────────────────────────────────────────────────────────────

import dynamic from "next/dynamic";
import BookingFormSkeleton from "./BookingFormSkeleton";

// Declared at module scope so webpack sees a stable chunk reference across
// renders — never move this inside the component body.
const BookingForm = dynamic(() => import("./BookingForm"), {
  ssr: false,
  loading: () => <BookingFormSkeleton />,
});

export default function BookingDynamicLoader() {
  return <BookingForm />;
}
