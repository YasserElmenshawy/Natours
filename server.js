const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE
/* .replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
    ); */
mongoose
    .connect(DB, {
    useNewUrlParser: true,      
    useCreateIndex: true,
    useFindAndModify: false
    })
    .then(() => console.log('DB connection successful!'));


const port = process.env.PORT || 8000;   // fire the server 

app.listen(port, () => {
const server = console.log(`App running on port ${port}`);
});

process.on('unhandledRejection',err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});