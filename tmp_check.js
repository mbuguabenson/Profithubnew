import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            ignoreHTTPSErrors: true,
            args: ['--no-sandbox', '--ignore-certificate-errors']
        });
        const page = await browser.newPage();
        
        console.log("Navigating to dashboard...");
        await page.goto('https://localhost:8443/', { waitUntil: 'networkidle0' });
        
        console.log("Looking for Run button...");
        // Click the first "Run" button (which should be Differs Rank-Based since it's the only one rendered now)
        await page.waitForTimeout(2000);
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const runBtn = btns.find(b => b.textContent && b.textContent.includes('Run'));
            if (runBtn) runBtn.click();
        });
        
        console.log("Waiting for DBot to load workspace...");
        await page.waitForTimeout(5000);
        
        // Find error blocks or missing input blocks in Blockly
        const blocklyData = await page.evaluate(() => {
            const errorBlock = document.querySelector('.blocklySelected, .blocklyError, [class*="error"], [class*="Error"]');
            
            // Collect all notify blocks to see if they lack children
            const gElements = Array.from(document.querySelectorAll('g[data-id]'));
            const missingInputs = [];
            
            gElements.forEach(el => {
                if (el.textContent.includes('Notify') && el.textContent.includes('green')) {
                    missingInputs.push(el.innerHTML);
                }
            });
            
            const logs = Array.from(document.querySelectorAll('.toast, .notification')).map(e => e.textContent);
            
            return {
                hasErrorClass: !!errorBlock,
                errorHtml: errorBlock ? errorBlock.outerHTML : null,
                missing: missingInputs,
                logs: logs
            };
        });
        
        console.log(JSON.stringify(blocklyData, null, 2));
        
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
