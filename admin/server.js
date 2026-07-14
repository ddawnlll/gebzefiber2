import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[admin] Panel running at http://localhost:${PORT}/admin`);
  console.log(`[admin] API running at http://localhost:${PORT}/api`);
});
