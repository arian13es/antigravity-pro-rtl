import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const snapMounts = ['/snap', '/var/lib/snapd/snap'];
const commands = ['antigravity', 'antigravity-ide'];
const bundleName = /^antigravity(?:[ -]ide)?(?:-linux)?(?:-(?:x64|arm64|amd64|aarch64))?$/i;

export function isSnapPath(target, mounts = snapMounts) {
    return mounts.some(mount => target === mount || target.startsWith(mount + path.sep));
}

function realPath(file) {
    try {
        return fs.realpathSync(file);
    } catch (error) {
        if (!['ENOENT', 'ENOTDIR', 'EACCES', 'ELOOP'].includes(error.code)) throw error;
        return null;
    }
}

function bundlesIn(dir) {
    try {
        return fs.readdirSync(dir).filter(name => bundleName.test(name)).map(name => path.join(dir, name));
    } catch (error) {
        if (!['ENOENT', 'ENOTDIR', 'EACCES', 'ELOOP'].includes(error.code)) throw error;
        return [];
    }
}

export function targetsAt(resources) {
    const targets = [];
    const asar = realPath(path.join(resources, 'app.asar'));
    const app = path.join(resources, 'app');
    if (asar && fs.statSync(asar, { throwIfNoEntry: false })?.isFile()) {
        targets.push({ type: 'standard', path: asar });
    }
    if (fs.existsSync(path.join(app, 'out', 'vs'))) targets.push({ type: 'ide', path: app });
    return targets;
}

export function findLinuxInstallations({
    roots = [
        '/usr/share', '/usr/lib', '/usr/local', '/usr/local/share', '/usr/local/lib', '/opt',
        path.join(os.homedir(), '.local', 'opt'),
        process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share')
    ],
    commandPath = process.env.PATH || '',
    snapRoots = snapMounts
} = {}) {
    const snaps = snapRoots.flatMap(mount => commands.map(name => path.join(mount, name, 'current')))
        .filter(dir => fs.existsSync(dir));
    const bundles = roots.flatMap(bundlesIn);
    const candidates = new Set([...bundles, ...bundles.flatMap(bundlesIn)]);

    for (const bin of commandPath.split(path.delimiter).filter(Boolean)) {
        for (const name of commands) {
            const launcher = path.resolve(bin, name);
            if (isSnapPath(launcher, snapRoots)) continue;
            const executable = realPath(launcher);
            if (!executable) continue;
            const dir = path.dirname(executable);
            candidates.add(dir);
            if (path.basename(dir) === 'bin') candidates.add(path.dirname(dir));
        }
    }

    const targets = new Map();
    for (const candidate of candidates) {
        const resources = realPath(path.join(candidate, 'resources'));
        if (!resources || isSnapPath(resources, snapRoots)) continue;
        for (const target of targetsAt(resources)) {
            const file = realPath(target.path);
            if (file && !isSnapPath(file, snapRoots)) targets.set(file, { ...target, path: file });
        }
    }
    return { targets: [...targets.values()], snaps };
}
