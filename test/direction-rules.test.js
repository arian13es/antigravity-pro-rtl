import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('ide-payload.js includes user query anchoring and alignment rules', () => {
    const payloadPath = path.join(__dirname, '..', 'bin', 'ide-payload.js');
    const content = fs.readFileSync(payloadPath, 'utf8');

    // 1. User query container styling (preserves native LTR layout direction)
    assert.match(content, /user-query-container/);
    assert.match(content, /direction:\s*ltr\s*!important/);

    // 2. Query content text formatting and strict flush right alignment
    assert.match(content, /\.query-content\[dir="rtl"\]/);
    assert.match(content, /text-align:\s*right\s*!important/);
    assert.match(content, /unicode-bidi:\s*isolate\s*!important/);
    assert.match(content, /align-self:\s*flex-end\s*!important/);
    assert.match(content, /margin-left:\s*auto\s*!important/);
    assert.match(content, /margin-right:\s*0\s*!important/);

    // 3. User query container flex column setup
    assert.match(content, /align-items:\s*flex-end\s*!important/);
    assert.match(content, /flex-direction:\s*column\s*!important/);

    // 4. walkDOM excludes user-query and chat-turn from containerTargets
    assert.doesNotMatch(content, /\['MESSAGE-CONTENT',\s*'MODEL-RESPONSE',\s*'USER-QUERY'\]/);

    // 5. Suggestion containers and chips stay constrained to center column
    assert.match(content, /followup-container/);
    assert.match(content, /max-width:\s*768px\s*!important/);
});

test('direction classification heuristic correctly categorizes technical Persian prompts', () => {
    const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/g;
    const LTR_REGEX = /[A-Za-z]/g;

    function detectDirection(text) {
        if (!text) return null;
        const clean = text.replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
        if (!clean) return null;

        const rtlMatches = clean.match(RTL_REGEX);
        const ltrMatches = clean.match(LTR_REGEX);

        const rtlCount = rtlMatches ? rtlMatches.length : 0;
        const ltrCount = ltrMatches ? ltrMatches.length : 0;

        if (rtlCount === 0 && ltrCount === 0) return null;

        if (rtlCount > 0 && (rtlCount >= ltrCount * 0.25 || rtlCount >= 3)) {
            return 'rtl';
        }

        if (ltrCount > 0) {
            return 'ltr';
        }

        return null;
    }

    // The user's actual prompt from the screenshot:
    const userPrompt = 'کتاب اینجوری گفته و من نفهمیدم خب قطب سیستم میشه -a نه a';
    assert.equal(detectDirection(userPrompt), 'rtl');

    // Assistant technical Persian with math
    const assistantIntro = 'سیستم مرتبه اول (First-Order System) ساده‌ترین نوع سیستم دینامیکی است G(s) = K / (Ts + 1)';
    assert.equal(detectDirection(assistantIntro), 'rtl');

    // Pure English prompt
    const englishPrompt = 'Can you calculate the step response for this transfer function?';
    assert.equal(detectDirection(englishPrompt), 'ltr');
});

