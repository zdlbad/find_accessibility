const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const https = require('https');
const fs = require('fs');

dotenv.config({ path: './config.env' });

if (process.env.NODE_ENV === 'development') mongoose.set('debug', true);

mongoose
  .connect(`mongodb+srv://zdl:1234321@cluster0.e5esz.mongodb.net/swivel?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log(`Connected to DB: ${con.connections[0].name} successfully.`);
  });

const httpPort = 3000;
const httpsPort = 4000;
const app = require('./app');


const privateKey = fs.readFileSync(__dirname + '/selfsigned.key');;
const certificate = fs.readFileSync(__dirname + '/selfsigned.crt');;
const credentials = {key: privateKey, cet:certificate};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);


httpServer.listen(httpPort, () => {
  console.log(`Listening on port ${httpPort} for http...`);
});

httpsServer.listen(httpsPort, () => {
  console.log(`Listening on port ${httpsPort} for https...`);
});
