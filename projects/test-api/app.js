const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Welcome to the User Authentication System!');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === 'admin' && password === 'password') {
        res.send('Login successful! Welcome, admin!');
    } else {
        res.send('Invalid credentials. Please try again.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
