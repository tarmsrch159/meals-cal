// Nutrition API Service: Hybrid Groq Cloud & Google Gemini Flash + Open Food Facts + Local Thai DB
import { searchLocalFood, THAI_FOOD_DATABASE } from '../data/thaiFoodDb.js';
import {
  callAiChat,
  callAiVisionApi,
  callGeminiVisionApi,
  getGroqApiKeys,
  getGeminiApiKeys,
  getRotatedGroqKeyList,
  getRotatedGeminiKeyList,
  getActiveAiProviderName,
  setActiveAiProvider,
  isGroqActive,
  parseAiJsonResponse,
  testAiServiceConnection
} from './aiService.js';

// ============================================================================
// API KEY POOL & MANAGEMENT
// ============================================================================

export function getGeminiApiKey() {
  const keys = getRotatedGeminiKeyList();
  return keys.length > 0 ? keys[0] : '';
}

export function getAllGeminiApiKeys() {
  return getGeminiApiKeys();
}

export function setGeminiApiKey(key) {
  if (!key || !key.trim()) {
    localStorage.removeItem('meals_cal_gemini_key');
  } else {
    localStorage.setItem('meals_cal_gemini_key', key.trim());
  }
}

export function getGroqApiKey() {
  const keys = getRotatedGroqKeyList();
  return keys.length > 0 ? keys[0] : '';
}

export function getAllGroqApiKeys() {
  return getGroqApiKeys();
}

export function setGroqApiKey(key) {
  if (!key || !key.trim()) {
    localStorage.removeItem('meals_cal_groq_key');
  } else {
    localStorage.setItem('meals_cal_groq_key', key.trim());
  }
}

export function getActiveAiProvider() {
  return getActiveAiProviderName();
}

export function setAiProviderPreference(provider) {
  setActiveAiProvider(provider);
}

export async function testAiConnection(provider = 'all') {
  return await testAiServiceConnection(provider);
}

// ============================================================================
// 1. ESTIMATE NUTRITION FROM TEXT (HYBRID GROQ <-> GEMINI)
// ============================================================================

/**
 * วิเคราะห์สารอาหารและคำนวณแคลอรี่จากข้อความภาษาไทยด้วย AI (Groq / Gemini)
 * @param {string} query คำค้นหา เช่น "ข้าวมันไก่ตอน 1 จาน", "ต้มยำกุ้งน้ำใส + ข้าวสวย 2 ทัพพี"
 */
export async function estimateNutritionWithGemini(query) {
  if (!query || !query.trim()) {
    throw new Error('กรุณาระบุชื่ออาหารที่ต้องการค้นหา');
  }

  const cleanQuery = query.trim();

  const systemPrompt = `คุณคือนักโภชนาการผู้เชี่ยวชาญอาหารไทยและอาหารสากล 
จงวิเคราะห์และคำนวณคุณค่าทางโภชนาการของอาหารตามข้อความที่ระบุ
ตอบกลับมาเป็น JSON Object ตัวเดียวเท่านั้น (ห้ามใส่ Markdown หรือข้อความอื่นนอกเหนือจาก JSON):
{
  "meal_name": "ชื่ออาหารภาษาไทยที่ชัดเจนและกระชับ",
  "name_en": "English Name",
  "calories": 450,
  "protein": 25.5,
  "carbs": 50.0,
  "fat": 15.0,
  "fiber": 3.0,
  "sodium": 750,
  "sugar": 5.0,
  "serving_size": "1 จาน (350 กรัม)",
  "category": "อาหารจานเดียว",
  "health_tip": "คำแนะนำโภชนาการที่เป็นประโยชน์ภาษาไทย 1 ประโยค"
}`;

  try {
    const aiResult = await callAiChat({
      userText: `วิเคราะห์สารอาหารของเมนูนี้: "${cleanQuery}"`,
      systemPrompt,
      temperature: 0.2,
      maxTokens: 1000,
      responseFormat: 'json'
    });

    if (aiResult && aiResult.text) {
      const parsed = parseAiJsonResponse(aiResult.text);

      if (parsed && (parsed.meal_name || parsed.calories !== undefined)) {
        return {
          id: 'ai_' + Date.now(),
          name: parsed.meal_name || cleanQuery,
          nameEn: parsed.name_en || '',
          calories: Math.max(10, Number(parsed.calories) || 300),
          protein: Math.max(0, Number(parsed.protein) || 15),
          carbs: Math.max(0, Number(parsed.carbs) || 35),
          fat: Math.max(0, Number(parsed.fat) || 10),
          fiber: Number(parsed.fiber) || 2,
          sodium: Number(parsed.sodium) || 500,
          sugar: Number(parsed.sugar) || 2,
          servingSize: parsed.serving_size || '1 หน่วยบริโภค',
          category: parsed.category || 'อาหารทั่วไป',
          healthTip: parsed.health_tip || 'รับประทานอาหารให้หลากหลายครบ 5 หมู่',
          aiProvider: aiResult.provider || 'groq',
          model: aiResult.model || '',
          source: `${aiResult.provider === 'groq' ? 'Groq' : 'Gemini'} AI (${aiResult.model})`
        };
      }
    }
  } catch (err) {
    console.warn('[Nutrition API] AI Text Estimate Warning, falling back to Local Thai DB:', err);
  }

  // Fallback 100% Guaranteed to Local Thai Database
  return fallbackLocalEstimate(cleanQuery);
}

