const fs = require('fs');
const path = require('path');

const dir = 'e:/SOFTWARES/site/Profithubnew/public/Official Bots';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xml'));

let fixedCount = 0;

files.forEach(f => {
    const p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');
    
    // First, let's look for any <value name="SYMBOL_LIST"> block.
    // Since it can span multiple lines and contain nested blocks, 
    // a simple regex might fail. But we know it ends with certain blocks.
    
    // Let's use a non-greedy regex that just removes everything between <value name="SYMBOL_LIST"> and the next </value>
    // Wait, since there are nested <value> and </value> inside, a simple regex will fail.
    
    // Let's replace the specific block we injected.
    const targetStr1 = `<value name="SYMBOL_LIST">
          <block type="lists_getIndex">
            <mutation statement="false" at="true"/>
            <field name="MODE">GET</field>
            <field name="WHERE">FROM_START</field>
            <value name="VALUE"><block type="variables_get"><field name="VAR" id="markets">Markets</field></block></value>
            <value name="AT"><block type="variables_get"><field name="VAR" id="market_index">Market Index</field></block></value>
          </block>
        </value>`;
        
    const targetStr2 = `<value name="SYMBOL_LIST">
          <block type="lists_getIndex">
            <mutation statement="false" at="true"></mutation>
            <field name="MODE">GET</field>
            <field name="WHERE">FROM_START</field>
            <value name="VALUE">
              <block type="variables_get">
                <field name="VAR" id="markets">Markets</field>
              </block>
            </value>
            <value name="AT">
              <block type="variables_get">
                <field name="VAR" id="market_index">Market Index</field>
              </block>
            </value>
          </block>
        </value>`;

    let originalC = c;
    
    // Normalize newlines and spaces to help matching
    const normalize = str => str.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
    
    const normalizedTarget1 = normalize('<value name="SYMBOL_LIST"> <block type="lists_getIndex"> <mutation statement="false" at="true"/> <field name="MODE">GET</field> <field name="WHERE">FROM_START</field> <value name="VALUE"><block type="variables_get"><field name="VAR" id="markets">Markets</field></block></value> <value name="AT"><block type="variables_get"><field name="VAR" id="market_index">Market Index</field></block></value> </block> </value>');
    const normalizedTarget2 = normalize('<value name="SYMBOL_LIST"> <block type="lists_getIndex"> <mutation statement="false" at="true"></mutation> <field name="MODE">GET</field> <field name="WHERE">FROM_START</field> <value name="VALUE"> <block type="variables_get"> <field name="VAR" id="markets">Markets</field> </block> </value> <value name="AT"> <block type="variables_get"> <field name="VAR" id="market_index">Market Index</field> </block> </value> </block> </value>');
    
    const regex1 = /<value\s+name="SYMBOL_LIST">[\s\S]*?<field\s+name="VAR"\s+id="market_index">Market Index<\/field>[\s\S]*?<\/block>[\s\S]*?<\/value>[\s\S]*?<\/block>[\s\S]*?<\/value>/m;

    
    if (regex1.test(c)) {
       c = c.replace(regex1, '<field name="SYMBOL_LIST">1HZ10V</field>');
    } else {
        // Fallback for any other inner block pattern for SYMBOL_LIST 
        const regexFall = /<value\s+name="SYMBOL_LIST">[\s\S]*?<block\s+type="lists_getIndex">[\s\S]*?<\/value>\s*<\/block>\s*<\/value>/m;
        if(regexFall.test(c)) {
            c = c.replace(regexFall, '<field name="SYMBOL_LIST">1HZ10V</field>');
        }
    }

    if (c !== originalC) {
        fs.writeFileSync(p, c);
        console.log('Fixed', f);
        fixedCount++;
    } else {
        if (c.includes('<value name="SYMBOL_LIST">')) {
            console.log('FAILED to fix', f);
        }
    }
});
console.log('Total fixed:', fixedCount);
