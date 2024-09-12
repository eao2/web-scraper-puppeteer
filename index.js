const express = require("express");
const {scrape} = require("./scrape");
const {testo} = require("./testo");
const app = express();

const PORT = process.env.PORT || 4000;

scrape().catch(console.error);

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
  testo()
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
