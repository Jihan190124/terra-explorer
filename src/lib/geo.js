import { Vector3 } from 'three';

const RAD = Math.PI / 180;

// Matches three.js SphereGeometry UVs for an equirectangular texture (lng -180 at u = 0).
export function latLngToVector3(lat, lng, radius = 1) {
  const phi = (90 - lat) * RAD;
  const theta = (lng + 180) * RAD;
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function vector3ToLatLng(v) {
  const r = v.length();
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, v.y / r))) / RAD;
  let theta = Math.atan2(v.z, -v.x) / RAD;
  if (theta < 0) theta += 360;
  return { lat, lng: theta - 180 };
}
