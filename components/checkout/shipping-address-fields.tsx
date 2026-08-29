'use client'

import { MapPin } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SearchableSelect } from '@/components/checkout/searchable-select'
import {
  INDIA_STATES,
  citiesForState,
  isIndiaCountry,
} from '@/lib/checkout/india-locations'
import type { ResolvedAddress } from '@/lib/checkout/address-types'

const inputClass =
  'h-11 w-full rounded-md border border-border bg-background px-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'

export type ShippingFormValues = {
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

type FieldErrors = Partial<Record<keyof ShippingFormValues, string>>

type ShippingAddressFieldsProps = {
  values: ShippingFormValues
  errors?: FieldErrors
  onChange: <K extends keyof ShippingFormValues>(key: K, value: ShippingFormValues[K]) => void
  onPatch: (patch: Partial<ShippingFormValues>) => void
}

export function ShippingAddressFields({
  values,
  errors = {},
  onChange,
  onPatch,
}: ShippingAddressFieldsProps) {
  const [cityManual, setCityManual] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [locationMessage, setLocationMessage] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<ResolvedAddress[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextSearch = useRef(false)
  const addressWrapRef = useRef<HTMLDivElement>(null)

  const cityOptions = citiesForState(values.state)

  useEffect(() => {
    if (!values.state) return
    const cities = citiesForState(values.state)
    if (values.city && cities.length > 0 && !cities.includes(values.city)) {
      setCityManual(true)
    }
  }, [values.state, values.city])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!addressWrapRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const applyResolved = useCallback(
    (resolved: ResolvedAddress, opts?: { keepAddress?: boolean }) => {
      skipNextSearch.current = true
      const patch: Partial<ShippingFormValues> = {
        city: resolved.city || values.city,
        state: resolved.state || values.state,
        postalCode: resolved.postalCode || values.postalCode,
        country: resolved.country || values.country || 'India',
      }
      if (!opts?.keepAddress && resolved.address) {
        patch.address = resolved.address
      }
      onPatch(patch)
      if (resolved.city && !citiesForState(resolved.state || values.state).includes(resolved.city)) {
        setCityManual(true)
      } else if (resolved.city) {
        setCityManual(false)
      }
      setShowSuggestions(false)
      setSuggestions([])
    },
    [onPatch, values.city, values.country, values.state, values.postalCode],
  )

  function onAddressChange(value: string) {
    onChange('address', value)
    if (skipNextSearch.current) {
      skipNextSearch.current = false
      return
    }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (value.trim().length < 4) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(
          `/api/checkout/location/search?q=${encodeURIComponent(value.trim())}`,
        )
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data.suggestions) ? (data.suggestions as ResolvedAddress[]) : []
        setSuggestions(list)
        setShowSuggestions(list.length > 0)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setSearchLoading(false)
      }
    }, 450)
  }

  async function useCurrentLocation() {
    setLocationMessage(null)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus('error')
      setLocationMessage('Location access unavailable. Please enter your address manually.')
      return
    }

    setLocationStatus('loading')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch('/api/checkout/location/reverse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok || !data.address) {
            setLocationStatus('error')
            setLocationMessage(
              data.error ||
                'Location access unavailable. Please enter your address manually.',
            )
            return
          }
          applyResolved(data.address as ResolvedAddress)
          setLocationStatus('idle')
          setLocationMessage('Address filled from your location. You can edit any field.')
        } catch {
          setLocationStatus('error')
          setLocationMessage('Location access unavailable. Please enter your address manually.')
        }
      },
      () => {
        setLocationStatus('error')
        setLocationMessage('Location access unavailable. Please enter your address manually.')
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60_000 },
    )
  }

  async function onPostalBlur() {
    const pin = values.postalCode.trim()
    if (!isIndiaCountry(values.country) || !/^[1-9][0-9]{5}$/.test(pin)) return
    try {
      const res = await fetch(`/api/checkout/location/pincode?pin=${encodeURIComponent(pin)}`)
      const data = await res.json().catch(() => ({}))
      const resolved = data.address as ResolvedAddress | null
      if (!resolved) return
      onPatch({
        city: values.city.trim() ? values.city : resolved.city,
        state: values.state.trim() ? values.state : resolved.state,
        country: values.country.trim() ? values.country : resolved.country || 'India',
      })
      if (!values.city.trim() && resolved.city) {
        const cities = citiesForState(resolved.state)
        setCityManual(!cities.includes(resolved.city))
      }
    } catch {
      // PIN lookup is optional — ignore failures
    }
  }

  function onStateChange(state: string) {
    onPatch({ state, city: '' })
    setCityManual(false)
  }

  return (
    <section className="space-y-4 rounded-md border border-border bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl text-foreground">Shipping address</h2>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locationStatus === 'loading'}
          className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-background px-3 py-2 font-sans text-xs text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60 sm:self-auto"
        >
          <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          {locationStatus === 'loading' ? 'Detecting location…' : 'Use my current location'}
        </button>
      </div>

      {locationMessage ? (
        <p
          className={`text-xs leading-relaxed ${
            locationStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'
          }`}
          role="status"
        >
          {locationMessage}
        </p>
      ) : null}

      <div className="grid gap-4">
        <div className="flex flex-col gap-2" ref={addressWrapRef}>
          <label htmlFor="checkout-address" className="text-sm font-medium">
            Address
          </label>
          <textarea
            id="checkout-address"
            required
            rows={3}
            value={values.address}
            onChange={(e) => onAddressChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true)
            }}
            placeholder="Start typing your address…"
            className={`${inputClass} h-auto py-3`}
            autoComplete="street-address"
            aria-invalid={Boolean(errors.address)}
          />
          {errors.address ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.address}
            </p>
          ) : null}
          {showSuggestions && suggestions.length > 0 ? (
            <ul
              className="overflow-hidden rounded-md border border-border bg-background shadow-sm"
              role="listbox"
              aria-label="Address suggestions"
            >
              {suggestions.map((s, idx) => {
                const label = [s.address, s.city, s.state, s.postalCode]
                  .filter(Boolean)
                  .join(', ')
                return (
                  <li key={`${label}-${idx}`} role="option">
                    <button
                      type="button"
                      className="flex w-full items-start gap-2 px-3 py-2.5 text-left font-sans text-sm hover:bg-muted"
                      onClick={() => applyResolved(s)}
                    >
                      <MapPin
                        className="mt-0.5 size-3.5 shrink-0 text-primary"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <span>{label}</span>
                    </button>
                  </li>
                )
              })}
              {searchLoading ? (
                <li className="px-3 py-2 text-xs text-muted-foreground">Searching…</li>
              ) : null}
            </ul>
          ) : null}
          <p className="text-[0.7rem] text-muted-foreground">
            You can type your full address manually or pick a suggestion when available.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SearchableSelect
            id="checkout-state"
            label="State"
            value={values.state}
            options={INDIA_STATES}
            placeholder="Select state"
            required
            error={errors.state}
            onChange={onStateChange}
          />

          {cityManual || cityOptions.length === 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="checkout-city" className="text-sm font-medium">
                  City
                </label>
                {values.state && cityOptions.length > 0 ? (
                  <button
                    type="button"
                    className="text-[0.7rem] text-primary hover:underline"
                    onClick={() => {
                      setCityManual(false)
                      onChange('city', '')
                    }}
                  >
                    Choose from list
                  </button>
                ) : null}
              </div>
              <input
                id="checkout-city"
                required
                value={values.city}
                onChange={(e) => onChange('city', e.target.value)}
                className={inputClass}
                autoComplete="address-level2"
                placeholder="Enter city"
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city ? (
                <p className="text-xs text-destructive" role="alert">
                  {errors.city}
                </p>
              ) : null}
            </div>
          ) : (
            <SearchableSelect
              id="checkout-city"
              label="City"
              value={values.city}
              options={cityOptions}
              placeholder={values.state ? 'Select city' : 'Select state first'}
              required
              disabled={!values.state}
              error={errors.city}
              onChange={(city) => onChange('city', city)}
              footerAction={{
                label: 'Enter city manually',
                onSelect: () => {
                  setCityManual(true)
                  onChange('city', '')
                },
              }}
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="checkout-postal" className="text-sm font-medium">
              PIN / Postal code
            </label>
            <input
              id="checkout-postal"
              required
              inputMode="numeric"
              value={values.postalCode}
              onChange={(e) => onChange('postalCode', e.target.value)}
              onBlur={onPostalBlur}
              className={inputClass}
              autoComplete="postal-code"
              placeholder="6-digit PIN"
              aria-invalid={Boolean(errors.postalCode)}
            />
            {errors.postalCode ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.postalCode}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="checkout-country" className="text-sm font-medium">
              Country
            </label>
            <input
              id="checkout-country"
              required
              value={values.country}
              onChange={(e) => onChange('country', e.target.value)}
              className={inputClass}
              autoComplete="country-name"
              aria-invalid={Boolean(errors.country)}
            />
            {errors.country ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.country}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
