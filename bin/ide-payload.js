/* SMART RTL PATCH - PRO UI (UNIVERSAL ENGINE) */
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
            (document.head || document.documentElement).appendChild(style);
        }
        style.textContent = css;
    }

    const staticCSS = `
        .rtl-widget-container { 
            position: fixed; z-index: 9999999; 
            display: flex; flex-direction: column; 
            touch-action: none; user-select: none; 
        }
        
        .rtl-widget-panel { 
            position: absolute; 
            transform: scale(0.95); opacity: 0; pointer-events: none; 
            transition: opacity 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); 
        }
        .rtl-widget-panel.open { transform: scale(1); opacity: 1; pointer-events: auto; }
        
        .rtl-theme-panel { 
            background-color: var(--vscode-editor-background, #1e1e1e); 
            color: var(--vscode-editor-foreground, #cccccc); 
            border: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.25)); 
            padding: 16px 20px; 
            border-radius: 12px; 
            width: 290px; 
            box-shadow: 0 12px 32px rgba(0,0,0,0.55); 
            max-height: 80vh; overflow-y: auto; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            box-sizing: border-box;
        }
        
        .rtl-theme-input { 
            background-color: var(--vscode-input-background, #2d2d2d); 
            color: var(--vscode-input-foreground, #ccc); 
            border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.15)); 
            padding: 6px 8px; border-radius: 6px; 
            width: 140px; font-size: 12px; 
            outline: none; transition: border 0.2s; 
            box-sizing: border-box;
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
            border-bottom: 1px solid rgba(128,128,128,0.12); 
        }
        .rtl-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .rtl-label { font-size: 13px; font-weight: 500; opacity: 0.9; }
        
        .rtl-widget-trigger { 
            width: 46px; height: 46px; border-radius: 50%; 
            background: var(--vscode-button-background, #007acc); 
            color: var(--vscode-button-foreground, #ffffff); 
            display: flex; align-items: center; justify-content: center; 
            cursor: grab; box-shadow: 0 4px 16px rgba(0,0,0,0.4); 
            transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.2s; 
            touch-action: none;
        }
        .rtl-widget-trigger:active { cursor: grabbing; }
        .rtl-widget-trigger:hover { transform: scale(1.08); background: var(--vscode-button-hoverBackground, #006eb3); }
        .rtl-widget-trigger svg { transition: transform 0.3s; pointer-events: none; }
        .rtl-widget-panel.open ~ .rtl-widget-trigger svg { transform: rotate(90deg); }
    `;
    injectStyle('rtl-widget-style', staticCSS);

    function updateDynamicCSS(faFont, enFont, codeFont, lh, fs) {
        let faFontName = "'PersianOnlyFont'";
        let faFontRule = '';
        const persianUnicodeRange = 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C, U+200D';
        
        if (faFont) {
            faFontName = `'UserPersianFont', 'PersianOnlyFont'`;
            let baseFaFont = faFont.replace(/[-\s]?Regular$/i, '');
            faFontRule = `
                @font-face { font-family: 'UserPersianFont'; src: local('${faFont}'), local('${baseFaFont}'); font-weight: 400; unicode-range: ${persianUnicodeRange}; font-display: swap; }
                @font-face { font-family: 'UserPersianFont'; src: local('${baseFaFont} Bold'), local('${baseFaFont}-Bold'); font-weight: 700; unicode-range: ${persianUnicodeRange}; font-display: swap; }
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
                font-display: swap;
            }
            
            /* Universal font application: Antigravity IDE, Standard App, and Gemini Desktop */
            .smart-rtl-text-node, 
            .monaco-chat-request, 
            .monaco-chat-response,
            .interactive-input-part,
            .chat-input-part,
            message-content,
            .message-content,
            model-response,
            user-query,
            .conversation-container,
            .response-container,
            .query-content,
            rich-textarea,
            .text-input-field,
            elicitations,
            .elicitations-container,
            .elicitations-message,
            .elicitation-item,
            .elicitation-label {
                font-family: ${faFontName}, ${enFontStr}var(--vscode-font-family, system-ui), "Segoe UI Emoji", sans-serif !important;
            }

            .smart-rtl-text-node,
            .monaco-chat-request, 
            .monaco-chat-response,
            .interactive-input-part,
            .chat-input-part,
            message-content p,
            message-content li,
            .message-content p,
            .message-content li,
            .elicitations-message,
            .elicitation-label {
                font-size: ${fs}px !important;
                line-height: ${lh} !important;
            }

            .monaco-chat-request .value, 
            .interactive-session .value {
                font-family: inherit !important;
                font-size: inherit !important;
            }

            /* Directional alignment contracts */
            [dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
            }

            [dir="ltr"] {
                direction: ltr !important;
                text-align: left !important;
            }

            p[dir="rtl"], h1[dir="rtl"], h2[dir="rtl"], h3[dir="rtl"], h4[dir="rtl"], h5[dir="rtl"], h6[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }

            li[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }

            ol[dir="rtl"], ul[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                padding-right: 28px !important;
                padding-left: 0 !important;
            }

            /* Mathematical formulas, code blocks and monospace preservation */
            pre, code, kbd, samp,
            pre *, code *,
            .monaco-editor .view-lines,
            .katex, .katex *,
            mjx-container, mjx-container *,
            math, math * {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
                font-family: var(--vscode-editor-font-family, Consolas, "Courier New", monospace) !important;
            }

            .katex-display, .katex-display * {
                direction: ltr !important;
                text-align: center !important;
            }

            /* ==========================================================================
               SUGGESTION CHIPS, ELICITATIONS & FOLLOW-UP PROMPTS CONSTRAINTS
               ========================================================================== */
            elicitations,
            .elicitations-container,
            .elicitations-message,
            model-response .attachment-container,
            message-content .attachment-container,
            .attachment-container.md-has-block-component,
            .response-container [class*="chip-container"],
            .response-container [class*="suggestion"],
            .response-container [class*="followup"],
            .response-container [class*="follow-up"],
            model-response [class*="chip-container"],
            model-response [class*="suggestion"],
            model-response [class*="followup"],
            model-response [class*="follow-up"],
            chat-turn [class*="suggestion"],
            chat-turn [class*="followup"],
            chat-turn [class*="follow-up"],
            [class*="suggestion-container"],
            [class*="suggestions-container"],
            [class*="followup-container"],
            [class*="follow-up-container"] {
                max-width: 768px !important;
                width: 100% !important;
                margin-left: auto !important;
                margin-right: auto !important;
                box-sizing: border-box !important;
                align-self: center !important;
            }

            /* Ensure attachment containers inside model responses never push off-screen */
            model-response .attachment-container,
            message-content .attachment-container,
            .attachment-container.md-has-block-component {
                margin-inline-start: auto !important;
                margin-inline-end: auto !important;
                align-self: center !important;
                overflow: visible !important;
            }

            /* Suggestion title / question text */
            [class*="suggestion"] p,
            [class*="followup"] p,
            [class*="follow-up"] p,
            [class*="suggestion-container"] p,
            [class*="followup-container"] p,
            .elicitations-message {
                max-width: 100% !important;
                box-sizing: border-box !important;
                direction: rtl !important;
                text-align: right !important;
                white-space: normal !important;
                margin-bottom: 8px !important;
            }

            /* Elicitations container flex layout (Google Gemini Desktop) */
            .elicitations-container {
                display: flex !important;
                flex-flow: row wrap !important;
                justify-content: flex-start !important;
                align-items: stretch !important;
                gap: 12px !important;
                direction: rtl !important;
                box-sizing: border-box !important;
                width: 100% !important;
                max-width: 768px !important;
                margin-left: auto !important;
                margin-right: auto !important;
                overflow: visible !important;
            }

            /* Individual suggestion / elicitation card buttons (cards with text and ↪) */
            .elicitation-item {
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
                flex: 1 1 calc(33.333% - 12px) !important;
                min-width: 180px !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                direction: rtl !important;
                text-align: right !important;
                white-space: normal !important;
                word-break: break-word !important;
                overflow-wrap: break-word !important;
                overflow: hidden !important;
            }

            /* Elicitation text label & prompt suggestion icon */
            .elicitation-label {
                direction: rtl !important;
                text-align: right !important;
                width: 100% !important;
                white-space: normal !important;
                word-break: break-word !important;
            }

            .elicitation-button-icon {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-start !important;
                flex-shrink: 0 !important;
            }

            /* Mobile & narrow viewports: stack cards cleanly without horizontal clipping */
            @media (max-width: 768px) {
                .elicitations-container {
                    flex-direction: column !important;
                }
                .elicitation-item {
                    width: 100% !important;
                    flex: 1 1 100% !important;
                    min-width: 0 !important;
                }
            }

            /* Chip buttons flex alignment */
            [class*="chip-container"],
            [class*="chips"],
            [class*="suggestion-list"],
            [class*="suggestions-list"] {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: wrap !important;
                justify-content: flex-start !important;
                gap: 8px !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
            }

            [dir="rtl"] [class*="chip-container"],
            [dir="rtl"] [class*="chips"],
            [dir="rtl"] [class*="suggestion-list"],
            [dir="rtl"] [class*="suggestions-list"] {
                direction: rtl !important;
                justify-content: flex-start !important;
            }

            /* ==========================================================================
               USER QUERY CONTAINER ISOLATION (PRESERVE NATIVE RIGHT ALIGNMENT)
               ========================================================================== */
            user-query,
            .user-query,
            user-query-container,
            .user-query-container,
            [class*="user-query"],
            [class*="user-turn"],
            .monaco-chat-request {
                direction: ltr !important; /* Preserves native LTR inline-start so user messages anchor right */
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-end !important;
            }

            /* Every child component inside user-query (thumbnails, query bubbles, actions)
               must maintain strict right-edge alignment (X = 679) flush with each other */
            user-query > *,
            .user-query > *,
            user-query .query-content,
            .user-query .query-content,
            user-query [class*="query-content"],
            .user-query [class*="query-content"],
            .query-content,
            [class*="query-content"],
            .user-query-bubble-with-background,
            user-query [class*="file-preview"],
            .user-query [class*="file-preview"],
            user-query [class*="attachment"],
            .user-query [class*="attachment"],
            user-query [class*="media-preview"],
            .user-query [class*="media-preview"],
            user-query [class*="image-preview"],
            .user-query [class*="image-preview"],
            user-query [class*="query-actions"],
            .user-query [class*="query-actions"],
            .monaco-chat-request .value,
            .monaco-chat-request [class*="file-preview"],
            .monaco-chat-request [class*="attachment"],
            .monaco-chat-request [class*="media-preview"],
            .monaco-chat-request [class*="image-preview"] {
                align-self: flex-end !important;
                margin-left: auto !important;
                margin-right: 0 !important;
                margin-inline-start: auto !important;
                margin-inline-end: 0 !important;
                max-width: 100% !important;
            }

            /* Action toolbar buttons (edit, copy) inside user queries */
            user-query [class*="actions"],
            .user-query [class*="actions"],
            .query-actions,
            [class*="query-actions"] {
                display: flex !important;
                flex-direction: row !important;
                justify-content: flex-end !important;
                align-self: flex-end !important;
                margin-left: auto !important;
                margin-right: 0 !important;
            }

            /* Text formatting inside user prompt bubbles */
            .query-content[dir="rtl"],
            [class*="query-content"][dir="rtl"],
            user-query .query-content[dir="rtl"],
            user-query [dir="rtl"],
            .monaco-chat-request[dir="rtl"] .value,
            .monaco-chat-request .value[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
                align-self: flex-end !important;
                margin-left: auto !important;
                margin-right: 0 !important;
            }

            .query-content[dir="ltr"],
            [class*="query-content"][dir="ltr"],
            user-query .query-content[dir="ltr"],
            user-query [dir="ltr"],
            .monaco-chat-request[dir="ltr"] .value,
            .monaco-chat-request .value[dir="ltr"] {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
                align-self: flex-end !important;
                margin-left: auto !important;
                margin-right: 0 !important;
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
        trigger.title = 'Antigravity RTL (کلیک: باز کردن | درگ: جابجایی)';
        
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

        function applyPosition(x, y) {
            const margin = 12;
            const btnSize = 48;
            const winW = window.innerWidth || 1200;
            const winH = window.innerHeight || 900;
            const maxX = Math.max(margin, winW - btnSize - margin);
            const maxY = Math.max(margin, winH - btnSize - margin);
            const clampedX = Math.min(Math.max(margin, x), maxX);
            const clampedY = Math.min(Math.max(margin, y), maxY);

            container.style.left = clampedX + 'px';
            container.style.top = clampedY + 'px';
            container.style.right = 'auto';
            container.style.bottom = 'auto';

            const isBottomHalf = clampedY > (winH / 2);
            const isRightHalf = clampedX > (winW / 2);

            if (isBottomHalf) {
                panel.style.bottom = '54px';
                panel.style.top = 'auto';
            } else {
                panel.style.top = '54px';
                panel.style.bottom = 'auto';
            }

            if (isRightHalf) {
                panel.style.right = '0';
                panel.style.left = 'auto';
                panel.style.transformOrigin = isBottomHalf ? 'bottom right' : 'top right';
                container.style.alignItems = 'flex-end';
            } else {
                panel.style.left = '0';
                panel.style.right = 'auto';
                panel.style.transformOrigin = isBottomHalf ? 'bottom left' : 'top left';
                container.style.alignItems = 'flex-start';
            }

            return { x: clampedX, y: clampedY };
        }

        try {
            const savedPos = JSON.parse(localStorage.getItem('smart-rtl-widget-pos') || 'null');
            if (savedPos && typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
                applyPosition(savedPos.x, savedPos.y);
            } else {
                applyPosition((window.innerWidth || 1200) - 68, (window.innerHeight || 900) - 68);
            }
        } catch (e) {
            applyPosition((window.innerWidth || 1200) - 68, (window.innerHeight || 900) - 68);
        }

        window.addEventListener('resize', () => {
            const curX = parseInt(container.style.left, 10) || ((window.innerWidth || 1200) - 68);
            const curY = parseInt(container.style.top, 10) || ((window.innerHeight || 900) - 68);
            applyPosition(curX, curY);
        });

        let isDragging = false;
        let hasMoved = false;
        let startPointerX = 0, startPointerY = 0;
        let startElemX = 0, startElemY = 0;

        function onPointerDown(e) {
            if (e.button !== undefined && e.button !== 0) return;
            isDragging = true;
            hasMoved = false;
            startPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            startPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

            const rect = container.getBoundingClientRect();
            startElemX = rect.left;
            startElemY = rect.top;

            window.addEventListener('mousemove', onPointerMove, { passive: false });
            window.addEventListener('mouseup', onPointerUp);
            window.addEventListener('touchmove', onPointerMove, { passive: false });
            window.addEventListener('touchend', onPointerUp);
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

            const dx = clientX - startPointerX;
            const dy = clientY - startPointerY;

            if (!hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
                hasMoved = true;
            }

            if (hasMoved) {
                if (e.cancelable) e.preventDefault();
                applyPosition(startElemX + dx, startElemY + dy);
            }
        }

        function onPointerUp() {
            if (!isDragging) return;
            isDragging = false;

            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('touchend', onPointerUp);

            if (hasMoved) {
                const finalX = parseInt(container.style.left, 10);
                const finalY = parseInt(container.style.top, 10);
                try {
                    localStorage.setItem('smart-rtl-widget-pos', JSON.stringify({ x: finalX, y: finalY }));
                } catch (err) {}
            }
        }

        trigger.addEventListener('mousedown', onPointerDown);
        trigger.addEventListener('touchstart', onPointerDown, { passive: true });

        trigger.onclick = (e) => {
            e.stopPropagation();
            if (hasMoved) return;
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
        (document.body || document.documentElement).appendChild(container);

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

    /* MATHEMATICAL DIRECTION CLASSIFIER (RATIO & THRESHOLD HEURISTIC) */
    const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/g;
    const LTR_REGEX = /[A-Za-z]/g;

    function detectDirection(text) {
        if (!text) return null;
        const clean = text.replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
        if (!clean) return null;

        if (forceRTL) return 'rtl';

        const rtlMatches = clean.match(RTL_REGEX);
        const ltrMatches = clean.match(LTR_REGEX);

        const rtlCount = rtlMatches ? rtlMatches.length : 0;
        const ltrCount = ltrMatches ? ltrMatches.length : 0;

        if (rtlCount === 0 && ltrCount === 0) return null;

        // In Persian technical prose, formulas and Latin variables (e.g. K, T, s, u(t))
        // or parenthetical English terms are frequently mixed.
        // If RTL characters are present and represent at least 25% of letters OR exceed 3 chars:
        if (rtlCount > 0 && (rtlCount >= ltrCount * 0.25 || rtlCount >= 3)) {
            return 'rtl';
        }

        if (ltrCount > 0) {
            return 'ltr';
        }

        return null;
    }

    function applyElementDir(el, dir) {
        if (!dir) return;

        if (!el.classList.contains('smart-rtl-text-node')) {
            el.classList.add('smart-rtl-text-node');
        }

        if (el.getAttribute('dir') !== dir) {
            el.setAttribute('dir', dir);
        }

        if (dir === 'rtl') {
            el.style.setProperty('direction', 'rtl', 'important');
            el.style.setProperty('text-align', 'right', 'important');
            el.style.setProperty('unicode-bidi', 'isolate', 'important');
        } else {
            el.style.setProperty('direction', 'ltr', 'important');
            el.style.setProperty('text-align', 'left', 'important');
            el.style.setProperty('unicode-bidi', 'isolate', 'important');
        }

        // If inside user-query or a query bubble, enforce right-edge flush alignment
        if (el.closest && el.closest('user-query, .user-query, [class*="user-query"], [class*="user-turn"], .monaco-chat-request')) {
            el.style.setProperty('align-self', 'flex-end', 'important');
            el.style.setProperty('margin-left', 'auto', 'important');
            el.style.setProperty('margin-right', '0', 'important');
        }
    }

    function updateDir() {
        if (!isRTL) return;

        const blockTargets = [];
        const containerTargets = [];

        function walkDOM(node) {
            if (!node) return;
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node;
                if (el.classList && el.classList.contains('rtl-widget-container')) return;

                const tag = el.tagName;
                if (['PRE', 'CODE', 'SVG', 'MATH', 'SCRIPT', 'STYLE'].includes(tag)) return;
                if (el.classList && (el.classList.contains('katex') || el.classList.contains('monaco-editor'))) {
                    if (!el.closest('.interactive-input-part, .chat-input-part')) return;
                }

                if (['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'TD', 'TH'].includes(tag)) {
                    blockTargets.push(el);
                } else if (el.getAttribute('contenteditable') === 'true' || tag === 'TEXTAREA') {
                    blockTargets.push(el);
                } else if (tag === 'INPUT' && (!el.type || el.type === 'text' || el.type === 'search')) {
                    blockTargets.push(el);
                } else if (['MESSAGE-CONTENT', 'MODEL-RESPONSE'].includes(tag)) {
                    containerTargets.push(el);
                } else if (tag === 'USER-QUERY' || (el.classList && el.classList.contains('user-query'))) {
                    // Lock layout direction of user-query to LTR flex column aligned to flex-end
                    el.style.setProperty('direction', 'ltr', 'important');
                    el.style.setProperty('display', 'flex', 'important');
                    el.style.setProperty('flex-direction', 'column', 'important');
                    el.style.setProperty('align-items', 'flex-end', 'important');
                } else if (tag === 'ELICITATIONS' || (el.classList && el.classList.contains('elicitations-container'))) {
                    el.style.setProperty('max-width', '768px', 'important');
                    el.style.setProperty('width', '100%', 'important');
                    el.style.setProperty('margin-left', 'auto', 'important');
                    el.style.setProperty('margin-right', 'auto', 'important');
                    el.style.setProperty('box-sizing', 'border-box', 'important');
                    el.style.setProperty('direction', 'rtl', 'important');
                } else if (tag === 'BUTTON' && el.classList && el.classList.contains('elicitation-item')) {
                    el.style.setProperty('direction', 'rtl', 'important');
                    el.style.setProperty('text-align', 'right', 'important');
                    el.style.setProperty('box-sizing', 'border-box', 'important');
                } else if (tag === 'DIV') {
                    const cls = el.className || '';
                    if (typeof cls === 'string') {
                        if (cls.match(/query-content|user-query-content/i)) {
                            el.style.setProperty('align-self', 'flex-end', 'important');
                            el.style.setProperty('margin-left', 'auto', 'important');
                            el.style.setProperty('margin-right', '0', 'important');
                            blockTargets.push(el);
                        } else if (cls.match(/file-preview|attachment|media-preview|image-preview/i)) {
                            // CRITICAL FIX: Only apply user right-alignment if strictly inside user-query
                            if (el.closest('user-query, .user-query, [class*="user-query"], [class*="user-turn"], .monaco-chat-request')) {
                                el.style.setProperty('align-self', 'flex-end', 'important');
                                el.style.setProperty('margin-left', 'auto', 'important');
                                el.style.setProperty('margin-right', '0', 'important');
                            } else if (el.closest('model-response, message-content, [class*="model-response"], [class*="message-content"]')) {
                                // Model-side attachments (like Gemini's <div class="attachment-container">) must be centered and constrained
                                el.style.setProperty('align-self', 'center', 'important');
                                el.style.setProperty('margin-left', 'auto', 'important');
                                el.style.setProperty('margin-right', 'auto', 'important');
                                el.style.setProperty('max-width', '768px', 'important');
                                el.style.setProperty('width', '100%', 'important');
                                el.style.setProperty('box-sizing', 'border-box', 'important');
                            }
                        } else if (cls.match(/query-actions/i)) {
                            if (el.closest('user-query, .user-query, [class*="user-query"], [class*="user-turn"], .monaco-chat-request')) {
                                el.style.setProperty('align-self', 'flex-end', 'important');
                                el.style.setProperty('margin-left', 'auto', 'important');
                                el.style.setProperty('margin-right', '0', 'important');
                                el.style.setProperty('display', 'flex', 'important');
                                el.style.setProperty('justify-content', 'flex-end', 'important');
                            }
                        } else if (cls.match(/suggestion|followup|follow-up|elicitations/i)) {
                            el.style.setProperty('max-width', '768px', 'important');
                            el.style.setProperty('width', '100%', 'important');
                            el.style.setProperty('margin-left', 'auto', 'important');
                            el.style.setProperty('margin-right', 'auto', 'important');
                            el.style.setProperty('box-sizing', 'border-box', 'important');
                            if (cls.match(/elicitations-message/i)) {
                                el.style.setProperty('direction', 'rtl', 'important');
                                el.style.setProperty('text-align', 'right', 'important');
                                blockTargets.push(el);
                            }
                        } else if (cls.match(/elicitation-label/i)) {
                            el.style.setProperty('direction', 'rtl', 'important');
                            el.style.setProperty('text-align', 'right', 'important');
                            blockTargets.push(el);
                        } else if (cls.match(/message-content|model-response|response-container/i)) {
                            containerTargets.push(el);
                        } else if (cls.match(/user-query|user-turn|chat-turn|user-query-container/i)) {
                            // Keep turn wrappers in native LTR layout direction
                            el.style.setProperty('direction', 'ltr', 'important');
                        } else if (cls.match(/monaco-chat-request/i)) {
                            el.style.setProperty('direction', 'ltr', 'important');
                        } else if (el.children.length === 0 && el.textContent.trim().length > 0) {
                            blockTargets.push(el);
                        }
                    }
                }

                if (el.shadowRoot) {
                    walkDOM(el.shadowRoot);
                }
            }

            const children = node.children || node.childNodes;
            if (children) {
                for (let i = 0; i < children.length; i++) {
                    walkDOM(children[i]);
                }
            }
        }

        walkDOM(document.body || document.documentElement);

        // 1. Set container-level alignment based on full aggregate text (immune to child code/math poisoning)
        for (let i = 0; i < containerTargets.length; i++) {
            const cEl = containerTargets[i];
            const cText = cEl.textContent;
            if (!cText || !cText.trim()) continue;
            const dir = detectDirection(cText);
            if (dir) {
                cEl.setAttribute('dir', dir);
                cEl.style.setProperty('direction', dir, 'important');
                if (dir === 'rtl') {
                    cEl.style.setProperty('text-align', 'right', 'important');
                }
            }
        }

        // 2. Set individual block-level alignment and list hierarchy
        for (let i = 0; i < blockTargets.length; i++) {
            const el = blockTargets[i];
            const text = el.textContent;
            if (!text || !text.trim()) continue;

            const dir = detectDirection(text);
            if (dir) {
                applyElementDir(el, dir);

                if (el.tagName === 'LI' && dir === 'rtl') {
                    const parentList = el.closest('ul, ol');
                    if (parentList && parentList.getAttribute('dir') !== 'rtl') {
                        parentList.setAttribute('dir', 'rtl');
                        parentList.style.setProperty('direction', 'rtl', 'important');
                        parentList.style.setProperty('text-align', 'right', 'important');
                        parentList.style.setProperty('padding-right', '28px', 'important');
                        parentList.style.setProperty('padding-left', '0', 'important');
                    }
                }
            }
        }
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
    
    const rootTarget = document.body || document.documentElement;
    if (rootTarget) {
        observer.observe(rootTarget, { childList: true, subtree: true, characterData: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body || document.documentElement, { childList: true, subtree: true, characterData: true });
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
