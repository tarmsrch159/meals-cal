<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <div>
          <h2 class="modal-title">AI สแกนรูปอาหาร (Vision)</h2>
          <p class="modal-subtitle">ถ่ายรูปหรืออัปโหลดรูปอาหาร ให้ Gemini AI วิเคราะห์อัตโนมัติ</p>
        </div>
        <button type="button" class="btn-close" @click="closeModal">✕</button>
      </div>

      <!-- Meal Slot Selector -->
      <div class="meal-slot-tabs">
        <button 
          v-for="slot in ['breakfast', 'lunch', 'dinner', 'snack']" 
          :key="slot"
          type="button"
          class="btn-slot-tab"
          :class="{ active: targetMeal === slot }"
          @click="targetMeal = slot"
        >
          <span>{{ calorieStore.getMealTypeName(slot) }}</span>
        </button>
      </div>

      <div class="scanner-body">
        <!-- Error Notice -->
        <div class="error-notice" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <!-- 1. Upload & Capture Area (When no image is chosen yet) -->
        <div v-if="!imagePreview" class="upload-dropzone">
          <input 
            type="file" 
            ref="fileInputRef" 
            accept="image/*" 
            class="hidden-file-input" 
            @change="onFileSelected"
          />

          <div class="dropzone-content">
            <h3 class="dropzone-title">เลือกรูปภาพอาหารของคุณ</h3>
            <p class="dropzone-desc">รองรับไฟล์ JPG, PNG หรือถ่ายภาพจากกล้องมือถือ</p>

            <div class="upload-buttons-row">
              <button 
                type="button" 
                class="btn-upload-action camera" 
                @click="triggerCameraCapture"
              >
                ถ่ายรูปอาหาร
              </button>
              <button 
                type="button" 
                class="btn-upload-action gallery" 
                @click="triggerFileSelect"
              >
                เลือกจากคลังภาพ
              </button>
            </div>
          </div>

          <!-- Quick Sample Images for Demo Testing -->
          <div class="sample-demo-section">
            <div class="sample-title">หรือคลิกทดสอบตัวอย่างอาหาร:</div>
            <div class="sample-chips-grid">
              <button 
                v-for="sample in samplePresets" 
                :key="sample.name"
                type="button" 
                class="btn-sample-preset"
                @click="loadSamplePreset(sample)"
              >
                <span>{{ sample.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Image Preview & AI Scanning State -->
        <div v-else class="scan-preview-wrapper">
          <div class="preview-img-box">
            <img :src="imagePreview" alt="Food preview" class="preview-img" />
            
            <!-- AI Scanner Radar Effect while scanning -->
            <div class="scanner-laser" v-if="isAnalyzing">
              <div class="laser-line"></div>
              <div class="laser-radar-tag">AI Vision กำลังวิเคราะห์วัตถุดิบและคำนวณแคลอรี่... ({{ elapsedSeconds }}s)</div>
            </div>

            <!-- Retake / Change image button -->
            <button 
              v-if="!isAnalyzing" 
              type="button" 
              class="btn-change-image" 
              @click="resetImage"
            >
              เปลี่ยนรูปภาพ
            </button>
          </div>

          <div v-if="!analyzedResult" class="vision-hint-form">
            <label for="vision-food-hint">ชื่อหรือรายละเอียดอาหาร (ไม่บังคับ)</label>
            <input
              id="vision-food-hint"
              v-model="foodHint"
              type="text"
              placeholder="เช่น ข้าวกะเพราไก่ไข่ดาว ไม่ใส่น้ำตาล"
              :disabled="isAnalyzing"
              @keyup.enter="startAiVisionScan(imageBase64, imageMime)"
            />
            <button
              v-if="!isAnalyzing"
              type="button"
              class="btn-upload-action camera vision-submit"
              @click="startAiVisionScan(imageBase64, imageMime)"
            >
              วิเคราะห์รูปอาหาร
            </button>
          </div>

          <!-- Error Alert Card when API fails -->
          <div v-if="errorMessage && !isAnalyzing && !analyzedResult" class="scan-error-card">
            <div class="error-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div class="error-msg-content">
              <h4>เรียกใช้ API Key ไม่สำเร็จ</h4>
              <p>{{ errorMessage }}</p>
            </div>
            <div class="error-actions-row">
              <button 
                type="button" 
                class="btn-retry-scan font-num" 
                @click="startAiVisionScan(imageBase64, imageMime)"
              >
                🔄 ลองใหม่อีกครั้ง
              </button>
              <button 
                type="button" 
                class="btn-fallback-local" 
                @click="applyLocalEstimateFallback"
              >
                💡 ใช้ระบบประมาณการไทย
              </button>
            </div>
          </div>

          <!-- AI Analysis Result Card -->
          <div v-if="analyzedResult" class="analysis-result-card">
            <p class="ai-estimate-notice">ตัวเลขโภชนาการเป็นค่าประมาณ โปรดตรวจสอบและปรับปริมาณก่อนบันทึก</p>
            <p class="ai-estimate-notice">ตัวเลขโภชนาการเป็นค่าประมาณ โปรดตรวจสอบและปรับปริมาณก่อนบันทึก</p>
            <div class="result-header">
              <div class="result-title-group">
                <div class="ai-badge-row">
                  <span v-if="analyzedResult.aiProvider === 'openrouter'" class="scanner-ai-badge badge-openrouter">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#6366F1"/><path d="m8 12 3 3 5-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <span>OpenRouter Vision ({{ analyzedResult.model || 'Free' }})</span>
                  </span>
                  <span v-else-if="analyzedResult.aiProvider === 'groq'" class="scanner-ai-badge badge-groq">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#F55036"/><path d="M12 5C8.13 5 5 8.13 5 12s3.13 7 7 7 7-3.13 7-7h-7v2.5h4.24c-.65 1.77-2.36 3-4.24 3-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5c1.15 0 2.2.43 3 1.15l1.77-1.77C15.54 5.76 13.86 5 12 5z" fill="#FFFFFF"/></svg>
                    <span>Groq AI Vision ({{ analyzedResult.model || 'Vision' }})</span>
                  </span>
                  <span v-else-if="analyzedResult.aiProvider === 'gemini'" class="scanner-ai-badge badge-gemini">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="#4E80EE"/></svg>
                    <span>Google Gemini Vision ({{ analyzedResult.model || 'Flash' }})</span>
                  </span>
                  <span v-else class="scanner-ai-badge badge-local">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    <span>ระบบประมาณการโภชนาการ (Local)</span>
                  </span>
                </div>
                <input 
                  type="text" 
                  v-model="analyzedResult.name" 
                  class="edit-name-input" 
                  title="คลิกเพื่อแก้ไขชื่อเมนู"
                />
                <span class="en-name-sub" v-if="analyzedResult.nameEn">{{ analyzedResult.nameEn }}</span>
              </div>

              <div class="health-score-badge" v-if="analyzedResult.healthScore">
                <span class="score-num font-num">{{ analyzedResult.healthScore }}/10</span>
                <span class="score-label">Health Score</span>
              </div>
            </div>

            <!-- Editable Nutrition Grid -->
            <div class="editable-nutrients-grid">
              <div class="edit-nut-box cal">
                <label>แคลอรี่ (kcal)</label>
                <input type="number" v-model.number="analyzedResult.calories" class="edit-num-input font-num" />
              </div>
              <div class="edit-nut-box carb">
                <label>คาร์บ (g)</label>
                <input type="number" v-model.number="analyzedResult.carbs" class="edit-num-input font-num" step="0.5" />
              </div>
              <div class="edit-nut-box pro">
                <label>โปรตีน (g)</label>
                <input type="number" v-model.number="analyzedResult.protein" class="edit-num-input font-num" step="0.5" />
              </div>
              <div class="edit-nut-box fat">
                <label>ไขมัน (g)</label>
                <input type="number" v-model.number="analyzedResult.fat" class="edit-num-input font-num" step="0.5" />
              </div>
            </div>

            <!-- Detected Ingredients Tags -->
            <div class="ingredients-wrap" v-if="analyzedResult.ingredients && analyzedResult.ingredients.length > 0">
              <span class="ing-label">วัตถุดิบที่ตรวจพบ:</span>
              <div class="ing-tags">
                <span v-for="(ing, idx) in analyzedResult.ingredients" :key="idx" class="ing-tag">
                  {{ ing }}
                </span>
              </div>
            </div>

            <!-- Health Tip -->
            <div class="health-tip-alert" v-if="analyzedResult.healthTip">
              {{ analyzedResult.healthTip }}
            </div>

            <!-- Portion & Unit Selector with Decimal Input -->
            <div class="portion-selector-card">
              <div class="portion-header-row">
                <span class="portion-title-text">สัดส่วนที่รับประทาน:</span>
                
                <div class="portion-unit-tabs">
                  <button 
                    type="button" 
                    class="btn-unit-tab"
                    :class="{ active: scannerPortionUnit === 'portion' }"
                    @click="setScannerPortionUnit('portion')"
                  >
                    จาน / ที่
                  </button>
                  <button 
                    type="button" 
                    class="btn-unit-tab"
                    :class="{ active: scannerPortionUnit === 'gram' }"
                    @click="setScannerPortionUnit('gram')"
                  >
                    กรัม (g)
                  </button>
                </div>
              </div>

              <!-- Stepper & Direct Decimal Input -->
              <div class="portion-input-row">
                <div class="portion-stepper-box">
                  <button 
                    type="button" 
                    class="btn-scanner-step font-num" 
                    @click="stepScannerPortion(scannerPortionUnit === 'gram' ? -25 : -0.25)"
                  >
                    -
                  </button>
                  <div class="scanner-input-wrap">
                    <input 
                      type="number" 
                      v-model.number="scannerPortionAmount" 
                      @input="onScannerPortionInput"
                      :step="scannerPortionUnit === 'gram' ? '5' : '0.1'"
                      min="0.01" 
                      class="scanner-portion-num font-num"
                    />
                    <span class="scanner-unit-label">{{ scannerPortionUnit === 'gram' ? 'g' : 'จาน' }}</span>
                  </div>
                  <button 
                    type="button" 
                    class="btn-scanner-step font-num" 
                    @click="stepScannerPortion(scannerPortionUnit === 'gram' ? 25 : 0.25)"
                  >
                    +
                  </button>
                </div>

                <!-- Quick Presets -->
                <div class="portion-quick-chips font-num">
                  <template v-if="scannerPortionUnit === 'portion'">
                    <button 
                      v-for="amt in [0.5, 1, 1.5, 2]" 
                      :key="amt"
                      type="button" 
                      class="btn-portion-chip"
                      :class="{ active: scannerPortionAmount === amt }"
                      @click="setScannerPortionPreset(amt, 'portion')"
                    >
                      {{ amt }}x
                    </button>
                  </template>
                  <template v-else>
                    <button 
                      v-for="g in [150, 250, 350, 500]" 
                      :key="g"
                      type="button" 
                      class="btn-portion-chip"
                      :class="{ active: scannerPortionAmount === g }"
                      @click="setScannerPortionPreset(g, 'gram')"
                    >
                      {{ g }}g
                    </button>
                  </template>
                </div>
              </div>

              <!-- Portion Equivalence Note -->
              <div class="portion-subnote font-num">
                <span v-if="scannerPortionUnit === 'gram'">
                  ≈ {{ scannerPortionAmount }} กรัม (เทียบเท่า {{ (selectedMultiplier).toFixed(2) }} จานมาตรฐาน)
                </span>
                <span v-else>
                  ≈ {{ scannerPortionAmount }} จาน (น้ำหนักประมาณ {{ Math.round(selectedMultiplier * scannerBaseGrams) }} กรัม)
                </span>
              </div>
            </div>

            <!-- Save Button -->
            <button 
              type="button" 
              class="btn-confirm-save" 
              @click="saveAnalyzedMeal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>บันทึกลง{{ calorieStore.getMealTypeName(targetMeal) }} ({{ Math.round(analyzedResult.calories * selectedMultiplier) }} kcal)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';
import { analyzeFoodPhotoWithGemini, fallbackLocalEstimate } from '../../services/nutritionApi.js';

const fileInputRef = ref(null);
const targetMeal = ref(state.selectedMealType || 'breakfast');
const imagePreview = ref(null);
const imageBase64 = ref('');
const imageMime = ref('image/jpeg');
const foodHint = ref('');
const isAnalyzing = ref(false);
const analyzedResult = ref(null);
const errorMessage = ref('');
const selectedMultiplier = ref(1);
const scannerPortionUnit = ref('portion'); // 'portion' | 'gram'
const scannerPortionAmount = ref(1);
const elapsedSeconds = ref(0);
let timerInterval = null;

function parseScannerBaseGrams(servingSize) {
  if (!servingSize) return 300;
  const match = String(servingSize).match(/(\d+)\s*(?:g|กรัม)/i);
  if (match) return Number(match[1]) || 300;
  return 300;
}

const scannerBaseGrams = computed(() => {
  return parseScannerBaseGrams(analyzedResult.value?.servingSize);
});

function setScannerPortionUnit(unit) {
  if (scannerPortionUnit.value === unit) return;
  scannerPortionUnit.value = unit;
  const baseGrams = scannerBaseGrams.value;

  if (unit === 'gram') {
    scannerPortionAmount.value = Math.round(selectedMultiplier.value * baseGrams * 10) / 10;
  } else {
    const raw = (Number(scannerPortionAmount.value) || baseGrams) / baseGrams;
    scannerPortionAmount.value = Math.round(raw * 100) / 100;
    selectedMultiplier.value = Math.max(0.01, scannerPortionAmount.value);
  }
}

function onScannerPortionInput() {
  const baseGrams = scannerBaseGrams.value;
  const val = Math.max(0.01, Number(scannerPortionAmount.value) || 0.01);
  scannerPortionAmount.value = val;

  if (scannerPortionUnit.value === 'gram') {
    selectedMultiplier.value = Math.max(0.01, val / baseGrams);
  } else {
    selectedMultiplier.value = val;
  }
}

function stepScannerPortion(delta) {
  const baseGrams = scannerBaseGrams.value;
  const current = Number(scannerPortionAmount.value) || (scannerPortionUnit.value === 'gram' ? baseGrams : 1);
  let next = Math.round((current + delta) * 100) / 100;

  if (scannerPortionUnit.value === 'gram') {
    if (next < 5) next = 5;
    scannerPortionAmount.value = next;
    selectedMultiplier.value = Math.max(0.01, next / baseGrams);
  } else {
    if (next < 0.1) next = 0.1;
    if (next > 20) next = 20;
    scannerPortionAmount.value = next;
    selectedMultiplier.value = next;
  }
}

function setScannerPortionPreset(amount, unit = 'portion') {
  const baseGrams = scannerBaseGrams.value;
  scannerPortionUnit.value = unit;
  scannerPortionAmount.value = amount;
  if (unit === 'gram') {
    selectedMultiplier.value = Math.max(0.01, amount / baseGrams);
  } else {
    selectedMultiplier.value = amount;
  }
}

onMounted(() => {
  targetMeal.value = state.selectedMealType || 'breakfast';
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// Sample presets with realistic food base64 / generated canvases for one-click testing
const samplePresets = [
  {
    name: 'ข้าวมันไก่ตอน',
    emoji: '🍗',
    promptName: 'ข้าวมันไก่ตอน 1 จานพร้อมน้ำซุป',
    mock: {
      name: 'ข้าวมันไก่ตอน',
      nameEn: 'Hainanese Chicken Rice',
      calories: 596,
      protein: 28,
      carbs: 68,
      fat: 24,
      fiber: 1.5,
      sodium: 780,
      servingSize: '1 จาน (350g)',
      ingredients: ['ข้าวมัน', 'เนื้อไก่ตอน', 'น้ำจิ้มเต้าเจี้ยว', 'แตงกวา', 'น้ำซุปฟัก'],
      healthScore: 7,
      healthTip: 'หากเลือกทานเนื้ออกล้วนไม่ติดหนัง จะลดพลังงานได้อีก 120 kcal'
    }
  },
  {
    name: 'ส้มตำไทย + ไก่ย่าง',
    emoji: '🥗',
    promptName: 'ส้มตำไทยและไก่ย่าง',
    mock: {
      name: 'ส้มตำไทย + ไก่ย่าง (ส่วนอก)',
      nameEn: 'Som Tum Thai & Grilled Chicken',
      calories: 310,
      protein: 38,
      carbs: 28,
      fat: 6,
      fiber: 4.0,
      sodium: 1100,
      servingSize: '1 ชุด',
      ingredients: ['มะละกอดิบ', 'มะเขือเทศ', 'ถั่วฝักยาว', 'ถั่วลิสง', 'อกไก่ย่าง'],
      healthScore: 9,
      healthTip: 'อาหารโปรตีนสูง ไฟเบอร์สูง ไขมันต่ำ เหมาะสำหรับช่วงลดไขมัน'
    }
  },
  {
    name: 'ผัดกะเพราหมูสับไข่ดาว',
    emoji: '🍳',
    promptName: 'ข้าวผัดกะเพราหมูสับไข่ดาวกรอบ',
    mock: {
      name: 'ข้าวผัดกะเพราหมูสับไข่ดาว',
      nameEn: 'Pork Basil Rice with Fried Egg',
      calories: 630,
      protein: 29,
      carbs: 62,
      fat: 30,
      fiber: 2.1,
      sodium: 980,
      servingSize: '1 จาน (380g)',
      ingredients: ['ข้าวหอมมะลิ', 'หมูสับ', 'ใบกะเพรา', 'พริกกระเทียม', 'ไข่ดาว'],
      healthScore: 6,
      healthTip: 'ใช้น้ำมันน้อยลง หรือเปลี่ยนเป็นไข่ต้มเพื่อลดไขมันอิ่มตัว'
    }
  }
];

function triggerFileSelect() {
  if (fileInputRef.value) {
    fileInputRef.value.removeAttribute('capture');
    fileInputRef.value.click();
  }
}

function triggerCameraCapture() {
  if (fileInputRef.value) {
    fileInputRef.value.setAttribute('capture', 'environment');
    fileInputRef.value.click();
  }
}

function compressImageForVision(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const MAX_DIM = 720;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        const base64 = dataUrl.split(',')[1];
        resolve({ dataUrl, base64, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.readAsDataURL(file);
  });
}

async function onFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  errorMessage.value = '';

  try {
    const compressed = await compressImageForVision(file);
    imagePreview.value = compressed.dataUrl;
    imageBase64.value = compressed.base64;
    imageMime.value = compressed.mimeType;

    // Let the user describe the dish before sending the image to AI.
  } catch (err) {
    console.error('Image compression error:', err);
    errorMessage.value = err.message || 'ไม่สามารถประมวลผลรูปภาพได้';
    isAnalyzing.value = false;
  }
}

async function startAiVisionScan(base64, mime) {
  isAnalyzing.value = true;
  analyzedResult.value = null;
  errorMessage.value = '';
  elapsedSeconds.value = 0;

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds.value += 1;
  }, 1000);

  try {
    const res = await analyzeFoodPhotoWithGemini(base64, mime, foodHint.value.trim());
    if (!res) {
      throw new Error('ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    }
    analyzedResult.value = res;
    if (res.isNotFood) {
      calorieStore.showToast('⚠️ AI ตรวจไม่พบอาหารที่ชัดเจนในภาพ คุณสามารถปรับแก้ชื่อเมนูและสารอาหารได้', 'info');
    } else {
      calorieStore.showToast(`✨ วิเคราะห์อาหารสำเร็จ: ${res.name}`, 'success');
    }
  } catch (err) {
    console.error('Vision analysis error:', err);
    errorMessage.value = err.message || 'เรียกใช้ API Key ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อหรือ API Key';
    calorieStore.showToast('เรียกใช้ API Key ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'error');
  } finally {
    isAnalyzing.value = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
}

function applyLocalEstimateFallback() {
  const localRes = fallbackLocalEstimate('อาหารจากรูปถ่าย (ประมาณการ)');
  analyzedResult.value = {
    ...localRes,
    name: 'อาหารจานเดียว (จากรูปภาพ)',
    servingSize: '1 จาน (350g)',
    healthTip: 'ประมาณการโภชนาการจากสูตรอาหารไทยมาตรฐาน คุณสามารถแก้ไขตัวเลขได้ตามต้องการ'
  };
  errorMessage.value = '';
  calorieStore.showToast('ใช้งานระบบประมาณการโภชนาการเรียบร้อย');
}

function loadSamplePreset(sample) {
  // Create a pleasant sample SVG canvas preview
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 400, 300);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 300);

  // Draw emoji and food name
  ctx.font = '70px serif';
  ctx.textAlign = 'center';
  ctx.fillText(sample.emoji, 200, 140);

  ctx.font = 'bold 22px Prompt, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(sample.name, 200, 200);

  ctx.font = '14px Prompt, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('ภาพอาหารจำลองสำหรับทดสอบ AI Vision', 200, 235);

  const dataUrl = canvas.toDataURL('image/jpeg');
  imagePreview.value = dataUrl;
  imageBase64.value = dataUrl.split(',')[1];
  imageMime.value = 'image/jpeg';
  foodHint.value = sample.name;

  // Instant apply mock result with high visual fidelity
  isAnalyzing.value = true;
  setTimeout(() => {
    analyzedResult.value = {
      ...sample.mock,
      id: 'sample_' + Date.now(),
      aiProvider: 'gemini',
      model: 'Gemini 2.5 Flash Vision',
      source: 'Google Gemini Vision (2.5 Flash)'
    };
    isAnalyzing.value = false;
  }, 700);
}

function resetImage() {
  imagePreview.value = null;
  imageBase64.value = '';
  analyzedResult.value = null;
  foodHint.value = '';
  errorMessage.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function saveAnalyzedMeal() {
  if (!analyzedResult.value) return;

  const baseGrams = scannerBaseGrams.value;
  calorieStore.addMealItem(
    targetMeal.value,
    {
      ...analyzedResult.value,
      baseGrams,
      portionUnit: scannerPortionUnit.value,
      portionAmount: scannerPortionAmount.value
    },
    selectedMultiplier.value,
    scannerPortionUnit.value,
    scannerPortionAmount.value
  );

  calorieStore.closeModal();
}

function closeModal() {
  calorieStore.closeModal();
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.1rem 1.3rem 0.8rem;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.header-icon {
  font-size: 1.5rem;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.78rem;
  color: #64748b;
  margin: 2px 0 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  color: #475569;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Meal Slot Tabs */
.meal-slot-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.3rem;
  padding: 0.6rem 1.3rem 0.4rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.btn-slot-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.45rem 0.2rem;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 10px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-slot-tab.active {
  background: var(--primary-forest, #154238);
  border-color: var(--primary-forest, #154238);
  color: #ffffff;
}

.scanner-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem;
}

.error-notice {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 0.82rem;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

/* Dropzone Upload Box */
.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 20px;
  padding: 2rem 1.5rem 1.5rem;
}

.hidden-file-input {
  display: none;
}

.camera-lens-icon {
  font-size: 3.5rem;
  margin-bottom: 0.6rem;
  animation: pulseIcon 2s infinite ease-in-out;
}

@keyframes pulseIcon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.dropzone-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.3rem;
}

.dropzone-desc {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 1.2rem;
}

.upload-buttons-row {
  display: flex;
  gap: 0.6rem;
  width: 100%;
  max-width: 380px;
}

.btn-upload-action {
  flex: 1;
  padding: 0.75rem 0.6rem;
  border: none;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.15s;
}

.btn-upload-action.camera {
  background: var(--primary-forest, #154238);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(21, 66, 56, 0.3);
}

.btn-upload-action.camera:hover {
  background: var(--primary-dark, #0D281E);
}

.btn-upload-action.gallery {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #1e293b;
}

.btn-upload-action.gallery:hover {
  background: #f1f5f9;
}

/* Sample Demos */
.sample-demo-section {
  margin-top: 1.5rem;
  width: 100%;
  border-top: 1px dashed #e2e8f0;
  padding-top: 1rem;
}

.sample-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.6rem;
}

.sample-chips-grid {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-sample-preset {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-sample-preset:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

/* Preview & Scan State */
.scan-preview-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vision-hint-form {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}

.vision-hint-form label {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
}

.vision-hint-form input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #fff;
  color: #0f172a;
  font: inherit;
}

.vision-submit {
  align-self: flex-start;
}

.preview-img-box {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 16px;
  overflow: hidden;
  background: #0f172a;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-laser {
  position: absolute;
  inset: 0;
  background: rgba(21, 66, 56, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.laser-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-neon, #D4FF32);
  box-shadow: 0 0 15px var(--accent-neon, #D4FF32);
  animation: scanLaser 2s ease-in-out infinite alternate;
}

@keyframes scanLaser {
  from { top: 5%; }
  to { top: 95%; }
}

.laser-radar-tag {
  background: rgba(15, 30, 23, 0.9);
  backdrop-filter: blur(4px);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid rgba(212, 255, 50, 0.3);
}

.btn-change-image {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(15, 23, 42, 0.8);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
}

/* Error Alert Card */
.scan-error-card {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 18px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
}

.error-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #FEE2E2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-msg-content h4 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #991B1B;
  margin: 0 0 0.25rem;
}

.error-msg-content p {
  font-size: 0.8rem;
  color: #B91C1C;
  margin: 0;
  line-height: 1.4;
}

.error-actions-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.4rem;
}

.btn-retry-scan {
  background: #DC2626;
  color: #FFFFFF;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
  transition: all 0.15s ease;
}

.btn-fallback-local {
  background: #FFFFFF;
  color: #1E293B;
  border: 1.5px solid #CBD5E1;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-fallback-local:hover {
  background: #F1F5F9;
  border-color: #94A3B8;
}

.btn-retry-scan:hover {
  background: #B91C1C;
  transform: translateY(-1px);
}

/* Result Card */
.analysis-result-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.9rem;
}

.ai-badge-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
}

.scanner-ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.2;
}

.scanner-ai-badge.badge-groq {
  background: #FFF1EE;
  border: 1px solid #FFCCBC;
  color: #D83B20;
}

.scanner-ai-badge.badge-gemini {
  background: #EEF4FF;
  border: 1px solid #C7D9FE;
  color: #1A56DB;
}

.scanner-ai-badge.badge-local {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #15803D;
}

.edit-name-input {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  border: 1px solid transparent;
  padding: 2px 4px;
  border-radius: 6px;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}

.edit-name-input:focus {
  border-color: var(--primary-forest, #154238);
  background: #f8fafc;
}

.en-name-sub {
  font-size: 0.75rem;
  color: #64748b;
  display: block;
}

.health-score-badge {
  text-align: right;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
}

.score-num {
  font-size: 1rem;
  font-weight: 800;
  color: #15803D;
  display: block;
}

.score-label {
  font-size: 0.62rem;
  color: #166534;
  font-weight: 600;
}

/* Nutrients Grid */
.editable-nutrients-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}

.edit-nut-box {
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.4rem 0.5rem;
}

.edit-nut-box.cal { background: #faf5ff; }
.edit-nut-box.carb { background: #eff6ff; }
.edit-nut-box.pro { background: #ecfdf5; }
.edit-nut-box.fat { background: #fffbeb; }

.edit-nut-box label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  display: block;
  margin-bottom: 2px;
}

.edit-num-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.2rem 0.3rem;
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  outline: none;
  background: #ffffff;
}

.ingredients-wrap {
  margin-bottom: 0.65rem;
}

.ing-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  display: block;
  margin-bottom: 0.25rem;
}

.ing-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.ing-tag {
  background: #f1f5f9;
  color: #334155;
  font-size: 0.72rem;
  padding: 2px 7px;
  border-radius: 6px;
}

.health-tip-alert {
  font-size: 0.78rem;
  color: #1e293b;
  background: #f8fafc;
  border-left: 3px solid var(--primary-forest, #154238);
  padding: 0.45rem 0.7rem;
  border-radius: 0 8px 8px 0;
  margin-bottom: 0.9rem;
  line-height: 1.35;
}

.portion-selector-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 0.8rem 0.9rem;
  margin-bottom: 1rem;
}

.portion-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.portion-title-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

.portion-unit-tabs {
  display: flex;
  background: #E2E8F0;
  border-radius: 8px;
  padding: 2px;
}

.btn-unit-tab {
  border: none;
  background: transparent;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748B;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-unit-tab.active {
  background: #FFFFFF;
  color: var(--primary-forest, #154238);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.portion-input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.portion-stepper-box {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 10px;
  padding: 2px 4px;
}

.btn-scanner-step {
  width: 24px;
  height: 26px;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 800;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.1s;
}

.btn-scanner-step:hover {
  background: #F1F5F9;
}

.scanner-input-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
}

.scanner-portion-num {
  width: 50px;
  border: none;
  background: transparent;
  font-size: 0.88rem;
  font-weight: 800;
  text-align: center;
  color: #0F1E17;
  outline: none;
}

.scanner-unit-label {
  font-size: 0.74rem;
  font-weight: 700;
  color: #64748B;
  margin-right: 4px;
}

.portion-quick-chips {
  display: flex;
  gap: 0.25rem;
}

.btn-portion-chip {
  padding: 0.3rem 0.6rem;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  border-radius: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-portion-chip:hover {
  background: #F1F5F9;
  border-color: #94A3B8;
}

.btn-portion-chip.active {
  background: var(--primary-forest, #154238);
  border-color: var(--primary-forest, #154238);
  color: #FFFFFF;
}

.portion-subnote {
  margin-top: 0.45rem;
  font-size: 0.72rem;
  color: #64748B;
  font-weight: 600;
}

.btn-confirm-save {
  width: 100%;
  padding: 0.85rem;
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 6px 20px rgba(212, 255, 50, 0.4);
}

.btn-confirm-save:hover {
  background: var(--accent-neon-hover, #C5F325);
  transform: translateY(-1px);
}
</style>
