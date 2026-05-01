<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evento extends Model
{
    use HasFactory;

    // Nome da tabela no MySQL do Aiven
    protected $table = 'eventos';

    /**
     * Ativa o gerenciamento automático de data de criação e atualização.
     * Isso resolverá o problema das colunas vindo como NULL.
     */
    public $timestamps = true;

    /**
     * Atributos que podem ser preenchidos em massa (Mass Assignment).
     * Adicione aqui todas as colunas que você tem na sua tabela.
     */
    protected $fillable = [
        'nome',
        'descricao',
        'latitude',
        'longitude',
        'data_evento',
        // adicione outros campos conforme sua migration
    ];

    /**
     * Casting de atributos.
     * Garante que as datas sejam tratadas como objetos Carbon (facilitando a formatação).
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'data_evento' => 'datetime',
    ];
}