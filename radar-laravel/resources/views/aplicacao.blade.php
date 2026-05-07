<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Radar Eventos - Sobre a Aplicação</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        /* Ajuste para garantir que o azul seja o mesmo do menu principal */
        .header-radar { background-color: #0d6efd !important; }
        .text-radar { color: #0d6efd !important; }
    </style>
</head>
<body class="bg-light">
    
    <header class="container-fluid header-radar py-5 mb-5 shadow">
        <div class="row">
            <div class="col-12 text-center text-white">
                <h1 class="display-4 fw-bold">Radar Eventos Technologies</h1>
                <p class="lead">Inovação em Geolocalização e Entretenimento</p>
            </div>
        </div>
    </header>
    
    <main class="container bg-white p-5 rounded shadow-sm">
        
        <div class="row justify-content-center">
            <div class="col-12 col-lg-10">
                
                <h2 class="text-radar mb-4 border-bottom pb-2">A Missão do Radar Eventos</h2>
                
                <p class="lead mb-4 text-dark">
                    A plataforma Radar Eventos tem como objetivo principal conectar usuários aos eventos de sua preferência, como shows, feiras culturais e gastronomia, utilizando o poder da geolocalização em tempo real.
                </p>

                <h2 class="text-radar mt-5 mb-3">Funcionalidades e Segurança</h2>
                
                <ul class="list-group list-group-flush mb-5">
                    <li class="list-group-item d-flex align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">📍 Informações Precisas</div>
                            Levamos dados exatos ao usuário, integrando mapas interativos para visualização de geolocalização e detalhes completos do evento.
                        </div>
                    </li>
                    <li class="list-group-item d-flex align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">📱 Acessibilidade Multiplataforma</div>
                            Arquitetura desenvolvida para facilitar a busca em smartphones e desktops, garantindo uma experiência fluida.
                        </div>
                    </li>
                    <li class="list-group-item d-flex align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">🔒 Segurança de Dados</div>
                            Aplicação de protocolos que protegem a privacidade e garantem a integridade das informações trafegadas na API.
                        </div>
                    </li>
                </ul>

                <h2 class="text-radar mt-5 mb-3">Nossa Inspiração</h2>
                <p class="text-muted">
                    O desenvolvimento deste projeto nasceu da necessidade de centralizar as opções de entretenimento no Vale do Ribeira, abrangendo desde o público infantil até o adulto, garantindo visibilidade para os produtores locais e lazer para a população.
                </p>
                
            </div>
        </div>

        <div class="mt-5 border-top pt-3">
            <p>
                <a href="{{ route('index') }}" class="btn btn-outline-primary fw-bold">
                    ← Voltar para o Mapa
                </a>
            </p>
        </div>
    </main>

    <footer class="container-fluid mt-5 py-3 text-center text-muted">
        <small>Radar Eventos Technologies &copy; 2026</small>
    </footer>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>