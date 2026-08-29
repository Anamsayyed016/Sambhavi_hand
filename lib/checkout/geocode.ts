import type { ResolvedAddress } from '@/lib/checkout/address-types'
import { normalizeStateName } from '@/lib/checkout/india-locations'

export type { ResolvedAddress }

type NominatimAddress = {
  house_number?: string
  road?: string
  pedestrian?: string
  neighbourhood?: string
  suburb?: string
  village?: string
  town?: string
  city?: string
  city_district?: string
  county?: string
  state_district?: string
  state?: string
  postcode?: string
  country?: string
}

type NominatimResult = {
  display_name?: string
  address?: NominatimAddress
}

const USER_AGENT = 'SambhaviHandloomCheckout/1.0 (customerconnect@sambhaviheritagereimagined.com)'

function buildStreetLine(addr: NominatimAddress): string {
  const parts = [
    [addr.house_number, addr.road || addr.pedestrian].filter(Boolean).join(' '),
    addr.neighbourhood,
    addr.suburb,
  ].filter((p) => p && p.trim())
  return parts.join(', ')
}

function pickCity(addr: NominatimAddress): string {
  const raw = (
    addr.city ||
    addr.town ||
    addr.village ||
    addr.city_district ||
    addr.suburb ||
    addr.county ||
    addr.state_district ||
    ''
  ).trim()
  return raw
    .replace(/\s+Municipal Corporation$/i, '')
    .replace(/\s+Municipal Council$/i, '')
    .replace(/\s+Corporation$/i, '')
    .replace(/\s+Municipality$/i, '')
    .trim()
}

export function mapNominatimToAddress(result: NominatimResult): ResolvedAddress | null {
  const addr = result.address
  if (!addr) return null

  const street = buildStreetLine(addr)
  const city = pickCity(addr)
  const state = normalizeStateName(addr.state) ?? (addr.state?.trim() || '')
  const postalCode = (addr.postcode || '').replace(/\s+/g, '').slice(0, 10)
  const country = addr.country?.trim() || 'India'

  const address =
    street ||
    [city, state].filter(Boolean).join(', ') ||
    (result.display_name?.split(',').slice(0, 2).join(',').trim() ?? '')

  if (!address && !city && !state) return null

  return {
    address,
    city,
    state,
    postalCode,
    country: country.toLowerCase() === 'india' ? 'India' : country,
  }
}

async function nominatimFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    next: { revalidate: 0 },
  })
}

export async function reverseGeocode(lat: number, lon: number): Promise<ResolvedAddress | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lon),
    addressdetails: '1',
    zoom: '18',
  })
  const res = await nominatimFetch(`https://nominatim.openstreetmap.org/reverse?${params}`)
  if (!res.ok) return null
  const data = (await res.json()) as NominatimResult
  return mapNominatimToAddress(data)
}

export async function searchAddresses(query: string, limit = 5): Promise<ResolvedAddress[]> {
  const q = query.trim()
  if (q.length < 3) return []

  const params = new URLSearchParams({
    format: 'jsonv2',
    q,
    addressdetails: '1',
    limit: String(limit),
    countrycodes: 'in',
  })
  const res = await nominatimFetch(`https://nominatim.openstreetmap.org/search?${params}`)
  if (!res.ok) return []
  const data = (await res.json()) as NominatimResult[]
  if (!Array.isArray(data)) return []

  const mapped: ResolvedAddress[] = []
  for (const item of data) {
    const resolved = mapNominatimToAddress(item)
    if (!resolved) continue
    if (!resolved.address && item.display_name) {
      resolved.address = item.display_name.split(',').slice(0, 3).join(',').trim()
    }
    mapped.push(resolved)
  }
  return mapped
}

type PostalOffice = {
  Name?: string
  District?: string
  State?: string
  Pincode?: string
  Country?: string
}

export async function lookupIndianPincode(pin: string): Promise<ResolvedAddress | null> {
  if (!/^[1-9][0-9]{5}$/.test(pin)) return null

  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  })
  if (!res.ok) return null

  const data = (await res.json()) as Array<{
    Status?: string
    PostOffice?: PostalOffice[] | null
  }>
  const first = data?.[0]
  if (!first || first.Status !== 'Success' || !first.PostOffice?.length) return null

  const office = first.PostOffice[0]
  const state = normalizeStateName(office.State) ?? (office.State?.trim() || '')
  const city = (office.District || office.Name || '').trim()

  return {
    address: '',
    city,
    state,
    postalCode: office.Pincode || pin,
    country: office.Country?.trim() || 'India',
  }
}
