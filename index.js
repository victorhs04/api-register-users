const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

let cars = [];
let currentUser = null;

// Função para ler os dados dos usuários do arquivo JSON
const readUsersFromFile = () => {
  try {
    const data = fs.readFileSync('usuarios.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler o arquivo de usuários:', err);
    return [];
  }
};

// Função para escrever os dados dos usuários no arquivo JSON
const writeUsersToFile = (users) => {
  try {
    fs.writeFileSync('usuarios.json', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Erro ao escrever no arquivo de usuários:', err);
  }
};

// Função para ler os dados dos carros do arquivo JSON
const readCarsFromFile = () => {
  try {
    const data = fs.readFileSync('carros.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler o arquivo de carros:', err);
    return [];
  }
};

// Função para escrever os dados dos carros no arquivo JSON
const writeCarsToFile = (cars) => {
  try {
    fs.writeFileSync('carros.json', JSON.stringify(cars, null, 2));
  } catch (err) {
    console.error('Erro ao escrever no arquivo de carros:', err);
  }
};

// Rota raiz
app.get('/', (req, res) => {
  res.send('Welcome to the API Register Users!');
});

app.get('/api/cars', (req, res) => {
  const cars = readCarsFromFile();
  res.json(cars);
});

app.post('/api/cars', (req, res) => {
  if (!currentUser || !currentUser.cnpj) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  const newCar = req.body;
  const cars = readCarsFromFile();
  newCar.id = cars.length + 1;
  cars.push(newCar);
  writeCarsToFile(cars);
  res.json(newCar);
});

app.post('/api/users/register', (req, res) => {
  const { username, password, cpf, cnpj } = req.body;
  const users = readUsersFromFile();

  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'Usuário já existe' });
  }

  if (!cpf && !cnpj) {
    return res.status(400).json({ message: 'CPF ou CNPJ é necessário' });
  }

  const newUser = { 
    id: users.length + 1, 
    username, 
    password, 
    cpf: cpf || null, 
    cnpj: cnpj || null 
  };

  users.push(newUser);
  writeUsersToFile(users);
  res.json({ message: 'Registrado com sucesso' });
});

app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsersFromFile();
  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    currentUser = user;
    res.json({ message: 'Logado com sucesso', user: { username: user.username, cnpj: user.cnpj } });
  } else {
    res.status(400).json({ message: 'Dados inválidos' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
