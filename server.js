const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração simples para o projeto
const PORTA = 3000;
const SEGREDO_JWT = 'chave_secreta_do_projeto_sghss_2025'; 

// Arrays simulando o banco de dados (MySQL estava dando erro de conexão)
let usuariosDB = [];
let pacientesDB = [];

// Função para criar o admin automaticamente ao iniciar
async function popularBanco() {
    const senhaCriptografada = await bcrypt.hash('123456', 10);
    
    usuariosDB.push({
        id: 1,
        email: 'admin@vidaplus.com',
        senha: senhaCriptografada
    });
    
    console.log('--- Sistema iniciado ---');
    console.log('Login Admin pronto: admin@vidaplus.com');
}

popularBanco();

// ROTA 1: LOGIN
app.post('/login', async (req, res) => {
    console.log('Tentativa de login recebida:', req.body.email); // Log para debugar

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Precisa mandar email e senha!' });
    }

    const usuarioEncontrado = usuariosDB.find(user => user.email === email);

    if (!usuarioEncontrado) {
        return res.status(401).json({ erro: 'Email não cadastrado.' });
    }

    // Comparar a senha enviada com a do banco
    const senhaBateu = await bcrypt.compare(senha, usuarioEncontrado.senha);

    if (!senhaBateu) {
        return res.status(401).json({ erro: 'Senha incorreta.' });
    }

    // Se deu tudo certo, gera o token
    const token = jwt.sign(
        { id: usuarioEncontrado.id, email: usuarioEncontrado.email },
        SEGREDO_JWT,
        { expiresIn: '2h' }
    );

    return res.json({
        auth: true,
        token: token,
        usuario: usuarioEncontrado.email
    });
});

// ROTA 2: CADASTRAR PACIENTE
app.post('/pacientes', (req, res) => {
    console.log('Cadastrando novo paciente:', req.body.nome);

    const { nome, cpf, telefone } = req.body;

    // Validação básica
    if (!nome || !cpf) {
        return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });
    }

    const novoPaciente = {
        id: pacientesDB.length + 1,
        nome: nome,
        cpf: cpf,
        telefone: telefone || 'Não informado',
        dataCadastro: new Date()
    };

    pacientesDB.push(novoPaciente);

    return res.status(201).json({
        msg: 'Paciente salvo com sucesso.',
        dados: novoPaciente
    });
});

// ROTA 3: LISTAR PACIENTES
app.get('/pacientes', (req, res) => {
    // Retorna a lista inteira
    console.log('Listagem de pacientes solicitada.');
    return res.json(pacientesDB);
});

// Rota só pra testar se servidor ta de pé
app.get('/', (req, res) => {
    res.send('Backend SGHSS rodando...');
});

app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});
