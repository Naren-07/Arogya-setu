export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="inline-block mb-4 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
          🇮🇳 Made for Rural India
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Healthcare Awareness
          <br />
          <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            In Your Language
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Ask health questions in Hindi or English via WhatsApp. Get instant
          guidance on symptoms, vaccinations, and preventive care.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/chat"
            className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 hover:-translate-y-0.5"
          >
            Try Web Chat →
          </a>
          <a
            href="https://wa.me/14155238886?text=join%20sandbox"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:-translate-y-0.5"
          >
            📱 WhatsApp Chat
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: '💬',
            title: 'Symptom Guidance',
            description: 'Ask about symptoms and get simple health advice with doctor visit recommendations when needed.',
          },
          {
            icon: '💉',
            title: 'Vaccination Schedules',
            description: 'Look up child and adult vaccination schedules based on Indian government guidelines.',
          },
          {
            icon: '🌿',
            title: 'Preventive Tips',
            description: 'Get hygiene tips, seasonal health advice, and preventive care guidance for rural life.',
          },
          {
            icon: '🌐',
            title: 'Multilingual',
            description: 'Chat in English or Hindi. The bot detects your language and responds accordingly.',
          },
          {
            icon: '⚡',
            title: 'Instant Responses',
            description: 'Get answers in under 3 seconds via WhatsApp — no app download needed.',
          },
          {
            icon: '🚨',
            title: 'Outbreak Alerts',
            description: 'Receive alerts about disease outbreaks in your area with precautions and safety tips.',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:shadow-lg hover:shadow-primary-100 transition-all hover:-translate-y-1"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {[
            { step: '1', text: 'Send a message on WhatsApp' },
            { step: '2', text: 'AI processes your query' },
            { step: '3', text: 'Get health guidance in seconds' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                {item.step}
              </div>
              <span className="text-gray-700 font-medium">{item.text}</span>
              {index < 2 && (
                <span className="hidden md:block text-gray-300 text-2xl ml-4">→</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
