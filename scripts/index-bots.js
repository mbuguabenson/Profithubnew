import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'constants', 'bot-manifest.json');

const CATEGORIES = [
    { directory: 'Automatic', id: 'Automatic' },
    { directory: 'Hybrid Bots', id: 'Hybrids' },
    { directory: 'Official Bots', id: 'Official' }
];

const botManifest = [];

CATEGORIES.forEach(category => {
    const categoryPath = path.join(PUBLIC_DIR, category.directory);
    
    if (fs.existsSync(categoryPath)) {
        const files = fs.readdirSync(categoryPath);
        
        files.forEach(file => {
            if (file.endsWith('.xml') || file.endsWith('.json')) {
                // Ensure name is clean without extension
                const name = file.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
                
                // Construct a relatively safe ID
                const id = `${category.id.toLowerCase()}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                
                // Add to manifest
                botManifest.push({
                    id: id,
                    name: name,
                    category: category.id,
                    prompt: `Load premium strategy: ${name}`,
                    description: `${category.id} premium strategy specifically engineered for deriv DBot features.`,
                    path: `/${category.directory}/${file}`
                });
            }
        });
    } else {
        console.warn(`Category directory not found: ${categoryPath}`);
    }
});

// Write JSON payload
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(botManifest, null, 4));
console.log(`Successfully indexed ${botManifest.length} localized premium bots into ${OUTPUT_FILE}.`);
