require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`HRM Core Server chạy tại http://localhost:${PORT}`));
}

module.exports = app;
