# Location Tracker

A real-time location tracking web application built with Next.js, React-Leaflet for mapping, and Socket.IO for live updates.

## Features

- Real-time location sharing
- Live map view with user markers
- Username-based user identification
- Online/offline status indicators

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone this repository or download the files.
2. Install dependencies for the Next.js client:
   ```bash
   cd location-tracker
   npm install
   ```
3. Install dependencies for the server:
   ```bash
   cd location-tracker
   npm install --prefix ./ --package=package.json.server
   ```

### Running the Application

1. Start the Socket.IO server:
   ```bash
   npm run start --prefix ./ --package=package.json.server
   ```
2. In a separate terminal, start the Next.js development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

### Usage

- Allow location access when prompted by the browser.
- Enter a username to join the tracking system.
- View all online users on the map with their live locations.

## Troubleshooting

- **Location Access Denied**: The app requires location access to function. Ensure you've granted permission in your browser.
- **Server Connection Issues**: Make sure the Socket.IO server is running on port 3001.
- **Map Not Loading**: Check your internet connection as the map tiles are loaded from OpenStreetMap.

## License

MIT
# locat
# locat
