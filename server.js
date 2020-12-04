const mongoose = require('mongoose');
const dotenv = require('dotenv');
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

const app = require('./app');


app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT} for http...`);
});
