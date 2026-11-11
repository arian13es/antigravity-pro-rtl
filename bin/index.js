#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { parseArgs } from 'node:util';
import picocolors from 'picocolors';
import ora from 'ora';
import prompts from 'prompts';
import * as asar from '@electron/asar';
import figlet from 'figlet';
import { findLinuxInstallations, isSnapPath, targetsAt } from './linux-installations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { blue, cyan, green, red, yellow, bold } = picocolors;

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function printBanner() {
    try {
        const fullArt = figlet.textSync('Antigravity', { font: 'Standard' }).split('\n');
        console.log('');
        for (const line of fullArt) {
            if (!line.trim()) continue;
            console.log(bold(line));
        }
        console.log('');
        console.log(bold(`  Antigravity Pro RTL Injector | v${pkg.version}`));
        console.log(`  GitHub: https://github.com/arian13es\n`);
    } catch (err) {
        console.log(bold(`\n✨ Antigravity Pro RTL Injector v${pkg.version}`));
        console.log(`  GitHub: https://github.com/arian13es\n`);
    }
}

printBanner();

function getStandardPath() {
    if (os.platform() === 'darwin') return '/Applications/Antigravity.app/Contents/Resources/app.asar';
    if (os.platform() === 'win32') return path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Antigravity', 'resources', 'app.asar');
    return '/opt/Antigravity/resources/app.asar';
}

function getIDEPath() {
    if (os.platform() === 'win32') return path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Antigravity IDE', 'resources', 'app');
    if (os.platform() === 'darwin') return '/Applications/Antigravity IDE.app/Contents/Resources/app';
    return '/opt/Antigravity IDE/resources/app';
}

async function patchIDE(appDir, isRestore) {
    if (!fs.existsSync(appDir)) {
        console.log(yellow(`[?] Target bypass: Antigravity IDE architecture not found at ${appDir}.`));
        return;
    }
    console.log(blue(`\n[✓] Target locked: IDE ecosystem located at ${appDir}`));
    
    const spinner = ora('Auditing IDE permissions...').start();
    
    let targetDirs = [
        path.join(appDir, 'out', 'vs', 'code', 'electron-browser', 'workbench'),
        path.join(appDir, 'out', 'vs', 'code', 'electron-sandbox', 'workbench'),
        path.join(appDir, 'out', 'vs', 'workbench', 'contrib', 'webview', 'browser', 'pre')
    ];
    
    let htmlDirs = targetDirs.filter(d => fs.existsSync(d));
    
    if (htmlDirs.length === 0) {
        spinner.fail('Incompatible IDE architecture detected. Missing vital HTML matrices.');
        return;
    }
    
    let htmlFiles = [];
    for (const dir of htmlDirs) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
        files.forEach(f => htmlFiles.push(path.join(dir, f)));
    }

    if (htmlFiles.length === 0) {
        spinner.fail('Execution halted: No HTML targets found in the IDE matrix.');
        return;
    }

    if (isRestore) {
        let restored = false;
        for (const htmlPath of htmlFiles) {
            const backupHtml = htmlPath + '.bak';
            if (fs.existsSync(backupHtml)) {
                fs.copyFileSync(backupHtml, htmlPath);
                restored = true;
            }
        }
        if (restored) spinner.succeed('IDE architecture successfully reverted to factory state.');
        else spinner.info('No backups detected. Factory reset aborted for IDE.');
        return;
    }

    spinner.text = 'Deploying Pro UI payloads into IDE webviews...';
    
    const payloadPath = path.join(__dirname, 'ide-payload.js');
    let payloadCode = fs.readFileSync(payloadPath, 'utf8');
    const fontPath = path.join(__dirname, 'Vazirmatn-Variable.woff2');
    let fontBase64 = '';
    if (fs.existsSync(fontPath)) {
        fontBase64 = fs.readFileSync(fontPath).toString('base64');
    }
    payloadCode = payloadCode.replace('__FONT_BASE64__', fontBase64);
    
    let patchedAny = false;
    for (const htmlPath of htmlFiles) {
        const dir = path.dirname(htmlPath);
        const targetJsPath = path.join(dir, 'ide-payload.js');
        fs.writeFileSync(targetJsPath, payloadCode);
        
        const backupHtml = htmlPath + '.bak';
        if (!fs.existsSync(backupHtml)) fs.copyFileSync(htmlPath, backupHtml);
        
        let htmlCode = fs.readFileSync(htmlPath, 'utf8');
        let modified = false;

        if (!htmlCode.includes("font-src 'self' data:;") && !htmlCode.includes("font-src") && htmlCode.includes("style-src")) {
            htmlCode = htmlCode.replace("style-src", "font-src 'self' data:; style-src");
            modified = true;
        } else if (htmlCode.includes("font-src") && !htmlCode.match(/font-src[^;]+data:/)) {
            htmlCode = htmlCode.replace(/font-src([^;]+);/g, "font-src$1 data:;");
            modified = true;
        }

        if (!htmlCode.includes('ide-payload.js')) {
            if (htmlCode.includes('</body>')) {
                htmlCode = htmlCode.replace('</body>', '  <script src="./ide-payload.js"></script>\n</body>');
            } else {
                htmlCode = htmlCode.replace('</html>', '  <script src="./ide-payload.js"></script>\n</html>');
            }
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(htmlPath, htmlCode);
            patchedAny = true;
        }
    }
    
    if (patchedAny) {
        spinner.succeed('★ IDE ecosystem successfully overhauled with Arian Pro UI!');
    } else {
        spinner.succeed('IDE is already operating on the Arian Pro UI architecture.');
    }
}

