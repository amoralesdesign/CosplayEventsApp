import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome5 } from '@expo/vector-icons';

interface EventMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

const EventMap: React.FC<EventMapProps> = ({ latitude, longitude, title, description }) => {
  console.log('Latitude:', latitude); // Verifica la latitud
       console.log('Longitude:', longitude);
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={title}
          description={description}
        >
          <FontAwesome5 name="theater-masks" size={45} color="#ea266d" />
        </Marker>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 12, // Esquinas redondeadas
    overflow: 'hidden', // Asegura que el mapa respete las esquinas redondeadas
  },
  map: {
    flex: 1,
  },
});

export default EventMap;