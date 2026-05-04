<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Admin - Radar Eventos</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .nav-radar { background-color: #0d6efd; }
        .card-admin { border-radius: 15px; overflow: hidden; }
    </style>
</head>
<body class="bg-light">

    <!-- Header Simples -->
    <header class="text-white nav-radar py-3 shadow-sm mb-4">
        <div class="container d-flex justify-content-between align-items-center">
            <div>
                <h1 class="h4 m-0 fw-bold">🛡️ Radar Eventos | Administração</h1>
                <small>Gestão de pontos em Jacupiranga e Cajati</small>
            </div>
            <a href="{{ route('index') }}" class="btn btn-outline-light btn-sm fw-bold">Voltar ao Mapa</a>
        </div>
    </header>

    <main class="container">
        <!-- Resumo Rápido -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card bg-primary text-white shadow-sm border-0">
                    <div class="card-body">
                        <h6>Total de Eventos</h6>
                        <h2 id="total-contagem" class="fw-bold">0</h2>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabela de Gestão -->
        <div class="card card-admin border-0 shadow-lg">
            <div class="card-header bg-dark text-white py-3">
                <h5 class="m-0">Lista de Eventos Ativos</h5>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">ID</th>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Cidade</th>
                                <th class="text-center pe-4">Ação</th>
                            </tr>
                        </thead>
                        <tbody id="tabela-corpo">
                            <!-- Inserido via JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <script>
        // URL da sua API no Render (Para que o Arthur e a Nathalia consigam usar de casa)
        const API_URL = 'https://radar-eventos.onrender.com';

        // Carrega a lista do MySQL via Node.js
        function buscarEventos() {
            fetch(`${API_URL}/eventos`)
                .then(res => res.json())
                .then(eventos => {
                    const tbody = document.getElementById('tabela-corpo');
                    const totalContagem = document.getElementById('total-contagem');
                    
                    tbody.innerHTML = "";
                    totalContagem.innerText = eventos.length;

                    eventos.forEach(ev => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="ps-4">#${ev.id}</td>
                            <td><strong>${ev.nome}</strong></td>
                            <td><span class="badge bg-secondary">${ev.categoria}</span></td>
                            <td>${ev.cidade}</td>
                            <td class="text-center pe-4">
                                <button class="btn btn-outline-danger btn-sm" onclick="deletarEvento(${ev.id})">
                                    🗑️ Excluir
                                </button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                })
                .catch(err => console.error("Erro ao carregar lista de admin:", err));
        }

        /**
         * Função para deletar usando a rota DELETE
         * Agora comunicando com o server.js corretamente
         */
        function deletarEvento(id) {
            if (confirm("⚠️ Atenção: Esta ação removerá o evento do mapa definitivamente. Confirmar?")) {
                
                // Mudamos de POST para DELETE para bater com a rota app.delete do seu server.js
                fetch(`${API_URL}/eventos/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(res => {
                    if (!res.ok) throw new Error('Erro ao excluir');
                    return res.json();
                })
                .then(() => {
                    alert("✅ Sucesso! Evento ID #" + id + " removido.");
                    buscarEventos(); // Atualiza a tabela automaticamente
                })
                .catch(err => {
                    console.error(err);
                    alert("❌ Erro na comunicação com o servidor. Verifique os logs do Render.");
                });
            }
        }

        // Inicia a busca ao carregar a página
        window.onload = buscarEventos;
    </script>

</body>
</html>