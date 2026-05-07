import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

// URL da API que configuramos e subimos no Render
const API_URL = 'https://radar-api-nk3u.onrender.com/eventos';

export default function App() {
  const [location, setLocation] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1. Solicita permissão para acessar o GPS do celular
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão de localização negada. O mapa iniciará na posição padrão.');
        setLoading(false);
        return;
      }

      // 2. Captura a posição atual do usuário
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      // 3. Busca os eventos cadastrados no banco de dados (Render)
      try {
        const response = await axios.get(API_URL);
        setEventos(response.data);
      } catch (error) {
        console.error("Erro ao buscar eventos da API:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={{ marginTop: 10 }}>Carregando Radar...</Text>
      </View>
    );
  }

  // Coordenadas padrão (Jacupiranga) caso o GPS esteja desligado no emulador
  const initialRegion = {
    latitude: location ? location.latitude : -24.8576,
    longitude: location ? location.longitude : -48.5058,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation={true}>
        {eventos.map((evento) => (
          <Marker
            key={evento.id || String(evento.lat) + String(evento.lng)}
            coordinate={{
              latitude: parseFloat(evento.lat),
              longitude: parseFloat(evento.lng),
            }}
            title={evento.nome}
            description={`${evento.categoria} - ${evento.cidade}`}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
