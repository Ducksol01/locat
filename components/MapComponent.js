'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon in React-Leaflet
const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom blinking icon for current user
const BlinkingIcon = L.divIcon({
  className: 'blinking-marker',
  html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); animation: blink 1s infinite;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

const MapComponent = ({ center, zoom, markers, currentUserLocation, username }) => {
  return (
    <div className="map-container">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {currentUserLocation && (
          <Marker position={[currentUserLocation.lat, currentUserLocation.lng]} icon={BlinkingIcon}>
            <Popup>
              <div>
                <h3>{username || 'You'}</h3>
                <p>Current Location</p>
              </div>
            </Popup>
          </Marker>
        )}
        {markers.map((marker, index) => (
          marker.name !== username && (
            <Marker key={index} position={[marker.lat, marker.lng]}
              icon={DefaultIcon}>
              <Popup>
                <div>
                  <h3>{marker.name}</h3>
                  <p>{marker.status}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