test('ide-payload.js enforces elicitations layout, suggestion cards, and model attachment isolation', () => {
    const payloadPath = path.join(__dirname, '..', 'bin', 'ide-payload.js');
    const content = fs.readFileSync(payloadPath, 'utf8');

    // 1. Universal font application includes elicitation tags
    assert.match(content, /elicitations/);
    assert.match(content, /\.elicitations-container/);
    assert.match(content, /\.elicitations-message/);
    assert.match(content, /\.elicitation-item/);
    assert.match(content, /\.elicitation-label/);

    // 2. Center column constraints for elicitations and model response attachments
    assert.match(content, /model-response \.attachment-container/);
    assert.match(content, /message-content \.attachment-container/);
    assert.match(content, /\.attachment-container\.md-has-block-component/);

    // 3. Elicitations container flex layout (RTL, wrap, gap, max-width)
    assert.match(content, /\.elicitations-container\s*\{[^}]*flex-flow:\s*row wrap\s*!important/);
    assert.match(content, /\.elicitations-container\s*\{[^}]*direction:\s*rtl\s*!important/);
    assert.match(content, /\.elicitations-container\s*\{[^}]*gap:\s*12px\s*!important/);
    assert.match(content, /\.elicitations-container\s*\{[^}]*max-width:\s*768px\s*!important/);

    // 4. Individual suggestion card buttons (elicitation-item) sizing and wrapping
    assert.match(content, /\.elicitation-item\s*\{[^}]*flex:\s*1 1 calc\(33\.333% - 12px\)\s*!important/);
    assert.match(content, /\.elicitation-item\s*\{[^}]*min-width:\s*180px\s*!important/);
    assert.match(content, /\.elicitation-item\s*\{[^}]*direction:\s*rtl\s*!important/);
    assert.match(content, /\.elicitation-item\s*\{[^}]*word-break:\s*break-word\s*!important/);

    // 5. Responsive column stacking on narrow viewports
    assert.match(content, /@media\s*\(max-width:\s*768px\)/);
    assert.match(content, /flex-direction:\s*column\s*!important/);

    // 6. walkDOM scopes attachment alignment strictly to user queries and isolates model attachments
    assert.match(content, /el\.closest\('user-query,\s*\.user-query/);
    assert.match(content, /el\.closest\('model-response,\s*message-content/);
    assert.match(content, /tag === 'ELICITATIONS'/);
    assert.match(content, /tag === 'BUTTON' && el\.classList && el\.classList\.contains\('elicitation-item'\)/);
});

test('ide-payload.js preserves code blocks, KaTeX math, user attachments, and settings widget', () => {
    const payloadPath = path.join(__dirname, '..', 'bin', 'ide-payload.js');
    const content = fs.readFileSync(payloadPath, 'utf8');

    // 1. Monospace & Code Block Preservation
    assert.match(content, /pre,\s*code,\s*kbd,\s*samp/);
    assert.match(content, /\.monaco-editor \.view-lines/);
    assert.match(content, /direction:\s*ltr\s*!important/);
    assert.match(content, /text-align:\s*left\s*!important/);
    assert.match(content, /unicode-bidi:\s*isolate\s*!important/);
    assert.match(content, /\['PRE',\s*'CODE',\s*'SVG',\s*'MATH',\s*'SCRIPT',\s*'STYLE'\]\.includes\(tag\)/);

    // 2. KaTeX & Mathematical Formula Preservation
    assert.match(content, /\.katex,\s*\.katex\s*\*/);
    assert.match(content, /mjx-container,\s*mjx-container\s*\*/);
    assert.match(content, /\.katex-display,\s*\.katex-display\s*\*/);
    assert.match(content, /text-align:\s*center\s*!important/);
    assert.match(content, /el\.classList\.contains\('katex'\)/);

    // 3. User Attachment vs Model Attachment Scoping
    assert.match(content, /cls\.match\(\/file-preview\|attachment\|media-preview\|image-preview\/i\)/);
    assert.match(content, /el\.style\.setProperty\('align-self',\s*'flex-end',\s*'important'\)/);
    assert.match(content, /el\.style\.setProperty\('margin-left',\s*'auto',\s*'important'\)/);
    assert.match(content, /el\.style\.setProperty\('margin-right',\s*'0',\s*'important'\)/);
    assert.match(content, /el\.style\.setProperty\('align-self',\s*'center',\s*'important'\)/);

    // 4. Settings Widget UI & Interaction Architecture
    assert.match(content, /\.rtl-widget-container/);
    assert.match(content, /position:\s*fixed/);
    assert.match(content, /z-index:\s*9999999/);
    assert.match(content, /\.rtl-widget-panel/);
    assert.match(content, /\.rtl-widget-panel\.open/);
    assert.match(content, /rtl-widget-trigger/);
    assert.match(content, /smart-rtl-config/);
    assert.match(content, /e\.altKey\s*&&\s*e\.code === 'KeyR'/);
    assert.match(content, /fixAtSign/);
});
