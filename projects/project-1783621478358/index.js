const express=require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app=express();

app.get('/',(req,res)=>{

res.send('Hello Jarvis');

});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(3000,()=>{

console.log('Server running');

});