async function patchStandard(asarPath, isRestore) {
    if (!fs.existsSync(asarPath)) {
        console.log(yellow(`[?] Target bypass: Standard Antigravity not found at ${asarPath}.`));
        return;
    }
    console.log(blue(`\n[✓] Target locked: Standard Antigravity located at ${asarPath}`));
    
    const backupPath = asarPath + '.bak';
    if (isRestore) {
        if (!fs.existsSync(backupPath)) {
            console.log(yellow('[!] Alert: Backup missing. Cannot revert standard core.'));
            return;
        }
        const spinner = ora('Reverting standard ASAR core to factory state...').start();
        try {
            fs.copyFileSync(backupPath, asarPath);
            spinner.succeed('Standard Antigravity successfully reverted.');
        } catch (e) {
            spinner.fail('Critical failure during ASAR restoration.');
            console.error(red(e.message));
        }
        return;
    }

    const spinner = ora('Acquiring write permissions & establishing backup...').start();
    try {
        fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(asarPath, backupPath);
        }
    } catch (e) {
        spinner.fail('Access Denied.');
        console.error(red('\n[!] OS Exception: ' + e.message));
        console.error(yellow('Action required: Elevate your terminal privileges (Run as Administrator/sudo).'));
        return;
    }
    
    const extractDir = path.join(path.dirname(asarPath), 'app-extracted-rtl-temp');
    spinner.text = 'Decrypting and unpacking ASAR core...';
    try {
        if (fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        asar.extractAll(asarPath, extractDir);
    } catch (e) {
        spinner.fail('Core unpacking failed.');
        console.error(red(e.message));
        return;
    }

    spinner.text = 'Injecting Unified RTL module into the core...';
    try {
        const utilsPath = path.join(extractDir, 'dist', 'utils.js');
        if (!fs.existsSync(utilsPath)) {
            throw new Error('dist/utils.js missing. The target architecture is incompatible.');
        }

        let utilsCode = fs.readFileSync(utilsPath, 'utf8');
        
        if (utilsCode.includes('/* ANTIGRAVITY PRO RTL PATCH */')) {
            spinner.succeed('Standard Antigravity is already operating on the patched architecture.');
            fs.rmSync(extractDir, { recursive: true, force: true });
            return;
        }

        const idePayloadPath = path.join(__dirname, 'ide-payload.js');
        const ideCode = fs.readFileSync(idePayloadPath, 'utf8');

        // Safely serialize the code to avoid template literal escaping issues in Electron
        const ideCodeString = JSON.stringify(ideCode);

        const payload = `/* ANTIGRAVITY PRO RTL PATCH */
void win.loadURL(url);

win.webContents.on('dom-ready', () => {
    try {
        const fontPath = require('path').join(__dirname, 'Vazirmatn-Variable.woff2');
        let fontBase64 = '';
        if (require('fs').existsSync(fontPath)) {
            fontBase64 = require('fs').readFileSync(fontPath).toString('base64');
        }
        
        let injectedScript = ${ideCodeString};
        injectedScript = injectedScript.replace(/__FONT_BASE64__/g, fontBase64);

        win.webContents.executeJavaScript(injectedScript).catch(err => console.error("Failed to inject RTL features:", err));
    } catch(e) {
        console.error("Failed to read offline font", e);
    }
});`;

        const anchor = 'void win.loadURL(url);';
        if (!utilsCode.includes(anchor)) {
            throw new Error('Injection anchor missing. Unsupported framework version.');
        }

        utilsCode = utilsCode.replace(anchor, payload);
        utilsCode = utilsCode.replace(/devTools:\s*!electron_1?\.app\.isPackaged/g, 'devTools: true');
        fs.writeFileSync(utilsPath, utilsCode);

        const fontSource = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontDest = path.join(extractDir, 'dist', 'Vazirmatn-Variable.woff2');
        if (fs.existsSync(fontSource)) {
            fs.copyFileSync(fontSource, fontDest);
        }
    } catch (e) {
        spinner.fail('Module injection failed.');
        console.error(red(e.message));
        if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
        return;
    }

    spinner.text = 'Rebuilding core ASAR package...';
    try {
        await asar.createPackage(extractDir, asarPath);
        fs.rmSync(extractDir, { recursive: true, force: true });
        spinner.succeed('★ Standard Antigravity ecosystem successfully overhauled!');
    } catch (e) {
        spinner.fail('Failed to reconstruct the core package.');
        console.error(red(e.message));
    }
}

