const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors()); //Un middleware que normal lo ponemos en otra carpeta, luego organizamos

app.get('/', (req, res) => {
  res.send('Hola mundo');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});