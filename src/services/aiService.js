/**
 * aiService.js
 * บริการเชื่อมต่อ AI API รองรับ Multi-Key Pool, Round-Robin Load Balancer,
 * และการสลับ/Failover ระหว่าง Groq Cloud และ Google Gemini อัตโนมัติ
 */

// หมุน Index เริ่มต้นแบบสุ่มเพื่อกระจายโหลดทันทีที่เปิดแอป
let currentGeminiKeyIndex = Math.floor(Math.random() * 10);
let currentGroqKeyIndex = Math.floor(Math.random() * 10);

// ============================================================================
// 1. JSON & Response Parsing Helper (Safe Markdown & Thought Tag Stripping)
// ============================================================================

/**
 * ตัวแปลงและดึง JSON Object จากผลลัพธ์ของ AI อย่างปลอดภัย 100%
 * รองรับโมเดลที่มี reasoning (<think>, <thought>), markdown codeblocks, หรือข้อความเกริ่นนำ
 */
export const parseAiJsonResponse = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. ลบ thought/reasoning tags ที่โมเดลสมัยใหม่ (DeepSeek, Compound, Qwen) มักแทรกเข้ามา
  let cleaned = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // 2. ลองแปลงโดยตรง
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // ดำเนินการต่อด้วยการสกัดหา Pattern
  }

  // 3. ใช้ Regex ค้นหาขอบเขตของ JSON Object ตัวแรก {...}
  const matchObj = cleaned.match(/\{[\s\S]*\}/);
  if (matchObj) {
    try {
      return JSON.parse(matchObj[0]);
    } catch (e) {
      // ลองทำความสะอาด trailing commas หรือ characters ที่ผิดปกติ
      try {
        const fixed = matchObj[0]
          .replace(/,\s*([\}\]])/g, '$1') // ตัด trailing comma
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // ตัด control characters
        return JSON.parse(fixed);
      } catch (e2) {
        console.warn('[AI Service] Regex JSON parse error:', e2);
      }
    }
  }

  // 4. ใช้ Regex ค้นหาขอบเขตของ JSON Array [...]
  const matchArr = cleaned.match(/\[[\s\S]*\]/);
  if (matchArr) {
    try {
      return JSON.parse(matchArr[0]);
    } catch (e) {
      console.warn('[AI Service] Array JSON parse error:', e);
    }
  }

  return null;
};

// ============================================================================
// 2. Key Pool & Load Balancer Helpers
// ============================================================================

/** ดึงรายชื่อ Groq API Keys ทั้งหมดที่มีและตัดคีย์ซ้ำ/คีย์ว่าง */
export const getGroqApiKeys = () => {
  const localKey = typeof localStorage !== 'undefined' ? (localStorage.getItem('meals_cal_groq_key') || '') : '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GROQ_API_KEY : '') || '';
  const envKeys = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEYS : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GROQ_API_KEYS : '') || '';
  const k1 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY_1 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GROQ_API_KEY_1 : '') || '';
  const k2 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY_2 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GROQ_API_KEY_2 : '') || '';
  const k3 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY_3 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GROQ_API_KEY_3 : '') || '';
  const k4 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY_4 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GROQ_API_KEY_4 : '') || '';
  const k5 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY_5 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GROQ_API_KEY_5 : '') || '';

  const parsed = [localKey, envKey, ...envKeys.split(','), k1, k2, k3, k4, k5]
    .map(k => (typeof k === 'string' ? k.trim() : ''))
    .filter(k => k && !k.includes('your_groq_api_key'));

  return [...new Set(parsed)];
};

/** หมุนเวียนคีย์ Groq แบบ Round-Robin */
export const getRotatedGroqKeyList = () => {
  const keys = getGroqApiKeys();
  if (keys.length <= 1) return keys;
  const rotated = [];
  const startIndex = currentGroqKeyIndex % keys.length;
  currentGroqKeyIndex = (currentGroqKeyIndex + 1) % keys.length;
  for (let i = 0; i < keys.length; i++) {
    rotated.push(keys[(startIndex + i) % keys.length]);
  }
  return rotated;
};

