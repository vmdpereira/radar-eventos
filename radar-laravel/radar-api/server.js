require('dotenv').config(); // 1. Carrega as variáveis do .env (instale com: npm install dotenv)
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
// 2. O Render define a porta automaticamente, caso contrário usa 3001
const PORT = process.env.PORT || 3001; 

// Middlewares
app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DO POOL DE CONEXÃO (Mais estável para Nuvem) ---
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

// Teste de conexão inicial
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERRO CRÍTICO: Não foi possível conectar ao Aiven:', err.message);
        return;
    }
    console.log('✅ DATABASE: Conectado ao MySQL no Aiven com sucesso!');
    connection.release(); // Libera a conexão de teste
});

// --- ROTAS DA API ---

app.get('/', (req, res) => {
    res.send('API Radar Eventos Online (Render + Aiven)');
});

// 2. Listar eventos (GET)
app.get('/eventos', (req, res) => {
    const query = 'SELECT * FROM eventos ORDER BY id DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ ERRO AO BUSCAR:', err);
            return res.status(500).json({ erro: 'Erro ao buscar dados.' });
        }
        console.log(`🔍 BUSCA: ${results.length} eventos encontrados.`);
        res.json(results);
    });
});

// 3. Cadastrar evento (POST)
app.post('/eventos', (req, res) => {
    const { nome, categoria, lat, lng, cidade, data_evento } = req.body;
    
    const cidadeFinal = cidade || 'Local não identificado';
    const dataFinal = data_evento || null;

    console.log('--------------------------------------------------');
    console.log(`📡 REQUISIÇÃO: Novo evento em ${cidadeFinal}`);

    const query = 'INSERT INTO eventos (nome, categoria, lat, lng, cidade, data_evento) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [nome, categoria, lat, lng, cidadeFinal, dataFinal];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('❌ ERRO NO INSERT:', err.message);
            return res.status(500).json({ erro: 'Falha ao gravar no banco.' });
        }
        
        console.log(`✅ SUCESSO: Evento ID #${result.insertId} salvo.`);
        console.log('--------------------------------------------------');

        res.status(201).json({ 
            id: result.insertId, 
            nome, 
            categoria, 
            lat, 
            lng,
            cidade: cidadeFinal,
            data_evento: dataFinal
        });
    });
});

// Inicialização do servidor (Ajustado para o Render)
app.listen(PORT, '0.0.0.0', () => {
    console.log('==================================================');
    console.log(`🚀 BACKEND ONLINE: Porta ${PORT}`);
    console.log('==================================================');
});