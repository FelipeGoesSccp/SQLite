//importa a biblioteca express
const express =require("express");
//imports = biblioteca SQlite
const sqlite3 = require("sqlite3").verbose();
//cria uma instancia do aplicativo express "app" sera o servidor
const app = express();
//define a porta que o servidor ira executar por requisitos
const port = 3000;
//middlieware é um software que fica no meio do caminho da requisição 
app.use(express.json());

const db = new sqlite3.Database('./meubanco.db', (err) =>{
    //se err não for nulo significado que ocorreu um erro na conexão
    if(err){
        console.error('Error ao conectar banco de dados', err.message);
        //se a conexão for bem sucedida
    }else{
    console.log('Conectado ao banco de dados SQLite');
    }
    db.run(`CREATE TABLE IF NOT EXISTS usuarios(
        id INTEGER PRIMARY KEY AUTOINCREMENT, -- 'id' é chave primaria 
        nome TEXT NOT NULL, -- 'nome' é um texto e não pode ser nulo 
        email TEXT UNIQUE NOT NULL -- 'email' é um texto e não pode ser nulo
        )`, (err) =>{
            if(err){
                console.error("Erro ao criar a tabela", err.message);
            }else{
                console.log("Tabela usuarios pronto");
            }            
        });
});

//! Rotas CRUD (Create, Read, Update, Delete)
app.post('/usuarios', (req, res) =>{
//! CREATE: Rota para criar um novo usuario
//! app.post() define que esta rota responde a requisição HTTP tipo POST
//! O caminho da rota é '/usuarios'
//! Extrai o 'nome' e 'email' do corpo da requisição (req.body)
    const {nome, email} = req.body;
//! Validação simples para garantir que o nome e email foram enviados
    if(!nome || !email){
//! Se faltar algum campo, retorna erro 400 (Bad Request)
        return res.status(400).json({error: 'Nome e email são obrigatórios'});
    }
//! Comando SQL para inserir um novo registro na tabela 'usuarios'
//! od '?' são placeholders que serão substituidos pelos valores digitados
        const sql = 'INSERT INTO usuarios (nome, email) VALUES (?, ?)';

        db.run(sql, [nome, email], function(err){
            if (err){
                return res.status(500).json({error:'Erro ao inserir usuario ou email já existe'})
            }
            res.status(201).json({
                message: 'Usuário Criado Com Sucesso!',
                id: this.lastID
            })
        })
})
app.get('/usuarios', (req,res) =>{
    const sql = 'SQL * FROM usuarios'
    db.all(sql, [], (err, rows)=>{
        if(err)
        {
            console.error(err.message)
            return res.status(500).json({error: 'Erro ao buscar usuarios'})
        }
        res.json({
            message: 'Usuarios listados com sucesso',
            data: rows
        })
    })

})
app.get('/usuarios/:id', (req, res) =>{
    const {id} = req.params;
    const sql = 'SELECT * usuarios WHERE id = ?'
    db.get(sql, [id], (err, row)=>{
        if(err)
        {
            console.error(err.message);
            return res.status(500).json({error: 'Erro ao buscar usuario'});
        }
        if(row)
        {
            res.json({
                message: 'Usuario encontrado',
                data: row
            });
        }
        else{
            res.status(404).json({error: 'Usuarios nao encontrado'});
        }
    })
})
app.delete('/usuarios/:id', (req, res) =>{
    const {id} = req.params;
    const sql = `DELETE FROM usuarios WHERE id = ?`
    db.run(sql, [id], function(err){
        if(err){
            console.error(err.message);
            return res.status(500).json({json: 'Erro ao deletar usuario'})
        }
        if(this.changes > 0){
            res.json({message: `Usuarios com ${id} deletado com sucesso`})
        }
        else{
            res.status(404).json({error: `Usuario não encontrado`})
        }

    })
})

app.listen(port, ()=>{
    console.log('Servidor rodando na porta ', port);
});
process.on('SIGINT', () =>{
    db.close((err) =>{
        if(err)
        {
            console.error(err.message)
        }
        console.log('conexão com o banco de dados SQLite fechada')
        process.exit(0);
    })
})