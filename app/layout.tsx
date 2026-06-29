import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mandil Farmhouse | Luxury Lakeside Retreat on Bolgoda Lake, Sri Lanka",
  description:
    "Escape to Mandil Farmhouse — a premier lakeside sanctuary on Bolgoda Lake. Enjoy exclusive Boat Safaris, luxury Family Day-Out Packages, and authentic Sri Lankan hospitality surrounded by breathtaking tropical nature.",
  keywords:
    "Mandil Farmhouse, Bolgoda Lake, Sri Lanka, Boat Safari, Family Package, luxury retreat, lakeside, tropical, pontoon boat, day tour",
  openGraph: {
    title: "Mandil Farmhouse | Escape to Bolgoda's Finest Lakeside Retreat",
    description:
      "Luxury boat safaris and family day-out packages at Bolgoda Lake. Book your unforgettable experience today.",
    type: "website",
    locale: "en_US",
    siteName: "Mandil Farmhouse",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning={true}
    >
      <head>
        <script
          suppressHydrationWarning={true}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 1. Global console.error filter for other hydration noise
                const origError = console.error;
                console.error = function(...args) {
                  const errorStr = args.map(arg => {
                    if (arg && typeof arg === 'object') {
                      return arg.message || arg.stack || String(arg);
                    }
                    return String(arg);
                  }).join(' ');

                  if (
                    errorStr.includes('hydration') ||
                    errorStr.includes('Hydration') ||
                    errorStr.includes('mismatch') ||
                    errorStr.includes('Mismatch') ||
                    errorStr.includes('server rendered HTML') ||
                    errorStr.includes('bis_skin_checked') ||
                    errorStr.includes('did not match')
                  ) {
                    return;
                  }
                  origError.apply(console, args);
                };

                // 2. Real-time MutationObserver to strip extension attributes
                if (typeof document !== 'undefined') {
                  const clean = () => {
                    document.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
                  };
                  const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                      if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                        mutation.target.removeAttribute('bis_skin_checked');
                      } else if (mutation.addedNodes) {
                        mutation.addedNodes.forEach((node) => {
                          if (node.nodeType === 1) {
                            if (node.hasAttribute('bis_skin_checked')) node.removeAttribute('bis_skin_checked');
                            node.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
                          }
                        });
                      }
                    });
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', clean);
                  } else {
                    clean();
                  }
                }
              })();
            `
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body
        className="w-full overflow-x-hidden font-sans antialiased bg-white text-slate-600"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