/** ดึงรายชื่อ Gemini API Keys ทั้งหมดที่มี */
export const getGeminiApiKeys = () => {
  const localKey = typeof localStorage !== 'undefined' ? (localStorage.getItem('meals_cal_gemini_key') || '') : '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GEMINI_API_KEY : '') || '';
  const envKeys = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEYS : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GEMINI_API_KEYS : '') || '';
  const k1 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY_1 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GEMINI_API_KEY_1 : '') || '';
  const k2 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY_2 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GEMINI_API_KEY_2 : '') || '';
  const k3 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY_3 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GEMINI_API_KEY_3 : '') || '';
  const k4 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY_4 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GEMINI_API_KEY_4 : '') || '';
  const k5 = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY_5 : '') || (typeof process !== 'undefined' && process.env ? process.env.VITE_GEMINI_API_KEY_5 : '') || '';

  const parsed = [localKey, envKey, ...envKeys.split(','), k1, k2, k3, k4, k5]
    .map(k => (typeof k === 'string' ? k.trim() : ''))
    .filter(k => k && !k.includes('your_gemini_api_key'));

  return [...new Set(parsed)];
};

/** หมุนเวียนคีย์ Gemini แบบ Round-Robin */
export const getRotatedGeminiKeyList = () => {
  const keys = getGeminiApiKeys();
  if (keys.length <= 1) return keys;
  const rotated = [];
  const startIndex = currentGeminiKeyIndex % keys.length;
  currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % keys.length;
  for (let i = 0; i < keys.length; i++) {
    rotated.push(keys[(startIndex + i) % keys.length]);
  }
  return rotated;
};

// ============================================================================
// 3. Fetch with Timeout Controller (รองรับการอัปโหลดรูปภาพและการประมวลผล AI)
// ============================================================================
export const fetchWithTimeout = async (url, options = {}, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

// ============================================================================
// 4. Groq Cloud API Caller (High-Speed LLM Inference)
// ============================================================================
export const callGroqChatApi = async ({
  userText,
  systemPrompt = '',
  chatHistory = [],
  temperature = 0.3,
  maxTokens = 1000,
  responseFormat = null
}) => {
  const keys = getRotatedGroqKeyList();
  if (!keys || keys.length === 0) return null;

  // เตรียมข้อความรูปแบบ OpenAI / Groq
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  // ประวัติการแชท (ย้อนหลัง 4 ข้อความ)
  for (const m of (chatHistory || []).slice(-4)) {
    if (m.sender === 'user' || m.role === 'user') {
      messages.push({ role: 'user', content: m.text || m.content });
    } else if (m.sender === 'ai' || m.role === 'assistant') {
      messages.push({ role: 'assistant', content: m.text || m.content });
    }
  }

  if (
    messages.length === 0 ||
    messages[messages.length - 1].role !== 'user' ||
    messages[messages.length - 1].content !== (userText || '').trim()
  ) {
    if (userText && userText.trim()) {
      messages.push({ role: 'user', content: userText.trim() });
    }
  }

  // รายชื่อโมเดล Groq ที่เปิดใช้งานและตอบ JSON ได้รวดเร็วและแม่นยำที่สุด
  const fastModels = [
    'groq/compound-mini',
    'groq/compound',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b'
  ];

  for (const key of keys) {
    if (!key || !key.trim()) continue;
    for (const model of fastModels) {
      try {
        const bodyPayload = {
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        };

        if (responseFormat === 'json' || responseFormat === 'json_object') {
          bodyPayload.response_format = { type: 'json_object' };
        }

        const resp = await fetchWithTimeout(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key.trim()}`
            },
            body: JSON.stringify(bodyPayload)
          },
          12000 // Timeout 12 วินาที
        );

        if (resp.ok) {
          const data = await resp.json();
          let reply = data.choices?.[0]?.message?.content || '';
          reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
          if (reply) {
            return {
              text: reply,
              provider: 'groq',
              model
            };
          }
        } else if (resp.status === 429) {
          console.warn(`[Groq API] Key ...${key.slice(-6)} ติด Rate limit (429), สลับไปยังคีย์ถัดไป`);
          break; // ข้ามไปลอง Key ถัดไป
        } else {
          const errText = await resp.text();
          console.warn(`[Groq API] Model ${model} HTTP ${resp.status}:`, errText);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn(`[Groq API] Model ${model} ใช้เวลานานเกินกำหนด กำลัง Failover...`);
        } else {
          console.warn(`[Groq API] Request error on ${model}:`, err);
        }
      }
    }
  }

  return null;
};

// ============================================================================
// 5. Google Gemini API Caller (Google AI Studio)
// ============================================================================
export const callGeminiChatApi = async ({
  userText,
  systemPrompt = '',
  chatHistory = [],
  temperature = 0.3,
  maxTokens = 1200,
  responseFormat = null
}) => {
  const keys = getRotatedGeminiKeyList();
  if (!keys || keys.length === 0) return null;

  const contents = [];
  for (const m of (chatHistory || []).slice(-4)) {
    if (m.sender === 'user' || m.role === 'user') {
      contents.push({ role: 'user', parts: [{ text: m.text || m.content }] });
    } else if (m.sender === 'ai' || m.role === 'model' || m.role === 'assistant') {
      contents.push({ role: 'model', parts: [{ text: m.text || m.content }] });
    }
  }

  if (
    contents.length === 0 ||
    contents[contents.length - 1].role !== 'user' ||
    contents[contents.length - 1].parts[0].text !== (userText || '').trim()
  ) {
    if (userText && userText.trim()) {
      contents.push({ role: 'user', parts: [{ text: userText.trim() }] });
    }
  }

  const payload = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: Math.max(maxTokens, 2048),
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  };

  if (responseFormat === 'json' || responseFormat === 'json_object') {
    payload.generationConfig.responseMimeType = 'application/json';
  }

  if (systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  // รายชื่อโมเดล Google Gemini ที่เปิดใช้งานและทดสอบสำเร็จ
  const validModels = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest'
  ];

  for (const key of keys) {
    for (const model of validModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.trim()}`;
        const resp = await fetchWithTimeout(
          url,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          },
          12000 // Timeout 12 วินาที
        );

        if (resp.ok) {
          const data = await resp.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          const replyText =
            parts.filter(p => !p.thought && p.text).map(p => p.text).join('\n') ||
            parts[parts.length - 1]?.text;

          if (replyText && replyText.trim()) {
            return {
              text: replyText.trim(),
              provider: 'gemini',
              model
            };
          }
        } else if (resp.status === 429) {
          console.warn(`[Gemini API] Key ...${key.slice(-6)} ติด Rate limit (429), สลับไปยังคีย์ถัดไป`);
          break;
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn(`[Gemini API] Model ${model} ตอบช้าเกินกำหนด กำลัง Failover...`);
        }
      }
    }
  }

  return null;
};

