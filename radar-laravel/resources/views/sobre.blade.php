<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Radar Eventos - Sobre</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .header-radar { background-color: #0059b3 !important; }
        .header-inner { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .header-logo { height: 160px; max-height: 180px; width: auto; }
        .text-radar { color: #0059b3 !important; }
    </style>
</head>
<body class="bg-light">
    
    <header class="container-fluid header-radar py-5 mb-5 shadow">
        <div class="container">
            <div class="header-inner text-white">
                <img src="./img/radarlogo.jpeg" alt="Radar Logo" class="header-logo">
                <div>
                    <h1 class="display-4 fw-bold">Sobre a Empresa</h1>
                    <p class="lead">Radar Eventos Technologies</p>
                </div>
            </div>
        </div>
    </header>
    
    <main class="container bg-white p-5 rounded shadow-sm">
        <div class="row mb-5">
            <div class="col-12 col-lg-10 mx-auto text-center">
                <h2 class="text-radar mb-4">Quem Somos</h2>
                <p class="lead text-secondary mt-3">
                    Somos uma empresa criada com o objetivo de facilitar a geolocalização de eventos, festas, shows e outros projetos de entretenimento no Vale do Ribeira.
                </p>
                <p class="lead text-secondary">
                    Nossa plataforma inovadora não só conecta você aos melhores eventos, mas também garante a acessibilidade e a melhor experiência para todos os usuários através de tecnologia de ponta.
                </p>
            </div>
        </div>

        <div class="row text-center mt-5 pt-4 border-top">
            <div class="col-md-4 mb-4">
                <div class="p-3">
                    <h3 class="text-radar fw-bold">🗺️ Missão</h3>
                    <p class="text-muted">Conectar pessoas e entretenimento através de um sistema de geolocalização eficiente e intuitivo.</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="p-3">
                    <h3 class="text-radar fw-bold">✨ Visão</h3>
                    <p class="text-muted">Ser a principal plataforma de mapeamento de eventos acessíveis da nossa região e do país.</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="p-3">
                    <h3 class="text-radar fw-bold">🤝 Valores</h3>
                    <p class="text-muted">Acessibilidade, Inovação Constante e Foco na Experiência do Usuário final.</p>
                </div>
            </div>
        </div>

        <div class="mt-5 pt-3 border-top">
            <p>
                <a href="{{ route('index') }}" class="btn btn-outline-primary fw-bold">
                    ← Voltar para a Home
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