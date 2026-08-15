const express=require('express');
const authRoutes = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const oauthRoutes = require('./routes/oauth');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app=express();

app.get('/',(req,res)=>{

res.send('Hello Jarvis');

});

app.use(helmet());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.' });
app.use(limiter);

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', oauthRoutes);

undefined

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);

app.listen(3000,()=>{

console.log('Server running');

});
