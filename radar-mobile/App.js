import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

// Importando sua imagem da pasta assets
import logoImg from './assets/radarlogo.jpeg';

const API_URL = 'https://radar-api-nk3u.onrender.com/eventos';
const AZUL_RADAR = '#005eb8'; // Tom de azul extraído do seu logo

export default function App() {
  const [location, setLocation] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exibirBoasVindas, setExibirBoasVindas] = useState(true);

  useEffect(() => {
    (async () => {
      // 1. Solicita permissão para acessar o GPS
      let { status } = await Location.requestForegroundPermissionsPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão de localização negada. O mapa iniciará na posição padrão.');
        setLoading(false);
        return;
      }

      // 2. Captura a posição atual
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      // 3. Busca os eventos na API
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

  // TELA DE BOAS-VINDAS
  if (exibirBoasVindas) {
    return (
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeContent}>
          <Image 
            source={logoImg} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
          
          <Text style={styles.welcomeTitle}>Bem-vindo ao Radar</Text>
          <Text style={styles.welcomeSubtitle}>
            Encontre os melhores eventos culturais de Jacupiranga e região.
          </Text>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setExibirBoasVindas(false)}
          >
            <Text style={styles.buttonText}>Acessar Mapa</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.footerText}>PTCC - Radar Eventos Technologies</Text>
      </View>
    );
  }

  // TELA DE CARREGAMENTO (Antes de abrir o mapa)
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AZUL_RADAR} />
        <Text style={{ marginTop: 10, color: AZUL_RADAR }}>Sincronizando eventos...</Text>
      </View>
    );
  }

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
            pinColor={AZUL_RADAR}
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
  // Estilos da Tela de Boas-Vindas
  welcomeContainer: {
    flex: 1,
    backgroundColor: AZUL_RADAR,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeContent: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoImage: {
    width: 220,
    height: 120,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AZUL_RADAR,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  button: {
    backgroundColor: AZUL_RADAR,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 11,
    opacity: 0.7,
  },
});
