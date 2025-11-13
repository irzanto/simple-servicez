const app = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await db.testConnection();
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start: DB connection error', err);
    process.exit(1);
  }
})();
