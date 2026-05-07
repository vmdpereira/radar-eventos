<?php

use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventoController;
use Illuminate\Http\Request;

// Rota para a página inicial (Mapa e Cadastro)
Route::get('/', [EventoController::class, 'index'])->name('index');

// Rotas para as páginas institucionais
Route::get('/sobre', [EventoController::class, 'sobre'])->name('sobre');
Route::get('/equipe', [EventoController::class, 'equipe'])->name('equipe');
Route::get('/contatos', [EventoController::class, 'contatos'])->name('contatos');
Route::get('/aplicacao', [EventoController::class, 'aplicacao'])->name('aplicacao');
Route::get('/eventos', [EventoController::class, 'eventos'])->name('eventos');
Route::get('/admin', [EventoController::class, 'admin'])->name('admin');

// Rota para processar o formulário de contato (POST)
Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
Route::get('/login-admin', function () {
    return view('login_admin');
})->name('login.admin');

// Processar o acesso
Route::post('/login-admin', function (Request $request) {
    $senhaPadrao = 'radar2026'; // Defina a senha do grupo aqui

    if ($request->senha === $senhaPadrao) {
        session(['admin_autenticado' => true]);
        return redirect()->route('admin');
    }

    return back()->with('erro', 'Senha incorreta!');
})->name('login.check');