// ============================================================================
// 6. Central AI Dispatcher (Groq Cloud <-> Google Gemini Flash)
// ============================================================================
export const isGroqActive = () => {
  if (typeof localStorage !== 'undefined') {
    const userPref = localStorage.getItem('meals_cal_active_ai_provider');
    if (userPref === 'groq') return true;
    if (userPref === 'gemini') return false;
  }
  const isGroqEnv = import.meta.env?.VITE_IS_GROQ || '';
  return String(isGroqEnv).toLowerCase() !== 'false' && String(isGroqEnv) !== '0';
};

export const setActiveAiProvider = (provider) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('meals_cal_active_ai_provider', provider === 'gemini' ? 'gemini' : 'groq');
  }
};

export const getActiveAiProviderName = () => {
  return isGroqActive() ? 'Groq Cloud' : 'Google Gemini';
};

export const callAiChat = async ({
  userText,
  systemPrompt = '',
  chatHistory = [],
  temperature = 0.3,
  maxTokens = 1000,
  responseFormat = null
}) => {
  const isGroqPrimary = isGroqActive();

  if (isGroqPrimary) {
    // 🥇 Tier 1: Groq Cloud (หลัก)
    try {
      const groqReply = await callGroqChatApi({
        userText,
        systemPrompt,
        chatHistory,
        temperature,
        maxTokens,
        responseFormat
      });
      if (groqReply) return groqReply;
    } catch (err) {
      console.warn('[AI Service] Groq error, กำลังสลับไป Gemini...', err);
    }

    // 🥈 Tier 2: Google Gemini (สำรอง)
    try {
      console.warn('[AI Service] Groq คีย์หมดหรือตอบช้า -> สลับใช้งาน Gemini...');
      const geminiReply = await callGeminiChatApi({
        userText,
        systemPrompt,
        chatHistory,
        temperature,
        maxTokens,
        responseFormat
      });
      if (geminiReply) return geminiReply;
    } catch (err) {
      console.warn('[AI Service] Gemini fallback error:', err);
    }
  } else {
    // 🥇 Tier 1: Gemini (เมื่อ VITE_IS_GROQ=false หรือผู้ใช้เลือก Gemini)
    try {
      const geminiReply = await callGeminiChatApi({
        userText,
        systemPrompt,
        chatHistory,
        temperature,
        maxTokens,
        responseFormat
      });
      if (geminiReply) return geminiReply;
    } catch (err) {
      console.warn('[AI Service] Gemini error, กำลังสลับไป Groq...', err);
    }

    // 🥈 Tier 2: Groq Cloud (สำรอง)
    try {
      console.warn('[AI Service] Gemini คีย์หมด -> สลับใช้งาน Groq...');
      const groqReply = await callGroqChatApi({
        userText,
        systemPrompt,
        chatHistory,
        temperature,
        maxTokens,
        responseFormat
      });
      if (groqReply) return groqReply;
    } catch (err) {
      console.warn('[AI Service] Groq fallback error:', err);
    }
  }

  return null;
};

