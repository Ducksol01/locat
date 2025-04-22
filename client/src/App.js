import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';

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
        alert('Unable to retrieve your location');
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
      style={{ height: '80vh', width: '100%' }}
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
    <div style={{
      background: '#fff',
      border: '1px solid #eee',
      borderRadius: '8px',
      padding: '1rem',
      margin: '1rem auto',
      maxWidth: 350,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <h4 style={{marginTop:0}}>Online Users</h4>
      <ul style={{listStyle:'none', padding:0, margin:0}}>
        {Object.entries(users).map(([id, loc], idx) => {
          if (!loc) return null;
          const isMe = myLocation && loc.lat === myLocation.lat && loc.lng === myLocation.lng;
          return (
            <li key={id} style={{marginBottom:8, color: isMe ? '#1976d2' : '#333'}}>
              <span style={{fontWeight: isMe ? 'bold' : 'normal'}}>
                {isMe ? 'You' : `User ${idx+1}`}
              </span>
              <br/>
              <span style={{fontSize:'0.95em', color:'#888'}}>
                Lat: {loc.lat.toFixed(5)}, Lng: {loc.lng.toFixed(5)}
              </span>
            </li>
          );
        })}
      </ul>
      <div style={{fontSize:'0.9em', color:'#aaa', marginTop:6}}>
        Total: {Object.values(users).filter(Boolean).length}
      </div>
    </div>
  );
}

function App() {
  const [myLocation, setMyLocation] = useState(null);
  const [users, setUsers] = useState({});

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f9f9f9', minHeight: '100vh' }}>
      <h2 style={{textAlign: 'center', margin: '1rem 0'}}>Location Tracker</h2>
      <p style={{textAlign: 'center'}}>Your location and nearby users are shown on the map in real-time.</p>
      <LocationUpdater setMyLocation={setMyLocation} setUsers={setUsers} />
      <OnlineUsersList users={users} myLocation={myLocation} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <MapView myLocation={myLocation} users={users} />
      </div>
      <footer style={{ textAlign: 'center', marginTop: '1rem', color: '#888' }}>
        For demo only. Locations are not stored permanently.
      </footer>
    </div>
  );
}

export default App;
