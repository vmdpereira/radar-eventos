import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, TouchableOpacity, Dimensions, Platform, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import logoImg from './assets/radarlogo.jpeg';

const API_URL = 'https://radar-api-nk3u.onrender.com/eventos';
const AZUL_FUNDO_LOGO_EXATO = '#0059b3'; 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
}

function formatDistance(meters) {
  if (meters === null || meters === undefined) return '';
  if (meters < 1000) {
    return `A ${Math.round(meters)}m de você`;
  }
  return `A ${(meters / 1000).toFixed(1)}km de você`;
}

function formatDate(dateString) {
  if (!dateString) return 'Data não definida';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exibirBoasVindas, setExibirBoasVindas] = useState(true);
  const [exibirPreferencias, setExibirPreferencias] = useState(false);
  const [categoriaFavorita, setCategoriaFavorita] = useState('Todos');

  const [favoritos, setFavoritos] = useState([]);
  const [scheduledNotifications, setScheduledNotifications] = useState({});
  const [notificadosProximidade, setNotificadosProximidade] = useState(new Set());
  const [eventoSelecionado, setEventoSelecionado] = useState(null);

  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações não foi concedida!');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedFavs = await AsyncStorage.getItem('@radar_favoritos');
        if (savedFavs) {
          setFavoritos(JSON.parse(savedFavs));
        }
        const savedNotes = await AsyncStorage.getItem('@radar_notifications');
        if (savedNotes) {
          setScheduledNotifications(JSON.parse(savedNotes));
        }
      } catch (err) {
        console.error('Erro ao carregar favoritos salvos:', err);
      }
    })();
  }, []);

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

  useEffect(() => {
    let subscription;
    if (eventos.length === 0 || favoritos.length === 0) return;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,   
          distanceInterval: 15,  
        },
        async (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation(newLocation.coords);

          for (const ev of eventos) {
            if (favoritos.includes(ev.id)) {
              const dist = getDistance(
                latitude,
                longitude,
                parseFloat(ev.lat),
                parseFloat(ev.lng)
              );

              if (dist < 1000) {
                if (!notificadosProximidade.has(ev.id)) {
                  try {
                    await Notifications.scheduleNotificationAsync({
                      content: {
                        title: "📍 Evento Favorito por Perto!",
                        body: `O evento "${ev.nome}" está a apenas ${Math.round(dist)}m de você em ${ev.cidade}!`,
                        sound: true,
                      },
                      trigger: null, 
                    });

                    setNotificadosProximidade(prev => {
                      const next = new Set(prev);
                      next.add(ev.id);
                      return next;
                    });
                  } catch (err) {
                    console.error('Erro ao disparar notificação de proximidade:', err);
                  }
                }
              } else if (dist > 1500) {
                if (notificadosProximidade.has(ev.id)) {
                  setNotificadosProximidade(prev => {
                    const next = new Set(prev);
                    next.delete(ev.id);
                    return next;
                  });
                }
              }
            }
          }
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [eventos, favoritos, notificadosProximidade]);

  const toggleFavorito = async (evento) => {
    const isFav = favoritos.includes(evento.id);
    let novosFavoritos = [...favoritos];
    let novasNotificacoes = { ...scheduledNotifications };

    if (isFav) {
      novosFavoritos = novosFavoritos.filter(id => id !== evento.id);

      const notificationId = scheduledNotifications[evento.id];
      if (notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
          delete novasNotificacoes[evento.id];
        } catch (err) {
          console.error("Erro ao cancelar notificação:", err);
        }
      }
    } else {
      novosFavoritos.push(evento.id);

      if (evento.data_evento) {
        try {
          const [ano, mes, dia] = evento.data_evento.split('-');
          const triggerDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 9, 0, 0);
          const agora = new Date();

          if (triggerDate > agora) {
            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: "📅 Hoje é o dia do Evento!",
                body: `O evento "${evento.nome}" que você favoritou acontece hoje em ${evento.cidade}! Não perca!`,
                sound: true,
              },
              trigger: triggerDate,
            });
            novasNotificacoes[evento.id] = notificationId;
          } else {
            console.log("A data do evento já passou, portanto não agendamos notificação.");
          }
        } catch (err) {
          console.error("Erro ao agendar notificação:", err);
        }
      }
    }

    try {
      setFavoritos(novosFavoritos);
      setScheduledNotifications(novasNotificacoes);
      await AsyncStorage.setItem('@radar_favoritos', JSON.stringify(novosFavoritos));
      await AsyncStorage.setItem('@radar_notifications', JSON.stringify(novasNotificacoes));
    } catch (err) {
      console.error('Erro ao salvar favoritos:', err);
    }
  };

  if (exibirPreferencias) {
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Suas Preferências</Text>
        <Text style={styles.welcomeSubtitle}>Escolha o que você quer ver no mapa:</Text>
        
        <View style={styles.prefArea}>
          {['Todos', 'Favoritos', 'Show', 'Cultura', 'Esporte', 'Outros'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.prefOption, categoriaFavorita === cat && styles.prefOptionActive]}
              onPress={() => setCategoriaFavorita(cat)}
            >
              <Text style={[styles.prefText, categoriaFavorita === cat && styles.prefTextActive]}>
                {cat === 'Favoritos' ? '⭐ Favoritos' : cat}
              </Text>
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

  const eventosFiltrados = categoriaFavorita === 'Todos' 
    ? eventos 
    : categoriaFavorita === 'Favoritos'
      ? eventos.filter(ev => favoritos.includes(ev.id))
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
        onPress={() => setEventoSelecionado(null)} 
      >
        {eventosFiltrados.map((evento) => {
          const isFav = favoritos.includes(evento.id);
          const linkStr = evento.link_ingresso ? evento.link_ingresso : "Não informado";
          return (
            <Marker
              key={evento.id || String(evento.lat) + String(evento.lng)}
              coordinate={{ latitude: parseFloat(evento.lat), longitude: parseFloat(evento.lng) }}
              title={evento.nome}
              pinColor={isFav ? '#FFD700' : AZUL_FUNDO_LOGO_EXATO} 
              description={`Categoria: ${evento.categoria}\nCidade: ${evento.cidade}\nData: ${formatDate(evento.data_evento)}\nIngressos: ${linkStr}`}
              onPress={() => setEventoSelecionado(evento)}
            />
          );
        })}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => { setEventoSelecionado(null); setExibirBoasVindas(true); }}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {eventoSelecionado && (() => {
        const isFav = favoritos.includes(eventoSelecionado.id);
        const dist = location ? getDistance(
          location.latitude,
          location.longitude,
          parseFloat(eventoSelecionado.lat),
          parseFloat(eventoSelecionado.lng)
        ) : null;

        let emoji = '📅';
        if (eventoSelecionado.categoria === 'Show') emoji = '🎤';
        else if (eventoSelecionado.categoria === 'Cultura') emoji = '🎨';
        else if (eventoSelecionado.categoria === 'Esporte') emoji = '🏆';
        else if (eventoSelecionado.categoria === 'Outros') emoji = '⭐';

        return (
          <View style={styles.bottomCard}>
            <View style={styles.cardHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{emoji} {eventoSelecionado.categoria}</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeCardButton} 
                onPress={() => setEventoSelecionado(null)}
              >
                <Text style={styles.closeCardText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.cardTitle}>{eventoSelecionado.nome}</Text>
            
            <View style={styles.cardInfoRow}>
              <Text style={styles.cardInfoLabel}>📍 Localização:</Text>
              <Text style={styles.cardInfoValue}>{eventoSelecionado.cidade}</Text>
            </View>

            <View style={styles.cardInfoRow}>
              <Text style={styles.cardInfoLabel}>📅 Data e Hora:</Text>
              <Text style={styles.cardInfoValue}>
                {formatDate(eventoSelecionado.data_evento)} às {eventoSelecionado.horario || 'Horário indefinido'}
              </Text>
            </View>

            {eventoSelecionado.link_ingresso ? (
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoLabel}>🎫 Ingressos:</Text>
                <TouchableOpacity onPress={() => Linking.openURL(eventoSelecionado.link_ingresso).catch(() => alert(`Simulando abertura do link: ${eventoSelecionado.link_ingresso}`))}>
                  <Text style={styles.cardLinkValue} numberOfLines={1} ellipsizeMode="tail">
                    {eventoSelecionado.link_ingresso}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoLabel}>🎫 Ingressos:</Text>
                <Text style={[styles.cardInfoValue, { color: '#888', fontStyle: 'italic' }]}>Entrada gratuita / Não informado</Text>
              </View>
            )}

            {dist !== null && (
              <View style={styles.cardDistanceRow}>
                <Text style={styles.cardDistanceText}>📍 {formatDistance(dist)}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.favButton, isFav && styles.favButtonActive]} 
              onPress={() => toggleFavorito(eventoSelecionado)}
            >
              <Text style={[styles.favButtonText, isFav && styles.favButtonTextActive]}>
                {isFav ? '🌟 Favoritado!' : '⭐ Adicionar aos Favoritos'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })()}
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
  
  buttonWelcome: { backgroundColor: '#ffffff', paddingVertical: 18, borderRadius: 15, width: '100%', alignItems: 'center', elevation: 8, marginBottom: 15 },
  buttonTextWelcome: { color: AZUL_FUNDO_LOGO_EXATO, fontSize: 18, fontWeight: 'bold' },
  buttonSecondary: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  buttonTextSecondary: { color: '#ffffff', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
  
  prefArea: { width: '100%', paddingHorizontal: 20, marginBottom: 30 },
  prefOption: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  prefOptionActive: { backgroundColor: '#ffffff' },
  prefText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  prefTextActive: { color: AZUL_FUNDO_LOGO_EXATO },

  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', width: 45, height: 45, borderRadius: 22.5, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  backButtonText: { fontSize: 24, color: AZUL_FUNDO_LOGO_EXATO, fontWeight: 'bold' },
  footerText: { color: '#ffffff', position: 'absolute', bottom: 30, fontSize: 12, opacity: 0.7 },

  bottomCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 25,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 89, 179, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: AZUL_FUNDO_LOGO_EXATO,
    fontSize: 13,
    fontWeight: 'bold',
  },
  closeCardButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: 100,
  },
  cardInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  cardLinkValue: {
    fontSize: 14,
    color: '#0059b3',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    flex: 1,
  },
  cardDistanceRow: {
    backgroundColor: '#e6f2ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  cardDistanceText: {
    color: AZUL_FUNDO_LOGO_EXATO,
    fontSize: 13,
    fontWeight: '600',
  },
  favButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  favButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#E6C200',
  },
  favButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favButtonTextActive: {
    color: '#000',
  },
});