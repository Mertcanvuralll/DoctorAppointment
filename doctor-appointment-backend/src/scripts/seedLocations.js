const mongoose = require('mongoose');
const City = require('../models/City');
const District = require('../models/District');
require('dotenv').config();

const cities = [
  {
    name: 'ADANA',
    code: '01',
    coordinates: { lat: 37.0000, lng: 35.3213 }
  },
  {
    name: 'ADIYAMAN',
    code: '02',
    coordinates: { lat: 37.7648, lng: 38.2786 }
  },
  {
    name: 'AFYONKARAHİSAR',
    code: '03',
    coordinates: { lat: 38.7507, lng: 30.5567 }
  },
  {
    name: 'AĞRI',
    code: '04',
    coordinates: { lat: 39.7191, lng: 43.0503 }
  },
  {
    name: 'AMASYA',
    code: '05',
    coordinates: { lat: 40.6499, lng: 35.8353 }
  },
  {
    name: 'ANKARA',
    code: '06',
    coordinates: { lat: 39.9334, lng: 32.8597 }
  },
  {
    name: 'ANTALYA',
    code: '07',
    coordinates: { lat: 36.8841, lng: 30.7056 }
  },
  {
    name: 'ARTVİN',
    code: '08',
    coordinates: { lat: 41.1828, lng: 41.8183 }
  },
  {
    name: 'AYDIN',
    code: '09',
    coordinates: { lat: 37.8560, lng: 27.8416 }
  },
  {
    name: 'BALIKESİR',
    code: '10',
    coordinates: { lat: 39.6484, lng: 27.8826 }
  },
  {
    name: 'İSTANBUL',
    code: '34',
    coordinates: { lat: 41.0082, lng: 28.9784 }
  },
  {
    name: 'İZMİR',
    code: '35',
    coordinates: { lat: 38.4192, lng: 27.1287 }
  }
];

