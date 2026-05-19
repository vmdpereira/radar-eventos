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
  const [exibirPreferencias, setExibirPreferencias] = useState(false);
  const [categoriaFavorita, setCategoriaFavorita] = useState('Todos');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão de localização negada.');
        setLoading(false);
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      try {
        const response = await axios.get(API_URL);
        setEventos(response.data);
      } catch (error) {
        console.error("Erro na API:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 1. TELA DE PREFERÊNCIAS (DENTRO DA ESTRUTURA AZUL)
  if (exibirPreferencias) {
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Suas Preferências</Text>
        <Text style={styles.welcomeSubtitle}>Escolha o que você quer ver no mapa:</Text>
        
        <View style={styles.prefArea}>
          {['Todos', 'Show', 'Cultura', 'Esporte', 'Outros'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.prefOption, categoriaFavorita === cat && styles.prefOptionActive]}
              onPress={() => setCategoriaFavorita(cat)}
            >
              <Text style={[styles.prefText, categoriaFavorita === cat && styles.prefTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.buttonWelcome} 
          onPress={() => setExibirPreferencias(false)}
        >
          <Text style={styles.buttonTextWelcome}>Salvar e Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. TELA DE BOAS-VINDAS
  if (exibirBoasVindas) {
    return (
      <View style={styles.welcomeContainer}>
        <Image source={logoImg} style={styles.logoImageFullWidth} resizeMode="cover" />
        <View style={styles.contentArea}>
          <Text style={styles.welcomeTitle}>Bem-vindo ao Radar</Text>
          <Text style={styles.welcomeSubtitle}>Eventos em tempo real em Jacupiranga e região.</Text>

          <TouchableOpacity style={styles.buttonWelcome} onPress={() => setExibirBoasVindas(false)}>
            <Text style={styles.buttonTextWelcome}>Acessar Mapa</Text>
          </TouchableOpacity>

          {/* BOTÃO DE PREFERÊNCIAS NA TELA INICIAL */}
          <TouchableOpacity 
            style={styles.buttonSecondary} 
            onPress={() => setExibirPreferencias(true)}
          >
            <Text style={styles.buttonTextSecondary}>⚙️ Configurar Interesses</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>PTCC - Radar Eventos Technologies © 2026</Text>
      </View>
    );
  }

  // FILTRAGEM DOS EVENTOS COM BASE NA PREFERÊNCIA
  const eventosFiltrados = categoriaFavorita === 'Todos' 
    ? eventos 
    : eventos.filter(ev => ev.categoria === categoriaFavorita);

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={{
          latitude: location ? location.latitude : -24.8576,
          longitude: location ? location.longitude : -48.5058,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }} 
        showsUserLocation={true}
      >
        {eventosFiltrados.map((evento) => (
          <Marker
            key={evento.id || String(evento.lat) + String(evento.lng)}
            coordinate={{ latitude: parseFloat(evento.lat), longitude: parseFloat(evento.lng) }}
            title={evento.nome}
            pinColor={AZUL_FUNDO_LOGO_EXATO}
            description={`${evento.categoria} - ${evento.cidade}`}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => setExibirBoasVindas(true)}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: '100%', height: '100%' },
  welcomeContainer: { flex: 1, backgroundColor: AZUL_FUNDO_LOGO_EXATO, alignItems: 'center', justifyContent: 'center' },
  logoImageFullWidth: { width: screenWidth, height: 250, marginTop: 50 },
  contentArea: { flex: 1, width: '100%', padding: 30, alignItems: 'center', justifyContent: 'center' },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 10 },
  welcomeSubtitle: { fontSize: 16, color: '#ffffff', textAlign: 'center', marginBottom: 30, opacity: 0.9 },
  
  // Botões
  buttonWelcome: { backgroundColor: '#ffffff', paddingVertical: 18, borderRadius: 15, width: '100%', alignItems: 'center', elevation: 8, marginBottom: 15 },
  buttonTextWelcome: { color: AZUL_FUNDO_LOGO_EXATO, fontSize: 18, fontWeight: 'bold' },
  buttonSecondary: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  buttonTextSecondary: { color: '#ffffff', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
  
  // Preferências
  prefArea: { width: '100%', paddingHorizontal: 20, marginBottom: 30 },
  prefOption: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  prefOptionActive: { backgroundColor: '#ffffff' },
  prefText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  prefTextActive: { color: AZUL_FUNDO_LOGO_EXATO },

  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', width: 45, height: 45, borderRadius: 22.5, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  backButtonText: { fontSize: 24, color: AZUL_FUNDO_LOGO_EXATO, fontWeight: 'bold' },
  footerText: { color: '#ffffff', position: 'absolute', bottom: 30, fontSize: 12, opacity: 0.7 }
});