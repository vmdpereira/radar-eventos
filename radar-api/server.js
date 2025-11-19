const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DA CONEXÃO COM O BANCO ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Se o seu MySQL tiver outro usuário, altere aqui
    password: '12345678',      // Se o seu MySQL tiver senha, coloque aqui
    database: 'radar_eventos'
});

// Tentativa de conexão com log de status
db.connect((err) => {
    if (err) {
        console.error('❌ ERRO CRÍTICO: Não foi possível conectar ao MySQL:', err.message);
        return;
    }
    console.log('✅ DATABASE: Conectado ao MySQL com sucesso!');
});

// --- ROTAS DA API ---

// 1. Rota de verificação (Ping)
app.get('/', (req, res) => {
    res.send('API Radar Eventos Online');
});

// 2. Listar eventos (GET)
app.get('/eventos', (req, res) => {
    // Buscamos todos os campos, ordenando pelos mais recentes
    const query = 'SELECT * FROM eventos ORDER BY id DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ ERRO AO BUSCAR:', err);
            return res.status(500).json({ erro: 'Erro ao buscar dados.' });
        }

        // Log detalhado para o seu controle no VS Code
        console.log(`🔍 BUSCA: ${results.length} eventos encontrados (incluindo datas).`);
        
        // Enviamos os resultados (o campo data_evento irá como string ISO ou objeto Date)
        res.json(results);
    });
});

// 3. Cadastrar evento (POST) - AQUI ESTÁ A INTEGRAÇÃO DOS LOGS
// 3. Cadastrar evento (POST) - ATUALIZADO COM DATA_EVENTO
app.post('/eventos', (req, res) => {
    // 1. Desestruturação incluindo a nova variável data_evento
    const { nome, categoria, lat, lng, cidade, data_evento } = req.body;
    
    // Tratamento de segurança para cidade e data
    const cidadeFinal = cidade || 'Local não identificado';
    const dataFinal = data_evento || null; // O MySQL aceita null se a coluna permitir, ou use uma data padrão

    console.log('--------------------------------------------------');
    console.log(`📡 REQUISIÇÃO RECEBIDA: Novo evento detectado!`);
    console.log(`📝 Nome: ${nome}`);
    console.log(`📅 Data do Evento: ${dataFinal}`); 
    console.log(`🏙️  Cidade Recebida: ${cidadeFinal}`); 
    console.log(`📍 Coordenadas: [${lat}, ${lng}]`);

    // 2. Query SQL atualizada para 6 campos e 6 placeholders (?)
    const query = 'INSERT INTO eventos (nome, categoria, lat, lng, cidade, data_evento) VALUES (?, ?, ?, ?, ?, ?)';
    
    // 3. Array de valores na ordem exata da query (Data adicionada ao final)
    const values = [nome, categoria, lat, lng, cidadeFinal, dataFinal];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('❌ ERRO NO INSERT:', err.message);
            return res.status(500).json({ erro: 'Falha ao gravar no banco. Verifique se a coluna data_evento existe.' });
        }
        
        console.log(`✅ SUCESSO: Evento "${nome}" salvo com ID #${result.insertId} para o dia ${dataFinal}`);
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

// Inicialização do servidor
app.listen(PORT, () => {
    console.log('==================================================');
    console.log(`🚀 BACKEND ONLINE: http://localhost:${PORT}`);
    console.log('==================================================');
});