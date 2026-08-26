/* SMART RTL PATCH - PRO UI */
(function() {
    let rtlConfig = { faFont: '', enFont: '', codeFont: '', lh: '1.6', fs: '14', isRTL: true, forceRTL: false, fixAtSign: true };
    try {
        const saved = localStorage.getItem('smart-rtl-config');
        if (saved) {
            rtlConfig = { ...rtlConfig, ...JSON.parse(saved) };
        }
    } catch (e) {}

    let isRTL = rtlConfig.isRTL;
    let forceRTL = rtlConfig.forceRTL || false;
    let fixAtSign = rtlConfig.fixAtSign !== false;

    function injectStyle(id, css) {
        let style = document.getElementById(id);
        if (!style) {
            style = document.createElement('style');
            style.id = id;
            document.head.appendChild(style);
        }
        style.textContent = css;
    }

    const staticCSS = `
        .rtl-widget-container { position: fixed; bottom: 20px; right: 20px; z-index: 999999; display: flex; flex-direction: column; align-items: flex-end; }
        
        .rtl-widget-panel { 
            position: absolute; bottom: 60px; right: 0;
            transform: scale(0.95); opacity: 0; pointer-events: none; 
            transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); 
            transform-origin: bottom right; 
        }
        .rtl-widget-panel.open { transform: scale(1); opacity: 1; pointer-events: auto; }
        
        .rtl-theme-panel { 
            background-color: var(--vscode-editor-background, #1e1e1e); 
            color: var(--vscode-editor-foreground, #cccccc); 
            border: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.2)); 
            padding: 16px 20px; 
            border-radius: 12px; 
            width: 290px; 
            box-shadow: 0 12px 32px rgba(0,0,0,0.5); 
            max-height: 80vh; overflow-y: auto; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .rtl-theme-input { 
            background-color: var(--vscode-input-background, #3c3c3c); 
            color: var(--vscode-input-foreground, #ccc); 
            border: 1px solid var(--vscode-input-border, transparent); 
            padding: 6px 8px; border-radius: 6px; 
            width: 140px; font-size: 12px; 
            outline: none; transition: border 0.2s; 
        }
        .rtl-theme-input:focus { border-color: var(--vscode-focusBorder, #007acc); }
        
        .rtl-toggle-btn-reset { 
            background: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.4)); 
            border: none; border-radius: 14px; 
            width: 44px; height: 24px; position: relative; 
            cursor: pointer; transition: background 0.3s; flex-shrink: 0; 
        }
        .rtl-toggle-btn-reset.active { background: var(--vscode-button-background, #007acc); }
        .rtl-toggle-knob { 
            background: #fff; border-radius: 50%; 
            width: 18px; height: 18px; position: absolute; 
            top: 3px; left: 3px; transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1); 
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .rtl-toggle-btn-reset.active .rtl-toggle-knob { transform: translateX(20px); }
        
        .rtl-row { 
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 14px; padding-bottom: 12px; 
            border-bottom: 1px solid rgba(128,128,128,0.1); 
        }
        .rtl-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .rtl-label { font-size: 13px; font-weight: 500; opacity: 0.9; }
        
        .rtl-widget-trigger { 
            width: 48px; height: 48px; border-radius: 50%; 
            background: var(--vscode-button-background, #007acc); 
            color: var(--vscode-button-foreground, #ffffff); 
            display: flex; align-items: center; justify-content: center; 
            cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.4); 
            transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); 
        }
        .rtl-widget-trigger:hover { transform: scale(1.08); background: var(--vscode-button-hoverBackground, #006eb3); }
        .rtl-widget-trigger svg { transition: transform 0.3s; }
        .rtl-widget-panel.open ~ .rtl-widget-trigger svg { transform: rotate(90deg); }
    `;
    injectStyle('rtl-widget-style', staticCSS);

    function updateDynamicCSS(faFont, enFont, codeFont, lh, fs) {
        let faFontName = "'PersianOnlyFont'";
        let faFontRule = '';
        const persianUnicodeRange = 'U+0600-06FF, U+FB50-FDFF, U+FE70-FEFF';
        
        if (faFont) {
            faFontName = `'UserPersianFont', 'PersianOnlyFont'`;
            let baseFaFont = faFont.replace(/[-\s]?Regular$/i, '');
            faFontRule = `
                @font-face { font-family: 'UserPersianFont'; src: local('${faFont}'), local('${baseFaFont}'); font-weight: 400; unicode-range: ${persianUnicodeRange}; }
                @font-face { font-family: 'UserPersianFont'; src: local('${baseFaFont} Bold'), local('${baseFaFont}-Bold'); font-weight: 700; unicode-range: ${persianUnicodeRange}; }
            `;
        }
        
        let enFontStr = enFont ? `'${enFont}', ` : '';
        
        const dynamicCSS = `
            ${faFontRule}
            @font-face {
                font-family: 'PersianOnlyFont';
                src: url('data:font/woff2;base64,__FONT_BASE64__') format('woff2');
                font-weight: 100 900;
                unicode-range: ${persianUnicodeRange};
            }
            .smart-rtl-text-node, 
            .monaco-chat-request, 
            .monaco-chat-response,
            .interactive-input-part,
            .chat-input-part {
                font-family: ${faFontName}, ${enFontStr}var(--vscode-font-family, system-ui), "Segoe UI Emoji" !important;
            }
            .monaco-chat-request, 
            .monaco-chat-response,
            .interactive-input-part,
            .chat-input-part {
                font-size: ${fs}px !important;
                line-height: ${lh} !important;
            }
            .monaco-chat-request .value, 
            .interactive-session .value {
                font-family: inherit !important;
                font-size: inherit !important;
            }
        `;
        if (isRTL) injectStyle('smart-ide-rtl-style', dynamicCSS);
    }
    updateDynamicCSS(rtlConfig.faFont, rtlConfig.enFont, rtlConfig.codeFont, rtlConfig.lh, rtlConfig.fs);

    function createWidget() {
        if (document.querySelector('.rtl-widget-container')) return;

        const container = document.createElement('div');
        container.className = 'rtl-widget-container';

        const panel = document.createElement('div');
        panel.className = 'rtl-widget-panel rtl-theme-panel';
        
        const title = document.createElement('div');
        title.style.cssText = 'text-align:center; font-weight:700; font-size:15px; margin-bottom:16px; letter-spacing:0.5px;';
        title.textContent = 'Antigravity Pro RTL Settings';
        panel.appendChild(title);

        const trigger = document.createElement('div');
        trigger.className = 'rtl-widget-trigger';
        
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');

        const line1 = document.createElementNS(ns, 'line');
        line1.setAttribute('x1', '21'); line1.setAttribute('y1', '6'); line1.setAttribute('x2', '3'); line1.setAttribute('y2', '6');
        
        const line2 = document.createElementNS(ns, 'line');
        line2.setAttribute('x1', '21'); line2.setAttribute('y1', '12'); line2.setAttribute('x2', '10'); line2.setAttribute('y2', '12');
        
        const line3 = document.createElementNS(ns, 'line');
        line3.setAttribute('x1', '21'); line3.setAttribute('y1', '18'); line3.setAttribute('x2', '6'); line3.setAttribute('y2', '18');
        
        const poly = document.createElementNS(ns, 'polyline');
        poly.setAttribute('points', '10 15 7 12 10 9');

        svg.appendChild(line1);
        svg.appendChild(line2);
        svg.appendChild(line3);
        svg.appendChild(poly);
        
        trigger.appendChild(svg);

        trigger.onclick = (e) => {
            e.stopPropagation();
            panel.classList.toggle('open');
        };

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                panel.classList.remove('open');
            }
        });

        function createRow(labelText, element) {
            const row = document.createElement('div');
            row.className = 'rtl-row';
            const label = document.createElement('span');
            label.className = 'rtl-label';
            label.textContent = labelText;
            row.appendChild(label);
            row.appendChild(element);
            return row;
        }

        function createToggle(id, active) {
            const btn = document.createElement('button');
            btn.id = id;
            btn.className = 'rtl-toggle-btn-reset ' + (active ? 'active' : '');
            const knob = document.createElement('div');
            knob.className = 'rtl-toggle-knob';
            btn.appendChild(knob);
            return btn;
        }

        function createFontSelector(val, fontList) {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'flex-end';
            wrapper.style.gap = '6px';

            const select = document.createElement('select');
            select.className = 'rtl-theme-input';
            
            let found = false;
            fontList.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.value;
                opt.textContent = f.label;
                if (val === f.value) { opt.selected = true; found = true; }
                select.appendChild(opt);
            });

            const customOpt = document.createElement('option');
            customOpt.value = '__custom__';
            customOpt.textContent = 'Custom...';
            if (!found && val !== '') { customOpt.selected = true; found = true; }
            select.appendChild(customOpt);

            const customInput = document.createElement('input');
            customInput.type = 'text';
            customInput.className = 'rtl-theme-input';
            customInput.placeholder = 'e.g. B Yekan';
            customInput.style.display = (select.value === '__custom__') ? 'block' : 'none';
            customInput.value = (!found && val) ? val : '';

            select.onchange = () => {
                customInput.style.display = select.value === '__custom__' ? 'block' : 'none';
            };

            wrapper.appendChild(select);
            wrapper.appendChild(customInput);

            return {
                element: wrapper,
                getValue: () => select.value === '__custom__' ? customInput.value.trim() : select.value,
                onChange: (cb) => { select.addEventListener('change', cb); customInput.addEventListener('input', cb); }
            };
        }

        const faFonts = [
            { label: 'System Default', value: '' },
            { label: 'Vazirmatn', value: 'Vazirmatn' },
            { label: 'IRANSans', value: 'IRANSans' },
            { label: 'IRANSansX', value: 'IRANSansX' },
            { label: 'Shabnam', value: 'Shabnam' },
            { label: 'B Yekan', value: 'B Yekan' },
            { label: 'B Nazanin', value: 'B Nazanin' },
            { label: 'Tahoma', value: 'Tahoma' },
            { label: 'Segoe UI', value: 'Segoe UI' }
        ];

        const enFonts = [
            { label: 'System Default', value: '' },
            { label: 'Segoe UI', value: 'Segoe UI' },
            { label: 'Arial', value: 'Arial' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Open Sans', value: 'Open Sans' },
            { label: 'Consolas', value: 'Consolas' },
            { label: 'Fira Code', value: 'Fira Code' }
        ];

        const toggleBtn = createToggle('rtl-toggle-btn', isRTL);
        const forceBtn = createToggle('rtl-force-btn', forceRTL);
        const atBtn = createToggle('rtl-at-btn', fixAtSign);
        
        const faFontSelector = createFontSelector(rtlConfig.faFont, faFonts);
        const enFontSelector = createFontSelector(rtlConfig.enFont, enFonts);
        
        const fsInput = document.createElement('input');
        fsInput.id = 'rtl-fs-input';
        fsInput.type = 'number';
        fsInput.min = '10'; fsInput.max = '30'; fsInput.step = '1';
        fsInput.value = rtlConfig.fs;
        fsInput.className = 'rtl-theme-input';

        const lhInput = document.createElement('input');
        lhInput.id = 'rtl-lh-input';
        lhInput.type = 'range';
        lhInput.min = '1.2'; lhInput.max = '2.5'; lhInput.step = '0.1';
        lhInput.value = rtlConfig.lh;
        lhInput.className = 'rtl-theme-input';

        panel.appendChild(createRow('Enable RTL', toggleBtn));
        panel.appendChild(createRow('Force RTL', forceBtn));
        panel.appendChild(createRow('Persian Font', faFontSelector.element));
        panel.appendChild(createRow('English Font', enFontSelector.element));
        panel.appendChild(createRow('Font Size (px)', fsInput));
        panel.appendChild(createRow('Line Height', lhInput));
        panel.appendChild(createRow('Fix @ Sign', atBtn));

        const footer = document.createElement('div');
        footer.style.cssText = 'margin-top:20px; text-align:center; font-size:12px; opacity:0.8; border-top:1px solid rgba(128,128,128,0.2); padding-top:12px; font-family:sans-serif;';
        
        const footerText = document.createTextNode('Developed by ');
        const githubLink = document.createElement('a');
        githubLink.href = 'https://github.com/arian13es';
        githubLink.textContent = 'Arian';
        githubLink.style.cssText = 'color:var(--vscode-textLink-foreground, #007acc); text-decoration:none; font-weight:bold; cursor:pointer;';
        
        footer.appendChild(footerText);
        footer.appendChild(githubLink);
        panel.appendChild(footer);

        container.appendChild(panel);
        container.appendChild(trigger);
        document.body.appendChild(container);

        const saveConfig = () => {
            try {
                localStorage.setItem('smart-rtl-config', JSON.stringify({
                    faFont: faFontSelector.getValue(),
                    enFont: enFontSelector.getValue(),
                    codeFont: '',
                    lh: lhInput.value,
                    fs: fsInput.value,
                    isRTL, forceRTL, fixAtSign
                }));
            } catch(e) {}
        };

        const onSettingsChange = () => {
            saveConfig();
            if (isRTL) {
                updateDynamicCSS(faFontSelector.getValue(), enFontSelector.getValue(), '', lhInput.value, fsInput.value);
                updateDir();
            }
        };

        toggleBtn.onclick = () => {
            isRTL = !isRTL;
            toggleBtn.className = 'rtl-toggle-btn-reset ' + (isRTL ? 'active' : '');
            saveConfig();
            if (isRTL) {
                onSettingsChange();
            } else {
                const s = document.getElementById('smart-ide-rtl-style');
                if (s) s.remove();
            }
        };

        forceBtn.onclick = () => {
            forceRTL = !forceRTL;
            forceBtn.className = 'rtl-toggle-btn-reset ' + (forceRTL ? 'active' : '');
            saveConfig();
            updateDir();
        };

        atBtn.onclick = () => {
            fixAtSign = !fixAtSign;
            atBtn.className = 'rtl-toggle-btn-reset ' + (fixAtSign ? 'active' : '');
            saveConfig();
        };

        faFontSelector.onChange(onSettingsChange);
        enFontSelector.onChange(onSettingsChange);
        fsInput.oninput = onSettingsChange;
        lhInput.oninput = onSettingsChange;
    }
    
    if (document.body) createWidget();
    else window.addEventListener('DOMContentLoaded', createWidget);

    function updateDir() {
        if (!isRTL) return;
        
        const allElements = document.querySelectorAll('*');
        const textElements = [];
        
        for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            const tag = el.tagName;
            
            if (['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'SPAN', 'TEXTAREA'].includes(tag)) {
                textElements.push(el);
                continue;
            }
            if (el.getAttribute('contenteditable') === 'true') {
                textElements.push(el);
                continue;
            }
            if (tag === 'DIV') {
                const cls = el.className || '';
                if (typeof cls === 'string' && cls.match(/message|value|content|prose|chat|request|response/i)) {
                    textElements.push(el);
                    continue;
                }
                if (el.children.length === 0 && el.textContent.trim().length > 0) {
                    textElements.push(el);
                    continue;
                }
            }
        }
        
        textElements.forEach(el => {
            if (el.closest('.rtl-widget-container')) return;
            if (el.closest('pre, code')) return;
            if (el.closest('.monaco-editor') && !el.closest('.interactive-input-part, .chat-input-part, [class*="message"], [class*="request"]')) return;
            
            const text = el.textContent.replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
            if (!text) return;
            
            let dir = 'auto';
            if (forceRTL) {
                dir = 'rtl';
            } else {
                const firstChar = text.match(/[A-Za-z\u0600-\u06FF]/);
                if (firstChar) {
                    dir = /[\u0600-\u06FF]/.test(firstChar[0]) ? 'rtl' : 'ltr';
                }
            }
            
            if (!el.classList.contains('smart-rtl-text-node')) {
                el.classList.add('smart-rtl-text-node');
            }
            
            if (el.getAttribute('dir') !== dir) {
                el.setAttribute('dir', dir);
                
                if (dir === 'rtl') {
                    el.style.setProperty('text-align', 'right', 'important');
                    el.style.setProperty('direction', 'rtl', 'important');
                    el.style.setProperty('unicode-bidi', 'isolate', 'important');
                } else {
                    el.style.setProperty('text-align', 'left', 'important');
                    el.style.setProperty('direction', 'ltr', 'important');
                    el.style.setProperty('unicode-bidi', 'isolate', 'important');
                }
                
                const bubble = el.closest('[class*="message"], [class*="request"], [class*="bubble"], .value');
                if (bubble) {
                    bubble.setAttribute('dir', dir);
                    bubble.style.setProperty('direction', dir, 'important');
                }
            }
        });
    }

    document.addEventListener('input', updateDir, { capture: true });
    
    let updateDirRAF = null;
    const observer = new MutationObserver((mutations) => {
        if (!isRTL) return;
        let needsUpdate = false;
        for (let i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0 || mutations[i].type === 'characterData') {
                needsUpdate = true;
                break;
            }
        }
        if (needsUpdate) {
            if (updateDirRAF) cancelAnimationFrame(updateDirRAF);
            updateDirRAF = requestAnimationFrame(() => {
                updateDir();
            });
        }
    });
    
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        });
    }

    setInterval(() => {
        if (isRTL) updateDir();
    }, 1500);

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.code === 'KeyR') { 
            const toggle = document.getElementById('rtl-toggle-btn');
            if (toggle) toggle.click();
        }
        if (fixAtSign && e.code === 'Digit2' && e.shiftKey) {
            if (e.key === '٬' || e.key === '،') {
                e.preventDefault();
                document.execCommand('insertText', false, '@');
            }
        }
    }, { capture: true });

})();
