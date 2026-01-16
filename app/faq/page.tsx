"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Carousel from '../components/customUI/Carousel';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1758272248920-a39302af6d5f?w=1200',
      title: 'Veelgestelde Vragen',
      subtitle: 'Vind antwoorden op veel gestelde vragen'
    }
  ];

  const faqs = [
    {
      "question": "Waar kan ik de Top 2000 online terugkijken en luisteren?",
      "answer": <p>Kijk en luister de NPO Radio 2 Top 2000 van 2025 <a className='bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent' href="https://www.nporadio2.nl/top2000-terugkijken-2025" target="_blank" rel="noreferrer noopener">hier</a> terug</p>
    },
    {
      "question": "Waar kan ik de Openingsshow van de Top 2000 terugkijken?",
      "answer": <p><a className='bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent' href="https://www.nporadio2.nl/nieuws/top2000/2ae87300-7dd9-47f4-954b-f266a5a03666/kijk-hier-live-naar-de-openingsshow-van-de-npo-radio-2-top-2000" target="_blank" rel="noreferrer noopener">Klik hier </a>om de Openingsshow van de Top 2000 te kijken</p>
    },
    {
      "question": "Staan alle nummers van de NPO Radio 2 Top 2000 ook in een Spotifylijst?",
      "answer": <><p>Elk jaar updaten we weer onze Spotifylijst met alle nummers uit de NPO Radio 2 Top 2000. </p><p><a className='bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent' href="https://open.spotify.com/playlist/1DTzz7Nh2rJBnyFbjsH1Mh?si=35329217ad4b4e94" target="_blank" rel="noreferrer noopener">Luister hier naar de NPO Radio 2 Top 2000 op Spotify</a></p></>
    },
    {
      "question": "Wat is het dj-team voor 2025?",
      "answer": <><h2><strong>Presentatieschema van de NPO Radio 2 Top 2000 van 2025:</strong></h2><p className="p1">00.00 - 02.00 uur Jeroen van Inkel<br />02.00 - 04.00 uur Daniël Lippens<br />04.00 - 06.00 uur Tim Op het Broek<br />06.00 - 08.00 uur Tannaz Hajeby<br />08.00 - 10.00 uur Jeroen Kijk in de Vegte<br />10.00 - 12.00 uur Bart Arens<br />12.00 - 14.00 uur Annemieke Schollaardt<br />14.00 - 16.00 uur Paul Rabbering<br />16.00 - 18.00 uur Ruud de Wild<br />18.00 - 20.00 uur Emmely de Wilt<br />20.00 - 22.00 uur Morad El Ouakili<br />22.00 - 00.00 uur Jan-Willem Roodbeen</p></>
    },
    {
      "question": "Wanneer begint de NPO Radio 2 Top 2000?",
      "answer": <p>De uitzending van de NPO Radio 2 Top 2000 begint op donderdag 25 december meteen om 00.00 uur. Traditiegetrouw is de nummer 1 op oudejaarsdag vlak voor de jaarwisseling te horen.</p>
    },
    {
      "question": "Hoe kan ik bij de NPO Radio 2 Top 2000 aanwezig zijn?",
      "answer": <p>Ticketverkoop voor het Top 2000 Café was op zaterdag 13 december om 10.00 uur.&nbsp;</p>
    },
    {
      "question": "Wanneer mag ik stemmen voor de NPO Radio 2 Top 2000?",
      "answer": <p>Je kon stemmen voor de NPO Radio 2 Top 2000 van 1 t/m 8 december.&nbsp;</p>
    },
    {
      "question": "Hoe luister ik naar de NPO Radio 2 Top 2000?",
      "answer": <p>Lees <a href="https://www.nporadio2.nl/nieuws/top2000/14a5a14d-13e2-41be-9d08-967bfe653b0b/zo-volg-je-dit-jaar-de-npo-radio-2-top-2000">alles over luisteren naar NPO Radio 2</a>.</p>
    },
    {
      "question": "Waar is de NPO Radio 2 Top 2000 op Visual Radio te zien?",
      "answer": <p>De NPO Radio 2 Top 2000 is non-stop live te zien via <a className='bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent' href="http://radio2.nl/">nporadio2.nl</a> en de gratis NPO Luister-app. </p>
    },
    {
      "question": "Wanneer wordt de complete lijst bekendgemaakt?",
      "answer": <p><a className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent" href="https://www.nporadio2.nl/nieuws/top2000/467529e3-adee-43d0-a02d-c7e310a743f9/dit-is-de-npo-radio-2-top-2000-lijst-van-2025" target="_blank" rel="noreferrer noopener"><strong>Klik hier om de Top 2000-lijst van 2025 te bekijken</strong></a></p>
    },
    {
      "question": "Wat voor tune draaien jullie toch steeds?",
      "answer": <p>Aan het begin van ieder uur hoor je: Tommy Overture (The Who). Deze is voor de eerste NPO Radio 2 Top 2000 in 1999 opnieuw opgenomen door het Metropole Orkest o.l.v. Dick Bakker. In 2016 is de tune in een nieuw jasje gestoken.</p>
    },
    {
      "question": "In welke kranten staat de lijst van de NPO Radio 2 Top 2000?",
      "answer": <p>De lijst komt dit jaar in <span>Dagblad van het Noorden te staan.&nbsp;</span></p>
    },
    {
      "question": "Waarom zenden jullie de NPO Radio 2 Top 2000 24 uur per dag uit?",
      "answer": <p>In 1999, het eerste jaar van de Top 2000, is ervoor gekozen de lijst als bijzonder project, achter elkaar uit te zenden. Uit onderzoek onder luisteraars is gebleken dat geen onderbreking charmant werd gevonden en de spanning van de NPO Radio 2 Top 2000 zo bewaard bleef. Sommige luisteraars zetten zelfs de wekker om hun favoriete nummers te horen. Overigens zou een NPO Radio 2 Top 2000 die over meerdere dagen wordt gespreid ook niet volledig beluisterd kunnen worden door de meeste mensen. Sterker nog; meer mensen zullen in geval van een langere periode (12 i.p.v. 6 dagen) moeten werken en dus juist minder kunnen luisteren. </p>
    },
    {
      "question": "Kan ik de tunes van de NPO Radio 2 Top 2000 ergens downloaden?",
      "answer": <p>Nee, helaas mogen de tunes niet ter download aangeboden worden.</p>
    },
    {
      "question": "Waarom brengen jullie de NPO Radio 2 Top 2000 niet helemaal uit op CD?",
      "answer": <p>Dat is een rechtenkwestie; lang niet alle platenmaatschappijen en/of artiesten geven toestemming voor het uitbrengen van hun nummer op zo'n CD. En wat zou een Top 2000 CD zijn zonder bijvoorbeeld de nummers van de The Beatles of The Rolling Stones? Op nporadio2.nl kun je de NPO Radio 2 <a className='bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent' href="https://www.nporadio2.nl/top2000-terugkijken-2023">Top 2000 editie 2024 terugluisteren</a>. Ook zijn de edities van de NPO Radio 2 Top 2000 via het officiële <a className='bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent' href="http://open.spotify.com/user/radio2nl">NPO Radio 2 Spotify-account</a> beschikbaar.</p>
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <Carousel slides={carouselSlides} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition"
              >
                <h4 className="pr-8">{faq.question}</h4>
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
