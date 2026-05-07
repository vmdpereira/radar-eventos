<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Radar Eventos - Galeria de Eventos</title>
    <!-- Bootstrap 5.3.3 conforme sua estrutura -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .header-radar { background-color: #0059b3 !important; min-height: 170px; }
        .header-inner { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .header-logo { height: 140px; max-height: 160px; width: auto; }
        .img-event { 
            height: 300px; 
            object-fit: cover; 
            border-radius: 12px; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        .img-event:hover { transform: scale(1.03); }
    </style>
</head>
<body class="bg-light">

    <!-- Header Padronizado -->
    <header class="container-fluid header-radar py-5 mb-5 shadow">
        <div class="container">
            <div class="header-inner text-white">
                <img src="./img/radarlogo.jpeg" alt="Radar Logo" class="header-logo">
                <div>
                    <h1 class="display-3 fw-bold">Eventos</h1>
                    <p class="lead">Confira os eventos que estão acontecendo na cidade!</p>
                    <h3 class="fs-5">Shows, peças de teatro, exposições e muito mais!</h3>
                </div>
            </div>
        </div>
    </header>

    <main class="container">
        <!-- Galeria de Imagens -->
        <div class="row g-4 justify-content-center">
            
            <div class="col-12 col-md-6">
                <div class="text-center">
                    <img src="./img/pessoas.jpg" class="img-fluid img-event w-100" alt="Pessoas em evento">
                </div>
            </div>

            <div class="col-12 col-md-6">
                <div class="text-center">
                    <img src="./img/iluminação.jpg" class="img-fluid img-event w-100" alt="Iluminação de show">
                </div>
            </div>

            <div class="col-12 col-md-6">
                <div class="text-center">
                    <img src="./img/show.jpg" class="img-fluid img-event w-100" alt="Apresentação musical">
                </div>
            </div>

            <div class="col-12 col-md-6">
                <div class="text-center">
                    <img src="./img/evento.jfif" class="img-fluid img-event w-100" alt="Local do evento">
                </div>
            </div>

        </div>

        <!-- Botão de Navegação -->
        <div class="row mt-5 mb-5 pt-4 border-top">
            <div class="col-12">
                <a href="{{ route('index') }}" class="text-primary fw-bold text-decoration-none" style="font-size: 20px;">
                    ← Voltar para a Home
                </a>
            </div>
        </div>
    </main>

    <footer class="container-fluid py-3 text-center text-muted border-top bg-white mt-auto">
        <small>Radar Eventos Technologies &copy; 2026 - Desenvolvido em Jacupiranga-SP</small>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>