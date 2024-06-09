import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function Map() {
  const [geoData, setGeoData] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, name: '' });

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  const onEachCountry = (country, layer) => {
    layer.on({
      mouseover: (e) => {
        setTooltip({
          show: true,
          x: e.originalEvent.clientX,
          y: e.originalEvent.clientY,
          name: country.properties.name,
        });
      },
      mouseout: () => {
        setTooltip({
          show: false,
          x: 0,
          y: 0,
          name: '',
        });
      },
      mousemove: (e) => {
        setTooltip((prev) => ({
          ...prev,
          x: e.originalEvent.clientX,
          y: e.originalEvent.clientY,
        }));
      }
    });
  };

  return (
    <div>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoData && (
          <GeoJSON data={geoData} onEachFeature={onEachCountry} />
        )}
      </MapContainer>
      {tooltip.show && (
        <div className="tooltip" style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}>
          <strong>{tooltip.name}</strong>
      

        </div>
      )}
    </div>
  );
}

export default Map;
