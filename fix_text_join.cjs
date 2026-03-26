const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const botsDir = path.join(__dirname, 'public', 'Official Bots');
const xmlFiles = fs.readdirSync(botsDir).filter(f => f.endsWith('.xml'));

let totalFixed = 0;

xmlFiles.forEach(file => {
    const filePath = path.join(botsDir, file);
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    
    if (!xmlContent.includes('block type="text_join"')) return;

    const dom = new JSDOM(xmlContent, { contentType: 'application/xml' });
    const document = dom.window.document;

    const textJoins = Array.from(document.querySelectorAll('block[type="text_join"]'));
    let hasChanges = false;

    textJoins.forEach(joinBlock => {
        const mutation = joinBlock.querySelector('mutation');
        if (!mutation) return; // Already dbot style or no mutation

        const itemsCount = parseInt(mutation.getAttribute('items') || '0', 10);
        
        // Collect all inner ADDx values
        const addValues = [];
        for (let i = 0; i < itemsCount; i++) {
            const valNode = Array.from(joinBlock.children).find(
                child => child.tagName === 'value' && child.getAttribute('name') === `ADD${i}`
            );
            if (valNode) addValues.push(valNode);
            else addValues.push(null);
        }

        // We found standard text_join, so clean it up and rebuild
        if (addValues.length > 0) {
            hasChanges = true;

            // Remove mutation and old values
            joinBlock.removeChild(mutation);
            Array.from(joinBlock.children).forEach(child => {
                if (child.tagName === 'value' && child.getAttribute('name').startsWith('ADD')) {
                    joinBlock.removeChild(child);
                }
            });

            // Make sure VARIABLE field exists
            let varField = Array.from(joinBlock.children).find(child => child.tagName === 'field' && child.getAttribute('name') === 'VARIABLE');
            if (!varField) {
                varField = document.createElement('field');
                varField.setAttribute('name', 'VARIABLE');
                varField.setAttribute('id', `text_var_${Math.floor(Math.random() * 10000)}`);
                varField.textContent = 'text';
                joinBlock.insertBefore(varField, joinBlock.firstChild); // put field first
            }

            // Create STACK
            const stackStmt = document.createElement('statement');
            stackStmt.setAttribute('name', 'STACK');

            let currentNextTarget = stackStmt;

            addValues.forEach((valNode, index) => {
                if (!valNode) return;
                
                // Get inner block or shadow
                const innerBlock = valNode.querySelector('block, shadow');
                if (!innerBlock) return;

                const textStmtBlock = document.createElement('block');
                textStmtBlock.setAttribute('type', 'text_statement');
                textStmtBlock.setAttribute('id', `txt_stmt_${Date.now()}_${index}_${Math.floor(Math.random() * 10000)}`);

                const textValue = document.createElement('value');
                textValue.setAttribute('name', 'TEXT');
                textValue.appendChild(innerBlock.cloneNode(true));
                textStmtBlock.appendChild(textValue);

                if (currentNextTarget === stackStmt) {
                    stackStmt.appendChild(textStmtBlock);
                } else {
                    const nextNode = document.createElement('next');
                    nextNode.appendChild(textStmtBlock);
                    currentNextTarget.appendChild(nextNode);
                }
                currentNextTarget = textStmtBlock;
            });

            joinBlock.appendChild(stackStmt);
        }
    });

    if (hasChanges) {
        fs.writeFileSync(filePath, dom.serialize());
        console.log(`Fixed ${file}`);
        totalFixed++;
    }
});

console.log(`Total fixed: ${totalFixed}`);
