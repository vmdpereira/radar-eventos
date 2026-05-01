<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EventoController extends Controller
{
    // Exibe a página principal com o mapa
    public function index() {
        return view('index');
    }

    // Exibe o painel de administração
    public function admin()
{
    // Verificação de segurança manual
    if (!session('admin_autenticado')) {
        return redirect()->route('login.admin');
    }

    return view('admin');
}

    // Exibe a página "Sobre"
    public function sobre() {
        return view('sobre');
    }

    // Exibe a página "Equipe"
    public function equipe() {
        return view('equipe');
    }

    // Exibe a página "Contatos"
    public function contatos() {
        return view('contatos');
    }

    // Exibe a página "Aplicação"
    public function aplicacao() {
        return view('aplicacao');
    }

    // Exibe a página "Eventos"
    public function eventos() {
        return view('eventos');
    }
}