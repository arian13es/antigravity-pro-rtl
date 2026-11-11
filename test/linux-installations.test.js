import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { findLinuxInstallations } from '../bin/linux-installations.js';

function fixture(t) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-rtl-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    return dir;
}

function ideFile(root) {
    const file = path.join(root, 'resources/app/out/vs/code/electron-sandbox/workbench/workbench.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '<html><body></body></html>');
    return file;
}

test('finds packaged, nested tarball, and PATH installations without duplicate targets', { skip: process.platform === 'win32' }, t => {
    const dir = fixture(t);
    const system = path.join(dir, 'usr/share');
    const opt = path.join(dir, 'opt');
    const ide = path.join(system, 'antigravity/resources/app');
    const desktop = path.join(opt, 'antigravity/Antigravity-x64/resources/app.asar');
    const custom = path.join(dir, 'custom bundle');
    const bin = path.join(dir, 'bin');
    ideFile(path.join(system, 'antigravity'));
    ideFile(custom);
    fs.mkdirSync(path.dirname(desktop), { recursive: true });
    fs.writeFileSync(desktop, '');
    fs.mkdirSync(path.join(custom, 'bin'));
    fs.mkdirSync(bin);
    fs.writeFileSync(path.join(custom, 'bin/antigravity-ide'), '', { mode: 0o755 });
    fs.symlinkSync(path.join(custom, 'bin/antigravity-ide'), path.join(bin, 'antigravity-ide'));
    fs.symlinkSync(path.join(system, 'antigravity'), path.join(opt, 'antigravity-ide'));

    const result = findLinuxInstallations({ roots: [system, opt], commandPath: bin, snapRoots: [] });
    assert.deepEqual(result.targets.map(target => target.path).sort(), [
        ide, desktop, path.join(custom, 'resources/app')
    ].sort());
});

test('reports the current Snap mount without treating it as a patch target', { skip: process.platform === 'win32' }, t => {
    const dir = fixture(t);
    const snap = path.join(dir, 'snap');
    const revision = path.join(snap, 'antigravity/70');
    const current = path.join(snap, 'antigravity/current');
    const bundle = path.join(revision, 'opt/antigravity');
    ideFile(bundle);
    fs.symlinkSync('70', current);
    const opt = path.join(dir, 'opt');
    fs.mkdirSync(opt);
    fs.symlinkSync(bundle, path.join(opt, 'antigravity'));

    const result = findLinuxInstallations({ roots: [opt], commandPath: '', snapRoots: [snap] });
    assert.deepEqual(result.targets, []);
    assert.deepEqual(result.snaps, [current]);
});

test('patches and restores a custom IDE through the CLI', { skip: process.platform !== 'linux' }, t => {
    const root = fixture(t);
    const html = ideFile(root);
    const original = fs.readFileSync(html, 'utf8');
    const cli = fileURLToPath(new URL('../bin/index.js', import.meta.url));
    const run = (...args) => spawnSync(process.execPath, [cli, '--path', root, ...args], {
        encoding: 'utf8',
        input: ''
    });

    const patch = run();
    assert.equal(patch.status, 0, patch.stderr || patch.stdout);
    assert.match(fs.readFileSync(html, 'utf8'), /<script src="\.\/ide-payload\.js"><\/script>/);

    const restore = run('--restore');
    assert.equal(restore.status, 0, restore.stderr || restore.stdout);
    assert.equal(fs.readFileSync(html, 'utf8'), original);
});
