// Baseline Browser Compatibility Checker - VS Code Extension
// This is the main extension.js file

const vscode = require('vscode');
const path = require('path');

// Baseline compatibility database (simplified - in production, fetch from MDN BCD API)
const baselineData = {
    css: {
        'display: grid': { baseline: true, supported: ['Chrome 57+', 'Firefox 52+', 'Safari 10.1+', 'Edge 16+'], mdn: 'CSS/display' },
        'display: flex': { baseline: true, supported: ['Chrome 29+', 'Firefox 20+', 'Safari 9+', 'Edge 12+'], mdn: 'CSS/display' },
        'container-queries': { baseline: false, supported: ['Chrome 105+', 'Safari 16+'], mdn: 'CSS/CSS_Container_Queries', fallback: 'Use media queries or JavaScript' },
        '@container': { baseline: false, supported: ['Chrome 105+', 'Safari 16+'], mdn: 'CSS/@container', fallback: 'Use @media queries' },
        'backdrop-filter': { baseline: true, supported: ['Chrome 76+', 'Firefox 103+', 'Safari 9+', 'Edge 79+'], mdn: 'CSS/backdrop-filter' },
        'aspect-ratio': { baseline: true, supported: ['Chrome 88+', 'Firefox 89+', 'Safari 15+', 'Edge 88+'], mdn: 'CSS/aspect-ratio' },
        'gap': { baseline: true, supported: ['Chrome 84+', 'Firefox 63+', 'Safari 14.1+', 'Edge 84+'], mdn: 'CSS/gap' },
        '@layer': { baseline: true, supported: ['Chrome 99+', 'Firefox 97+', 'Safari 15.4+', 'Edge 99+'], mdn: 'CSS/@layer' },
        'color-mix': { baseline: false, supported: ['Chrome 111+', 'Safari 16.2+'], mdn: 'CSS/color_value/color-mix', fallback: 'Use preprocessor color functions' },
        ':has': { baseline: true, supported: ['Chrome 105+', 'Firefox 121+', 'Safari 15.4+', 'Edge 105+'], mdn: 'CSS/:has' },
        'subgrid': { baseline: false, supported: ['Firefox 71+', 'Safari 16+'], mdn: 'CSS/CSS_Grid_Layout/Subgrid', fallback: 'Use nested grids' }
    },
    html: {
        '<dialog>': { baseline: true, supported: ['Chrome 37+', 'Firefox 98+', 'Safari 15.4+', 'Edge 79+'], mdn: 'HTML/Element/dialog' },
        '<details>': { baseline: true, supported: ['Chrome 12+', 'Firefox 49+', 'Safari 6+', 'Edge 79+'], mdn: 'HTML/Element/details' },
        'loading="lazy"': { baseline: true, supported: ['Chrome 77+', 'Firefox 75+', 'Safari 16.4+', 'Edge 79+'], mdn: 'HTML/Element/img#attr-loading' },
        'popover': { baseline: false, supported: ['Chrome 114+', 'Edge 114+'], mdn: 'HTML/Global_attributes/popover', fallback: 'Use JavaScript modal libraries' },
        '<search>': { baseline: true, supported: ['Chrome 118+', 'Firefox 118+', 'Safari 17+', 'Edge 118+'], mdn: 'HTML/Element/search' },
        'inert': { baseline: true, supported: ['Chrome 102+', 'Firefox 112+', 'Safari 15.5+', 'Edge 102+'], mdn: 'HTML/Global_attributes/inert' }
    },
    javascript: {
        'Promise': { baseline: true, supported: ['Chrome 32+', 'Firefox 29+', 'Safari 8+', 'Edge 12+'], mdn: 'JavaScript/Reference/Global_Objects/Promise' },
        'async/await': { baseline: true, supported: ['Chrome 55+', 'Firefox 52+', 'Safari 11+', 'Edge 15+'], mdn: 'JavaScript/Reference/Statements/async_function' },
        'optional chaining': { baseline: true, supported: ['Chrome 80+', 'Firefox 74+', 'Safari 13.1+', 'Edge 80+'], mdn: 'JavaScript/Reference/Operators/Optional_chaining' },
        '?.': { baseline: true, supported: ['Chrome 80+', 'Firefox 74+', 'Safari 13.1+', 'Edge 80+'], mdn: 'JavaScript/Reference/Operators/Optional_chaining' },
        'nullish coalescing': { baseline: true, supported: ['Chrome 80+', 'Firefox 72+', 'Safari 13.1+', 'Edge 80+'], mdn: 'JavaScript/Reference/Operators/Nullish_coalescing' },
        '??': { baseline: true, supported: ['Chrome 80+', 'Firefox 72+', 'Safari 13.1+', 'Edge 80+'], mdn: 'JavaScript/Reference/Operators/Nullish_coalescing' },
        '.at()': { baseline: true, supported: ['Chrome 92+', 'Firefox 90+', 'Safari 15.4+', 'Edge 92+'], mdn: 'JavaScript/Reference/Global_Objects/Array/at' },
        'structuredClone': { baseline: true, supported: ['Chrome 98+', 'Firefox 94+', 'Safari 15.4+', 'Edge 98+'], mdn: 'JavaScript/Reference/Global_Objects/structuredClone' },
        '.toSorted()': { baseline: false, supported: ['Chrome 110+', 'Firefox 115+', 'Safari 16+'], mdn: 'JavaScript/Reference/Global_Objects/Array/toSorted', fallback: 'Use [...array].sort()' },
        '.toReversed()': { baseline: false, supported: ['Chrome 110+', 'Firefox 115+', 'Safari 16+'], mdn: 'JavaScript/Reference/Global_Objects/Array/toReversed', fallback: 'Use [...array].reverse()' },
        'import.meta': { baseline: true, supported: ['Chrome 64+', 'Firefox 62+', 'Safari 11.1+', 'Edge 79+'], mdn: 'JavaScript/Reference/Operators/import.meta' },
        'top-level await': { baseline: true, supported: ['Chrome 89+', 'Firefox 89+', 'Safari 15+', 'Edge 89+'], mdn: 'JavaScript/Reference/Operators/await#top_level_await' }
    }
};

