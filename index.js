const express = require("express");
const {scrape} = require("./scrape");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/scrape", (req, res) => {
    scrape();
    res.send("scraping...")
  });

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
