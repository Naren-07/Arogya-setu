import '@/styles/globals.css';

export const metadata = {
  title: 'SwasthyaSaathi Lite — AI Healthcare Chatbot',
  description: 'Multilingual AI chatbot providing basic healthcare awareness to rural and semi-urban populations in India via WhatsApp.',
  keywords: ['healthcare', 'chatbot', 'AI', 'WhatsApp', 'India', 'multilingual', 'Hindi'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-primary-100">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                SwasthyaSaathi
              </h1>
              <span className="text-xs font-medium px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                Lite
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                Home
              </a>
              <a
                href="/chat"
                className="text-sm font-medium px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                Chat Now
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
            <p>⚠️ This chatbot provides general guidance only. Please consult a doctor for medical advice.</p>
            <p className="mt-2">SwasthyaSaathi Lite — Built for Hackathon 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
