<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Acesso Administrativo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light d-flex align-items-center vh-100">
    <div class="container" style="max-width: 400px;">
        <div class="card shadow">
            <div class="card-body p-4 text-center">
                <h3 class="mb-4">🛡️ Radar Admin</h3>
                <form action="{{ route('login.check') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <input type="password" name="senha" class="form-control text-center" placeholder="Senha do Grupo" required>
                    </div>
                    @if(session('erro'))
                        <div class="alert alert-danger p-2 small">{{ session('erro') }}</div>
                    @endif
                    <button type="submit" class="btn btn-primary w-100 fw-bold">Entrar</button>
                </form>
            </div>
        </div>
    </div>
</body>
</html>