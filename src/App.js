import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import countryMapping from './countryMapping.json';
import indicatorNames from './indicatorMap.json'
import './App.css';

function Map() {
  const [geoData, setGeoData] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, name: '' });
  const [flashingCountry, setFlashingCountry] = useState(null);
  const [countryData, setCountryData] = useState(null); // State to hold country data

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  async function fetchCountryData(countryName) {
    try {
      const countryCode = countryMapping[countryName];
      if (!countryCode) {
        throw new Error(`No country code found for ${countryName}`);
      }

      const response = await fetch(`https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL;SP.DYN.LE00.IN;NY.GDP.MKTP.CD;NY.GDP.PCAP.CD;SH.DYN.MORT;SH.XPD.CHEX.PC.CD;SL.UEM.TOTL.ZS;SE.XPD.TOTL.GD.ZS;AG.LND.FRST.ZS;EG.ELC.ACCS.ZS;EN.ATM.CO2E.PC?date=2021&source=2&format=json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length < 2 || !Array.isArray(data[1])) {
        throw new Error('Unexpected data format');
      }

      // Initialize an object to hold country data
      const countryDataObj = {};

      // Process each indicator and store its value in the object
      data[1].forEach(entry => {
        if (entry.value !== null) {
          countryDataObj[indicatorNames[entry.indicator.id]] = entry.value;
        }
      });

      // Set the country data state
      setCountryData(countryDataObj);

    } catch (error) {
      console.error('Error fetching country data:', error);
      // Reset country data if error occurs
      setCountryData(null);
    }
  }

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
      click: () => {
        setFlashingCountry(country.properties.name);
        fetchCountryData(country.properties.name);
        setTimeout(() => {
          setFlashingCountry(null);
        }, 1000); // Flashing duration, adjust as needed
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
      <MapContainer center={[20, 0]} zoom={3} minZoom={3} maxZoom={10} style={{ height: "100vh", width: "75%", float: "left" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            onEachFeature={onEachCountry}
            style={(feature) => ({
              fillColor: feature.properties.name === flashingCountry ? 'red' : '#3388ff',
              weight: 2,
              opacity: 1,
              color: 'white',
              fillOpacity: 0.7,
            })}
          />
        )}
      </MapContainer>
      {tooltip.show && (
        <div className="tooltip" style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}>
          <strong>{tooltip.name}</strong>
        </div>
      )}
      {countryData && ( // Render country data if available
        <div className="data-container" style={{ backgroundColor: "black", color: "white", float: "right", width: "25%", height: "100vh", overflow: "auto" }}>
          <h1>Country Data</h1>
          <ul className='data'>
            {Object.entries(countryData).map(([indicator, value]) => (
              <li key={indicator}>
                <strong>{indicator}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Map