/**
 * ฟังก์ชันสำรองข้อมูลอาหารไทยอัจฉริยะ (ทำงานได้ 100% แม้ไม่มี API Key หรือออฟไลน์)
 */
export function fallbackLocalEstimate(query) {
  const localMatches = searchLocalFood(query);
  if (localMatches.length > 0) {
    const top = localMatches[0];
    return {
      id: 'local_est_' + Date.now(),
      name: top.name,
      nameEn: top.nameEn || '',
      calories: top.calories,
      protein: top.protein,
      carbs: top.carbs,
      fat: top.fat,
      fiber: top.fiber || 1,
      sodium: top.sodium || 500,
      servingSize: top.servingSize || '1 จาน',
      category: top.category || 'อาหารจานเดียว',
      healthTip: top.healthTip || 'สารอาหารอ้างอิงจากฐานข้อมูลโภชนาการไทยมาตรฐาน',
      aiProvider: 'local',
      model: 'Thai Food DB',
      source: 'ฐานข้อมูลอาหารไทย (Local)'
    };
  }

  // Heuristic estimate for generic dishes
  let estCalories = 380;
  let estProtein = 18;
  let estCarbs = 45;
  let estFat = 12;

  if (query.includes('ทอด') || query.includes('กรอบ') || query.includes('มัน') || query.includes('ขาหมู')) {
    estCalories = 580;
    estFat = 28;
    estCarbs = 55;
  } else if (query.includes('ต้ม') || query.includes('นึ่ง') || query.includes('คลีน') || query.includes('สลัด') || query.includes('อกไก่')) {
    estCalories = 240;
    estProtein = 28;
    estFat = 4;
    estCarbs = 20;
  } else if (query.includes('น้ำ') || query.includes('ชา') || query.includes('กาแฟ') || query.includes('นม')) {
    estCalories = 140;
    estProtein = 3;
    estCarbs = 24;
    estFat = 4;
  }

  return {
    id: 'est_' + Date.now(),
    name: query,
    nameEn: '',
    calories: estCalories,
    protein: estProtein,
    carbs: estCarbs,
    fat: estFat,
    fiber: 2,
    sodium: 600,
    servingSize: '1 ที่ (ประมาณ)',
    category: 'อาหารทั่วไป',
    healthTip: 'ประมาณการจากสูตรอาหารไทยมาตรฐาน',
    aiProvider: 'local',
    model: 'Local Engine',
    source: 'ระบบประมาณการโภชนาการ'
  };
}

// ============================================================================
// 2. FOOD PHOTO RECOGNITION (AI VISION OCR)
// ============================================================================

/**
 * วิเคราะห์รูปภาพอาหารผ่าน AI Vision (Google Gemini Flash Vision)
 */
