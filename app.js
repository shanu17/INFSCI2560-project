const express = require("express");
const port = 3000;

const app = express();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});