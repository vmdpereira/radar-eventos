<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Radar Eventos</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        #map { height: 450px; width: 100%; border-radius: 10px; border: 2px solid #0059b3; }
        .nav-radar { background-color: #0059b3; }
        .header-inner { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .header-logo { height: 160px; max-height: 180px; width: auto; }
        .form-label { font-weight: bold; color: #0059b3; }
        .leaflet-popup-content-wrapper { border-left: 5px solid #0059b3; }
        .bg-primary { background-color: #0059b3 !important; }
        .text-primary { color: #0059b3 !important; }
        .border-primary { border-color: #0059b3 !important; }
        .btn-primary { background-color: #0059b3; border-color: #0059b3; }
        .btn-primary:hover { background-color: #004080; }
    </style>
</head>
<body class="bg-light">
    <div class="container shadow-lg p-0 bg-white min-vh-100">
        <header class="row g-0 text-white nav-radar py-4 shadow-sm">
            <div class="col-12">
                <div class="header-inner text-white">
                    <img src="./img/radarlogo.jpeg" alt="Radar Logo" class="header-logo">
                    <div class="text-start">
                        <h1 class="fw-bold m-0">Radar Eventos</h1>
                        <small>Geolocalização Cultural - Jacupiranga/SP</small>
                    </div>
                </div>
            </div>
        </header>
                    </div>
                </div>
            </div>
        </header>

        <nav class="row g-0 nav-radar border-top border-light py-2 text-center shadow-sm">
            <div class="col"><a href="{{ route('index') }}" class="text-white text-decoration-none fw-bold">Home</a></div>
            <div class="col"><a href="{{ route('sobre') }}" class="text-white text-decoration-none">Sobre</a></div>
            <div class="col"><a href="{{ route('equipe') }}" class="text-white text-decoration-none">Equipe</a></div>
            <div class="col"><a href="{{ route('contatos') }}" class="text-white text-decoration-none">Contatos</a></div>
            <div class="col"><a href="{{ route('aplicacao') }}" class="text-white text-decoration-none">Aplicação</a></div>
            <div class="col"><a href="{{ route('eventos') }}" class="text-white text-decoration-none">Eventos</a></div>
            <div class="col"><a href="{{ route('admin') }}" class="text-warning text-decoration-none fw-bold">🛡️ Admin</a></div>
        </nav>

        <main class="row p-4">
            <div class="col-lg-8">
                <h3 class="text-primary mb-3">📍 1. Marque o local no mapa</h3>
                <div id="map"></div>
            </div>
            
            <div class="col-lg-4 mt-4 mt-lg-0">
                <div class="card border-primary shadow-sm">
                    <div class="card-header bg-primary text-white fw-bold py-3">2. Cadastro do Evento</div>
                    <div class="card-body p-4">
                        <form id="form-evento">
                            @csrf
                            <div class="mb-3">
                                <label class="form-label">Nome do Evento</label>
                                <input type="text" id="nome" name="nome" class="form-control border-primary" placeholder="Ex: Show na Praça" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Categoria</label>
                                <select id="categoria" name="categoria" class="form-select border-primary">
                                    <option value="Show">Show / Música</option>
                                    <option value="Cultura">Cultura / Teatro</option>
                                    <option value="Esporte">Esporte / Lazer</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Cidade</label>
                                <input type="text" id="cidade" name="cidade" class="form-control border-primary" placeholder="Clique no mapa..." required>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-primary">Data</label>
                                    <input type="date" id="data_evento" name="data_evento" class="form-control border-primary" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-primary">Horário</label>
                                    <input type="time" id="horario_evento" name="horario" class="form-control border-primary" required>
                                </div>
                            </div>

                            <input type="hidden" id="lat" name="lat">
                            <input type="hidden" id="lng" name="lng">
                            
                            <button type="submit" class="btn btn-primary w-100 fw-bold py-2 mt-2 shadow-sm">Publicar Agora</button>
                        </form>
                    </div>
                </div>
            </div>
        </main>

        <footer class="text-center py-4 text-muted border-top bg-light">
            Radar Eventos &copy; 2026 | Jacupiranga-SP
        </footer>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const API_URL = 'https://radar-api-nk3u.onrender.com/eventos';

        const map = L.map('map').setView([-24.8576, -48.5058], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const criarIcone = (cor) => new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${cor}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const icones = {
            'Show': criarIcone('blue'),
            'Cultura': criarIcone('red'),
            'Esporte': criarIcone('green'),
            'Outros': criarIcone('gold')
        };

        let marker;

        map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            document.getElementById('lat').value = lat;
            document.getElementById('lng').value = lng;
            
            const campoCidade = document.getElementById('cidade');
            campoCidade.value = "Detectando...";

            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: { 'User-Agent': 'RadarEventos_App' }
            })
            .then(res => res.json())
            .then(data => {
                campoCidade.value = data.address.city || data.address.town || data.address.village || data.address.suburb || "Jacupiranga";
            })
            .catch(() => { campoCidade.value = "Jacupiranga"; });

            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lng]).addTo(map);
        });

        function renderizarEventos() {
            fetch(API_URL)
                .then(res => res.json())
                .then(eventos => {
                    eventos.forEach(ev => {
                        const iconeFinal = icones[ev.categoria] || icones['Outros'];
                        const dataBr = ev.data_evento ? new Date(ev.data_evento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : "Sem data";
                        const horarioFormatado = ev.horario ? ev.horario.substring(0, 5) : "Não definido";

                        L.marker([ev.lat, ev.lng], { icon: iconeFinal })
                            .addTo(map)
                            .bindPopup(`
                                <strong style="font-size: 1.1em;">${ev.nome}</strong><br>
                                <span class="badge bg-primary mb-1">${ev.categoria}</span><br>
                                <strong>📅 Data:</strong> ${dataBr}<br>
                                <strong>🕒 Horário:</strong> ${horarioFormatado}<br>
                                <strong>📍 Local:</strong> ${ev.cidade}
                            `);
                    });
                })
                .catch(err => console.error("Erro ao carregar do Render:", err));
        }

        renderizarEventos();

        document.getElementById('form-evento').onsubmit = function(e) {
            e.preventDefault();
            
            const payload = {
                nome: document.getElementById('nome').value,
                categoria: document.getElementById('categoria').value,
                cidade: document.getElementById('cidade').value,
                data_evento: document.getElementById('data_evento').value,
                horario: document.getElementById('horario_evento').value, 
                lat: document.getElementById('lat').value,
                lng: document.getElementById('lng').value
            };

            if (!payload.lat) { alert("Clique no mapa primeiro!"); return; }

            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (res.ok) {
                    alert("✅ Evento publicado com sucesso!");
                    window.location.reload();
                } else {
                    alert("❌ Erro ao salvar. Verifique o backend.");
                }
            })
            .catch(err => alert("Erro de conexão: " + err));
        };
    </script>
</body>
</html>