import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import './App.css';

// Fix marker icon issue
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const socket = io('http://localhost:5000');

function LocationUpdater({ setMyLocation, setUsers }) {
  useEffect(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    let watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        socket.emit('updateLocation', { lat: latitude, lng: longitude });
      },
      (err) => {
        alert('Unable to retrieve your location. Please ensure location services are enabled and allowed for this site.');
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [setMyLocation]);

  useEffect(() => {
    socket.on('usersLocations', (users) => {
      setUsers(users);
    });
    return () => socket.off('usersLocations');
  }, [setUsers]);

  return null;
}

function MapView({ myLocation, users }) {
  const mapRef = useRef();

  // Center map on user's location
  function CenterMap() {
    const map = useMap();
    useEffect(() => {
      if (myLocation) {
        map.setView([myLocation.lat, myLocation.lng], 15);
      }
    }, [myLocation, map]);
    return null;
  }

  return (
    <MapContainer
      center={myLocation || [20.5937, 78.9629]} // Default: India
      zoom={5}
      style={{ height: '70vh', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {myLocation && (
        <Marker position={[myLocation.lat, myLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {Object.entries(users).map(([id, loc]) =>
        loc && myLocation && (loc.lat !== myLocation.lat || loc.lng !== myLocation.lng) ? (
          <Marker key={id} position={[loc.lat, loc.lng]}>
            <Popup>Nearby user</Popup>
          </Marker>
        ) : null
      )}
      <CenterMap />
    </MapContainer>
  );
}

function OnlineUsersList({ users, myLocation }) {
  return (
    <div className="online-users">
      <h4>Online Users</h4>
      <ul>
        {Object.entries(users).map(([id, loc], idx) => {
          if (!loc) return null;
          const isMe = myLocation && loc.lat === myLocation.lat && loc.lng === myLocation.lng;
          return (
            <li key={id}>
              <span className={isMe ? 'me' : ''}>
                {isMe ? 'You' : `User ${idx+1}`}
              </span>
              <span style={{fontSize:'0.93em', color:'#888', marginLeft: 8}}>
                Lat: {loc.lat.toFixed(5)}, Lng: {loc.lng.toFixed(5)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="total">
        Total: {Object.values(users).filter(Boolean).length}
      </div>
    </div>
  );
}

function App() {
  const [myLocation, setMyLocation] = useState(null);
  const [users, setUsers] = useState({});

  return (
    <div className="app-container">
      <div className="header">
        <h2>Location Tracker</h2>
        <p>Your location and nearby users are shown on the map in real-time.</p>
      </div>
      <LocationUpdater setMyLocation={setMyLocation} setUsers={setUsers} />
      <OnlineUsersList users={users} myLocation={myLocation} />
      <div className="map-wrapper">
        <MapView myLocation={myLocation} users={users} />
      </div>
      <footer>
        For demo only. Locations are not stored permanently.
      </footer>
    </div>
  );
}

export default App;
