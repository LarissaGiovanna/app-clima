const fs = require('fs');
const path = require('path');
const Module = require('module');

function loadService(relativePath, { mocks = {}, exportNames = [] } = {}) {
  const full = path.resolve(__dirname, '..', relativePath);
  let src = fs.readFileSync(full, 'utf8');
  src = src.replace(/^import\s+.*?;?\s*$/gm, '');
  src = src
    .replace(/export\s+async\s+function/g, 'async function')
    .replace(/export\s+function/g, 'function')
    .replace(/export\s+const/g, 'const')
    .replace(/export\s*\{[^}]*\};?/g, '')
    .replace(/export\s+default\s+/g, '');
  const mockKeys = Object.keys(mocks);
  const mockValues = mockKeys.map((k) => mocks[k]);
  const exportList = exportNames.length
    ? `return { ${exportNames.join(', ')} };`
    : 'return {};';
  const factory = new Function(
    ...mockKeys,
    'module',
    'exports',
    'require',
    `${src}\n${exportList}`
  );
  return factory(...mockValues, { exports: {} }, {}, require);
}

module.exports = { loadService };