export async function analyzeFoodPhotoWithGemini(base64Data, mimeType = 'image/jpeg') {
  if (!base64Data) {
    throw new Error('ไม่พบข้อมูลรูปภาพสำหรับวิเคราะห์');
  }

  const prompt = `คุณคือนักโภชนาการ AI ผู้เชี่ยวชาญด้านอาหารไทยและโภชนาการสากล
วิเคราะห์ภาพอาหารนี้อย่างละเอียด ระบุชื่อเมนูภาษาไทย, วัตถุดิบที่ตรวจพบ, สัดส่วน, และประมาณการพลังงานสารอาหาร
ตอบกลับเป็น JSON Object รูปแบบนี้เท่านั้น (ห้ามใส่ Markdown หรือข้อความอื่นนอกเหนือจาก JSON):
{
  "meal_name": "ชื่อเมนูภาษาไทยที่ชัดเจน",
  "name_en": "English Name",
  "calories": 520,
  "protein": 28.0,
  "carbs": 60.0,
  "fat": 18.0,
  "fiber": 2.5,
  "sodium": 850,
  "ingredients_detected": ["วัตถุดิบ 1", "วัตถุดิบ 2"],
  "estimated_portion": "1 จาน (300g)",
  "health_score": 8,
  "health_tip": "คำแนะนำโภชนาการภาษาไทย 1 ประโยค"
}`;

  try {
    const visionResult = await callAiVisionApi({
      prompt,
      base64Data,
      mimeType
    });

    if (visionResult && visionResult.rawText) {
      const parsed = parseAiJsonResponse(visionResult.rawText);

      if (parsed && (parsed.meal_name || parsed.calories !== undefined)) {
        // ตรวจสอบกรณีภาพไม่ใช่รูปอาหาร
        const isNotFood =
          parsed.meal_name?.includes('ไม่พบภาพอาหาร') ||
          parsed.meal_name?.includes('ไม่มีอาหาร') ||
          parsed.meal_name?.toLowerCase().includes('no food') ||
          (parsed.calories === 0 && (!parsed.ingredients_detected || parsed.ingredients_detected.length === 0));

        return {
          id: 'vision_' + Date.now(),
          name: parsed.meal_name || 'อาหารจากรูปถ่าย',
          nameEn: parsed.name_en || '',
          calories: isNotFood ? 0 : Math.max(10, Number(parsed.calories) || 450),
          protein: Math.max(0, Number(parsed.protein) || (isNotFood ? 0 : 20)),
          carbs: Math.max(0, Number(parsed.carbs) || (isNotFood ? 0 : 50)),
          fat: Math.max(0, Number(parsed.fat) || (isNotFood ? 0 : 12)),
          fiber: Number(parsed.fiber) || (isNotFood ? 0 : 2),
          sodium: Number(parsed.sodium) || (isNotFood ? 0 : 600),
          servingSize: parsed.estimated_portion || '1 จาน',
          ingredients: parsed.ingredients_detected || [],
          healthScore: isNotFood ? 0 : (parsed.health_score || 7),
          healthTip: parsed.health_tip || (isNotFood ? 'กรุณาถ่ายภาพอาหารให้อยู่ในตำแหน่งที่ชัดเจน' : 'รับประทานอาหารให้หลากหลาย'),
          aiProvider: visionResult.provider || 'gemini',
          model: visionResult.model,
          source: `${visionResult.provider === 'gemini' ? 'Google Gemini Vision' : 'Groq Vision'} (${visionResult.model})`,
          isNotFood
        };
      }
    }
  } catch (err) {
    console.error('[Nutrition API] AI Vision error:', err);
    throw err;
  }

  throw new Error('เรียกใช้ API Key ไม่สำเร็จ (AI Vision ไม่ตอบสนองหรือหมดเวลาเชื่อมต่อ)');
}

// ============================================================================
// 3. AI COACH & MEAL RECOMMENDATION (HYBRID GROQ <-> GEMINI)
// ============================================================================

/**
 * AI โภชนาการอัจฉริยะ: วิเคราะห์มื้อที่กินไปแล้วในวันนี้ และแนะนำเมนูสำหรับมื้อถัดไปตามโควต้าสารอาหารที่เหลือจริง
 */
