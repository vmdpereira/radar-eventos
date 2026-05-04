const path = require('path');
// Garante que o Node procure o .env na pasta correta da API
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// O Render define a porta automaticamente através da variável de ambiente PORT
const PORT = process.env.PORT || 3001; 

// Debug inicial para conferência em Cajati
console.log("--- DEBUG DE CONEXÃO ---");
console.log("Tentando conectar com o usuário:", process.env.DB_USER);
console.log("No host:", process.env.DB_HOST);
console.log("------------------------");

// Middlewares
app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DO POOL DE CONEXÃO (Otimizado para Nuvem/Aiven) ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false 
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste de conexão imediato ao iniciar
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERRO CRÍTICO: Falha ao conectar ao Aiven:', err.message);
        return;
    }
    console.log('✅ DATABASE: Conexão estabelecida com o MySQL no Aiven!');
    connection.release(); 
});

// --- ROTAS DA API ---

// 1. Rota de Verificação (Health Check)
app.get('/', (req, res) => {
    res.send('API Radar Eventos Online (Render + Aiven)');
});

// 2. Listar eventos (GET)
app.get('/eventos', (req, res) => {
    const query = 'SELECT * FROM eventos ORDER BY id DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ ERRO AO BUSCAR EVENTOS:', err);
            return res.status(500).json({ erro: 'Erro ao buscar dados no banco.' });
        }
        console.log(`🔍 BUSCA: ${results.length} eventos carregados do banco.`);
        res.json(results);
    });
});

// 3. Cadastrar evento (POST) - Com Logs detalhados
app.post('/eventos', (req, res) => {
    const { nome, categoria, lat, lng, cidade, data_evento, horario } = req.body;
    
    const cidadeFinal = cidade || 'Local não identificado';
    const dataFinal = data_evento || null;

    console.log('--------------------------------------------------');
    console.log(`📡 REQUISIÇÃO RECEBIDA:`);
    console.log(`- Evento: ${nome}`);
    console.log(`- Localização: ${cidadeFinal}`);
    console.log(`- Categoria: ${categoria}`);
    console.log(`- Horário: ${horario}`);

    const query = 'INSERT INTO eventos (nome, categoria, lat, lng, cidade, data_evento, horario) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [nome, categoria, lat, lng, cidadeFinal, dataFinal, horario];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('❌ ERRO NO INSERT:', err.message);
            return res.status(500).json({ erro: 'Falha ao gravar evento no Aiven.' });
        }
        
        console.log(`✅ SUCESSO: Evento ID #${result.insertId} salvo no banco.`);
        console.log('--------------------------------------------------');

        res.status(201).json({ 
            id: result.insertId, 
            nome, 
            categoria, 
            lat, 
            lng,
            cidade: cidadeFinal,
            data_evento: dataFinal,
            horario

        });
    });
});

// 4. Excluir evento (DELETE)
app.delete('/eventos/:id', (req, res) => {
    const { id } = req.params;

    console.log(`🗑️ SOLICITAÇÃO DE EXCLUSÃO: ID #${id}`);

    const query = 'DELETE FROM eventos WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('❌ ERRO AO EXCLUIR:', err.message);
            return res.status(500).json({ erro: 'Falha ao excluir evento no banco.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Evento não encontrado.' });
        }

        console.log(`✅ SUCESSO: Evento ID #${id} removido do banco.`);
        res.json({ mensagem: 'Evento excluído com sucesso!' });
    });
});

// Inicialização do servidor configurada para aceitar conexões externas (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
    console.log('==================================================');
    console.log(`🚀 BACKEND RADAR EVENTOS ONLINE`);
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🕒 Status: Aguardando requisições...`);
    console.log('==================================================');
});