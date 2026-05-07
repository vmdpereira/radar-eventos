<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('eventos', function (Blueprint $table) {
        $table->id();
        $table->string('nome');
        $table->string('categoria');
        $table->decimal('lat', 10, 8);
        $table->decimal('lng', 11, 8);
        $table->string('cidade')->default('Inserção Manual'); // Refletindo o que arrumamos no MySQL
        $table->date('data_evento'); // Adiciona a coluna de data
        $table->timestamps();
    });
}
    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};
