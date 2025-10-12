import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const preBuildScript = async () => {
  const buildDate = (new Date()).toLocaleString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const versionFilePath = path.resolve(__dirname, '../src/version.ts');
  const versionContent = `export const APP_BUILD_DATE = '${buildDate}';\n`;
  
  try {
    fs.writeFileSync(versionFilePath, versionContent, 'utf8');
    console.log('✅ Version file updated successfully.');
  } catch (error) {
    console.error('❌ Error writing version file:', error);
  }
};

preBuildScript().catch(error => {
  console.error('❌ Pre-build script failed:', error);
  process.exit(1);
});