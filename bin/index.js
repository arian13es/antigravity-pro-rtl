#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import picocolors from 'picocolors';
import ora from 'ora';
import prompts from 'prompts';
import * as asar from '@electron/asar';
import figlet from 'figlet';

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

const args = process.argv.slice(2);
const isRestore = args.includes('--restore');

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

async function main() {
    console.log(green('\n⚡ Initializing Antigravity Pro RTL Injector...'));
    
    let standardPath = getStandardPath();
    let idePath = getIDEPath();
    
    if (!fs.existsSync(standardPath) && !fs.existsSync(idePath)) {
        console.log(yellow(`[?] Automatic scanning failed to locate the Antigravity instances.`));
        const response = await prompts({
            type: 'text',
            name: 'customPath',
            message: `Provide the absolute path to the target ('app.asar' or 'app' folder):`
        });
        if (!response.customPath || !fs.existsSync(response.customPath)) {
            console.error(red('\n[!] Invalid trajectory. Process aborted.\n'));
            process.exit(1);
        }
        const isAsar = response.customPath.endsWith('.asar');
        if (isAsar) {
            await patchStandard(response.customPath, isRestore);
        } else {
            await patchIDE(response.customPath, isRestore);
        }
    } else {
        await patchIDE(idePath, isRestore);
        await patchStandard(standardPath, isRestore);
    }
    
    console.log(green(bold('\n⚡ Master execution completed. Reboot your applications to initialize the new UI.\n')));
}

main().catch(e => {
    console.error(red('\n[!] An unhandled architectural error occurred:'), e.message);
    process.exit(1);
});
