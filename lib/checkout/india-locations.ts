/** Indian states / UTs and major cities for checkout helpers. Manual city entry always remains available. */

export const INDIA_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const

export type IndiaState = (typeof INDIA_STATES)[number]

/** Major / commonly shipped-to cities by state. Not exhaustive — customers can enter any city. */
export const CITIES_BY_STATE: Record<IndiaState, readonly string[]> = {
  'Andaman and Nicobar Islands': ['Port Blair', 'Havelock Island', 'Diglipur'],
  'Andhra Pradesh': [
    'Visakhapatnam',
    'Vijayawada',
    'Guntur',
    'Nellore',
    'Kurnool',
    'Tirupati',
    'Rajahmundry',
    'Kakinada',
    'Anantapur',
    'Eluru',
  ],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Tawang', 'Pasighat'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur', 'Nagaon'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif'],
  Chandigarh: ['Chandigarh'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  Delhi: [
    'New Delhi',
    'Delhi',
    'Dwarka',
    'Rohini',
    'Saket',
    'Karol Bagh',
    'Laxmi Nagar',
    'Mayur Vihar',
  ],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  Gujarat: [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Bhavnagar',
    'Jamnagar',
    'Gandhinagar',
    'Junagadh',
    'Anand',
  ],
  Haryana: [
    'Gurugram',
    'Faridabad',
    'Panipat',
    'Ambala',
    'Karnal',
    'Hisar',
    'Rohtak',
    'Sonipat',
    'Panchkula',
  ],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Manali', 'Solan', 'Mandi', 'Kullu'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'],
  Karnataka: [
    'Bengaluru',
    'Mysuru',
    'Mangaluru',
    'Hubballi',
    'Belagavi',
    'Kalaburagi',
    'Davangere',
    'Ballari',
    'Udupi',
  ],
  Kerala: [
    'Thiruvananthapuram',
    'Kochi',
    'Kozhikode',
    'Thrissur',
    'Kollam',
    'Kannur',
    'Alappuzha',
    'Kottayam',
    'Palakkad',
  ],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Kavaratti', 'Agatti'],
  'Madhya Pradesh': [
    'Bhopal',
    'Indore',
    'Jabalpur',
    'Gwalior',
    'Ujjain',
    'Sagar',
    'Rewa',
    'Satna',
    'Ratlam',
  ],
  Maharashtra: [
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Thane',
    'Aurangabad',
    'Solapur',
    'Kolhapur',
    'Navi Mumbai',
    'Amravati',
  ],
  Manipur: ['Imphal', 'Thoubal', 'Churachandpur'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung'],
  Odisha: [
    'Bhubaneswar',
    'Cuttack',
    'Rourkela',
    'Berhampur',
    'Sambalpur',
    'Puri',
    'Balasore',
    'Bhadrak',
    'Baripada',
  ],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  Punjab: [
    'Ludhiana',
    'Amritsar',
    'Jalandhar',
    'Patiala',
    'Bathinda',
    'Mohali',
    'Pathankot',
    'Hoshiarpur',
  ],
  Rajasthan: [
    'Jaipur',
    'Jodhpur',
    'Udaipur',
    'Kota',
    'Ajmer',
    'Bikaner',
    'Alwar',
    'Bhilwara',
    'Sikar',
  ],
  Sikkim: ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Erode',
    'Vellore',
    'Thoothukudi',
    'Kanchipuram',
  ],
  Telangana: [
    'Hyderabad',
    'Warangal',
    'Nizamabad',
    'Karimnagar',
    'Khammam',
    'Ramagundam',
    'Mahbubnagar',
  ],
  Tripura: ['Agartala', 'Udaipur', 'Dharmanagar'],
  'Uttar Pradesh': [
    'Lucknow',
    'Kanpur',
    'Varanasi',
    'Agra',
    'Prayagraj',
    'Ghaziabad',
    'Noida',
    'Meerut',
    'Bareilly',
    'Aligarh',
    'Moradabad',
    'Gorakhpur',
  ],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Nainital', 'Roorkee'],
  'West Bengal': [
    'Kolkata',
    'Howrah',
    'Durgapur',
    'Asansol',
    'Siliguri',
    'Kharagpur',
    'Darjeeling',
    'Bardhaman',
  ],
}

const STATE_ALIASES: Record<string, IndiaState> = {
  orissa: 'Odisha',
  odisha: 'Odisha',
  'andaman and nicobar': 'Andaman and Nicobar Islands',
  'andaman & nicobar islands': 'Andaman and Nicobar Islands',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'nct of delhi': 'Delhi',
  'national capital territory of delhi': 'Delhi',
  pondicherry: 'Puducherry',
  'jammu & kashmir': 'Jammu and Kashmir',
  uttaranchal: 'Uttarakhand',
}

export function normalizeStateName(raw: string | null | undefined): IndiaState | null {
  if (!raw?.trim()) return null
  const trimmed = raw.trim()
  const exact = INDIA_STATES.find((s) => s.toLowerCase() === trimmed.toLowerCase())
  if (exact) return exact
  const alias = STATE_ALIASES[trimmed.toLowerCase()]
  if (alias) return alias
  const partial = INDIA_STATES.find(
    (s) =>
      s.toLowerCase().includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(s.toLowerCase()),
  )
  return partial ?? null
}

export function citiesForState(state: string): readonly string[] {
  const normalized = normalizeStateName(state)
  if (!normalized) return []
  return CITIES_BY_STATE[normalized]
}

export function isIndiaCountry(country: string): boolean {
  const c = country.trim().toLowerCase()
  return c === 'india' || c === 'in' || c === 'ind'
}

/** Indian PIN: 6 digits, first digit 1–9 */
export const INDIA_PIN_REGEX = /^[1-9][0-9]{5}$/
