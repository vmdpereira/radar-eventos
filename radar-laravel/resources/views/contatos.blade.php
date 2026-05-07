<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contatos - Radar Eventos</title>
    <!-- Bootstrap 5.3.3 conforme sua estrutura -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <style>
        .header-radar { background-color: #0059b3 !important; }
        .text-radar { color: #0059b3 !important; }
        .btn-radar { background-color: #0059b3; color: white; border: none; }
        .btn-radar:hover { background-color: #004080; color: white; }
    </style>
</head>
<body class="bg-light">
    
    <!-- Cabeçalho idêntico ao padrão da Aplicação -->
    <header class="container-fluid header-radar py-3 mb-4 shadow">
        <div class="row">
            <div class="col-12 text-center text-white">
                <img src="./img/radarlogo.jpeg" alt="Radar Logo" class="mb-3" style="height: 80px;">
                <h1 class="display-4 fw-bold">Nossos Contatos</h1>
                <p class="lead">Radar Eventos Technologies - Suporte e Atendimento</p>
            </div>
        </div>
    </header>
    
    <main class="container">
        
        <!-- Seção de Números de Telefone -->
        <div class="row justify-content-center mb-5">
            <div class="col-12 col-md-10 col-lg-8">
                <div class="row mb-4 text-center">
                    <div class="col-12">
                        <p class="lead text-secondary">Fale conosco através dos números abaixo ou envie uma mensagem via WhatsApp.</p>
                    </div>
                </div>

                <ul class="list-group shadow-sm mb-4"> 
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        (13) 99721-8*** <span class="badge bg-success rounded-pill">WhatsApp</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center list-group-item-action">
                        (13) 99745-9*** <span class="badge bg-secondary rounded-pill">Suporte</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        (13) 99753-2*** <span class="badge bg-success rounded-pill">WhatsApp</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center list-group-item-action">
                        (13) 99714-7*** <span class="badge bg-secondary rounded-pill">Comercial</span>
                    </li>
                </ul>
            </div>
        </div>
        
        <!-- Seção do Formulário de Mensagem -->
        <div class="row justify-content-center mt-5">
            <div class="col-12 col-md-8 col-lg-6">
                <h2 class="text-radar mb-4 text-center border-top pt-4">Envie sua Mensagem</h2>

                <!-- Alerta de Sucesso (Session Flash Message) -->
                @if (session('success_message'))
                    <div class="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
                        <strong>Sucesso!</strong> {{ session('success_message') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif

                <form action="{{ route('messages.store') }}" method="POST" class="p-4 bg-white border rounded shadow-sm">
                    @csrf <!-- Proteção obrigatória do Laravel -->
                    
                    <div class="mb-3">
                        <label for="name" class="form-label fw-bold">Nome Completo</label>
                        <input type="text" id="name" name="name" class="form-control" placeholder="Seu nome" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="email" class="form-label fw-bold">Endereço de E-mail</label>
                        <input type="email" class="form-control" id="email" name="email" placeholder="nome@exemplo.com" required>
                    </div>

                    <div class="mb-3">
                        <label for="message" class="form-label fw-bold">Mensagem</label>
                        <textarea class="form-control" id="message" name="message" rows="4" placeholder="Como podemos ajudar?" required></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-radar btn-lg w-100 mt-2 fw-bold">Enviar Contato</button>
                </form>

                <div class="text-center mt-4">
                    <p>
                        <a href="{{ route('index') }}" class="text-radar fw-bold text-decoration-none" style="font-size: 18px;">
                            ← Voltar para a Home
                        </a>
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Informação de Horário -->
        <div class="row mt-5 mb-5">
            <div class="col-12 col-md-8 mx-auto">
                 <div class="alert alert-info text-center shadow-sm" role="alert">
                    Atendimento disponível de Segunda a Sexta, das 8h às 18h.
                </div>
            </div>
        </div>
        
    </main>

    <footer class="container-fluid mt-auto py-3 text-center text-muted border-top bg-white">
        <small>Radar Eventos Technologies &copy; 2026 - Desenvolvido em Jacupiranga-SP</small>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>
</html>