import Mapbox from "@rnmapbox/maps";

const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

if (!token) {
  throw new Error("Mapbox token missing in environment variables");
}

Mapbox.setAccessToken(token);

export default Mapbox;
