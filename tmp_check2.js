import puppeteer from 'puppeteer';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--ignore-certificate-errors', '--disable-web-security']
        });
        const page = await browser.newPage();
        
        console.log("Navigating...");
        await page.goto('https://localhost:8443/', { waitUntil: 'networkidle2', timeout: 30000 });
        
        console.log("Clicking run...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const b = btns.find(x => x.textContent && x.textContent.includes('Run'));
            if (b) b.click();
        });
        
        console.log("Waiting for builder to load...");
        await page.waitForTimeout(4000);
        
        // Let's run the bot explicitly (which triggers the "The block(s) highlighted in red are missing input values" error)
        console.log("Clicking DBot Run Bot button...");
        await page.evaluate(() => {
            const b2 = document.querySelector('#db-animation__run-button');
            if (b2) b2.click();
        });
        await page.waitForTimeout(1000);

        const errors = await page.evaluate(() => {
            // Check notifications
            const toasts = Array.from(document.querySelectorAll('.dc-toast__message, .notification, .snackbar, .error, .toast')).map(e => e.textContent);
            // Check blockly SVG for red blocks (usually they have a specific filter or class, but we can look for any attributes indicating error)
            const redBlocks = Array.from(document.querySelectorAll('path, rect')).filter(e => {
                const stroke = e.getAttribute('stroke');
                return stroke === '#ff0000' || stroke === 'red' || (e.className.baseVal && e.className.baseVal.includes('error'));
            }).map(e => e.parentElement ? e.parentElement.innerHTML : e.outerHTML);
            
            // Check notify blocks with missing MESSAGE
            const blocks = Array.from(document.querySelectorAll('g[data-id]'));
            const notifyBlocks = blocks.filter(b => b.textContent.includes('Notify')).map(b => b.textContent);

            return { toasts, redBlocks: redBlocks.length, notifyText: notifyBlocks };
        });
        console.log("Results:");
        console.log(JSON.stringify(errors, null, 2));

        // Just in case, export the DOM of the blockly workspace
        const workspace = await page.evaluate(() => {
            const el = document.querySelector('.blocklyWorkspace');
            return el ? el.innerHTML.slice(0, 1000) : 'not found';
        });
        
        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
