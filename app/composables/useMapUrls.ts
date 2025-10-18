export function useMapUrls() {
  const getOpenStreetMapUrl = (address: string) => {
    return `//www.openstreetmap.org/search?query=${address?.replace('\n', ', ')}`;
  };

  const getAppleMapsUrl = (address: string) => {
    return `//maps.apple.com/?q=${address?.replace('\n', ', ')}`;
  };

  const getGoogleMapsUrl = (address: string) => {
    return `//www.google.com/maps/search/?api=1&query=${address?.replace('\n', ', ')}`;
  };

  return { getOpenStreetMapUrl, getAppleMapsUrl, getGoogleMapsUrl };
}
