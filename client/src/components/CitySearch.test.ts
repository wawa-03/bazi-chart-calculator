import { describe, expect, it } from "vitest";
import { cityLocationFromPlace } from "./CitySearch";

describe("cityLocationFromPlace", () => {
  it("preserves the full precision returned by a selected city location", () => {
    const location = cityLocationFromPlace(
      { placeId: "beijing", primaryText: "北京", secondaryText: "中国" },
      { name: "北京", formatted_address: "北京市", geometry: { location: { lat: () => 39.904201987654, lng: () => 116.407396123456 } } },
    );

    expect(location).toEqual({ name: "北京", address: "北京市", latitude: 39.904201987654, longitude: 116.407396123456 });
  });
});
