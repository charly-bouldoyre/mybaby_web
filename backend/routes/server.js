//backend/routes/server.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Import des routes
app.use("/users", require("./routes/user.routes"));
app.use("/matches", require("./routes/match.routes"));
app.use("/events", require("./routes/event.routes"));
app.use("/ranking", require("./routes/ranking.routes"));

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
