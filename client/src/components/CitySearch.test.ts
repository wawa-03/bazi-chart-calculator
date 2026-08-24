import { describe, expect, it } from "vitest";
import { cityLocationFromPlace } from "./CitySearch";

describe("cityLocationFromPlace", () => {
  it("preserves the full precision returned by a selected city location", () => {
    const location = cityLocationFromPlace(
      { placeId: "beijing", primaryText: "北京", secondaryText: "中国" },
      { name: "北京", formatted_address: "北京市", address_components: [{ long_name: "中国", types: ["country"] }], geometry: { location: { lat: () => 39.904201987654, lng: () => 116.407396123456 } } },
    );

    expect(location).toEqual({ name: "北京", address: "北京市", country: "中国", latitude: 39.904201987654, longitude: 116.407396123456 });
  });

  it("accepts an overseas city and keeps its longitude for solar-time correction", () => {
    const location = cityLocationFromPlace(
      { placeId: "london", primaryText: "London", secondaryText: "United Kingdom" },
      { name: "London", formatted_address: "London, UK", address_components: [{ long_name: "United Kingdom", types: ["country"] }], geometry: { location: { lat: () => 51.5073509, lng: () => -0.1277583 } } },
    );

    expect(location).toEqual({ name: "London", address: "London, UK", country: "United Kingdom", latitude: 51.5073509, longitude: -0.1277583 });
  });

  it.each([
    ["北京", "中国", 39.9042, 116.4074],
    ["London", "United Kingdom", 51.5073509, -0.1277583],
    ["New York", "United States", 40.7128, -74.006],
    ["Tokyo", "Japan", 35.6762, 139.6503],
    ["Sydney", "Australia", -33.8688, 151.2093],
  ])("keeps coordinates and country for %s", (name, country, latitude, longitude) => {
    const location = cityLocationFromPlace(
      { placeId: name.toLowerCase(), primaryText: name, secondaryText: country },
      { name, formatted_address: `${name}, ${country}`, address_components: [{ long_name: country, types: ["country"] }], geometry: { location: { lat: () => latitude, lng: () => longitude } } },
    );

    expect(location).toMatchObject({ name, country, latitude, longitude });
  });
});
