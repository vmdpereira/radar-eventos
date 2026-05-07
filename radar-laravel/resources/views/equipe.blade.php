<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Radar Eventos - Equipe</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .header-radar { background-color: #0059b3 !important; }
        .header-inner { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .header-logo { height: 160px; max-height: 180px; width: auto; }
        .card-img-radar { 
            height: 250px; 
            object-fit: cover; 
            border-radius: 8px; 
            margin-bottom: 15px;
        }
        .text-radar { color: #0059b3 !important; }
    </style>
</head>
<body class="bg-light">
    
    <!-- Header padronizado com o Radar Eventos Technologies -->
    <header class="container-fluid header-radar py-5 mb-5 shadow">
        <div class="container">
            <div class="header-inner text-white">
                <img src="./img/radarlogo.jpeg" alt="Radar Logo" class="header-logo">
                <div>
                    <h1 class="display-4 fw-bold">Equipe de Desenvolvimento</h1>
                    <p class="lead">Os fundadores por trás do Radar Eventos Technologies</p>
                </div>
            </div>
        </div>
    </header>
    
    <main class="container">
        
        <div class="row mb-5">
            <div class="col-12 text-center">
                <h2 class="text-secondary pb-2 border-bottom d-inline-block">Fundadores do Projeto</h2>
            </div>
        </div>

        <div class="row justify-content-center">
            
            <!-- Arthur -->
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card shadow-sm h-100 border-primary">
                    <div class="card-body text-center">
                         <img src="./img/arthur.jpeg" class="img-fluid card-img-radar" alt="Arthur Manoel">
                        <h4 class="card-title text-radar">Arthur Manoel Oliveira França</h4>
                    </div>
                </div>
            </div>

            <!-- Diogo -->
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card shadow-sm h-100 border-primary">
                    <div class="card-body text-center">
                        <img src="./img/diogo.jpeg" class="img-fluid card-img-radar" alt="Diogo Toledo">
                        <h4 class="card-title text-radar">Diogo Toledo Lazzari Gulli</h4>
                    </div>
                </div>
            </div>
            
            <!-- Maria Denise -->
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card shadow-sm h-100 border-primary">
                    <div class="card-body text-center">
                        <img src="./img/denise.img.jpeg" class="img-fluid card-img-radar" alt="Maria Denise">
                        <h4 class="card-title text-radar">Maria Denise dos Santos Silva</h4>
                    </div>
                </div>
            </div>

            <!-- Nathália -->
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card shadow-sm h-100 border-primary">
                    <div class="card-body text-center">
                        <img src="./img/nathalia.jpeg" class="img-fluid card-img-radar" alt="Nathália Pereira">
                        <h4 class="card-title text-radar">Nathália Pereira Lopes</h4>
                    </div>
                </div>
            </div>

            <!-- Vinicius -->
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card shadow-sm h-100 border-primary">
                    <div class="card-body text-center">
                         <img src="./img/vinicius.jpeg" class="img-fluid card-img-radar" alt="Vinicius Miguel">
                        <h4 class="card-title text-radar">Vinicius Miguel Dias Pereira</h4>
                    </div>
                </div>
            </div>

            <!-- Rhuan -->
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card shadow-sm h-100 border-primary">
                    <div class="card-body text-center">
                        <img src="./img/rhuan.jpeg" class="img-fluid card-img-radar" alt="Rhuan Felipe Gomes Domingues">
                        <h4 class="card-title text-radar">Rhuan Felipe Gomes Domingues</h4>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center mt-5 mb-5 pt-4 border-top">
            <a href="{{ route('index') }}" class="btn btn-outline-primary fw-bold px-4">
                ← Voltar para a Home
            </a>
        </div>
        
    </main>

    <footer class="container-fluid py-3 text-center text-muted border-top bg-white">
        <small>Radar Eventos Technologies &copy; 2026</small>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>