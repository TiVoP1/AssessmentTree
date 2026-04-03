import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample weather data matching Weatherstack API current object structure.
const sampleWeatherTexasCity = {
  observation_time: '03:45 PM',
  temperature: 82,
  weather_code: 116,
  weather_icons: [
    'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png',
  ],
  weather_descriptions: ['Partly cloudy'],
  wind_speed: 14,
  wind_degree: 170,
  wind_dir: 'S',
  pressure: 1015,
  precip: 0,
  humidity: 68,
  cloudcover: 25,
  feelslike: 86,
  uv_index: 7,
  visibility: 10,
};

const sampleWeatherDickinson = {
  observation_time: '03:45 PM',
  temperature: 80,
  weather_code: 113,
  weather_icons: [
    'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png',
  ],
  weather_descriptions: ['Sunny'],
  wind_speed: 12,
  wind_degree: 180,
  wind_dir: 'S',
  pressure: 1016,
  precip: 0,
  humidity: 65,
  cloudcover: 10,
  feelslike: 84,
  uv_index: 8,
  visibility: 10,
};

// Coordinates for the two areas
const coords = {
  texasCity77590: { lat: 29.404, long: -94.94 },
  texasCity77591: { lat: 29.37, long: -94.98 },
  dickinson77539: { lat: 29.461, long: -95.054 },
} as const;

function getCoordsForZip(zipCode: string, city: string) {
  if (city === 'Dickinson') return coords.dickinson77539;
  return zipCode === '77590' ? coords.texasCity77590 : coords.texasCity77591;
}

function getWeatherForCity(city: string) {
  return city === 'Dickinson' ? sampleWeatherDickinson : sampleWeatherTexasCity;
}

// Parsed from example.txt — Zillow listings for Texas City & Dickinson, TX
const properties = [
  { street: '8515 Twelve Oaks Dr', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '5717 Eunice St', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '1506 17th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '716 San Jacinto Ave', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '1413 N Natchez Dr', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '7506 Nightingale Cir', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '1309 Parkwest St', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '311 25th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '9014 Barracuda Dr', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '3901 22nd St N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '405 13th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '2813 32nd Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '7011 Anderson St', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '214 S Texas St', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '3502 Conquest Cir', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '1120 17th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '2918 15th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '2510 Sunnycrest Dr', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '2721 Overland Trl', city: 'Dickinson', state: 'TX', zipCode: '77539' },
  { street: '416 22nd Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '1714 Mackey Dr', city: 'Dickinson', state: 'TX', zipCode: '77539' },
  { street: '1217 4th Ave S', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '7211 Mockingbird Ln', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '1720 17th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '4001 29th St N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '312 N Logan St', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '7426 Nightingale Cir', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '1208 N Logan St', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '8908 Glacier Ave', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '3014 14th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '1132 18th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '427 22nd Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '5321 Brigantine Cay Ct', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '2013 17th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '7 N Pine Rd', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '1925 14th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '5106 Allen Cay Dr', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '6223 Linton Ln', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '414 Buttonwood Dr', city: 'Texas City', state: 'TX', zipCode: '77591' },
  { street: '1603 5th Ave N', city: 'Texas City', state: 'TX', zipCode: '77590' },
  { street: '326 S Bell Dr', city: 'Texas City', state: 'TX', zipCode: '77591' },
];

async function seedDev() {
  console.log('Seeding development database...');

  const seedData = properties.map((prop) => {
    const { lat, long } = getCoordsForZip(prop.zipCode, prop.city);
    const weatherData = getWeatherForCity(prop.city);
    return {
      id: `seed-${prop.street.toLowerCase().replace(/\s+/g, '-')}`,
      street: prop.street,
      city: prop.city,
      state: prop.state,
      zipCode: prop.zipCode,
      lat,
      long,
      weatherData,
    };
  });

  // Delete existing seed data and re-insert in a single batch
  await prisma.property.deleteMany({
    where: { id: { startsWith: 'seed-' } },
  });

  await prisma.property.createMany({ data: seedData });

  console.log(`Seeded ${properties.length.toString()} properties.`);
}

seedDev()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    throw err;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
