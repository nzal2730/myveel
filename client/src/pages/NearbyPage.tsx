import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import {
  Crosshair,
  MapPin,
  Navigation,
  Phone,
  Search,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { NEARBY_CATEGORIES } from '../lib/constants';
import { capitalise } from '../lib/format';
import type { FavouritePlace, NearbyPlace } from '../types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  SearchInput,
  Select,
} from '../components/ui';

interface NearbyResponse {
  center: { latitude: number; longitude: number };
  radiusKm: number;
  places: NearbyPlace[];
  favouritesCount: number;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function NearbyPage() {
  const { success } = useToast();
  const [center, setCenter] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const [radius, setRadius] = useState(10);
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [favourites, setFavourites] = useState<FavouritePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [searchData, favData] = await Promise.all([
        api.get<NearbyResponse>('/nearby/search', {
          latitude: center.latitude,
          longitude: center.longitude,
          radiusKm: radius,
          category,
          query: query || undefined,
        }),
        api.get<FavouritePlace[]>('/nearby/favourites'),
      ]);
      setPlaces(searchData.places);
      setFavourites(favData);
    } catch (err: any) {
      setError(err.message || 'Could not load nearby services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.latitude, center.longitude, radius, category, query]);

  const locate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocating(false);
        success('Map centred on your location.');
      },
      () => {
        setLocating(false);
        setError('Location permission denied. Showing the default city centre.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const favouriteIds = useMemo(
    () => new Map(favourites.map((favourite) => [favourite.name.toLowerCase(), favourite.id])),
    [favourites]
  );

  const toggleFavourite = async (place: NearbyPlace) => {
    const existingId = favouriteIds.get(place.name.toLowerCase());
    try {
      if (existingId) {
        await api.delete(`/nearby/favourites/${existingId}`);
        success('Removed from favourites.');
      } else {
        await api.post('/nearby/favourites', {
          name: place.name,
          category: place.category,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          phone: place.phone,
          rating: place.rating,
          notes: null,
        });
        success('Saved to favourites.');
      }
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not update favourites.');
    }
  };

  const removeFavourite = async (favourite: FavouritePlace) => {
    try {
      await api.delete(`/nearby/favourites/${favourite.id}`);
      success('Favourite removed.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not remove favourite.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="Nearby Services"
        subtitle="Find trusted garages, tyre shops, fuel stations, EV chargers and car washes around you."
        actions={
          <Button variant="secondary" icon={<Crosshair className="h-4 w-4" />} onClick={locate} loading={locating}>
            Use my location
          </Button>
        }
      />

      <div className="mb-5 grid gap-2 sm:grid-cols-[1fr_180px_180px]">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name, address or category…" />
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          {NEARBY_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        <Select value={String(radius)} onChange={(event) => setRadius(Number(event.target.value))}>
          {[2, 5, 10, 20, 50].map((value) => (
            <option key={value} value={value}>{value} km radius</option>
          ))}
        </Select>
      </div>

      {error && <div className="mb-4"><ErrorState message={error} onRetry={load} /></div>}

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="h-[420px] w-full lg:h-[560px]">
            <MapContainer
              center={[center.latitude, center.longitude]}
              zoom={13}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <Recenter lat={center.latitude} lng={center.longitude} />
              <CircleMarker
                center={[center.latitude, center.longitude]}
                radius={8}
                pathOptions={{ color: '#FFD400', fillColor: '#FFD400', fillOpacity: 0.9 }}
              >
                <Popup>You are here</Popup>
              </CircleMarker>
              {places.map((place) => (
                <CircleMarker
                  key={place.id}
                  center={[place.latitude, place.longitude]}
                  radius={7}
                  pathOptions={{
                    color: favouriteIds.has(place.name.toLowerCase()) ? '#34D399' : '#FFD400',
                    fillColor: favouriteIds.has(place.name.toLowerCase()) ? '#34D399' : '#FFD400',
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                    <span className="text-xs font-medium">{place.name}</span>
                  </Tooltip>
                  <Popup>
                    <div className="space-y-1 text-xs">
                      <p className="text-sm font-semibold">{place.name}</p>
                      <p>{place.address}</p>
                      <p>{place.distanceKm} km · {capitalise(place.category)}</p>
                      {place.phone && <p>{place.phone}</p>}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Places near you"
              subtitle={`${places.length} result${places.length === 1 ? '' : 's'} within ${radius} km`}
              action={<Badge tone="yellow">{center.latitude.toFixed(2)}, {center.longitude.toFixed(2)}</Badge>}
            />
            {loading ? (
              <LoadingBlock label="Searching nearby…" />
            ) : places.length ? (
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {places.map((place) => {
                  const isFavourite = favouriteIds.has(place.name.toLowerCase());
                  return (
                    <div key={place.id} className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-text-main">{place.name}</p>
                          <p className="mt-0.5 text-[11px] text-text-secondary">{place.address}</p>
                        </div>
                        <button
                          onClick={() => toggleFavourite(place)}
                          className={`rounded-lg p-1.5 transition ${isFavourite ? 'text-emerald-300 hover:bg-emerald-500/10' : 'text-text-secondary hover:bg-white/5 hover:text-primary-yellow'}`}
                          aria-label={isFavourite ? 'Remove favourite' : 'Add favourite'}
                        >
                          {isFavourite ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge tone="neutral">{capitalise(place.category)}</Badge>
                        <Badge tone="yellow">{place.distanceKm} km</Badge>
                        {place.rating && <Badge tone="success">★ {place.rating}</Badge>}
                        {place.openingHours && <span className="text-[10px] text-text-secondary">{place.openingHours}</span>}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        {place.phone && (
                          <a href={`tel:${place.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 text-[11px] text-primary-yellow hover:text-primary-hover">
                            <Phone className="h-3 w-3" /> {place.phone}
                          </a>
                        )}
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=17/${place.latitude}/${place.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-text-main"
                        >
                          <Navigation className="h-3 w-3" /> Directions
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Search className="h-7 w-7" />}
                title="No places found"
                description="Try increasing the radius or choosing a different category."
              />
            )}
          </Card>

          <Card>
            <CardHeader
              title="Saved favourites"
              subtitle="Quick access to your trusted services"
              action={<Badge tone="neutral">{favourites.length}</Badge>}
            />
            {favourites.length ? (
              <div className="space-y-2">
                {favourites.map((favourite) => (
                  <div key={favourite.id} className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-main">{favourite.name}</p>
                      <p className="truncate text-[11px] text-text-secondary">
                        {capitalise(favourite.category)} · {favourite.address}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {favourite.phone && (
                        <a href={`tel:${favourite.phone.replace(/\s/g, '')}`} className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-primary-yellow" aria-label="Call">
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button onClick={() => removeFavourite(favourite)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-300" aria-label="Remove favourite">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center">
                <MapPin className="mx-auto mb-2 h-5 w-5 text-text-secondary" />
                <p className="text-xs text-text-secondary">Tap the star on a place to save it here.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
