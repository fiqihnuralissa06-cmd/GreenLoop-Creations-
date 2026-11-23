import {
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {MapPin, Navigation, Recycle, Search, Store} from 'lucide-react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {PANGKALPINANG_CENTER, PANGKALPINANG_DISTRICTS} from '../data/mockDatabase';
import type {PartnerOutlet, User, WasteCollectionPoint} from '../types/schema';
import {calculateDistanceKm} from '../utils/formatters';

interface SelectedMarkerState {
  kind: 'collection' | 'outlet';
  id: string;
}

interface CollectionPinMarkerProps {
  point: WasteCollectionPoint;
  isSelected: boolean;
  onSelect: (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => void;
}

function CollectionPinMarker({point, isSelected, onSelect}: CollectionPinMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{lat: point.lat, lng: point.lng}}
      title={point.name}
      zIndex={isSelected ? 30 : 10}
      onClick={() => onSelect(point.id, marker)}
    >
      <Pin
        background={isSelected ? '#064e3b' : '#059669'}
        borderColor="#064e3b"
        glyphColor="#ffffff"
        scale={isSelected ? 1.25 : 1.05}
      />
    </AdvancedMarker>
  );
}

interface OutletPinMarkerProps {
  outlet: PartnerOutlet;
  isSelected: boolean;
  onSelect: (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => void;
}

function OutletPinMarker({outlet, isSelected, onSelect}: OutletPinMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{lat: outlet.lat, lng: outlet.lng}}
      title={outlet.name}
      zIndex={isSelected ? 30 : 12}
      onClick={() => onSelect(outlet.id, marker)}
    >
      <Pin
        background={isSelected ? '#9a3412' : '#c86d51'}
        borderColor="#7c2d12"
        glyphColor="#ffffff"
        scale={isSelected ? 1.25 : 1.05}
      />
    </AdvancedMarker>
  );
}

interface MapViewportControllerProps {
  focusCoords: {lat: number; lng: number; zoom?: number} | null;
}

function MapViewportController({focusCoords}: MapViewportControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !focusCoords) return;
    map.panTo({lat: focusCoords.lat, lng: focusCoords.lng});
    if (focusCoords.zoom) {
      map.setZoom(focusCoords.zoom);
    }
  }, [map, focusCoords]);

  return null;
}

interface PangkalpinangMapProps {
  collectionPoints: WasteCollectionPoint[];
  partnerOutlets: PartnerOutlet[];
  users: User[];
  highlightedPointId?: string | null;
  compact?: boolean;
  onDepositPlastic?: (pointId: string, addedKg: number) => void;
  onBrowseCatalog?: () => void;
  onOpenFullMap?: () => void;
}

