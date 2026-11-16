/* SMART RTL PATCH - PRO UI (UNIVERSAL ENGINE) */
(function() {
    // Re-execution guard: the injector can call this script on both 'dom-ready'
    // and 'did-finish-load' for the same document; only the first run may boot.
    if (window.__SMART_RTL_ACTIVE__) return;
    window.__SMART_RTL_ACTIVE__ = true;

    let rtlConfig = { faFont: '', enFont: '', lh: '1.6', fs: '14', isRTL: true, forceRTL: false, fixAtSign: true };
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

    function updateDynamicCSS(faFont, enFont, lh, fs) {
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
            
            /* Universal font application: Antigravity IDE, Standard App, and Gemini Desktop (Strictly text elements) */
            .smart-rtl-text-node, 
            .monaco-chat-request .value, 
            .monaco-chat-response,
            .interactive-input-part,
            .chat-input-part,
            message-content p,
            message-content li,
            .message-content p,
            .message-content li,
            model-response p,
            model-response li,
            model-response blockquote,
            .query-content,
            rich-textarea [contenteditable="true"],
            .text-input-field textarea,
            .elicitations-message,
            .elicitation-label,
            model-response suggestion-chip [class*="text"],
            model-response mat-chip [class*="text"],
            chat-turn suggestion-chip [class*="text"],
            chat-turn mat-chip [class*="text"],
            [class*="conversation-title"][dir="rtl"],
            [class*="history-item"][dir="rtl"],
            [class*="notebook-title"][dir="rtl"],
            p[dir="rtl"],
            li[dir="rtl"],
            h1[dir="rtl"],
            h2[dir="rtl"],
            h3[dir="rtl"],
            h4[dir="rtl"],
            h5[dir="rtl"],
            h6[dir="rtl"],
            blockquote[dir="rtl"],
            td[dir="rtl"],
            th[dir="rtl"] {
                font-family: ${faFontName}, ${enFontStr}var(--font-family, var(--vscode-font-family, system-ui)), "Segoe UI Emoji", sans-serif !important;
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

            /* Directional alignment contracts (Strictly content and text nodes) */
            p[dir="rtl"],
            li[dir="rtl"],
            h1[dir="rtl"],
            h2[dir="rtl"],
            h3[dir="rtl"],
            h4[dir="rtl"],
            h5[dir="rtl"],
            h6[dir="rtl"],
            blockquote[dir="rtl"],
            td[dir="rtl"],
            th[dir="rtl"],
            .smart-rtl-text-node[dir="rtl"],
            .query-content[dir="rtl"],
            [class*="query-content"][dir="rtl"],
            .elicitation-label[dir="rtl"],
            .elicitation-item[dir="rtl"],
            suggestion-chip[dir="rtl"],
            mat-chip[dir="rtl"],
            rich-textarea [contenteditable="true"][dir="rtl"],
            textarea[dir="rtl"],
            input[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }

            p[dir="ltr"],
            li[dir="ltr"],
            h1[dir="ltr"],
            h2[dir="ltr"],
            h3[dir="ltr"],
            h4[dir="ltr"],
            h5[dir="ltr"],
            h6[dir="ltr"],
            blockquote[dir="ltr"],
            td[dir="ltr"],
            th[dir="ltr"],
            .smart-rtl-text-node[dir="ltr"],
            .query-content[dir="ltr"],
            [class*="query-content"][dir="ltr"],
            rich-textarea [contenteditable="true"][dir="ltr"],
            textarea[dir="ltr"],
            input[dir="ltr"] {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }

            ol[dir="rtl"], ul[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                padding-right: 28px !important;
                padding-left: 0 !important;
            }

            /* Lists containing RTL items follow them automatically (CSS-only, no JS) */
            ul:has(> li[dir="rtl"]),
            ol:has(> li[dir="rtl"]) {
                direction: rtl !important;
                text-align: right !important;
                padding-right: 28px !important;
                padding-left: 0 !important;
            }

            /* Mathematical formulas, code blocks and monospace preservation */
            pre, code, kbd, samp, var,
            pre *, code *,
            .monaco-editor .view-lines {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
                font-family: var(--vscode-editor-font-family, Consolas, "Courier New", monospace) !important;
            }

            /* Math renderers (KaTeX, MathJax, Gemini math-block / math-inline, and
               plain-text math fallbacks) keep their NATIVE fonts and a forced LTR
               flow so bidi reordering can never scramble formulas */
            .katex, .katex *,
            .katex-display, .katex-display *,
            mjx-container, mjx-container *,
            math, math *,
            math-block, math-inline, math-display,
            div.math-block, span.math-inline,
            [class*="math-block"], [class*="math-inline"],
            [class*="katex"], [class*="mathjax"],
            span[class*="math"],
            span[class*="formula"] {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }

            code, kbd, samp, var, math-inline, span[class*="math-inline"], [class*="math-inline"] {
                display: inline-block;
                unicode-bidi: isolate !important;
            }

            .katex-display, .katex-display * {
                direction: ltr !important;
                text-align: center !important;
            }

            /* ==========================================================================
               SUGGESTION CHIPS, ELICITATIONS & FOLLOW-UP PROMPTS CONSTRAINTS (SCOPED)
               ========================================================================== */
            elicitations,
            .elicitations-container,
            .elicitations-message,
            model-response suggestion-chips,
            model-response action-chips,
            model-response mat-chip-set,
            chat-turn suggestion-chips,
            chat-turn action-chips,
            chat-turn mat-chip-set,
            elicitations suggestion-chips,
            elicitations action-chips,
            elicitations mat-chip-set,
            .response-container [class*="chip-container"]:not([class*="source-inline-chip"]),
            .response-container [class*="chips"],
            .response-container [class*="suggestions-container"],
            .response-container [class*="followup-container"],
            model-response [class*="chip-container"]:not([class*="source-inline-chip"]),
            model-response [class*="chips"],
            model-response [class*="suggestions-container"],
            model-response [class*="followup-container"],
            chat-turn [class*="chip-container"]:not([class*="source-inline-chip"]),
            chat-turn [class*="chips-container"],
            chat-turn [class*="suggestions-container"],
            chat-turn [class*="followup-container"],
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
                max-width: 768px !important;
                margin-inline-start: auto !important;
                margin-inline-end: auto !important;
                align-self: center !important;
                overflow: visible !important;
            }

            /* Inline attachment chips, citation pills, and file references (e.g. 1000165706.JPG) */
            [class*="file-chip"],
            [class*="attachment-chip"],
            [class*="source-chip"],
            [class*="citation"] {
                width: auto !important;
                max-width: 100% !important;
                display: inline-flex !important;
                align-items: center !important;
                vertical-align: middle !important;
                box-sizing: border-box !important;
            }

            /* File-preview / attachment CARDS keep their native block layout and
               positioning; we only clamp their width so they never overflow */
            [class*="file-preview"],
            [class*="media-preview"],
            [class*="image-preview"],
            [class*="thumbnail"],
            mat-chip:not(.elicitation-item) {
                max-width: 100% !important;
                box-sizing: border-box !important;
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

            /* Suggestion Chips and Actions container flex layout (Strictly scoped to responses) */
            model-response suggestion-chips,
            model-response action-chips,
            model-response mat-chip-set,
            chat-turn suggestion-chips,
            chat-turn action-chips,
            chat-turn mat-chip-set,
            elicitations suggestion-chips,
            elicitations action-chips,
            elicitations mat-chip-set,
            model-response [class*="chip-container"]:not([class*="source-inline-chip"]),
            model-response [class*="chips-container"],
            model-response [class*="suggestion-list"],
            model-response [class*="suggestions-list"],
            chat-turn [class*="chip-container"]:not([class*="source-inline-chip"]),
            chat-turn [class*="chips-container"],
            chat-turn [class*="suggestion-list"],
            chat-turn [class*="suggestions-list"] {
                display: flex !important;
                flex-flow: row wrap !important;
                justify-content: flex-start !important;
                align-items: stretch !important;
                gap: 8px !important;
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

            /* Single inline suggestion chips (like 'Yes ↪' suggestions) - Scoped to responses */
            model-response suggestion-chip,
            chat-turn suggestion-chip,
            chat-turn [class*="suggestion-chip"],
            model-response [class*="suggestion-chip"],
            chat-turn button[class*="suggestion"],
            model-response button[class*="suggestion"],
            elicitations suggestion-chip,
            suggestion-chip[dir="rtl"],
            mat-chip[dir="rtl"] {
                display: inline-flex !important;
                flex-direction: row !important;
                align-items: center !important;
                gap: 6px !important;
                direction: rtl !important;
                text-align: right !important;
                box-sizing: border-box !important;
                white-space: nowrap !important;
                flex: 0 0 auto !important;
            }

            /* Elicitation text label & prompt suggestion icon */
            .elicitation-label,
            model-response suggestion-chip [class*="text"],
            model-response mat-chip [class*="text"],
            chat-turn suggestion-chip [class*="text"] {
                direction: rtl !important;
                text-align: right !important;
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
                .elicitations-container,
                model-response suggestion-chips,
                chat-turn suggestion-chips,
                suggestion-chips,
                action-chips {
                    flex-direction: column !important;
                }
                .elicitation-item {
                    width: 100% !important;
                    flex: 1 1 100% !important;
                    min-width: 0 !important;
                }
            }

            /* Chip buttons flex alignment inside responses */
            model-response [class*="chip-container"]:not([class*="source-inline-chip"]),
            model-response [class*="chips"],
            model-response [class*="suggestion-list"],
            chat-turn [class*="chip-container"]:not([class*="source-inline-chip"]),
            chat-turn [class*="chips"],
            chat-turn [class*="suggestion-list"] {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: wrap !important;
                justify-content: flex-start !important;
                gap: 8px !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                direction: rtl !important;
            }

            /* Inline source-citation chips (uploaded file references such as
               image_x.jpg or doc.pdf rendered inside message text and table
               cells) are inline components in Gemini's native design. They
               must never be stretched into full-width flex rows, which makes
               them overlap neighbouring text lines. */
            source-inline-chip,
            sources-carousel-inline,
            [class*="source-inline-chip"] {
                width: auto !important;
                max-width: 100% !important;
                align-self: auto !important;
            }

            [dir="rtl"] model-response [class*="chip-container"]:not([class*="source-inline-chip"]),
            [dir="rtl"] model-response [class*="chips"],
            [dir="rtl"] chat-turn [class*="chip-container"]:not([class*="source-inline-chip"]),
            [dir="rtl"] chat-turn [class*="chips"] {
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

            /* Every child component inside user-query (query bubbles, actions)
               must maintain strict right-edge alignment flush with each other.
               Attachment / file-preview cards are intentionally NOT listed here:
               they keep their native positioning, which prevents the upload
               preview card from drifting over the message text. */
            user-query > *,
            .user-query > *,
            [class*="user-query"] > *,
            user-query .query-content,
            .user-query .query-content,
            user-query [class*="query-content"],
            .user-query [class*="query-content"],
            .query-content,
            [class*="query-content"],
            .user-query-bubble-with-background,
            user-query [class*="query-container"],
            .user-query [class*="query-container"],
            user-query [class*="bubble"],
            .user-query [class*="bubble"],
            user-query [class*="query-actions"],
            .user-query [class*="query-actions"],
            .monaco-chat-request .value {
                align-self: flex-end !important;
                margin-left: auto !important;
                margin-right: 0 !important;
                margin-inline-start: auto !important;
                margin-inline-end: 0 !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
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

            /* Sidebar conversation titles and notebook text labels: strictly target the text span.
               Excluded from response/chat content: Gemini nests the conversation inside a
               side-nav/side-navigation-v2 wrapper, so an unscoped descendant selector would
               also hit every span inside model-response (including KaTeX math spans) and
               force direction:rtl on formulas with higher specificity than the math LTR rules. */
            [class*="conversation-title"][dir="rtl"],
            [class*="history-item"][dir="rtl"],
            [class*="notebook-title"][dir="rtl"],
            side-navigation-v2 [dir="rtl"] span:not(model-response span):not(chat-turn span):not([class*="katex"]):not([class*="math"]):not([class*="mjx"]),
            side-nav [dir="rtl"] span:not(model-response span):not(chat-turn span):not([class*="katex"]):not([class*="math"]):not([class*="mjx"]) {
                direction: rtl !important;
                text-align: start !important;
                unicode-bidi: isolate !important;
            }

            /* Structural Chrome, Sidebars, and Input Isolation (Protects application layout from inversion) */
            side-navigation-v2,
            side-navigation-v2[dir="rtl"],
            side-nav,
            side-nav[dir="rtl"],
            [class*="side-nav"],
            [class*="side-nav"][dir="rtl"],
            nav,
            nav[dir="rtl"],
            aside,
            aside[dir="rtl"],
            header,
            header[dir="rtl"],
            [role="banner"],
            [role="banner"][dir="rtl"],
            [role="navigation"],
            [role="navigation"][dir="rtl"],
            [role="toolbar"],
            [role="toolbar"][dir="rtl"],
            mat-toolbar,
            mat-toolbar[dir="rtl"],
            .top-bar,
            .top-bar[dir="rtl"],
            [class*="top-bar"],
            [class*="top-bar"][dir="rtl"],
            [class*="header"],
            [class*="header"][dir="rtl"],
            [class*="app-bar"],
            [class*="app-bar"][dir="rtl"],
            [class*="toolbar"],
            [class*="toolbar"][dir="rtl"],
            .conversation-container,
            .conversation-container[dir="rtl"],
            input-area,
            input-area[dir="rtl"],
            .input-area,
            .input-area[dir="rtl"],
            [class*="input-area"],
            [class*="input-area"][dir="rtl"],
            input-container,
            input-container[dir="rtl"],
            [class*="input-container"],
            [class*="input-container"][dir="rtl"],
            [class*="bottom-container"],
            [class*="bottom-container"][dir="rtl"],
            [class*="chat-window-input"],
            [class*="chat-window-input"][dir="rtl"],
            [class*="input-box"],
            [class*="input-box"][dir="rtl"],
            .text-input-field,
            .text-input-field[dir="rtl"],
            [class*="composer"],
            [class*="composer"][dir="rtl"],
            [class*="prompt-box"],
            [class*="prompt-box"][dir="rtl"],
            [class*="pill-container"],
            [class*="pill-container"][dir="rtl"],
            rich-textarea,
            rich-textarea[dir="rtl"],
            [class*="response-actions"],
            [class*="response-actions"][dir="rtl"],
            [class*="actions-area"],
            [class*="actions-area"][dir="rtl"],
            [class*="message-actions"],
            [class*="message-actions"][dir="rtl"] {
                direction: ltr !important;
            }

            /* Protect icons, buttons, and action controls from font corruption, bidi isolation, and inversion */
            mat-icon,
            [class*="mat-icon"],
            [class*="material-symbols"],
            [class*="google-symbols"],
            [class*="google-symbol"],
            [class*="material-icons"],
            .google-symbols,
            .material-symbols-outlined,
            .material-symbols-rounded,
            .material-symbols-sharp,
            button,
            [role="button"],
            [class*="icon-button"],
            [class*="chip__icon"],
            [class*="leading-icon"] {
                direction: ltr !important;
                letter-spacing: normal !important;
                line-height: normal !important;
                white-space: nowrap !important;
                unicode-bidi: normal !important;
            }

            /* Inside input bar, only user Persian text is RTL */
            rich-textarea [contenteditable="true"][dir="rtl"],
            rich-textarea [contenteditable="true"] p[dir="rtl"],
            .text-input-field textarea[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }

            /* ==========================================================================
               MATH LTR SHIELD (final cascade position)
               Gemini nests the whole conversation inside a side-nav/side-navigation-v2
               wrapper, so legacy [dir="rtl"] descendant rules can out-rank the math
               rules above by specificity. This shield repeats the LTR contract at the
               end of the sheet with equal-or-higher specificity, so math renderers
               (KaTeX / MathJax) can never be flipped back to RTL, no matter what
               direction rules precede them.
               ========================================================================== */
            model-response span[class*="katex"], model-response span[class*="katex"] *,
            chat-turn span[class*="katex"], chat-turn span[class*="katex"] *,
            model-response span[class*="math-inline"], model-response span[class*="math-inline"] *,
            chat-turn span[class*="math-inline"], chat-turn span[class*="math-inline"] *,
            model-response span[class*="math-display"], model-response span[class*="math-display"] *,
            chat-turn span[class*="math-display"], chat-turn span[class*="math-display"] *,
            model-response span[class*="mathjax"], model-response span[class*="mathjax"] *,
            chat-turn span[class*="mathjax"], chat-turn span[class*="mathjax"] *,
            model-response mjx-container, model-response mjx-container *,
            chat-turn mjx-container, chat-turn mjx-container * {
                direction: ltr !important;
                unicode-bidi: isolate !important;
                text-align: left !important;
            }

            model-response span.katex-display, chat-turn span.katex-display,
            model-response span[class*="katex-display"], chat-turn span[class*="katex-display"],
            model-response math-display, chat-turn math-display {
                direction: ltr !important;
                unicode-bidi: isolate !important;
                text-align: center !important;
            }
        `;
        if (isRTL) injectStyle('smart-ide-rtl-style', dynamicCSS);
    }
    updateDynamicCSS(rtlConfig.faFont, rtlConfig.enFont, rtlConfig.lh, rtlConfig.fs);

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
            const btnSize = 46;
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
                    lh: lhInput.value,
                    fs: fsInput.value,
                    isRTL, forceRTL, fixAtSign
                }));
            } catch(e) {}
        };

        const onSettingsChange = () => {
            saveConfig();
            if (isRTL) {
                updateDynamicCSS(faFontSelector.getValue(), enFontSelector.getValue(), lhInput.value, fsInput.value);
            }
        };

        toggleBtn.onclick = () => {
            isRTL = !isRTL;
            toggleBtn.className = 'rtl-toggle-btn-reset ' + (isRTL ? 'active' : '');
            saveConfig();
            if (isRTL) {
                dirGeneration++;
                runFullScan();
            } else {
                const s = document.getElementById('smart-ide-rtl-style');
                if (s) s.remove();
                clearAppliedStyles();
            }
        };

        forceBtn.onclick = () => {
            forceRTL = !forceRTL;
            forceBtn.className = 'rtl-toggle-btn-reset ' + (forceRTL ? 'active' : '');
            saveConfig();
            dirGeneration++;
            runFullScan();
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


    /* ==========================================================================
       INCREMENTAL DIRECTION ENGINE
       - The full document is scanned only once (startup and toggle changes).
       - Runtime mutations re-scan ONLY the mutated nodes, never the whole DOM.
       - Per-element decisions are memoized, so inline styles are rewritten only
         when an element's content actually changes. This removes the old
         per-keystroke and per-1.5s full-DOM walks that caused input and
         streaming lag.
       ========================================================================== */
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

    const SKIP_TAGS = ['PRE', 'CODE', 'SVG', 'MATH', 'SCRIPT', 'STYLE', 'MAT-ICON', 'I'];
    const CHROME_SELECTOR = 'header, [role="banner"], [role="navigation"], [role="toolbar"], mat-toolbar, .top-bar, [class*="top-bar"], [class*="header"], [class*="app-bar"], [class*="toolbar"], [class*="input-area"], [class*="bottom-container"], input-area, rich-textarea, [class*="pill-container"], input-container, [class*="input-container"], chat-window, [class*="composer"], [class*="chat-input"], [class*="prompt"], side-navigation-v2, side-nav, [class*="side-nav"], nav, aside';

    // Bumped when forceRTL changes so memoized decisions are recomputed.
    let dirGeneration = 0;

    // Per-element memo of the text signature, direction decision and applied
    // layout key. Elements are only re-styled when something really changed.
    const nodeState = new WeakMap();
    function stateFor(el) {
        let s = nodeState.get(el);
        if (!s) {
            s = {};
            nodeState.set(el, s);
        }
        return s;
    }

    function decideDir(el) {
        let text;
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            text = el.value;
        } else {
            text = el.textContent;
        }
        if (!text || !text.trim()) return null;
        const s = stateFor(el);
        if (s.gen === dirGeneration && s.text === text) return s.decision;
        s.gen = dirGeneration;
        s.text = text;
        s.decision = detectDirection(text);
        return s.decision;
    }

    function applyElementDir(el, dir) {
        if (!dir) return;
        const s = stateFor(el);
        if (s.dir === dir && el.getAttribute('dir') === dir) return;
        s.dir = dir;

        if (!el.classList.contains('smart-rtl-text-node')) {
            el.classList.add('smart-rtl-text-node');
        }
        el.setAttribute('dir', dir);
        el.style.setProperty('direction', dir, 'important');
        el.style.setProperty('text-align', dir === 'rtl' ? 'right' : 'left', 'important');
        el.style.setProperty('unicode-bidi', 'isolate', 'important');

        // If inside user-query or a query bubble, enforce right-edge flush alignment
        if (el.closest('user-query, .user-query, [class*="user-query"], [class*="user-turn"], .monaco-chat-request')) {
            el.classList.add('smart-rtl-layout');
            el.style.setProperty('align-self', 'flex-end', 'important');
            el.style.setProperty('margin-left', 'auto', 'important');
            el.style.setProperty('margin-right', '0', 'important');
        }
    }

    function applyLayoutStyles(el, key, props) {
        const s = stateFor(el);
        if (s.layoutKey === key) return;
        s.layoutKey = key;
        el.classList.add('smart-rtl-layout');
        for (let i = 0; i < props.length; i++) {
            el.style.setProperty(props[i][0], props[i][1], 'important');
        }
    }

    function processElement(el) {
        // Returns false when the whole subtree can be pruned from the walk.
        if (el.classList && el.classList.contains('rtl-widget-container')) return false;

        const tag = el.tagName;
        // SVG/MathML elements use lowercase tag names; prune their subtrees too.
        if (tag === 'svg' || tag === 'math') return false;
        if (SKIP_TAGS.includes(tag)) return false;

        const clsStr = typeof el.className === 'string' ? el.className : '';
        if (clsStr.includes('google-symbols') ||
            clsStr.includes('google-symbol') ||
            clsStr.includes('material-symbols') ||
            clsStr.includes('material-icons') ||
            clsStr.includes('mat-icon') ||
            clsStr.includes('icon-button') ||
            clsStr.includes('chip__icon') ||
            clsStr.includes('katex') ||
            clsStr.includes('math-block') ||
            clsStr.includes('math-inline') ||
            clsStr.includes('mathjax') ||
            clsStr.includes('mjx') ||
            clsStr.includes('monaco-editor')) return false;

        // Layout-only containers: their styling is fully handled by the injected CSS.
        if (tag === 'ELICITATIONS' || tag === 'SUGGESTION-CHIPS' || tag === 'ACTION-CHIPS' || (el.classList && el.classList.contains('elicitations-container'))) {
            return true;
        }

        // Suggestion / elicitation cards: RTL only when their own text is Persian.
        if ((tag === 'BUTTON' && el.classList && el.classList.contains('elicitation-item')) || tag === 'SUGGESTION-CHIP' || tag === 'MAT-CHIP' || (el.classList && el.classList.contains('suggestion-chip'))) {
            if (el.closest('model-response, chat-turn, elicitations, [class*="elicitations"]')) {
                if (decideDir(el) === 'rtl') {
                    applyLayoutStyles(el, 'chip-rtl', [['direction', 'rtl'], ['text-align', 'right'], ['box-sizing', 'border-box']]);
                }
            }
            return true;
        }

        let candidate = false;

        if (['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'TD', 'TH'].includes(tag)) {
            candidate = true;
        } else if (['SPAN', 'A', 'LABEL'].includes(tag) && el.children.length === 0 && el.textContent.trim().length > 0) {
            if (!el.closest(CHROME_SELECTOR)) {
                candidate = true;
            }
        } else if (el.getAttribute('contenteditable') === 'true' || tag === 'TEXTAREA') {
            candidate = true;
        } else if (tag === 'INPUT' && (!el.type || el.type === 'text' || el.type === 'search')) {
            candidate = true;
        } else if (tag === 'DIV') {
            const cls = clsStr;
            if (cls.match(/query-content|user-query-content/i)) {
                applyLayoutStyles(el, 'query-content', [['align-self', 'flex-end'], ['margin-left', 'auto'], ['margin-right', '0']]);
                candidate = true;
            } else if (cls.match(/file-preview|attachment|media-preview|image-preview/i)) {
                // Attachment cards keep their native positioning; only clamp width
                // so they can never overflow the message column.
                if (el.closest('user-query, .user-query, [class*="user-query"], [class*="user-turn"], .monaco-chat-request')) {
                    applyLayoutStyles(el, 'user-attachment', [['max-width', '100%']]);
                }
            } else if (cls.match(/query-actions/i)) {
                if (el.closest('user-query, .user-query, [class*="user-query"], [class*="user-turn"], .monaco-chat-request')) {
                    applyLayoutStyles(el, 'query-actions', [['align-self', 'flex-end'], ['margin-left', 'auto'], ['margin-right', '0'], ['display', 'flex'], ['justify-content', 'flex-end']]);
                }
            } else if (cls.match(/elicitation-label|elicitations-message/i)) {
                applyLayoutStyles(el, 'elicitation-text', [['direction', 'rtl'], ['text-align', 'right']]);
                candidate = true;
            } else if (el.children.length === 0 && el.textContent.trim().length > 0) {
                if (!el.closest(CHROME_SELECTOR)) {
                    candidate = true;
                }
            }
        }

        if (candidate && el.closest('button:not(.elicitation-item), [role="button"]:not(.elicitation-item), [class*="icon-button"]')) {
            return true;
        }

        if (candidate) {
            applyElementDir(el, decideDir(el));
        }

        return true;
    }

    // Iterative walk with early pruning (SVG, code, math, Monaco editor, icons,
    // widget) so even the initial scan stays fast on large workbench DOM trees.
    function walkSubtree(root) {
        if (!root) return;
        const stack = [root];
        while (stack.length > 0) {
            const node = stack.pop();
            if (!node || node.nodeType !== Node.ELEMENT_NODE) continue;
            if (!processElement(node)) continue;
            const children = node.children;
            if (children) {
                for (let i = 0; i < children.length; i++) stack.push(children[i]);
            }
            if (node.shadowRoot) {
                const shadowChildren = node.shadowRoot.children;
                if (shadowChildren) {
                    for (let i = 0; i < shadowChildren.length; i++) stack.push(shadowChildren[i]);
                }
            }
        }
    }

    function runFullScan() {
        if (!isRTL) return;
        walkSubtree(document.body || document.documentElement);
    }

    function clearAppliedStyles() {
        const styled = document.querySelectorAll('.smart-rtl-text-node, .smart-rtl-layout');
        for (let i = 0; i < styled.length; i++) {
            const el = styled[i];
            el.classList.remove('smart-rtl-text-node');
            el.classList.remove('smart-rtl-layout');
            el.removeAttribute('dir');
            const props = ['direction', 'text-align', 'unicode-bidi', 'align-self', 'margin-left', 'margin-right', 'display', 'justify-content', 'box-sizing'];
            for (let j = 0; j < props.length; j++) el.style.removeProperty(props[j]);
        }
    }

    if (document.body) runFullScan();
    else document.addEventListener('DOMContentLoaded', runFullScan);

    // Runtime updates: only the mutated subtrees are re-scanned, batched per frame.
    const pendingNodes = new Set();
    let flushScheduled = false;

    function scheduleNode(node) {
        pendingNodes.add(node);
        if (flushScheduled) return;
        flushScheduled = true;
        requestAnimationFrame(() => {
            flushScheduled = false;
            const batch = Array.from(pendingNodes);
            pendingNodes.clear();
            for (let i = 0; i < batch.length; i++) {
                let target = batch[i];
                if (target && target.nodeType === Node.TEXT_NODE) target = target.parentElement;
                if (!target || target.nodeType !== Node.ELEMENT_NODE) continue;
                walkSubtree(target);
            }
        });
    }

    const observer = new MutationObserver((mutations) => {
        if (!isRTL) return;
        for (let i = 0; i < mutations.length; i++) {
            const m = mutations[i];
            if (m.type === 'characterData') {
                if (m.target.parentElement) scheduleNode(m.target.parentElement);
            } else {
                const added = m.addedNodes;
                for (let j = 0; j < added.length; j++) scheduleNode(added[j]);
            }
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

    // Textarea/input value edits do not emit DOM mutations, so they need their
    // own listener. It is O(1) per keystroke instead of a full-document walk.
    document.addEventListener('input', (e) => {
        if (!isRTL) return;
        const el = e.target;
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            applyElementDir(el, detectDirection(el.value));
        }
    }, { capture: true });

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.code === 'KeyR') {
            const toggle = document.getElementById('rtl-toggle-btn');
            if (toggle) toggle.click();
        }
        if (fixAtSign && e.code === 'Digit2' && e.shiftKey && (e.key === '٬' || e.key === '،')) {
            const active = document.activeElement;
            const editable = active && (active.isContentEditable || active.tagName === 'TEXTAREA' || (active.tagName === 'INPUT' && (!active.type || active.type === 'text' || active.type === 'search')));
            if (editable && !(active.closest && active.closest('.monaco-editor'))) {
                e.preventDefault();
                document.execCommand('insertText', false, '@');
            }
        }
    }, { capture: true });

})();
