"use client";

import Carousel from '../components/customUI/Carousel';

export default function HistoryPage() {
  const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1629426958038-a4cb6e3830a0?w=1200',
      title: 'Geschiedenis van de TOP2000',
      subtitle: 'Het verhaal achter de lijst der lijsten'
    }
  ];

  const timeline = [
    {
      year: 1999,
      title: 'Het Begin',
      description: 'De eerste NPO Radio 2 Top2000 werd uitgezonden van 26 december tot 31 december 1999 als eenmalig millenniumproject, maar werd zo\'n groot succes dat het sindsdien jaarlijks terugkeert. De eerste editie startte na Kerst met John Denver\'s "Thank God I\'m a Country Boy" op nummer 2000.'
    },
    {
      year: 2000,
      title: 'Vast Programma',
      description: 'Na het enorme succes van de eerste editie besloot NPO Radio 2 om de Top2000 elk jaar opnieuw uit te zenden tijdens de kerstperiode. Stemmen konden publiekelijk worden uitgebracht om de 2000 nummers te bepalen.'
    },
    {
      year: 2005,
      title: 'Eerste Andere Nummer 1',
      description: 'Voor het eerst stond niet "Bohemian Rhapsody" bovenaan: de Nederlandse klassieker "Avond" van Boudewijn de Groot stond dat jaar op nummer 1.'
    },
    {
      year: 2009,
      title: 'Vroege Start',
      description: 'De uitzending begon voortaan al om de middag op eerste kerstdag, zodat er meer tijd was voor langere nummers.'
    },
    {
      year: 2010,
      title: 'Top 2000 Café',
      description: 'Rond deze tijd werd het Top 2000 Café in Hilversum geïntroduceerd als fysieke locatie waar publiek en dj\'s de uitzending samen beleven.'
    },
    {
      year: 2011,
      title: 'Unieke Opening',
      description: 'De uitzending werd geopend met een bericht vanaf het internationale ruimtestation ISS door astronaut André Kuipers—een bijzondere mijlpaal in de geschiedenis.'
    },
    {
      year: 2018,
      title: 'Top 2000 Award',
      description: 'NPO Radio 2 introduceerde de jaarlijkse Top 2000 Award voor de Nederlands artiest met de hoogste nieuwe binnenkomer in de lijst.'
    },
    {
      year: 2020,
      title: 'Kerstavond Start',
      description: 'Vanaf 2020 begint de Top2000 officieel al om middernacht op eerste kerstdag, zodat langere albumversies gedraaid kunnen worden in plaats van korte radioversies.'
    },
    {
      year: 2023,
      title: '25 Jaar Top2000',
      description: 'In 2023 vierde de Top2000 zijn 25-jarig jubileum en werden ook de nummers van plaats 2001-2500 (De Extra 500) gepubliceerd.'
    },
    {
      year: 2025,
      title: 'Recente Editie',
      description: 'De 27e editie van de Top2000 werd opnieuw uitgezonden met Queen\'s "Bohemian Rhapsody" als populairste nummer, wat vaak de hoogste notering in de Top2000 is.'
    }
  ];

  return (
    <div>
      <Carousel slides={carouselSlides} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="mb-6">Het Verhaal van de TOP2000</h2>
          <p className="text-gray-700 leading-relaxed">
            De <strong>TOP2000</strong> is een jaarlijks terugkerende radiomarathon op <strong>NPO Radio 2</strong>, waarin 
            luisteraars stemmen op hun favoriete 2000 nummers aller tijden. Sinds de eerste uitzending in 1999 is het 
            uitgegroeid tot een van de grootste muziek- en radiotradities van Nederland, geliefd bij miljoenen luisteraars.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200 hidden md:block" />

          <div className="space-y-12">
            {timeline.map((event, index) => (
              <div
                key={event.year}
                className={`relative flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full mb-3">
                      {event.year}
                    </span>
                    <h3 className="mb-3">{event.title}</h3>
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex w-2/12 justify-center my-4 md:my-0">
                  <div className="w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg" />
                </div>

                {/* Spacer */}
                <div className="hidden md:block w-5/12" />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="mb-4">Hoe het Werkt</h3>
            <p className="text-gray-700">
              Luisteraars stemmen vooraf op hun favoriete nummers via de website van NPO Radio 2. De lijst 
              wordt samengesteld op basis van deze publieke stemmen.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="mb-4">Uitzending & Datum</h3>
            <p className="text-gray-700">
              De Top2000 wordt elk jaar uitgezonden tussen eerste kerstdag en oudejaarsavond. Sinds 2020 begint 
              de uitzending al op 25 december om 00:00 uur.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="mb-4">Culturele Impact</h3>
            <p className="text-gray-700">
              De Top2000 is een van de grootste radiotradities van Nederland en wordt door miljoenen mensen 
              gevolgd — vaak genoemd als de "lijst der lijsten".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
