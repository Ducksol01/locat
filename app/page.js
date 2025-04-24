'use client'

import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

// Get the hostname dynamically (will work in the browser only due to 'use client')
const getSocketUrl = () => {
  // Check if window is defined (only in browser)
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const host = window.location.hostname; // This will be the IP or domain name
    return `${protocol}://${host}:3001`;
  }
  return 'http://localhost:3001'; // Fallback for SSR (won't be used with 'use client')
};

const socket = io(getSocketUrl());

export default function Home() {
  const [location, setLocation] = useState(null);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
      },
      (error) => console.error('Error getting location:', error)
    );

    // Update location every 10 seconds
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        }
      );
    }, 10000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Socket.io events
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('updateUsers', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('updateUsers');
    };
  }, []);

  useEffect(() => {
    if (location && username && isConnected) {
      socket.emit('updateLocation', { username, location });
    }
  }, [location, username, isConnected]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && location) {
      socket.emit('setUsername', { username, location });
    }
  };

  const markers = users.map(user => ({
    lat: user.location.lat,
    lng: user.location.lng,
    name: user.username,
    status: 'Online'
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Location Tracker</h1>
      
      {!username && (
        <div className="mb-6 max-w-md mx-auto">
          <form onSubmit={handleUsernameSubmit} className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="flex-1 p-2 border rounded"
              disabled={!location}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
              disabled={!location || !username.trim()}
            >
              Join
            </button>
          </form>
          {!location && (
            <p className="text-red-500 mt-2">Waiting for location access...</p>
          )}
        </div>
      )}

      <div className="mb-6 max-w-md mx-auto">
        <div className="bg-white p-4 rounded shadow">
          <h2 className={`text-lg font-semibold mb-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </h2>
          <p className="text-gray-600">Online Users: {users.length}</p>
          {username && <p className="text-gray-600">Logged in as: {username}</p>}
        </div>
      </div>

      {location ? (
        <MapComponent 
          center={[location.lat, location.lng]} 
          zoom={13} 
          markers={markers} 
          currentUserLocation={location}
          username={username}
        />
      ) : (
        <div className="text-center py-10">
          <p>Loading map... Please allow location access.</p>
        </div>
      )}
    </div>
  );
}
