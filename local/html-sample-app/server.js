const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.static('public'));

// app.get('/api/cors', (req, res) => {
//   res.json({
//     message: 'CORS Request Successful!'
//   });
// });

const port = 4242;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});