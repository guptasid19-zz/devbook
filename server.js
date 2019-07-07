const express = require('express');
const connectDB = require('./config/db');
var bodyParser = require('body-parser')

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const postRoutes = require('./routes/posts');

const app = express();

app.use(bodyParser.json({ extended: false }))

connectDB();

const port = process.env.port || 8081;

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);


app.get('/', (req, res) => {
    res.send('Hello world');
})

app.listen(port, () => {
    console.log(`Server started running on ${port}.`);
})