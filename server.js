const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming form data
app.use(express.urlencoded({ extended: true }));

// Simple route to show the form for inputting the URL
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Enter a URL to Render</h1>
        <form action="/render" method="POST">
          <input type="text" name="url" placeholder="Enter URL" required />
          <button type="submit">Render</button>
        </form>
      </body>
    </html>
  `);
});

// Route to render the URL using Puppeteer
app.post('/render', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const browser = await puppeteer.launch({
      headless: true, // Run Chromium in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Render and similar platforms
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' }); // Navigate to the provided URL
    const screenshot = await page.screenshot(); // Take a screenshot of the page

    res.contentType('image/png');
    res.send(screenshot); // Send the screenshot to the client

    await browser.close(); // Close the browser instance
  } catch (err) {
    console.error(err);
    res.status(500).send('Error rendering the page');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
