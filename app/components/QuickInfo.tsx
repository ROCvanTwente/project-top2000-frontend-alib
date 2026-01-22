import Link from 'next/link';
import { Calendar, Users, Music, TrendingUp, Radio, ArrowUpRight } from 'lucide-react';

export default function QuickInfo() {
  return (
    <div>
      {/* Top 5 Songs Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-3 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Ontdek TOP2000
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Ontdek de beste muziek uit meer dan twee decennia radiouitmuntendheid
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href={`/year`}
              className="relative bg-white p-7 rounded-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-neutral-200 hover:border-red-300 hover:-translate-y-2 min-h-[200px]"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1619468653928-d1a9c708903b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxlbmRhciUyMG11c2ljJTIwdmludGFnZXxlbnwxfHx8fDE3NjQ3NDgyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/70 to-red-700/70 group-hover:from-red-600/80 group-hover:to-red-700/80 transition-all duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-white transition-colors" />
                </div>
                <h3 className="mb-2 text-white transition-colors">Zoeken op Jaar</h3>
                <p className="text-red-100 transition-colors text-sm">
                  Bekijk ranglijsten van 1999 tot 2024
                </p>
              </div>
              <div className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              </div>
            </Link>

            <Link
              href="/artists"
              className="relative bg-white p-7 rounded-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-neutral-200 hover:border-neutral-800 hover:-translate-y-2 min-h-[200px]"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1649197506484-16a3a3b61f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFydGlzdHMlMjBjb25jZXJ0fGVufDF8fHx8MTc2NDc0ODIxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700/70 to-neutral-900/70 group-hover:from-neutral-700/80 group-hover:to-neutral-900/80 transition-all duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white transition-colors" />
                </div>
                <h3 className="mb-2 text-white transition-colors">Artiesten</h3>
                <p className="text-neutral-200 transition-colors text-sm">
                  Ontdek alle uitgelichte artiesten
                </p>
              </div>
              <div className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <ArrowUpRight className="h-4 w-4 text-neutral-700" />
              </div>
            </Link>

            <Link
              href="/songs"
              className="relative bg-white p-7 rounded-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-neutral-200 hover:border-orange-300 hover:-translate-y-2 min-h-[200px]"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1631692362908-7fcbc77c5104?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZHMlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2NDYzOTQ0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/70 to-orange-600/70 group-hover:from-orange-500/80 group-hover:to-orange-600/80 transition-all duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Music className="h-6 w-6 text-white transition-colors" />
                </div>
                <h3 className="mb-2 text-white transition-colors">Nummers</h3>
                <p className="text-orange-100 transition-colors text-sm">
                  Blader door alle TOP2000 nummers
                </p>
              </div>
              <div className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <ArrowUpRight className="h-4 w-4 text-orange-600" />
              </div>
            </Link>

            <Link
              href="/statistics"
              className="relative bg-white p-7 rounded-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-neutral-200 hover:border-yellow-400 hover:-translate-y-2 min-h-[200px]"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1720962158812-d16549f1e5a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNoYXJ0cyUyMGRhdGF8ZW58MXx8fHwxNzY0NzQ4MjE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/70 to-yellow-600/70 group-hover:from-yellow-500/80 group-hover:to-yellow-600/80 transition-all duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-white transition-colors" />
                </div>
                <h3 className="mb-2 text-white transition-colors">Statistieken</h3>
                <p className="text-yellow-100 transition-colors text-sm">
                  Bekijk grafieken en inzichten
                </p>
              </div>
              <div className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <ArrowUpRight className="h-4 w-4 text-yellow-600" />
              </div>
            </Link>

            <a
              href="https://en.wikipedia.org/wiki/Bart_Arends"
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-white p-7 rounded-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-neutral-200 hover:border-red-300 hover:-translate-y-2 min-h-[200px]"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1760895223972-57b1d858d77e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpbyUyMGJyb2FkY2FzdGluZyUyMHN0dWRpb3xlbnwxfHx8fDE3NjQ3NDgyMTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/70 to-red-600/70 group-hover:from-red-500/80 group-hover:to-red-600/80 transition-all duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Radio className="h-6 w-6 text-white transition-colors" />
                </div>
                <h3 className="mb-2 text-white transition-colors">Bart Arends</h3>
                <p className="text-red-100 transition-colors text-sm">
                  Meer informatie over de presentatoren
                </p>
              </div>
              <div className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}