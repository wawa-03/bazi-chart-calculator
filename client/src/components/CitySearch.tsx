/**
 * 观象历书设计提醒：城市搜索是输入侧注的一部分，紧凑、可核对，并把坐标作为历法条件而非装饰信息。
 */
import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPinned, Search, X } from "lucide-react";
import { MapView } from "@/components/Map";

export type CityLocation = {
  name: string;
  address: string;
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

export function CitySearch({ onSelect }: CitySearchProps) {
  const autocomplete = useRef<google.maps.places.AutocompleteService | null>(null);
  const detailService = useRef<google.maps.places.PlacesService | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selected, setSelected] = useState<CityLocation | null>(null);

  function onMapReady(map: google.maps.Map) {
    autocomplete.current = new google.maps.places.AutocompleteService();
    detailService.current = new google.maps.places.PlacesService(map);
    setReady(true);
  }

  useEffect(() => {
    const keyword = query.trim();
    if (!ready || keyword.length < 2 || !autocomplete.current || selected?.name === keyword) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = window.setTimeout(() => {
      autocomplete.current?.getPlacePredictions(
        {
          input: keyword,
          componentRestrictions: { country: "cn" },
          types: ["(cities)"],
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.slice(0, 5).map((prediction) => ({
              placeId: prediction.place_id,
              primaryText: prediction.structured_formatting?.main_text || prediction.description,
              secondaryText: prediction.structured_formatting?.secondary_text || "中国",
            })));
          } else {
            setSuggestions([]);
          }
          setIsSearching(false);
        },
      );
    }, 260);

    return () => window.clearTimeout(timer);
  }, [query, ready, selected]);

  function chooseSuggestion(suggestion: Suggestion) {
    if (!detailService.current) return;
    setIsSelecting(true);
    detailService.current.getDetails(
      { placeId: suggestion.placeId, fields: ["name", "formatted_address", "geometry"] },
      (place, status) => {
        const point = place?.geometry?.location;
        if (status === google.maps.places.PlacesServiceStatus.OK && point) {
          const location = {
            name: place.name || suggestion.primaryText,
            address: place.formatted_address || suggestion.secondaryText,
            latitude: point.lat(),
            longitude: point.lng(),
          };
          setSelected(location);
          setQuery(location.name);
          setSuggestions([]);
          onSelect(location);
        }
        setIsSelecting(false);
      },
    );
  }

  function clearSelection() {
    setSelected(null);
    setQuery("");
    setSuggestions([]);
  }

  return (
    <div className="city-search">
      <div className="field-head city-field-head">
        <label className="field-label" htmlFor="birth-city">出生城市</label>
        <span>{ready ? "地点服务已就绪" : "正在连接地点服务"}</span>
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
          placeholder="输入城市，如北京、上海"
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
        {(isSearching || isSelecting) && <LoaderCircle className="city-spinner" aria-label="正在搜索" />}
        {!isSearching && !isSelecting && query && <button type="button" onClick={clearSelection} aria-label="清除城市"><X /></button>}
      </div>
      {suggestions.length > 0 && (
        <div className="city-suggestions" id="city-suggestions" role="listbox" aria-label="城市搜索结果">
          {suggestions.map((suggestion) => (
            <button type="button" role="option" key={suggestion.placeId} onClick={() => chooseSuggestion(suggestion)}>
              <MapPinned />
              <span><b>{suggestion.primaryText}</b><small>{suggestion.secondaryText}</small></span>
            </button>
          ))}
        </div>
      )}
      {selected && <p className="city-selected"><MapPinned /> 已选 {selected.name} · {selected.latitude.toFixed(4)}°N, {selected.longitude.toFixed(4)}°E</p>}
      <MapView className="city-search-map-loader" initialCenter={{ lat: 35.8617, lng: 104.1954 }} initialZoom={4} onMapReady={onMapReady} />
    </div>
  );
}
