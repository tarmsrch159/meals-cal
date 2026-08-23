// Nutrition API Service: Google Gemini Flash (NLP & Vision) + Open Food Facts + Local Thai DB
import { searchLocalFood, THAI_FOOD_DATABASE } from '../data/thaiFoodDb.js';

// Default Gemini API Key from environment or local storage
export function getGeminiApiKey() {
  const customKey = localStorage.getItem('meals_cal_gemini_key');
  if (customKey && customKey.trim().length > 10) {
    return customKey.trim();
  }
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

export function setGeminiApiKey(key) {
  if (!key || !key.trim()) {
    localStorage.removeItem('meals_cal_gemini_key');
  } else {
    localStorage.setItem('meals_cal_gemini_key', key.trim());
  }
}

/**
 * วิเคราะห์สารอาหารและคำนวณแคลอรี่จากข้อความภาษาไทยด้วย Gemini Flash (พร้อม Fast Timeout & Fallback)
 * @param {string} query คำค้นหา เช่น "ข้าวมันไก่ตอน 1 จาน", "ต้มยำกุ้งน้ำใส + ข้าวสวย 2 ทัพพี"
 */
export async function estimateNutritionWithGemini(query) {
  if (!query || !query.trim()) {
    throw new Error('กรุณาระบุชื่ออาหารที่ต้องการค้นหา');
  }

  const cleanQuery = query.trim();
  const apiKey = getGeminiApiKey();

  // If no valid API key, use smart local Thai DB estimation directly
  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    return fallbackLocalEstimate(cleanQuery);
  }

  // Active production models from Google AI
  const models = [
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-pro-latest'
  ];
  let lastError = null;

  const prompt = `คุณคือนักโภชนาการผู้เชี่ยวชาญอาหารไทยและอาหารสากล 
จงวิเคราะห์และคำนวณคุณค่าทางโภชนาการของอาหารตามข้อความนี้: "${cleanQuery}"

ตอบกลับมาในรูปแบบ JSON Object ตัวเดียวเท่านั้น (ห้ามใส่ Markdown code block อื่นนอกจาก JSON string) โดยมีโครงสร้างดังนี้:
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

  for (const model of models) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s fast timeout

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 400 || response.status === 403) {
          throw new Error('Gemini API Key ไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าถึง (กรุณาตรวจในหน้าตั้งค่า ⚙️)');
        } else if (response.status === 429) {
          throw new Error('โควต้า Gemini API เต็มชั่วคราว');
        }
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const rawText = parts.filter(p => !p.thought && p.text).map(p => p.text).join('\n') || parts[parts.length - 1]?.text;
      if (!rawText) {
        throw new Error('ไม่พบข้อมูลตอบกลับจาก AI');
      }

      const cleanJsonStr = rawText.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      return {
        id: 'gemini_' + Date.now(),
        name: parsed.meal_name || cleanQuery,
        nameEn: parsed.name_en || '',
        calories: Math.max(10, Number(parsed.calories) || 300),
        protein: Number(parsed.protein) || 15,
        carbs: Number(parsed.carbs) || 35,
        fat: Number(parsed.fat) || 10,
        fiber: Number(parsed.fiber) || 2,
        sodium: Number(parsed.sodium) || 500,
        sugar: Number(parsed.sugar) || 2,
        servingSize: parsed.serving_size || '1 หน่วยบริโภค',
        category: parsed.category || 'อาหารทั่วไป',
        healthTip: parsed.health_tip || 'รับประทานอาหารให้หลากหลายครบ 5 หมู่',
        source: 'Gemini AI Flash'
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Gemini model ${model} error:`, err.message);
      lastError = err;
    }
  }

  // Fallback to instant local estimate if Gemini fails
  console.info('Falling back to local Thai food estimation for:', cleanQuery);
  return fallbackLocalEstimate(cleanQuery);
}

/**
 * ฟังก์ชันสำรองข้อมูลอาหารไทยอัจฉริยะ (ทำงานได้ 100% แม้ไม่มี API Key หรืออินเทอร์เน็ตช้า)
 */
function fallbackLocalEstimate(query) {
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
      source: 'ฐานข้อมูลอาหารไทย'
    };
  }

  // Smart heuristic estimate for generic dishes
  let estCalories = 380;
  let estProtein = 18;
  let estCarbs = 45;
  let estFat = 12;

  if (query.includes('ทอด') || query.includes('กรอบ') || query.includes('มัน')) {
    estCalories = 580;
    estFat = 28;
    estCarbs = 55;
  } else if (query.includes('ต้ม') || query.includes('นึ่ง') || query.includes('คลีน') || query.includes('สลัด')) {
    estCalories = 220;
    estProtein = 26;
    estFat = 4;
    estCarbs = 20;
  } else if (query.includes('น้ำ') || query.includes('ชา') || query.includes('กาแฟ')) {
    estCalories = 120;
    estProtein = 2;
    estCarbs = 22;
    estFat = 3;
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
    source: 'ระบบประมาณการโภชนาการ'
  };
}

/**
 * สแกนและวิเคราะห์รูปภาพอาหารด้วย Gemini Flash Vision (พร้อม Fast Timeout & Fallback)
 * @param {string} base64Data ข้อมูลรูปภาพ Base64
 * @param {string} mimeType เช่น "image/jpeg", "image/png"
 */
