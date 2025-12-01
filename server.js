// server.js - Backend do Projeto SGHSS
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

// --- DADOS EM MEMÓRIA (SIMULAÇÃO DE BANCO DE DADOS) ---
// Isso permite que o projeto rode sem configurar MySQL agora.
const usuarios = []; 
const pacientes = [];
const SECRET_KEY = 'minha-chave-secreta-projeto-uninter'; // Em projeto real, vai no .env

// --- FUNÇÕES AUXILIARES ---
// Criar um usuário administrador padrão ao iniciar
const criarAdmin = async () => {
    const senhaHash = await bcrypt.hash('123456', 8);
    usuarios.push({ id: 1, email: 'admin@vidaplus.com', senha: senhaHash });
    console.log('Usuário Admin criado: admin@vidaplus.com / 123456');
};
criarAdmin();

// --- ENDPOINTS (ROTAS) ---

// 1. Rota de Login (Autenticação) - Requisito Obrigatório
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    
    // Busca usuário
    const user = usuarios.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
    }

    // Verifica senha (Criptografia)
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
    }

    // Gera Token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    
    return res.json({ 
        mensagem: 'Autenticação realizada com sucesso',
        token: token 
    });
});

// 2. Rota para Listar Pacientes (CRUD - Read)
app.get('/pacientes', (req, res) => {
    // Aqui você poderia adicionar verificação de token se quisesse ser mais rigoroso
    res.json(pacientes);
});

// 3. Rota para Cadastrar Paciente (CRUD - Create)
app.post('/pacientes', (req, res) => {
    const { nome, cpf, telefone } = req.body;

    if (!nome || !cpf) {
        return res.status(400).json({ erro: 'Nome e CPF são obrigatórios' });
    }

    const novoPaciente = {
        id: pacientes.length + 1,
        nome,
        cpf,
        telefone,
        data_cadastro: new Date()
    };

    pacientes.push(novoPaciente);
    
    res.status(201).json({ 
        mensagem: 'Paciente cadastrado com sucesso!', 
        paciente: novoPaciente 
    });
});

// Rota de teste inicial
app.get('/', (req, res) => {
    res.send('API do SGHSS rodando perfeitamente!');
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT}`);
});