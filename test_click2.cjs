const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:3005');
    await new Promise(r => setTimeout(r, 2000));
    
    // Auto-login
    await page.type('#passInput', 'fiat16');
    await page.click('button[onclick="checkPassword()"]');
    await new Promise(r => setTimeout(r, 1000));
    
    // Click on the glass cover
    console.log("Clicking cover...");
    const covers = await page.$$('div[id^="qty-cover-"]');
    if (covers.length > 0) {
        await covers[0].click();
        console.log("Clicked!");
    } else {
        console.log("No cover found");
    }
    
    await new Promise(r => setTimeout(r, 1000));
    await browser.close();
    process.exit(0);
})();
