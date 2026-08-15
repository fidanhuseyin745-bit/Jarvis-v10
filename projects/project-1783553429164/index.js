const express=require('express');
const authRoutes = require('./routes/auth');

const app=express();

app.get('/',(req,res)=>{

res.send('Hello Jarvis');

});

app.use('/auth', authRoutes);

app.listen(3000,()=>{

console.log('Server running');

});