function getGeminiPath() {
    if (os.platform() === 'win32') {
        const base = path.join(process.env.LOCALAPPDATA || '', 'Google', 'Gemini');
        if (fs.existsSync(base)) {
            const dirs = fs.readdirSync(base).filter(f => f.startsWith('app-') && fs.statSync(path.join(base, f)).isDirectory());
            if (dirs.length > 0) {
                dirs.sort();
                return path.join(base, dirs[dirs.length - 1], 'resources', 'app.asar');
            }
        }
    }
    return null;
}

async function patchGemini(asarPath, isRestore) {
    if (!asarPath || !fs.existsSync(asarPath)) {
        console.log(yellow(`[?] Target bypass: Gemini Desktop App not found.`));
        return;
    }
    console.log(blue(`\n[✓] Target locked: Gemini App located at ${asarPath}`));
    
    const backupPath = asarPath + '.bak';
    if (isRestore) {
        if (!fs.existsSync(backupPath)) {
            console.log(yellow('[!] Alert: Backup missing. Cannot revert Gemini core.'));
            return;
        }
        const spinner = ora('Reverting Gemini ASAR core to factory state...').start();
        try {
            fs.copyFileSync(backupPath, asarPath);
            spinner.succeed('Gemini successfully reverted.');
        } catch (e) {
            spinner.fail('Critical failure during ASAR restoration.');
            console.error(red(e.message));
        }
        return;
    }

    const spinner = ora('Acquiring write permissions & establishing backup...').start();
    try {
        fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(asarPath, backupPath);
        }
    } catch (e) {
        spinner.fail('Access Denied.');
        console.error(red('\n[!] OS Exception: ' + e.message));
        return;
    }
    
    const extractDir = path.join(path.dirname(asarPath), 'app-extracted-rtl-temp');
    spinner.text = 'Decrypting and unpacking Gemini ASAR core...';
    try {
        if (fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        asar.extractAll(asarPath, extractDir);
    } catch (e) {
        spinner.fail('Core unpacking failed.');
        console.error(red(e.message));
        return;
    }

    spinner.text = 'Injecting Unified RTL module into Gemini...';
    try {
        const preloadPath = path.join(extractDir, 'src', 'preload.js');
        if (!fs.existsSync(preloadPath)) {
            throw new Error('src/preload.js missing. The target architecture is incompatible.');
        }

        let preloadCode = fs.readFileSync(preloadPath, 'utf8');
        
        if (preloadCode.includes('/* ANTIGRAVITY PRO RTL PATCH */')) {
            spinner.succeed('Gemini is already operating on the patched architecture.');
            fs.rmSync(extractDir, { recursive: true, force: true });
            return;
        }

        const idePayloadPath = path.join(__dirname, 'ide-payload.js');
        const ideCode = fs.readFileSync(idePayloadPath, 'utf8');

        const fontPath = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        let fontBase64 = '';
        if (fs.existsSync(fontPath)) {
            fontBase64 = fs.readFileSync(fontPath).toString('base64');
        }
        
        let injectedScript = ideCode.replace(/__FONT_BASE64__/g, fontBase64);

        const payload = `\n/* ANTIGRAVITY PRO RTL PATCH */
window.addEventListener('DOMContentLoaded', () => {
    try {
        ${injectedScript}
    } catch(e) {
        console.error("Failed to inject RTL features:", e);
    }
});`;

        preloadCode += payload;
        fs.writeFileSync(preloadPath, preloadCode);
    } catch (e) {
        spinner.fail('Module injection failed.');
        console.error(red(e.message));
        if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
        return;
    }

    spinner.text = 'Rebuilding Gemini ASAR package...';
    try {
        await asar.createPackage(extractDir, asarPath);
        fs.rmSync(extractDir, { recursive: true, force: true });
        spinner.succeed('★ Gemini App successfully overhauled!');
    } catch (e) {
        spinner.fail('Failed to reconstruct the Gemini package.');
        console.error(red(e.message));
    }
}