// ============================================================================
// 7. Gemini Vision OCR (สำหรับสแกนรูปภาพ / อาหาร)
// ============================================================================
export const callGeminiVisionApi = async ({
  prompt,
  base64Data,
  mimeType = 'image/jpeg'
}) => {
  const keys = getRotatedGeminiKeyList();
  if (!keys || keys.length === 0) return null;

  const visionModels = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash'
  ];

  for (const key of keys) {
    if (!key || !key.trim()) continue;
    for (const model of visionModels) {
      try {
        const resp = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    { inlineData: { mimeType, data: base64Data } }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json',
                maxOutputTokens: 4096,
                thinkingConfig: {
                  thinkingBudget: 0
                }
              }
            })
          },
          45000 // Timeout 45 วินาที (เพียงพอสำหรับการอัปโหลดและวิเคราะห์รูปภาพ)
        );

        if (resp.ok) {
          const data = await resp.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          let rawText =
            parts.filter(p => !p.thought && p.text).map(p => p.text).join('\n') ||
            parts[0]?.text ||
            '';
          if (rawText && rawText.trim()) {
            return {
              rawText: rawText.trim(),
              model,
              provider: 'gemini'
            };
          }
        } else if (resp.status === 429) {
          console.warn(`[Gemini API] Key ...${key.slice(-6)} Rate limited (429), สลับคีย์ถัดไป`);
          break; // สลับ Key ถัดไป
        } else {
          const errText = await resp.text();
          console.warn(`[Gemini Vision] Model ${model} HTTP ${resp.status}:`, errText);
        }
      } catch (err) {
        console.warn(`[Vision API] Model ${model} error:`, err);
      }
    }
  }

  return null;
};

// ============================================================================
// 8. Unified AI Vision Dispatcher (Google Gemini Flash Vision)
// ============================================================================
export const callAiVisionApi = async ({ prompt, base64Data, mimeType = 'image/jpeg' }) => {
  try {
    const geminiVision = await callGeminiVisionApi({ prompt, base64Data, mimeType });
    if (geminiVision) return geminiVision;
  } catch (err) {
    console.warn('[AI Service] Gemini Vision error:', err);
  }

  return null;
};

// ============================================================================
// 9. AI Connection Health Check & Diagnostics
// ============================================================================
export const testAiServiceConnection = async (provider = 'all') => {
  const results = {
    groq: { status: 'untested', latency: 0, model: '', message: '' },
    gemini: { status: 'untested', latency: 0, model: '', message: '' }
  };

  if (provider === 'all' || provider === 'groq') {
    const startTime = Date.now();
    try {
      const groqRes = await callGroqChatApi({
        userText: 'Hello',
        systemPrompt: 'Respond with JSON: {"status":"ok"}',
        maxTokens: 50,
        responseFormat: 'json'
      });
      const latency = Date.now() - startTime;
      if (groqRes && groqRes.text) {
        results.groq = {
          status: 'online',
          latency,
          model: groqRes.model,
          message: `เชื่อมต่อสำเร็จ (${latency}ms) - ${groqRes.model}`
        };
      } else {
        results.groq = {
          status: 'error',
          latency,
          model: '',
          message: 'ไม่พบคีย์ Groq หรือ API ไม่ตอบสนอง'
        };
      }
    } catch (e) {
      results.groq = {
        status: 'error',
        latency: Date.now() - startTime,
        model: '',
        message: e.message || 'ข้อผิดพลาดในการเชื่อมต่อ'
      };
    }
  }

  if (provider === 'all' || provider === 'gemini') {
    const startTime = Date.now();
    try {
      const geminiRes = await callGeminiChatApi({
        userText: 'Hello',
        systemPrompt: 'Respond with JSON: {"status":"ok"}',
        maxTokens: 50,
        responseFormat: 'json'
      });
      const latency = Date.now() - startTime;
      if (geminiRes && geminiRes.text) {
        results.gemini = {
          status: 'online',
          latency,
          model: geminiRes.model,
          message: `เชื่อมต่อสำเร็จ (${latency}ms) - ${geminiRes.model}`
        };
      } else {
        results.gemini = {
          status: 'error',
          latency,
          model: '',
          message: 'ไม่พบคีย์ Gemini หรือ API ไม่ตอบสนอง'
        };
      }
    } catch (e) {
      results.gemini = {
        status: 'error',
        latency: Date.now() - startTime,
        model: '',
        message: e.message || 'ข้อผิดพลาดในการเชื่อมต่อ'
      };
    }
  }

  return results;
};
