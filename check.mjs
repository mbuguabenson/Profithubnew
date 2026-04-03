import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        args: ['--ignore-certificate-errors']
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    page.on('requestfailed', request => {
        console.log('BROWSER REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });

    try {
        console.log('Navigating to https://localhost:8443 ...');
        await page.goto('https://localhost:8443', { waitUntil: 'networkidle0', timeout: 15000 });
        console.log('Page loaded!');
        
        // Wait another 5 seconds to ensure any async loader issues appear
        await new Promise(r => setTimeout(r, 5000));
        
        // Check if stuck on loader
        const bodyHTML = await page.evaluate(() => document.body.innerHTML);
        if (bodyHTML.includes('loader') || bodyHTML.includes('spinner')) {
            console.log('Found loader/spinner in DOM!');
        } else {
            console.log('No loader found natively in DOM.');
        }

    } catch (err) {
        console.log('Failed to navigate or timeout:', err);
    } finally {
        await browser.close();
    }
})();
