const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/users');

const app = express();

connectDB();

const port = process.env.port || 8080;

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello world');
})

app.listen(port, () => {
    console.log(`Server srated running on ${port}.`);
})