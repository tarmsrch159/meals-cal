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
              <div class="laser-radar-tag">AI Vision กำลังวิเคราะห์วัตถุดิบและคำนวณแคลอรี่...</div>
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

          <!-- AI Analysis Result Card -->
          <div v-if="analyzedResult" class="analysis-result-card">
            <div class="result-header">
              <div class="result-title-group">
                <span class="ai-badge">วิเคราะห์สำเร็จ</span>
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

            <!-- Portion Selector -->
            <div class="portion-selector-row">
              <span class="portion-label">สัดส่วนที่รับประทาน:</span>
              <div class="portion-buttons">
                <button 
                  v-for="mult in [0.5, 1, 1.5, 2]" 
                  :key="mult"
                  type="button" 
                  class="btn-portion-chip"
                  :class="{ active: selectedMultiplier === mult }"
                  @click="selectedMultiplier = mult"
                >
                  {{ mult }}x
                </button>
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
import { ref, onMounted } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';
import { analyzeFoodPhotoWithGemini } from '../../services/nutritionApi.js';

const fileInputRef = ref(null);
const targetMeal = ref(state.selectedMealType || 'breakfast');
const imagePreview = ref(null);
const imageBase64 = ref('');
const imageMime = ref('image/jpeg');
const isAnalyzing = ref(false);
const analyzedResult = ref(null);
const errorMessage = ref('');
const selectedMultiplier = ref(1);

onMounted(() => {
  targetMeal.value = state.selectedMealType || 'breakfast';
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

function onFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  errorMessage.value = '';
  imageMime.value = file.type || 'image/jpeg';

  const reader = new FileReader();
  reader.onload = (ev) => {
    const fullDataUrl = ev.target.result;
    imagePreview.value = fullDataUrl;
    
    // Extract raw base64 without prefix
    const base64Data = fullDataUrl.split(',')[1];
    imageBase64.value = base64Data;

    // Trigger AI Vision scan
    startAiVisionScan(base64Data, imageMime.value);
  };
  reader.readAsDataURL(file);
}

async function startAiVisionScan(base64, mime) {
  isAnalyzing.value = true;
  analyzedResult.value = null;
  errorMessage.value = '';

  try {
    const res = await analyzeFoodPhotoWithGemini(base64, mime);
    analyzedResult.value = res;
  } catch (err) {
    console.error('Vision analysis error:', err);
    errorMessage.value = err.message || 'ไม่สามารถวิเคราะห์ภาพได้';
  } finally {
    isAnalyzing.value = false;
  }
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

  // Instant apply mock result with high visual fidelity
  isAnalyzing.value = true;
  setTimeout(() => {
    analyzedResult.value = {
      ...sample.mock,
      id: 'sample_' + Date.now(),
      source: 'Gemini Vision AI'
    };
    isAnalyzing.value = false;
  }, 700);
}

function resetImage() {
  imagePreview.value = null;
  imageBase64.value = '';
  analyzedResult.value = null;
  errorMessage.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function saveAnalyzedMeal() {
  if (!analyzedResult.value) return;

  calorieStore.addMealItem(
    targetMeal.value,
    analyzedResult.value,
    selectedMultiplier.value
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

.ai-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary-forest, #154238);
  background: var(--primary-light, #EBF3F0);
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 0.25rem;
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

.portion-selector-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.portion-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.portion-buttons {
  display: flex;
  gap: 0.3rem;
}

.btn-portion-chip {
  padding: 0.3rem 0.6rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.btn-portion-chip.active {
  background: var(--primary-forest, #154238);
  border-color: var(--primary-forest, #154238);
  color: #ffffff;
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
