const express = require('express');
const app = express();

app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Jarvis API");
});

// Basit bilgiler için bir endpoint ekle
app.get('/simple', (req, res)=>{
    res.json({ message: "Basit bilgiler" });
});

app.listen(3000,()=>{
    console.log("Server started");
});
