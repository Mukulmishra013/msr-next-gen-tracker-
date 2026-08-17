// Dynamic Geolocation & Geofencing Engine with Admin Configurable Office GPS & WFH Support
// Geofence Radius, Admin Coordinate Control & Per-Staff Work From Home (WFH) Mode

const OFFICE_LOCATION_STORAGE_KEY = 'msr_dynamic_office_location';
const STAFF_WORK_MODE_STORAGE_KEY = 'msr_staff_work_modes';

// Default Office Coordinates (Can be updated dynamically by Admin)
export const DEFAULT_OFFICE_COORDINATES = {
  name: "MSR Next Gen GKP Office",
  lat: 26.7606,
  lng: 83.3732,
  radiusMeters: 500, // 500m default geofence radius
};

/**
 * Get the current active Office GPS coordinates (from Admin settings or default)
 */
export function getOfficeLocation() {
  try {
    const saved = localStorage.getItem(OFFICE_LOCATION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        name: parsed.name || DEFAULT_OFFICE_COORDINATES.name,
        lat: Number(parsed.lat) || DEFAULT_OFFICE_COORDINATES.lat,
        lng: Number(parsed.lng) || DEFAULT_OFFICE_COORDINATES.lng,
        radiusMeters: Number(parsed.radiusMeters) || 500
      };
    }
  } catch (e) {}
  return DEFAULT_OFFICE_COORDINATES;
}

/**
 * Set and save new Office GPS coordinates & Geofence radius by Admin
 */
export function setOfficeLocation(newLocation) {
  try {
    const updated = {
      name: newLocation.name || "MSR Head Office",
      lat: Number(newLocation.lat),
      lng: Number(newLocation.lng),
      radiusMeters: Number(newLocation.radiusMeters) || 500
    };
    localStorage.setItem(OFFICE_LOCATION_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving office location:', e);
    return DEFAULT_OFFICE_COORDINATES;
  }
}

/**
 * Get all staff work modes (OFFICE vs WFH)
 */
export function getAllStaffWorkModes() {
  try {
    const saved = localStorage.getItem(STAFF_WORK_MODE_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    usr_priya_telecaller: 'WFH', // Default to WFH for ease of telecalling from home
    usr_rahul_telecaller: 'WFH',
    usr_amit_field: 'OFFICE'
  };
}

/**
 * Get work mode for a specific staff member
 * @returns {'OFFICE' | 'WFH'}
 */
export function getStaffWorkMode(userId) {
  const modes = getAllStaffWorkModes();
  return modes[userId] || 'WFH'; // Default to WFH if not specified
}

/**
 * Set work mode for a specific staff member by Admin
 */
export function setStaffWorkMode(userId, mode = 'WFH') {
  try {
    const modes = getAllStaffWorkModes();
    modes[userId] = mode;
    localStorage.setItem(STAFF_WORK_MODE_STORAGE_KEY, JSON.stringify(modes));
    return modes;
  } catch (e) {
    console.error('Error saving staff work mode:', e);
  }
}

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
export function checkGeofence(userLat, userLng, office = null) {
  const activeOffice = office || getOfficeLocation();
  const distance = calculateHaversineDistance(userLat, userLng, activeOffice.lat, activeOffice.lng);
  return {
    withinGeofence: distance <= activeOffice.radiusMeters,
    distanceMeters: distance,
    allowedRadius: activeOffice.radiusMeters,
    officeName: activeOffice.name,
    status: distance <= activeOffice.radiusMeters ? "present" : "outside_office"
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
            msg = "Location permission block kiya gaya hai. Please GPS permission allow karein ya Admin se WFH mode activate karwayein.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "GPS Signal nahi mil raha. Open area me try karein.";
            break;
          case error.TIMEOUT:
            msg = "GPS request timeout ho gaya. Dubara koshish karein.";
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}
