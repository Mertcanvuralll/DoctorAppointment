import React from 'react';
import { Box, Typography } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
  marginTop: '8px'
};

const defaultCenter = {
  lat: 41.0082,
  lng: 28.9784
};

const LocationPicker = ({ value, onChange }) => {
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    onChange({ lat, lng });
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Click on the map to set your location
      </Typography>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={value || defaultCenter}
          zoom={13}
          onClick={handleMapClick}
        >
          {value && (
            <Marker
              position={value}
              draggable={true}
              onDragEnd={(e) => {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                onChange({ lat, lng });
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
};

export default LocationPicker; 