export async function getAiMealRecommendation({ dailyTotals, targets, remaining, eatenList, nextMealSlot = 'dinner', goal = 'maintain' }) {
  const eatenText = eatenList && eatenList.length > 0
    ? eatenList.map(item => `- ${item.name} (${item.calories} kcal, P:${item.protein}g C:${item.carbs}g F:${item.fat}g)`).join('\n')
    : '(ยังไม่มีการบันทึกอาหารในวันนี้)';

  const systemPrompt = `คุณคือนักโภชนาการและ AI ผู้ช่วยวางแผนมื้ออาหารไทยส่วนบุคคล
จงวิเคราะห์ภาพรวมโภชนาการวันนี้ ให้คะแนนสุขภาพ (1-100) และแนะนำ 3 เมนูอาหารไทยสำหรับ "${nextMealSlot}" ที่เหมาะกับโควต้าแคลอรี่และสารอาหารที่เหลือที่สุด
ตอบกลับเป็น JSON Object รูปแบบนี้เท่านั้น (ห้ามใส่ Markdown อื่นนอกเหนือจาก JSON):
{
  "healthScore": 88,
  "dailyAnalysis": "สรุปสั้นๆ 1-2 ประโยคถึงสารอาหารที่ทานไปแล้ว เช่น วันนี้โปรตีนยังขาดอีกนิด แต่คุมคาร์บได้ดีมาก",
  "nutritionTip": "คำแนะนำโภชนาการ 1 ประโยคสำหรับมื้อถัดไป",
  "recommendations": [
    {
      "name": "ชื่อเมนูไทย 1",
      "nameEn": "English Name 1",
      "calories": 350,
      "protein": 28,
      "carbs": 30,
      "fat": 8,
      "fiber": 3,
      "sodium": 650,
      "servingSize": "1 จาน",
      "reason": "เหตุผลที่แนะนำเมนูนี้ เช่น ให้โปรตีนสูง ไขมันต่ำ เหมาะกับโควต้าที่เหลือ"
    },
    {
      "name": "ชื่อเมนูไทย 2",
      "nameEn": "English Name 2",
      "calories": 280,
      "protein": 25,
      "carbs": 20,
      "fat": 6,
      "fiber": 4,
      "sodium": 550,
      "servingSize": "1 ชาม",
      "reason": "เหตุผล..."
    },
    {
      "name": "ชื่อเมนูไทย 3",
      "nameEn": "English Name 3",
      "calories": 220,
      "protein": 22,
      "carbs": 15,
      "fat": 4,
      "fiber": 5,
      "sodium": 500,
      "servingSize": "1 จาน",
      "reason": "เหตุผล..."
    }
  ]
}`;

  const userQuery = `เป้าหมายผู้ใช้: ${goal === 'lose' ? 'ลดไขมัน/ลดน้ำหนัก' : goal === 'gain' ? 'เพิ่มกล้ามเนื้อ/เพิ่มน้ำหนัก' : 'รักษาสุขภาพ/รักษาน้ำหนัก'}
มื้อที่ต้องการแนะนำ: ${nextMealSlot}

สถานะสารอาหารวันนี้:
- ทานไปแล้ว: ${dailyTotals.calories} / ${targets.calorieTarget} kcal (เหลืออีก ${remaining.calories} kcal)
- โปรตีน: ${dailyTotals.protein} / ${targets.proteinTarget}g (เหลืออีก ${remaining.protein}g)
- คาร์บ: ${dailyTotals.carbs} / ${targets.carbsTarget}g (เหลืออีก ${remaining.carbs}g)
- ไขมัน: ${dailyTotals.fat} / ${targets.fatTarget}g (เหลืออีก ${remaining.fat}g)

รายการที่ทานไปแล้ววันนี้:
${eatenText}`;

  try {
    const aiResult = await callAiChat({
      userText: userQuery,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 1200,
      responseFormat: 'json'
    });

    if (aiResult && aiResult.text) {
      const parsed = parseAiJsonResponse(aiResult.text);
      if (parsed && parsed.recommendations && parsed.recommendations.length > 0) {
        return {
          ...parsed,
          aiProvider: aiResult.provider,
          model: aiResult.model,
          source: `${aiResult.provider === 'groq' ? 'Groq' : 'Gemini'} AI (${aiResult.model})`
        };
      }
    }
  } catch (err) {
    console.warn('[Nutrition API] AI Coach request error, falling back to local coach:', err);
  }

  // Smart Local Fallback based on remaining macros
  return fallbackLocalCoach({ dailyTotals, targets, remaining, nextMealSlot });
}

/**
 * Local AI Coach fallback engine using Thai Food DB
 */