// Feature patterns for detection
const patterns = {
    css: [
        /display\s*:\s*grid/gi,
        /display\s*:\s*flex/gi,
        /@container/gi,
        /container-queries/gi,
        /backdrop-filter/gi,
        /aspect-ratio/gi,
        /gap\s*:/gi,
        /@layer/gi,
        /color-mix/gi,
        /:has\(/gi,
        /subgrid/gi
    ],
    html: [
        /<dialog[\s>]/gi,
        /<details[\s>]/gi,
        /loading\s*=\s*["']lazy["']/gi,
        /popover\s*=/gi,
        /<search[\s>]/gi,
        /inert\s*=/gi
    ],
    javascript: [
        /\?\./g,
        /\?\?/g,
        /\.at\(/g,
        /structuredClone/g,
        /\.toSorted\(/g,
        /\.toReversed\(/g,
        /async\s+function/g,
        /await\s+/g,
        /import\.meta/g,
        /new\s+Promise/g
    ]
};

function activate(context) {
    console.log('Baseline Compatibility Checker is now active');

    // Diagnostic collection for warnings
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('baseline');
    context.subscriptions.push(diagnosticCollection);

    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider(
        ['html', 'css', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
        {
            provideHover(document, position) {
                return provideBaselineHover(document, position);
            }
        }
    );
    context.subscriptions.push(hoverProvider);

    // Register command to check current file
    const checkCommand = vscode.commands.registerCommand('baseline-checker.checkFile', () => {
        checkCurrentFile(diagnosticCollection);
    });
    context.subscriptions.push(checkCommand);

    // Register command to show status panel
    const statusCommand = vscode.commands.registerCommand('baseline-checker.showStatus', () => {
        showStatusPanel();
    });
    context.subscriptions.push(statusCommand);

    // Auto-check on document change
    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            debounce(() => checkDocument(event.document, diagnosticCollection), 1000);
        }
    });

    // Check active document on activation
    if (vscode.window.activeTextEditor) {
        checkDocument(vscode.window.activeTextEditor.document, diagnosticCollection);
    }

    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'baseline-checker.checkFile';
    statusBarItem.text = '$(shield) Baseline Check';
    statusBarItem.tooltip = 'Check Browser Compatibility';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

function provideBaselineHover(document, position) {
    const range = document.getWordRangeAtPosition(position);
    if (!range) return null;

    const word = document.getText(range);
    const line = document.lineAt(position.line).text;
    
    // Determine file type
    const fileType = getFileType(document.languageId);
    if (!fileType) return null;

    // Check for feature match
    const feature = findFeature(word, line, fileType);
    if (!feature) return null;

    const data = baselineData[fileType][feature];
    if (!data) return null;

    // Create hover content
    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;

    const icon = data.baseline ? '✅' : '⚠️';
    const status = data.baseline ? '**Baseline**' : '**Not Baseline**';
    
    markdown.appendMarkdown(`### ${icon} ${feature}\n\n`);
    markdown.appendMarkdown(`${status}\n\n`);
    markdown.appendMarkdown(`**Browser Support:**\n`);
    data.supported.forEach(browser => {
        markdown.appendMarkdown(`- ${browser}\n`);
    });

    if (data.fallback) {
        markdown.appendMarkdown(`\n💡 **Recommendation:** ${data.fallback}\n`);
    }

    markdown.appendMarkdown(`\n[📚 View on MDN](https://developer.mozilla.org/en-US/docs/Web/${data.mdn})`);

    return new vscode.Hover(markdown);
}

function checkDocument(document, diagnosticCollection) {
    const fileType = getFileType(document.languageId);
    if (!fileType) return;

    const diagnostics = [];
    const text = document.getText();
    const features = detectFeatures(text, fileType);

    features.forEach(feature => {
        const data = baselineData[fileType][feature.name];
        if (data && !data.baseline) {
            const diagnostic = new vscode.Diagnostic(
                feature.range,
                `⚠️ Non-baseline feature: ${feature.name}. ${data.fallback || 'May not be supported in all browsers'}`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.source = 'Baseline Checker';
            diagnostics.push(diagnostic);
        }
    });

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkCurrentFile(diagnosticCollection) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    checkDocument(editor.document, diagnosticCollection);

    const fileType = getFileType(editor.document.languageId);
    if (!fileType) return;

    const text = editor.document.getText();
    const features = detectFeatures(text, fileType);

    // Count baseline vs non-baseline
    let baselineCount = 0;
    let nonBaselineCount = 0;
    features.forEach(f => {
        const data = baselineData[fileType][f.name];
        if (data) {
            if (data.baseline) baselineCount++;
            else nonBaselineCount++;
        }
    });

    const message = `Detected ${features.length} feature${features.length !== 1 ? 's' : ''}: ✅ ${baselineCount} baseline, ⚠️ ${nonBaselineCount} non-baseline`;

    if (nonBaselineCount > 0) {
        vscode.window.showWarningMessage(message, 'View Details').then(selection => {
            if (selection === 'View Details') {
                showDetailedReport(features, fileType);
            }
        });
    } else {
        vscode.window.showInformationMessage(`✅ ${message}`);
    }
}

function showDetailedReport(features, fileType) {
    const panel = vscode.window.createWebviewPanel(
        'baselineReport',
        'Baseline Compatibility Report',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .feature { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; }
                .baseline { background: #d4edda; border-color: #c3e6cb; }
                .non-baseline { background: #fff3cd; border-color: #ffeaa7; }
                .feature-name { font-weight: bold; font-size: 16px; margin-bottom: 8px; }
                .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-bottom: 8px; }
                .status-baseline { background: #28a745; color: white; }
                .status-warning { background: #ffc107; color: black; }
                .support { font-size: 14px; color: #666; margin-top: 5px; }
                .recommendation { margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>🔍 Baseline Compatibility Report</h1>
            <p>Detected ${features.length} features in your ${fileType.toUpperCase()} code</p>
    `;

    features.forEach(feature => {
        const data = baselineData[fileType][feature.name];
        if (!data) return;

        const isBaseline = data.baseline;
        const statusClass = isBaseline ? 'baseline' : 'non-baseline';
        const statusBadge = isBaseline ? 'status-baseline' : 'status-warning';
        const icon = isBaseline ? '✅' : '⚠️';

        html += `
            <div class="feature ${statusClass}">
                <div class="feature-name">${icon} ${feature.name}</div>
                <span class="status ${statusBadge}">${isBaseline ? 'Baseline' : 'Not Baseline'}</span>
                <div class="support">Supported in: ${data.supported.join(', ')}</div>
                ${data.fallback ? `<div class="recommendation">💡 <strong>Recommendation:</strong> ${data.fallback}</div>` : ''}
            </div>
        `;
    });

    html += '</body></html>';
    panel.webview.html = html;
}

function showStatusPanel() {
    const panel = vscode.window.createWebviewPanel(
        'baselineStatus',
        'Baseline Quick Reference',
        vscode.ViewColumn.Beside,
        {}
    );

    panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
                h2 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
                .section { margin: 20px 0; }
                .baseline-list { color: #28a745; }
                .non-baseline-list { color: #ffc107; }
                li { margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>🛡️ Baseline Quick Reference</h1>
            
            <div class="section">
                <h2>CSS</h2>
                <p class="baseline-list">✅ <strong>Baseline:</strong> Grid, Flexbox, Backdrop Filter, Aspect Ratio, @layer</p>
                <p class="non-baseline-list">⚠️ <strong>Not Baseline:</strong> Container Queries, color-mix(), Subgrid</p>
            </div>

            <div class="section">
                <h2>HTML</h2>
                <p class="baseline-list">✅ <strong>Baseline:</strong> &lt;dialog&gt;, &lt;details&gt;, loading="lazy", inert</p>
                <p class="non-baseline-list">⚠️ <strong>Not Baseline:</strong> popover attribute</p>
            </div>

            <div class="section">
                <h2>JavaScript</h2>
                <p class="baseline-list">✅ <strong>Baseline:</strong> async/await, Optional chaining (?.),  Nullish coalescing (??), .at()</p>
                <p class="non-baseline-list">⚠️ <strong>Not Baseline:</strong> .toSorted(), .toReversed()</p>
            </div>

            <p style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 8px;">
                💡 <strong>Tip:</strong> Hover over features in your code to see detailed compatibility information!
            </p>
        </body>
        </html>
    `;
}

function detectFeatures(text, fileType) {
    const featuresSet = new Set();
    const lines = text.split('\n');

    patterns[fileType]?.forEach(pattern => {
        lines.forEach(line => {
            const matches = line.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const featureName = normalizeFeature(match, fileType);
                    if (baselineData[fileType][featureName]) {
                        featuresSet.add(featureName); // Add only once
                    }
                });
            }
        });
    });

    // Convert set to array with dummy range (range only used for diagnostics)
    return Array.from(featuresSet).map(featureName => ({
        name: featureName,
        range: new vscode.Range(0, 0, 0, 0)
    }));
}

function findFeature(word, line, fileType) {
    // Check direct match
    for (const feature in baselineData[fileType]) {
        if (line.includes(feature) || word === feature.replace(/[^a-zA-Z]/g, '')) {
            return feature;
        }
    }
    return null;
}

function normalizeFeature(match, fileType) {
    const normalized = match.trim();

    if (baselineData[fileType][normalized]) return normalized;

    // CSS patterns
    if (fileType === 'css') {
        if (normalized.includes('grid')) return 'display: grid';
        if (normalized.includes('flex')) return 'display: flex';
        if (normalized.includes('@container')) return '@container';
        if (normalized.includes('color-mix')) return 'color-mix';
        if (normalized.includes('subgrid')) return 'subgrid';
        if (normalized.includes('aspect-ratio')) return 'aspect-ratio';
        if (normalized.includes('gap')) return 'gap';
        if (normalized.includes('backdrop-filter')) return 'backdrop-filter';
        if (normalized.includes('@layer')) return '@layer';
        if (normalized.includes(':has')) return ':has';
    }

    // HTML patterns
    if (fileType === 'html') {
        if (normalized.includes('<dialog')) return '<dialog>';
        if (normalized.includes('<details')) return '<details>';
        if (normalized.includes('loading="lazy"')) return 'loading="lazy"';
        if (normalized.includes('popover')) return 'popover';
        if (normalized.includes('<search')) return '<search>';
        if (normalized.includes('inert')) return 'inert';
    }

    // JS patterns
    if (fileType === 'javascript') {
        if (normalized.includes('?.')) return '?.';
        if (normalized.includes('??')) return '??';
        if (normalized.includes('.toSorted')) return '.toSorted()';
        if (normalized.includes('.toReversed')) return '.toReversed()';
        if (normalized.includes('.at(')) return '.at()';
        if (normalized.includes('structuredClone')) return 'structuredClone';
        if (normalized.includes('async function') || normalized.includes('await')) return 'async/await';
        if (normalized.includes('import.meta')) return 'import.meta';
        if (normalized.includes('Promise')) return 'Promise';
    }

    return normalized;
}

function getFileType(languageId) {
    if (languageId === 'css' || languageId === 'scss' || languageId === 'less') return 'css';
    if (languageId === 'html') return 'html';
    if (languageId.includes('javascript') || languageId.includes('typescript')) return 'javascript';
    return null;
}

let debounceTimer;
function debounce(func, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
}

function deactivate() {
    console.log('Baseline Compatibility Checker deactivated');
}

module.exports = { activate, deactivate };