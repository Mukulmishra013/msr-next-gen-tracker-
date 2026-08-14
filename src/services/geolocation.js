// Geolocation & Geofencing Engine for Gorakhpur (GKP) Office & Field Visits

// Default GKP Office Location Coordinates
export const OFFICE_COORDINATES = {
  name: "MSR Next Gen GKP Office",
  lat: 26.7606,
  lng: 83.3732,
  radiusMeters: 200, // 200-meter strict geofence radius
};

/**
 * Calculates Great-Circle distance between two points using the Haversine formula
 * @returns {number} Distance in meters
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

/**
 * Validates if coordinates are within the office geofence
 */
export function checkGeofence(userLat, userLng, office = OFFICE_COORDINATES) {
  const distance = calculateHaversineDistance(userLat, userLng, office.lat, office.lng);
  return {
    withinGeofence: distance <= office.radiusMeters,
    distanceMeters: distance,
    allowedRadius: office.radiusMeters,
    status: distance <= office.radiusMeters ? "present" : "outside_office"
  };
}

/**
 * Requests device GPS location with high accuracy
 */
export function getCurrentGpsPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Aapke device me GPS Geolocation support nahi hai."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        });
      },
      (error) => {
        let msg = "GPS location access failed.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission block kiya gaya hai. Please GPS permission allow karein.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "GPS Signal nahi mil raha. Please open area me try karein.";
            break;
          case error.TIMEOUT:
            msg = "GPS request timeout ho gaya. Dubara koshish karein.";
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });
}