function fallbackLocalCoach({ dailyTotals, targets, remaining, nextMealSlot }) {
  const remCal = Math.max(150, remaining.calories || 400);
  const needProtein = (remaining.protein || 0) > 20;

  let score = 85;
  let analysis = 'สารอาหารวันนี้กระจายตัวได้ดี พลังงานรวมอยู่ในเกณฑ์ที่เหมาะสม';
  let tip = 'เลือกมื้อถัดไปที่เน้นผักและโปรตีนไขมันต่ำเพื่อสุขภาพที่ดี';

  if (remaining.calories < 0) {
    score = 72;
    analysis = `วันนี้พลังงานรวมเกินเป้าหมายไป ${Math.abs(remaining.calories)} kcal`;
    tip = 'แนะนำเลือกเมนูน้ำใส ต้ม นึ่ง หรือสลัดผักไขมันต่ำเพื่อรักษาสมดุล';
  } else if (needProtein) {
    score = 82;
    analysis = `พลังงานยังเหลืออีก ${remCal} kcal และยังต้องการโปรตีนเพิ่มอีก ${Math.round(remaining.protein)}g`;
    tip = 'แนะนำเลือกอาหารที่มีอกไก่ ไข่ขาว ปลา หรือเต้าหู้เป็นหลัก';
  }

  // Pick top 3 suitable meals from local database
  const recs = [
    {
      name: needProtein ? 'สุกี้น้ำรวมมิตร (ไม่ใส่วุ้นเส้น)' : 'ต้มยำกุ้งน้ำใส + ข้าวสวย',
      nameEn: needProtein ? 'Mixed Sukiyaki Soup' : 'Tom Yum Soup with Rice',
      calories: Math.min(remCal, 280),
      protein: 26,
      carbs: 22,
      fat: 6,
      fiber: 4,
      sodium: 750,
      servingSize: '1 ชาม',
      reason: needProtein ? 'โปรตีนสูง แคลอรี่ต่ำ ผักเยอะอิ่มท้องนาน' : 'แคลอรี่พอเหมาะ ไขมันต่ำ ย่อยง่าย'
    },
    {
      name: 'อกไก่ย่างสมุนไพร + สลัดผักน้ำใส',
      nameEn: 'Grilled Herb Chicken with Salad',
      calories: Math.min(remCal, 240),
      protein: 32,
      carbs: 12,
      fat: 5,
      fiber: 3.5,
      sodium: 520,
      servingSize: '1 จาน',
      reason: 'โปรตีนเน้นๆ ซ่อมแซมกล้ามเนื้อและอยู่ท้องโดยไม่เพิ่มคาร์โบไฮเดรต'
    },
    {
      name: 'ปลากะพงนึ่งมะนาว',
      nameEn: 'Steamed Sea Bass with Lime & Chili',
      calories: Math.min(remCal, 210),
      protein: 28,
      carbs: 8,
      fat: 4,
      fiber: 1.5,
      sodium: 680,
      servingSize: '1 ที่ (200g)',
      reason: 'ปลาเนื้อขาวไขมันดี ย่อยง่าย เหมาะสำหรับมื้อเย็น'
    }
  ];

  return {
    healthScore: score,
    dailyAnalysis: analysis,
    nutritionTip: tip,
    recommendations: recs,
    source: 'ระบบโภชนาการอัจฉริยะ (Local)'
  };
}

// ============================================================================
// 4. OPEN FOOD FACTS API
// ============================================================================

export async function searchOpenFoodFacts(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query.trim())}&search_simple=1&action=process&json=1&page_size=8`;
    
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.products || !Array.isArray(data.products)) return [];

    return data.products
      .filter(p => p.product_name || p.product_name_th || p.product_name_en)
      .map(p => {
        const nutriments = p.nutriments || {};
        const calories = Math.round(
          nutriments['energy-kcal_100g'] || 
          nutriments['energy-kcal_serving'] || 
          nutriments['energy-kcal'] || 
          (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0)
        );

        return {
          id: 'off_' + (p.code || Math.random().toString(36).substr(2, 9)),
          name: p.product_name_th || p.product_name || p.product_name_en,
          nameEn: p.product_name_en || p.brands || '',
          brand: p.brands || '',
          category: 'สินค้าสำเร็จรูป',
          calories: calories || 150,
          protein: Math.round((nutriments.proteins_100g || nutriments.proteins || 0) * 10) / 10,
          carbs: Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * 10) / 10,
          fat: Math.round((nutriments.fat_100g || nutriments.fat || 0) * 10) / 10,
          fiber: Math.round((nutriments.fiber_100g || nutriments.fiber || 0) * 10) / 10,
          sodium: Math.round((nutriments.sodium_100g || nutriments.sodium || 0) * 1000),
          servingSize: p.serving_size || '100 กรัม / 1 หน่วยบริโภค',
          healthTip: p.nutriscore_grade ? `Nutri-Score: ระดับ ${p.nutriscore_grade.toUpperCase()}` : 'สินค้าสำเร็จรูปมีข้อมูลโภชนาการตามฉลาก',
          source: 'Open Food Facts'
        };
      });
  } catch (err) {
    return [];
  }
}
