const express = require("express");
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Сервер запущен на ${PORT}`));

app.use(express.static(path.join(__dirname, 'public')))
