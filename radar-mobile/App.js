import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

// Importando sua imagem da pasta assets
import logoImg from './assets/radarlogo.jpeg';

const API_URL = 'https://radar-api-nk3u.onrender.com/eventos';
const AZUL_FUNDO_LOGO_EXATO = '#0059b3'; 

export default function App() {
  const [location, setLocation] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exibirBoasVindas, setExibirBoasVindas] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão de localização negada. O mapa iniciará na posição padrão.');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

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
        <Image 
          source={logoImg} 
          style={styles.logoImageFullWidth} 
          resizeMode="cover" 
        />
        <View style={styles.contentArea}>
          <Text style={styles.welcomeTitle}>Bem-vindo ao Radar</Text>
          <Text style={styles.welcomeSubtitle}>
            Descubra eventos culturais, lazer e shows em Jacupiranga e região em tempo real.
          </Text>
          <TouchableOpacity 
            style={styles.buttonWelcome} 
            onPress={() => setExibirBoasVindas(false)}
          >
            <Text style={styles.buttonTextWelcome}>Acessar Mapa</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>PTCC - Radar Eventos Technologies © 2026</Text>
      </View>
    );
  }

  // TELA DE CARREGAMENTO
  if (loading) {
    return (
      <View style={styles.containerLoading}>
        <ActivityIndicator size="large" color={AZUL_FUNDO_LOGO_EXATO} />
        <Text style={{ marginTop: 15, color: AZUL_FUNDO_LOGO_EXATO, fontWeight: 'bold' }}>Sincronizando eventos...</Text>
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
            pinColor={AZUL_FUNDO_LOGO_EXATO}
            description={`${evento.categoria} - ${evento.cidade}`}
          />
        ))}
      </MapView>

      {/* BOTÃO DE VOLTAR - Pequeno e discreto sobre o mapa */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setExibirBoasVindas(true)}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerLoading: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // Botão de Voltar no Mapa
  backButton: {
    position: 'absolute',
    top: 50, // Distância do topo para não ficar em cima da barra de status
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButtonText: {
    fontSize: 24,
    color: AZUL_FUNDO_LOGO_EXATO,
    fontWeight: 'bold',
  },
  // Estilos da Boas-Vindas
  welcomeContainer: {
    flex: 1,
    backgroundColor: AZUL_FUNDO_LOGO_EXATO,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoImageFullWidth: {
    width: screenWidth,
    height: 250,
    marginTop: 50,
  },
  contentArea: {
    flex: 1,
    width: '100%',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 22,
    opacity: 0.9,
  },
  buttonWelcome: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    elevation: 8,
  },
  buttonTextWelcome: {
    color: AZUL_FUNDO_LOGO_EXATO,
    fontSize: 20,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#ffffff',
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    opacity: 0.7,
  },
});