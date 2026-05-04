<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

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

    public function destroy($id)
    {
    // Recupera a URL da API que configuramos no Environment do Render
    $apiUrl = env('NEXT_PUBLIC_API_URL', 'https://radar-frontend-lwat.onrender.com');

    // Faz a chamada DELETE para o Node.js
    $response = Http::delete("{$apiUrl}/eventos/{$id}");

    if ($response->successful()) {
        return redirect()->route('admin')->with('sucesso', 'Evento removido com sucesso!');
    }

    return back()->with('erro', 'Falha ao excluir o evento na API.');
    }
}