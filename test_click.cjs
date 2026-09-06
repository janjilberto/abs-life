const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // Start a local server just to be sure we are testing the built/current files
    // Wait, Vite is already running on port 3000. But if not, we can serve it.
    // Let's just run npx vite preview --port 3005 and test it
})();
