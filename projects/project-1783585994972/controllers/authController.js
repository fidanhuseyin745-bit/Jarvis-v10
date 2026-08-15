'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, '..', 'config', 'users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function register(req, res) {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username ve password zorunlu.' });
  }

  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Kullanıcı zaten mevcut.' });
  }

  const hashed = await bcrypt.hash(password, 10);

  users.push({ username, password: hashed });
  writeUsers(users);

  return res.status(201).json({ message: 'Kayıt başarılı.' });

}

async function login(req, res) {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username ve password zorunlu.' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
  }

  return res.status(200).json({ message: 'Giriş başarılı.', username: user.username });

}

module.exports = { register, login };
