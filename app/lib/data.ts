export const getDJList = () => [
  { name: 'Bart Arends', url: 'https://en.wikipedia.org/wiki/Bart_Arends' },
  { name: 'Frank van der Lende', url: 'https://nl.wikipedia.org/wiki/Frank_van_der_Lende' },
  { name: 'Jeroen van Inkel', url: 'https://nl.wikipedia.org/wiki/Jeroen_van_Inkel' },
  { name: 'Jan-Willem Roodbeen', url: 'https://nl.wikipedia.org/wiki/Jan-Willem_Roodbeen' },
  { name: 'Jeroen Kijk in de Vegte', url: 'https://nl.wikipedia.org/wiki/Jeroen_Kijk_in_de_Vegte' },
  { name: 'Gerard Ekdom', url: 'https://nl.wikipedia.org/wiki/Gerard_Ekdom' },
  { name: 'Gijs Staverman', url: 'https://nl.wikipedia.org/wiki/Gijs_Staverman' },
  { name: 'Wouter van der Goes', url: 'https://nl.wikipedia.org/wiki/Wouter_van_der_Goes' },
  { name: 'Ruud de Wild', url: 'https://nl.wikipedia.org/wiki/Ruud_de_Wild' },
  { name: 'Paul Rabbering', url: 'https://nl.wikipedia.org/wiki/Paul_Rabbering' },
  { name: 'Annemieke Schollaardt', url: 'https://nl.wikipedia.org/wiki/Annemieke_Schollaardt' },
  { name: 'Stefan Stasse', url: 'https://nl.wikipedia.org/wiki/Stefan_Stasse' },
  { name: 'Evelien de Bruijn', url: 'https://nl.wikipedia.org/wiki/Evelien_de_Bruijn' },  
];

export const getYearsList = () => {
  const years = [];
  for (let year = 2024; year >= 1999; year--) {
    years.push(year);
  }
  return years;
};