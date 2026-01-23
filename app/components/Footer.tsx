import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-red-900 to-red-500 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <Link href="/">
              <img src="/images/logo_roc_opendag.png" alt="Top2000 Logo" className="h-20 w-auto" />
            </Link>
            <p className="text-neutral-300 mt-4 leading-relaxed">
              De ultieme muziekcountdown die de beste nummers aller tijden viert.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-white">Snelle Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 group-hover:bg-white transition-colors" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/artists" className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 group-hover:bg-white transition-colors" />
                  Artiesten
                </Link>
              </li>
              <li>
                <Link href="/songs" className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 group-hover:bg-white transition-colors" />
                  Nummers
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 group-hover:bg-white transition-colors" />
                  Statistieken
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-white">Hulpmiddelen</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/history" className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 group-hover:bg-white transition-colors" />
                  Geschiedenis
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 group-hover:bg-white transition-colors" />
                  Veelgestelde Vragen
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 group-hover:bg-white transition-colors" />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/playlists" className="text-neutral-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 group-hover:bg-white transition-colors" />
                  Mijn Afspeellijsten
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-10 pt-8 text-center">
          <p className="text-neutral-400">&copy; {new Date().getFullYear()} TOP2000. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
}
