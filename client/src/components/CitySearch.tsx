/**
 * 观象历书设计提醒：城市搜索是输入侧注的一部分，紧凑、可核对，并把坐标作为历法条件而非装饰信息。
 */
import { useState } from "react";
import { LoaderCircle, MapPinned, Search, X } from "lucide-react";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { formatCoordinate } from "@/lib/bazi";
import { siteCopy } from "@/lib/siteCopy";
import { trpc } from "@/lib/trpc";

export type CityLocation = {
  name: string;
  address: string;
  country: string;
  latitude: number;
  longitude: number;
};

type CitySearchProps = {
  onSelect: (location: CityLocation) => void;
};

type Suggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
};

type PlaceDetails = {
  name?: string | null;
  displayName?: string | { text?: string } | null;
  formatted_address?: string | null;
  formattedAddress?: string | null;
  address_components?: Array<{ long_name?: string; longText?: string; types?: string[] }> | null;
  addressComponents?: Array<{ long_name?: string; longText?: string; types?: string[] }> | null;
  location?: { lat: () => number; lng: () => number } | null;
  geometry?: { location?: { lat: () => number; lng: () => number } | null } | null;
};

function textValue(value?: string | { text?: string } | null) {
  return typeof value === "string" ? value : value?.text || "";
}

export function cityLocationFromPlace(suggestion: Suggestion, place?: PlaceDetails | null): CityLocation | null {
  const point = place?.location || place?.geometry?.location;
  if (!point) return null;
  const countryComponent = [...(place?.addressComponents || []), ...(place?.address_components || [])].find((component) => component.types?.includes("country"));
  const country = countryComponent?.longText || countryComponent?.long_name || suggestion.secondaryText;
  return {
    name: textValue(place?.displayName) || place?.name || suggestion.primaryText,
    address: place?.formattedAddress || place?.formatted_address || suggestion.secondaryText,
    country,
    latitude: point.lat(),
    longitude: point.lng(),
  };
}

export function CitySearch({ onSelect }: CitySearchProps) {
  const { locale } = useAppLocale();
  const copy = siteCopy[locale].city;
  const [query, setQuery] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [selected, setSelected] = useState<CityLocation | null>(null);
  const keyword = query.trim();
  const suggestionsQuery = trpc.places.autocomplete.useQuery({ query: keyword || "__" }, { enabled: keyword.length >= 2 && selected?.name !== keyword, retry: false, staleTime: 30_000 });
  const suggestions = selected?.name === keyword ? [] : (suggestionsQuery.data || []) as Suggestion[];
  const isSearching = suggestionsQuery.isFetching;
  const detailsQuery = trpc.places.details.useMutation();

  function chooseSuggestion(suggestion: Suggestion) {
    setIsSelecting(true);
    detailsQuery.mutate({ placeId: suggestion.placeId, fallbackName: suggestion.primaryText, fallbackAddress: suggestion.secondaryText }, {
      onSuccess: (location) => {
        if (!location) return;
        setSelected(location);
        setQuery(location.name);
        onSelect(location);
      },
      onSettled: () => setIsSelecting(false),
    });
  }

  function clearSelection() {
    setSelected(null);
    setQuery("");
  }

  return (
    <div className="city-search">
      <div className="field-head city-field-head">
        <label className="field-label" htmlFor="birth-city">{copy.label}</label>
        <span>{copy.ready}</span>
      </div>
      <div className="city-search-box">
        <Search aria-hidden="true" />
        <input
          id="birth-city"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
          aria-controls="city-suggestions"
          placeholder={copy.placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && suggestions[0]) {
              event.preventDefault();
              chooseSuggestion(suggestions[0]);
            }
          }}
        />
        {(isSearching || isSelecting) && <LoaderCircle className="city-spinner" aria-label={copy.searching} />}
        {!isSearching && !isSelecting && query && <button type="button" onClick={clearSelection} aria-label={copy.clear}><X /></button>}
      </div>
      {suggestions.length > 0 && (
        <div className="city-suggestions" id="city-suggestions" role="listbox" aria-label={copy.results}>
          {suggestions.map((suggestion) => (
            <button type="button" role="option" key={suggestion.placeId} onClick={() => chooseSuggestion(suggestion)}>
              <MapPinned />
              <span><b>{suggestion.primaryText}</b><small>{suggestion.secondaryText}</small></span>
            </button>
          ))}
        </div>
      )}
      {selected && <p className="city-selected"><MapPinned /> {copy.selected} {selected.name} · {selected.country} · {formatCoordinate(selected.latitude)}°, {formatCoordinate(selected.longitude)}°</p>}
    </div>
  );
}