function reportSnap(target) {
    console.error(yellow(`[!] Snap installation is read-only: ${target}`));
    console.error(yellow('Use a writable Antigravity installation, such as the official Linux tarball, with --path.'));
}

async function patchTargets(targets, isRestore) {
    for (const target of targets) {
        try {
            const resolved = fs.realpathSync(target.path);
            if (os.platform() === 'linux' && (isSnapPath(target.path) || isSnapPath(resolved))) {
                reportSnap(target.path);
                process.exitCode = 1;
                continue;
            }
            const patch = target.type === 'standard' ? patchStandard : patchIDE;
            await patch(resolved, isRestore);
        } catch (error) {
            console.error(red(`[!] Could not modify ${target.path}: ${error.message}`));
            process.exitCode = 1;
        }
    }
}

async function patchCustomPath(input, isRestore) {
    if (!input) throw new Error('Provide an Antigravity installation path.');
    const location = path.resolve(input);
    const resolved = fs.realpathSync(location);
    if (os.platform() === 'linux' && (isSnapPath(location) || isSnapPath(resolved))) {
        reportSnap(location);
        process.exitCode = 1;
        return;
    }

    const stat = fs.statSync(resolved);
    let targets = [];
    if (stat.isFile() && location.endsWith('.asar')) {
        targets = [{ type: 'standard', path: resolved }];
    } else if (stat.isDirectory()) {
        targets = fs.existsSync(path.join(resolved, 'out', 'vs'))
            ? [{ type: 'ide', path: resolved }]
            : [...targetsAt(resolved), ...targetsAt(path.join(resolved, 'resources'))];
    }
    if (!targets.length) throw new Error(`No supported Antigravity resources found at ${location}.`);
    await patchTargets(targets, isRestore);
}

async function main() {
    const { values: { restore: isRestore, path: customPath } } = parseArgs({
        options: {
            restore: { type: 'boolean' },
            path: { type: 'string' }
        }
    });
    console.log(green('\n⚡ Initializing Antigravity Pro RTL Injector...'));

    if (customPath !== undefined) {
        await patchCustomPath(customPath, isRestore);
    } else if (os.platform() === 'linux') {
        const { targets, snaps } = findLinuxInstallations();
        for (const snap of snaps) reportSnap(snap);
        if (targets.length) {
            await patchTargets(targets, isRestore);
        } else if (snaps.length) {
            process.exitCode = 1;
            return;
        } else {
            await promptForPath(isRestore);
        }
    } else {
        const standardPath = getStandardPath();
        const idePath = getIDEPath();
        const geminiPath = getGeminiPath();
        if (fs.existsSync(standardPath) || fs.existsSync(idePath) || geminiPath) {
            await patchIDE(idePath, isRestore);
            await patchStandard(standardPath, isRestore);
            await patchGemini(geminiPath, isRestore);
        } else {
            await promptForPath(isRestore);
        }
    }

    if (!process.exitCode) {
        console.log(green(bold('\nRestart the patched applications to apply the changes.\n')));
    }
}

async function promptForPath(isRestore) {
    console.log(yellow('[?] No supported installation was found automatically.'));
    const { customPath } = await prompts({
        type: 'text',
        name: 'customPath',
        message: "Path to the Antigravity installation, 'app.asar' or 'app' directory"
    });
    await patchCustomPath(customPath, isRestore);
}

main().catch(e => {
    console.error(red('\n[!] An unhandled architectural error occurred:'), e.message);
    process.exit(1);
});