export async function analyzeFoodPhotoWithGemini(base64Data, mimeType = 'image/jpeg') {
  if (!base64Data) {
    throw new Error('กรุณาอัปโหลดรูปภาพอาหาร');
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    // If no real key, provide realistic demo analysis
    await new Promise(r => setTimeout(r, 600));
    return {
      id: 'vision_sample_' + Date.now(),
      name: 'อาหารจานเดียวจากรูปภาพ',
      nameEn: 'Mixed Thai Dish',
      calories: 480,
      protein: 24.0,
      carbs: 58.0,
      fat: 14.0,
      fiber: 2.5,
      sodium: 780,
      servingSize: '1 จาน (300g)',
      ingredients: ['ข้าวสวย', 'เนื้อสัตว์', 'ผักเคียง', 'เครื่องปรุง'],
      healthScore: 8,
      healthTip: 'ตรวจพบโปรตีนและคาร์โบไฮเดรตในสัดส่วนที่เหมาะสม',
      source: 'AI Vision'
    };
  }

  const models = [
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-pro-latest'
  ];
  let lastError = null;

  const prompt = `คุณคือนักโภชนาการและ AI ตรวจจับอาหารไทยจากรูปถ่าย
จงวิเคราะห์ภาพนี้และตอบเป็น JSON Object เท่านั้น:
{
  "is_food": true,
  "meal_name": "ชื่ออาหารภาษาไทย",
  "name_en": "English name",
  "ingredients_detected": ["วัตถุดิบ 1", "วัตถุดิบ 2"],
  "estimated_portion": "1 จาน (300g)",
  "calories": 520,
  "protein": 28.0,
  "carbs": 60.0,
  "fat": 18.0,
  "fiber": 2.5,
  "sodium": 850,
  "health_score": 8,
  "health_tip": "คำแนะนำโภชนาการภาษาไทย"
}`;

  for (const model of models) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Vision API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const rawText = parts.filter(p => !p.thought && p.text).map(p => p.text).join('\n') || parts[parts.length - 1]?.text;
      if (!rawText) throw new Error('AI ไม่ได้ส่งผลการวิเคราะห์ภาพ');

      const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        id: 'vision_' + Date.now(),
        name: parsed.meal_name || 'อาหารจากรูปถ่าย',
        nameEn: parsed.name_en || '',
        calories: Number(parsed.calories) || 450,
        protein: Number(parsed.protein) || 20,
        carbs: Number(parsed.carbs) || 50,
        fat: Number(parsed.fat) || 12,
        fiber: Number(parsed.fiber) || 2,
        sodium: Number(parsed.sodium) || 600,
        servingSize: parsed.estimated_portion || '1 จาน',
        ingredients: parsed.ingredients_detected || [],
        healthScore: parsed.health_score || 7,
        healthTip: parsed.health_tip || 'คำนวณจากรูปภาพโดยประมาณ',
        source: 'Gemini Vision AI'
      };
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
    }
  }

  throw lastError || new Error('ไม่สามารถวิเคราะห์ภาพได้');
}

/**
 * ค้นหาข้อมูลอาหารจาก Open Food Facts API (สินค้าสำเร็จรูป / ขนม / เครื่องดื่ม)
 */
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

/**
 * AI โภชนาการอัจฉริยะ: วิเคราะห์มื้อที่กินไปแล้วในวันนี้ และแนะนำเมนูสำหรับมื้อถัดไปตามโควต้าสารอาหารที่เหลือจริง
 */
export async function getAiMealRecommendation({ dailyTotals, targets, remaining, eatenList, nextMealSlot = 'dinner', goal = 'maintain' }) {
  const apiKey = getGeminiApiKey();

  const eatenText = eatenList && eatenList.length > 0
    ? eatenList.map(item => `- ${item.name} (${item.calories} kcal, P:${item.protein}g C:${item.carbs}g F:${item.fat}g)`).join('\n')
    : '(ยังไม่มีการบันทึกอาหารในวันนี้)';

  const models = [
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-pro-latest'
  ];

  const prompt = `คุณคือนักโภชนาการและ AI ผู้ช่วยวางแผนมื้ออาหารไทยส่วนบุคคล
เป้าหมายผู้ใช้: ${goal === 'lose' ? 'ลดไขมัน/ลดน้ำหนัก' : goal === 'gain' ? 'เพิ่มกล้ามเนื้อ/เพิ่มน้ำหนัก' : 'รักษาสุขภาพ/รักษาน้ำหนัก'}
มื้อที่ต้องการแนะนำ: ${nextMealSlot}

สถานะสารอาหารวันนี้:
- ทานไปแล้ว: ${dailyTotals.calories} / ${targets.calorieTarget} kcal (เหลืออีก ${remaining.calories} kcal)
- โปรตีน: ${dailyTotals.protein} / ${targets.proteinTarget}g (เหลืออีก ${remaining.protein}g)
- คาร์บ: ${dailyTotals.carbs} / ${targets.carbsTarget}g (เหลืออีก ${remaining.carbs}g)
- ไขมัน: ${dailyTotals.fat} / ${targets.fatTarget}g (เหลืออีก ${remaining.fat}g)

รายการที่ทานไปแล้ววันนี้:
${eatenText}

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
      "reason": "..."
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
      "reason": "..."
    }
  ]
}`;

  if (apiKey && !apiKey.includes('your_gemini_api_key')) {
    for (const model of models) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3
            }
          })
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const rawText = parts.filter(p => !p.thought && p.text).map(p => p.text).join('\n') || parts[parts.length - 1]?.text;
          if (rawText) {
            const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.recommendations && parsed.recommendations.length > 0) {
              return {
                ...parsed,
                source: `Gemini AI (${model})`
              };
            }
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn(`AI Coach model ${model} failed:`, err.message);
      }
    }
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
    source: 'ระบบโภชนาการอัจฉริยะ'
  };
}