const districts = {
  '34': [ // İstanbul
    {
      name: 'ADALAR',
      code: '34-1',
      coordinates: { lat: 40.8760, lng: 29.0897 }
    },
    {
      name: 'ARNAVUTKÖY',
      code: '34-2',
      coordinates: { lat: 41.1971, lng: 28.7367 }
    },
    {
      name: 'ATAŞEHİR',
      code: '34-3',
      coordinates: { lat: 40.9923, lng: 29.1244 }
    },
    {
      name: 'AVCILAR',
      code: '34-4',
      coordinates: { lat: 40.9793, lng: 28.7216 }
    },
    {
      name: 'BAĞCILAR',
      code: '34-5',
      coordinates: { lat: 41.0361, lng: 28.8502 }
    },
    {
      name: 'BAHÇELİEVLER',
      code: '34-6',
      coordinates: { lat: 41.0022, lng: 28.8625 }
    },
    {
      name: 'BAKIRKÖY',
      code: '34-7',
      coordinates: { lat: 40.9819, lng: 28.8772 }
    },
    {
      name: 'BAŞAKŞEHİR',
      code: '34-8',
      coordinates: { lat: 41.0933, lng: 28.8016 }
    },
    {
      name: 'BAYRAMPAŞA',
      code: '34-9',
      coordinates: { lat: 41.0318, lng: 28.9134 }
    },
    {
      name: 'BEŞİKTAŞ',
      code: '34-10',
      coordinates: { lat: 41.0422, lng: 29.0093 }
    },
    {
      name: 'BEYKOZ',
      code: '34-11',
      coordinates: { lat: 41.1277, lng: 29.0959 }
    },
    {
      name: 'BEYLİKDÜZÜ',
      code: '34-12',
      coordinates: { lat: 40.9823, lng: 28.6288 }
    },
    {
      name: 'BEYOĞLU',
      code: '34-13',
      coordinates: { lat: 41.0370, lng: 28.9850 }
    },
    {
      name: 'BÜYÜKÇEKMECE',
      code: '34-14',
      coordinates: { lat: 41.0203, lng: 28.5891 }
    },
    {
      name: 'ÇATALCA',
      code: '34-15',
      coordinates: { lat: 41.1435, lng: 28.4616 }
    },
    {
      name: 'ÇEKMEKÖY',
      code: '34-16',
      coordinates: { lat: 41.0297, lng: 29.1772 }
    },
    {
      name: 'ESENLER',
      code: '34-17',
      coordinates: { lat: 41.0437, lng: 28.8756 }
    },
    {
      name: 'ESENYURT',
      code: '34-18',
      coordinates: { lat: 41.0289, lng: 28.6728 }
    },
    {
      name: 'EYÜP',
      code: '34-19',
      coordinates: { lat: 41.0478, lng: 28.9339 }
    },
    {
      name: 'FATİH',
      code: '34-20',
      coordinates: { lat: 41.0186, lng: 28.9397 }
    },
    {
      name: 'GAZİOSMANPAŞA',
      code: '34-21',
      coordinates: { lat: 41.0685, lng: 28.9121 }
    },
    {
      name: 'GÜNGÖREN',
      code: '34-22',
      coordinates: { lat: 41.0199, lng: 28.8892 }
    },
    {
      name: 'KADIKÖY',
      code: '34-23',
      coordinates: { lat: 40.9927, lng: 29.0277 }
    },
    {
      name: 'KAĞITHANE',
      code: '34-24',
      coordinates: { lat: 41.0850, lng: 28.9742 }
    },
    {
      name: 'KARTAL',
      code: '34-25',
      coordinates: { lat: 40.9107, lng: 29.1903 }
    },
    {
      name: 'KÜÇÜKÇEKMECE',
      code: '34-26',
      coordinates: { lat: 41.0003, lng: 28.7828 }
    },
    {
      name: 'MALTEPE',
      code: '34-27',
      coordinates: { lat: 40.9351, lng: 29.1517 }
    },
    {
      name: 'PENDİK',
      code: '34-28',
      coordinates: { lat: 40.8775, lng: 29.2384 }
    },
    {
      name: 'SANCAKTEPE',
      code: '34-29',
      coordinates: { lat: 41.0031, lng: 29.2347 }
    },
    {
      name: 'SARIYER',
      code: '34-30',
      coordinates: { lat: 41.1645, lng: 29.0510 }
    },
    {
      name: 'SİLİVRİ',
      code: '34-31',
      coordinates: { lat: 41.0730, lng: 28.2466 }
    },
    {
      name: 'SULTANBEYLİ',
      code: '34-32',
      coordinates: { lat: 40.9589, lng: 29.2674 }
    },
    {
      name: 'SULTANGAZİ',
      code: '34-33',
      coordinates: { lat: 41.1040, lng: 28.8674 }
    },
    {
      name: 'ŞİLE',
      code: '34-34',
      coordinates: { lat: 41.1754, lng: 29.6134 }
    },
    {
      name: 'ŞİŞLİ',
      code: '34-35',
      coordinates: { lat: 41.0602, lng: 28.9877 }
    },
    {
      name: 'TUZLA',
      code: '34-36',
      coordinates: { lat: 40.8156, lng: 29.3012 }
    },
    {
      name: 'ÜMRANİYE',
      code: '34-37',
      coordinates: { lat: 41.0161, lng: 29.1211 }
    },
    {
      name: 'ÜSKÜDAR',
      code: '34-38',
      coordinates: { lat: 41.0234, lng: 29.0129 }
    },
    {
      name: 'ZEYTİNBURNU',
      code: '34-39',
      coordinates: { lat: 40.9947, lng: 28.9031 }
    }
  ],
  '06': [ // Ankara
    {
      name: 'AKYURT',
      code: '06-1',
      coordinates: { lat: 40.1397, lng: 33.0831 }
    },
    {
      name: 'ALTINDAĞ',
      code: '06-2',
      coordinates: { lat: 39.9687, lng: 32.8802 }
    },
  ]
};

async function seedLocations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await City.deleteMany({});
    await District.deleteMany({});

  
    const createdCities = await City.insertMany(cities);
    console.log('Cities seeded successfully');

    for (const city of createdCities) {
      const cityDistricts = districts[city.code] || [];
      const districtsWithCityId = cityDistricts.map(district => ({
        ...district,
        cityId: city.code
      }));

      if (districtsWithCityId.length > 0) {
        await District.insertMany(districtsWithCityId);
        console.log(`Districts seeded successfully for ${city.name}`);
      }
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding locations:', error);
    process.exit(1);
  }
}

seedLocations(); 