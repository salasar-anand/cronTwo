const express = require("express");
const cron = require("node-cron");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Replace with your target URLs
const URLS = ["https://crontwo.onrender.com"];

let logs = []; // Store logs

// Function to get formatted time in IST
const getCurrentTime = () => {
  const now = new Date();
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
};

// Schedule a cron job to run every 3 minutes
cron.schedule("*/3 * * * *", async () => {
  const currentTime = getCurrentTime();
  console.log(`Cron Job Running at: ${currentTime} IST`);

  for (const url of URLS) {
    try {
      console.log(`Hitting the URL: ${url}`);
      const response = await axios.get(url);
      const log = `✅ ${currentTime} IST - Hit ${url} | Status: ${response.status}`;
      logs.unshift(log); // Add new log at the beginning
    } catch (error) {
      const log = `❌ ${currentTime} IST - Failed to hit ${url} | Error: ${error.message}`;
      logs.unshift(log);
    }
  }

  // Keep only the last 10 logs
  if (logs.length > 10) {
    logs = logs.slice(0, 10);
  }
});

// Serve logs in an HTML page
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Cron Job Logs</title>
        <meta http-equiv="refresh" content="10"> 
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; }
          h2 { color: #333; }
          .log-container { background: #fff; padding: 10px; border-radius: 8px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); }
          .log-item { padding: 8px; margin: 5px 0; border-left: 5px solid #28a745; }
          .error { border-left-color: #dc3545; color: #d9534f; }
        </style>
      </head>
      <body>
        <h2>🔄 Cron Job Execution Logs</h2>
        <div class="log-container">
          ${logs.length ? logs.map(log => `<div class="log-item ${log.includes('❌') ? 'error' : ''}">${log}</div>`).join("") : "<p>No logs yet...</p>"}
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
