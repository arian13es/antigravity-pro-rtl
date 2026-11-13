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
