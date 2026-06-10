import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, TouchableOpacity, Dimensions, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
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

const generateLeafletHtml = (location, eventosFiltrados, favoritos, azulLogo) => {
  const userLat = location ? location.latitude : -24.8576;
  const userLng = location ? location.longitude : -48.5058;

  // Map events to simple safe structures
  const safeEvents = eventosFiltrados.map(ev => ({
    id: ev.id,
    nome: ev.nome.replace(/'/g, "\\'").replace(/"/g, '\\"'),
    cidade: ev.cidade.replace(/'/g, "\\'").replace(/"/g, '\\"'),
    categoria: ev.categoria,
    lat: parseFloat(ev.lat),
    lng: parseFloat(ev.lng)
  }));

  const serializedEvents = JSON.stringify(safeEvents);
  const serializedFavs = JSON.stringify(favoritos);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #f4f6f9;
        }
        .leaflet-div-icon {
          background: transparent;
          border: none;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const map = L.map('map', {
          zoomControl: false
        }).setView([${userLat}, ${userLng}], 14);

        L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 20
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const hasLocation = ${location ? 'true' : 'false'};
        if (hasLocation) {
          const userIcon = L.divIcon({
            html: '<div style="width: 16px; height: 16px; background: #007bff; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,123,255,0.6);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          L.marker([${userLat}, ${userLng}], { icon: userIcon }).addTo(map);
        }

        const eventos = ${serializedEvents};
        const favoritos = ${serializedFavs};
        const azulColor = '${azulLogo}';

        eventos.forEach(ev => {
          const isFav = favoritos.includes(ev.id);
          const pinColor = isFav ? '#FFD700' : azulColor;
          const pinBorder = isFav ? '#E6C200' : '#003d80';

          const markerIcon = L.divIcon({
            html: \`
              <div style="
                width: 24px;
                height: 24px;
                background: \${pinColor};
                border: 2px solid \${pinBorder};
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background: white;
                  border-radius: 50%;
                  transform: rotate(45deg);
                "></div>
              </div>
            \`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });

          const marker = L.marker([ev.lat, ev.lng], { icon: markerIcon }).addTo(map);
          
          marker.on('click', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'SELECT_EVENTO',
              eventoId: ev.id
            }));
          });
        });

        // Tap map to dismiss bottom sheet
        map.on('click', (e) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'DESELECT_EVENTO'
          }));
        });
      </script>
    </body>
    </html>
  `;
};

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
      // 1. Fetch events from API immediately and independently of location
      axios.get(API_URL)
        .then(response => {
          setEventos(response.data);
        })
        .catch(error => {
          console.error("Erro na API:", error);
        })
        .finally(() => {
          setLoading(false);
        });

      // 2. Request permissions and get location safely without blocking the events API
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permissão de localização negada.');
          return;
        }

        // Try to get last known position first (extremely fast, doesn't hang)
        let currentLocation = await Location.getLastKnownPositionAsync({});
        
        // If not available, request current position with a balanced accuracy
        if (!currentLocation) {
          currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }

        if (currentLocation) {
          setLocation(currentLocation.coords);
        }
      } catch (err) {
        console.error('Erro ao buscar localização:', err);
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
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: generateLeafletHtml(location, eventosFiltrados, favoritos, AZUL_FUNDO_LOGO_EXATO) }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'SELECT_EVENTO') {
              const selected = eventos.find(ev => ev.id === data.eventoId);
              if (selected) {
                setEventoSelecionado(selected);
              }
            } else if (data.type === 'DESELECT_EVENTO') {
              setEventoSelecionado(null);
            }
          } catch (err) {
            console.error('Erro na mensagem do WebView:', err);
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

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