export function PangkalpinangMap({
  collectionPoints,
  partnerOutlets,
  users,
  highlightedPointId,
  compact = false,
  onDepositPlastic,
  onBrowseCatalog,
  onOpenFullMap,
}: PangkalpinangMapProps) {
  const loadingStatus = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');

  const [layerFilter, setLayerFilter] = useState<'all' | 'collection' | 'outlet'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('Semua');
  const [selected, setSelected] = useState<SelectedMarkerState | null>(null);
  const [anchorMarker, setAnchorMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [focusCoords, setFocusCoords] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);

  // Places API (New) Search State for Pangkalpinang
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [searchPin, setSearchPin] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const userLookup = useMemo(() => {
    const record: Record<string, User> = {};
    for (const u of users) {
      record[u.id] = u;
    }
    return record;
  }, [users]);

  const filteredPoints = useMemo(() => {
    if (layerFilter === 'outlet') return [];
    return collectionPoints.filter(
      (pt) => districtFilter === 'Semua' || pt.district === districtFilter,
    );
  }, [collectionPoints, layerFilter, districtFilter]);

  const filteredOutlets = useMemo(() => {
    if (layerFilter === 'collection') return [];
    return partnerOutlets.filter(
      (out) => districtFilter === 'Semua' || out.district === districtFilter,
    );
  }, [partnerOutlets, layerFilter, districtFilter]);

  useEffect(() => {
    if (!highlightedPointId) return;
    const foundPoint = collectionPoints.find((p) => p.id === highlightedPointId);
    if (foundPoint) {
      setLayerFilter('all');
      setDistrictFilter('Semua');
      setSelected({kind: 'collection', id: foundPoint.id});
      setFocusCoords({lat: foundPoint.lat, lng: foundPoint.lng, zoom: 14});
    }
  }, [highlightedPointId, collectionPoints]);

  // Places API (New) Autocomplete biased to Pangkalpinang
  useEffect(() => {
    if (!placesLib || compact) return;
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }
        const response = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: `${trimmed}, Pangkalpinang`,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['id'],
          locationBias: {
            center: PANGKALPINANG_CENTER,
            radius: 15000,
          },
        });
        setSuggestions(response.suggestions || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429') || msg.includes('Quota')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setSuggestions([]);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [placesLib, searchQuery, compact]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!suggestion.placePrediction) return;
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });
        if (place.location) {
          const lat = place.location.lat();
          const lng = place.location.lng();
          setSearchPin({
            lat,
            lng,
            label: place.displayName || place.formattedAddress || searchQuery,
          });
          setFocusCoords({lat, lng, zoom: 14});
        }
        setSearchQuery('');
        setSuggestions([]);
        sessionTokenRef.current = null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429') || msg.includes('Quota')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    },
    [searchQuery],
  );

  const selectedPoint =
    selected?.kind === 'collection'
      ? collectionPoints.find((p) => p.id === selected.id) || null
      : null;

  const selectedOutlet =
    selected?.kind === 'outlet'
      ? partnerOutlets.find((o) => o.id === selected.id) || null
      : null;

  const nearestPointFromSearch = useMemo(() => {
    if (!searchPin || collectionPoints.length === 0) return null;
    let best = collectionPoints[0];
    let bestDist = calculateDistanceKm(searchPin.lat, searchPin.lng, best.lat, best.lng);
    for (const pt of collectionPoints) {
      const dist = calculateDistanceKm(searchPin.lat, searchPin.lng, pt.lat, pt.lng);
      if (dist < bestDist) {
        best = pt;
        bestDist = dist;
      }
    }
    return {point: best, distanceKm: bestDist};
  }, [searchPin, collectionPoints]);

  const mapHasError =
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE;

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      {!compact && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLayerFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  layerFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Lokasi ({collectionPoints.length + partnerOutlets.length})
              </button>
              <button
                type="button"
                onClick={() => setLayerFilter('collection')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  layerFilter === 'collection'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Titik Drop-Off ({collectionPoints.length})
              </button>
              <button
                type="button"
                onClick={() => setLayerFilter('outlet')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  layerFilter === 'outlet'
                    ? 'bg-white text-orange-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mitra Outlet ({partnerOutlets.length})
              </button>
            </div>

            <select
              aria-label="Filter kecamatan Pangkalpinang"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              <option value="Semua">Semua Kecamatan</option>
              {PANGKALPINANG_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  Kec. {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Pangkalpinang Places Search */}
          <div className="relative w-full lg:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jalan atau area di Pangkalpinang..."
                aria-label="Cari lokasi di Pangkalpinang"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-emerald-700"
              />
            </div>

            {suggestions.length > 0 && (
              <ul className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {suggestions.map((sug, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => void handleSelectSuggestion(sug)}
                      className="w-full text-left px-3 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-start gap-2 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                      <span>{sug.placePrediction?.text.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Nearest Drop-off banner when user searches an address */}
      {!compact && searchPin && nearestPointFromSearch && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
          <div className="flex items-start sm:items-center gap-2.5 text-emerald-950">
            <Navigation className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Dari <strong>{searchPin.label}</strong>, titik drop-off terdekat adalah{' '}
              <strong>{nearestPointFromSearch.point.name}</strong> (
              <span className="font-mono tabular-nums">
                {nearestPointFromSearch.distanceKm.toFixed(1)} km
              </span>
              ).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected({kind: 'collection', id: nearestPointFromSearch.point.id});
              setFocusCoords({
                lat: nearestPointFromSearch.point.lat,
                lng: nearestPointFromSearch.point.lng,
                zoom: 15,
              });
            }}
            className="text-emerald-900 font-semibold underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pusatkan Peta
          </button>
        </div>
      )}

      {/* Map + Directory Split */}
      <div className={`grid grid-cols-1 ${compact ? '' : 'lg:grid-cols-12'} gap-6 items-start`}>
        {/* Map Viewport Container */}
        <div
          className={`${
            compact ? 'w-full' : 'lg:col-span-8'
          } rounded-xl overflow-hidden border border-slate-200 bg-slate-100`}
        >
          {mapHasError ? (
            <div
              className={`${
                compact ? 'h-[320px]' : 'h-[480px]'
              } flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-600`}
            >
              <MapPin className="w-8 h-8 text-emerald-700 mb-3" strokeWidth={1.5} />
              <div className="text-sm font-semibold text-slate-900">
                Peta Interaktif Google Maps Tidak Dapat Dimuat
              </div>
              <p className="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed">
                Silakan periksa koneksi atau kuota kunci Google Maps Platform Anda. Anda tetap dapat
                menjelajahi seluruh titik pengumpulan sampah dan mitra outlet Pangkalpinang melalui
                daftar di samping.
              </p>
            </div>
          ) : (
            <div className={compact ? 'h-[340px] w-full' : 'h-[460px] lg:h-[540px] w-full'}>
              <GoogleMap
                defaultCenter={PANGKALPINANG_CENTER}
                defaultZoom={12.8}
                mapId="DEMO_MAP_ID"
                gestureHandling="greedy"
                disableDefaultUI={compact}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{width: '100%', height: '100%'}}
                onClick={() => {
                  setSelected(null);
                  setAnchorMarker(null);
                }}
              >
                <MapViewportController focusCoords={focusCoords} />

                {filteredPoints.map((point) => (
                  <CollectionPinMarker
                    key={point.id}
                    point={point}
                    isSelected={selected?.kind === 'collection' && selected.id === point.id}
                    onSelect={(id, marker) => {
                      setSelected({kind: 'collection', id});
                      setAnchorMarker(marker);
                    }}
                  />
                ))}

                {filteredOutlets.map((outlet) => (
                  <OutletPinMarker
                    key={outlet.id}
                    outlet={outlet}
                    isSelected={selected?.kind === 'outlet' && selected.id === outlet.id}
                    onSelect={(id, marker) => {
                      setSelected({kind: 'outlet', id});
                      setAnchorMarker(marker);
                    }}
                  />
                ))}

                {searchPin && (
                  <AdvancedMarker
                    position={{lat: searchPin.lat, lng: searchPin.lng}}
                    title={searchPin.label}
                  >
                    <Pin background="#0f172a" borderColor="#020617" glyphColor="#ffffff" />
                  </AdvancedMarker>
                )}

                {selectedPoint && (
                  <InfoWindow
                    anchor={anchorMarker}
                    position={
                      anchorMarker ? undefined : {lat: selectedPoint.lat, lng: selectedPoint.lng}
                    }
                    maxWidth={300}
                    onCloseClick={() => {
                      setSelected(null);
                      setAnchorMarker(null);
                    }}
                  >
                    <div className="p-1 text-slate-900 space-y-2 max-w-[260px]">
                      <div className="text-[11px] font-medium text-emerald-800">
                        Titik Pengumpulan · Kec. {selectedPoint.district}
                      </div>
                      <h4 className="font-semibold text-sm leading-snug">{selectedPoint.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedPoint.address}
                      </p>

                      <div className="pt-1 space-y-1">
                        <div className="flex justify-between text-xs tabular-nums">
                          <span className="text-slate-500">Kapasitas Terisi</span>
                          <span className="font-mono font-semibold">
                            {selectedPoint.current_load_kg} / {selectedPoint.capacity_kg} kg
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-700"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  (selectedPoint.current_load_kg / selectedPoint.capacity_kg) * 100,
                                ),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                        <div>
                          Jenis Plastik:{' '}
                          <strong className="font-mono">
                            {selectedPoint.accepted_plastic_types.join(', ')}
                          </strong>
                        </div>
                        <div>Jam Operasi: {selectedPoint.operational_hours}</div>
                        <div>
                          Pengelola:{' '}
                          {userLookup[selectedPoint.manager_user_id]?.name || 'Tim GreenLoop'}
                        </div>
                      </div>

                      {onDepositPlastic && (
                        <button
                          type="button"
                          onClick={() => onDepositPlastic(selectedPoint.id, 5)}
                          className="w-full mt-1 py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
                        >
                          Simulasikan Setor +5 kg Plastik
                        </button>
                      )}
                    </div>
                  </InfoWindow>
                )}

                {selectedOutlet && (
                  <InfoWindow
                    anchor={anchorMarker}
                    position={
                      anchorMarker ? undefined : {lat: selectedOutlet.lat, lng: selectedOutlet.lng}
                    }
                    maxWidth={300}
                    onCloseClick={() => {
                      setSelected(null);
                      setAnchorMarker(null);
                    }}
                  >
                    <div className="p-1 text-slate-900 space-y-2 max-w-[260px]">
                      <div className="text-[11px] font-medium text-orange-800">
                        Mitra Outlet Suvenir · Kec. {selectedOutlet.district}
                      </div>
                      <h4 className="font-semibold text-sm leading-snug">{selectedOutlet.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedOutlet.address}
                      </p>

                      <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                        <div>Kategori: {selectedOutlet.featured_categories.join(', ')}</div>
                        <div>Buka: {selectedOutlet.opening_hours}</div>
                        <div>
                          Mitra: {userLookup[selectedOutlet.owner_user_id]?.name || 'Mitra Lokal'}
                        </div>
                      </div>

                      {onBrowseCatalog && (
                        <button
                          type="button"
                          onClick={onBrowseCatalog}
                          className="w-full mt-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
                        >
                          Lihat Produk di Katalog
                        </button>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </div>
          )}

          {/* Legend Strip */}
          <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                <span>Titik Pengumpulan Plastik (HDPE/PP)</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#c86d51] inline-block" />
                <span>Mitra Outlet Suvenir Lokal</span>
              </span>
            </div>

            {compact && onOpenFullMap && (
              <button
                type="button"
                onClick={onOpenFullMap}
                className="text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2 cursor-pointer"
              >
                Buka Peta Lengkap
              </button>
            )}
          </div>
        </div>

        {/* Full Mode Directory Sidebar */}
        {!compact && (
          <div className="lg:col-span-4 space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {filteredPoints.map((point) => {
              const pct = Math.min(
                100,
                Math.round((point.current_load_kg / point.capacity_kg) * 100),
              );
              const isSelected = selected?.kind === 'collection' && selected.id === point.id;

              return (
                <div
                  key={point.id}
                  className={`p-4 rounded-xl border transition-colors bg-white ${
                    isSelected ? 'border-emerald-700 bg-emerald-50/30' : 'border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelected({kind: 'collection', id: point.id});
                      setAnchorMarker(null);
                      setFocusCoords({lat: point.lat, lng: point.lng, zoom: 14});
                    }}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5 text-emerald-800 font-medium">
                        <Recycle className="w-3.5 h-3.5" />
                        <span>Drop-Off · {point.district}</span>
                      </span>
                      <span className="font-mono">{point.status}</span>
                    </div>

                    <h3 className="font-semibold text-sm text-slate-900 mt-1">{point.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{point.address}</p>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs tabular-nums">
                        <span className="text-slate-600">
                          Plastik: <span className="font-mono">{point.accepted_plastic_types.join('/')}</span>
                        </span>
                        <span className="font-mono font-medium text-slate-900">
                          {point.current_load_kg} / {point.capacity_kg} kg ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            pct >= 85 ? 'bg-[#c86d51]' : 'bg-emerald-700'
                          }`}
                          style={{width: `${pct}%`}}
                        />
                      </div>
                    </div>
                  </button>

                  {onDepositPlastic && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">
                        PIC: {userLookup[point.manager_user_id]?.name || 'Admin'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDepositPlastic(point.id, 5)}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-800 hover:text-white rounded-md transition-colors cursor-pointer"
                      >
                        + Setor 5 kg
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredOutlets.map((outlet) => {
              const isSelected = selected?.kind === 'outlet' && selected.id === outlet.id;

              return (
                <button
                  key={outlet.id}
                  type="button"
                  onClick={() => {
                    setSelected({kind: 'outlet', id: outlet.id});
                    setAnchorMarker(null);
                    setFocusCoords({lat: outlet.lat, lng: outlet.lng, zoom: 14});
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-colors bg-white cursor-pointer ${
                    isSelected ? 'border-[#c86d51] bg-orange-50/30' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-[#b85c40] font-medium">
                      <Store className="w-3.5 h-3.5" />
                      <span>Mitra Outlet · {outlet.district}</span>
                    </span>
                    <span className="text-slate-500">{outlet.opening_hours}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 mt-1">{outlet.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{outlet.address}</p>
                  <div className="mt-2 text-xs text-slate-600">
                    Fokus: {outlet.featured_categories.join(' · ')}
                  </div>
                </button>
              );
            })}

            {filteredPoints.length === 0 && filteredOutlets.length === 0 && (
              <div className="p-6 text-center border border-slate-200 rounded-xl bg-white text-xs text-slate-500">
                Tidak ada lokasi yang cocok dengan filter kecamatan ini.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
