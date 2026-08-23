<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">ตั้งค่า & ตรวจสอบ AI</h2>
          <p class="modal-subtitle">จัดการ API Key และเป้าหมายสารอาหารของคุณ</p>
        </div>
        <button type="button" class="btn-close" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <!-- Gemini API Key Section -->
        <div class="settings-section">
          <div class="section-title-row">
            <div>
              <h4 class="sec-title">Google Gemini AI Key (ฟรี)</h4>
              <p class="sec-desc">ใช้สำหรับค้นหาโภชนาการแบบ AI NLP และวิเคราะห์ภาพอาหาร</p>
            </div>
          </div>

          <div class="api-key-input-group">
            <input 
              :type="showKey ? 'text' : 'password'" 
              v-model="apiKeyInput" 
              placeholder="ใส่ Gemini API Key (เริ่มต้นด้วย AIzaSy...)" 
              class="key-input"
            />
            <button type="button" class="btn-toggle-key font-num" @click="showKey = !showKey">
              {{ showKey ? 'ซ่อน' : 'แสดง' }}
            </button>
          </div>

          <!-- Free Key Instructions Box -->
          <div class="key-guide-box">
            <span class="guide-badge">คำแนะนำ: วิธีรับ API Key ฟรี 100%</span>
            <ol class="guide-steps">
              <li>เข้าเว็บ <a href="https://aistudio.google.com/" target="_blank" class="guide-link">aistudio.google.com</a> แล้วล็อกอินด้วย Google Account</li>
              <li>กดปุ่ม <strong>"Get API key"</strong> และกด <strong>"Create API key"</strong></li>
              <li>คัดลอก Key ที่ขึ้นต้นด้วย <code>AIzaSy...</code> มาวางในช่องด้านบน</li>
            </ol>
          </div>

          <div class="api-actions-row">
            <button 
              type="button" 
              class="btn-test-key" 
              :disabled="isTestingKey" 
              @click="testApiKeyStepByStep"
            >
              {{ isTestingKey ? 'กำลังตรวจสอบทีละขั้นตอน...' : 'ตรวจสอบ Key ทีละขั้นตอน' }}
            </button>

            <button 
              type="button" 
              class="btn-save-key" 
              @click="saveApiKey"
            >
              บันทึก Key
            </button>
          </div>

          <!-- Step-by-Step Diagnostic Test Feedback -->
          <div v-if="testResult" class="test-feedback-box" :class="testResult.status">
            <div class="feedback-header">
              <span>{{ testResult.status === 'success' ? 'ผลการตรวจสอบ: ใช้งานได้สมบูรณ์' : 'ผลการตรวจสอบ: พบข้อควรแก้ไข' }}</span>
              <span class="latency-tag" v-if="testResult.latency">{{ testResult.latency }} ms</span>
            </div>
            <p class="feedback-msg">{{ testResult.message }}</p>
            <div class="feedback-steps" v-if="testResult.steps">
              <div v-for="(step, idx) in testResult.steps" :key="idx" class="step-item" :class="step.ok ? 'pass' : 'fail'">
                <span>{{ step.ok ? '✓' : '✗' }}</span>
                <span>{{ step.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Manual Daily Targets Adjustments -->
        <div class="settings-section">
          <div class="section-title-row">
            <div>
              <h4 class="sec-title">เป้าหมายสารอาหารรายวัน</h4>
              <p class="sec-desc">ปรับเปลี่ยนตัวเลขเป้าหมายแคลอรี่และสารอาหารได้โดยตรง</p>
            </div>
          </div>

          <div class="targets-form-grid">
            <div class="target-field">
              <label>เป้าหมายแคลอรี่ (kcal)</label>
              <input type="number" v-model.number="profileForm.calorieTarget" class="target-input" />
            </div>
            <div class="target-field">
              <label>คาร์โบไฮเดรต (g)</label>
              <input type="number" v-model.number="profileForm.carbsTarget" class="target-input" />
            </div>
            <div class="target-field">
              <label>โปรตีน (g)</label>
              <input type="number" v-model.number="profileForm.proteinTarget" class="target-input" />
            </div>
            <div class="target-field">
              <label>ไขมัน (g)</label>
              <input type="number" v-model.number="profileForm.fatTarget" class="target-input" />
            </div>
          </div>

          <button type="button" class="btn-save-targets" @click="saveTargets">
            บันทึกเป้าหมาย
          </button>
        </div>

        <!-- Data Management & Reset -->
        <div class="settings-section danger-section">
          <div class="section-title-row">
            <div>
              <h4 class="sec-title">จัดการข้อมูลทั้งหมด</h4>
              <p class="sec-desc">ล้างประวัติการบันทึกอาหารและคืนค่าเริ่มต้นของระบบ</p>
            </div>
          </div>

          <button type="button" class="btn-reset-data" @click="confirmReset">
            รีเซ็ตข้อมูลประวัติอาหารทั้งหมด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';
import { getGeminiApiKey, setGeminiApiKey, estimateNutritionWithGemini } from '../../services/nutritionApi.js';

const apiKeyInput = ref('');
const showKey = ref(false);
const isTestingKey = ref(false);
const testResult = ref(null);

const profileForm = reactive({
  calorieTarget: state.userProfile.calorieTarget || 2000,
  carbsTarget: state.userProfile.carbsTarget || 230,
  proteinTarget: state.userProfile.proteinTarget || 120,
  fatTarget: state.userProfile.fatTarget || 55
});

onMounted(() => {
  apiKeyInput.value = getGeminiApiKey();
});

function saveApiKey() {
  setGeminiApiKey(apiKeyInput.value);
  calorieStore.showToast('บันทึก Gemini API Key เรียบร้อย');
}

async function testApiKeyStepByStep() {
  const key = (apiKeyInput.value || '').trim();
  isTestingKey.value = true;
  testResult.value = null;

  const steps = [];

  // Step 1: Format validation
  if (!key) {
    steps.push({ ok: false, text: 'ขั้นที่ 1: ตรวจสอบ Key (ยังไม่ได้กรอก API Key)' });
    testResult.value = {
      status: 'error',
      message: 'กรุณากรอก Gemini API Key ก่อนทดสอบ หรือรับ Key ฟรีได้ที่ aistudio.google.com',
      steps
    };
    isTestingKey.value = false;
    return;
  }

  const isAiStudioFormat = key.startsWith('AIzaSy');
  steps.push({
    ok: isAiStudioFormat,
    text: isAiStudioFormat 
      ? 'ขั้นที่ 1: รูปแบบ Key ถูกต้อง (ขึ้นต้นด้วย AIzaSy...)' 
      : 'ขั้นที่ 1: รูปแบบ Key อาจไม่ใช่ของ Google AI Studio (โดยทั่วไปจะขึ้นต้นด้วย AIzaSy...)'
  });

  // Temporarily set key for test
  setGeminiApiKey(key);

  // Step 2: Live Ping to Google API
  const startTime = Date.now();
  try {
    const res = await estimateNutritionWithGemini('ไข่ต้ม 1 ฟอง');
    const elapsed = Date.now() - startTime;

    steps.push({ ok: true, text: `ขั้นที่ 2: เชื่อมต่อเซิร์ฟเวอร์ Gemini API สำเร็จ (${elapsed} ms)` });
    steps.push({ ok: true, text: `ขั้นที่ 3: วิเคราะห์เมนู "${res.name}" ได้ ${res.calories} kcal (${res.source})` });

    testResult.value = {
      status: 'success',
      latency: elapsed,
      message: 'เชื่อมต่อ Gemini AI สำเร็จและพร้อมใช้งานสำหรับค้นหาและสแกนอาหาร!',
      steps
    };
  } catch (err) {
    const elapsed = Date.now() - startTime;
    steps.push({ ok: false, text: `ขั้นที่ 2: เกิดข้อผิดพลาดในการเชื่อมต่อ (${err.message})` });
    steps.push({ ok: true, text: 'ขั้นที่ 3: ระบบจะใช้ฐานข้อมูลอาหารไทยมาตรฐาน 100+ เมนูเป็นระบบสำรองอัตโนมัติ' });

    testResult.value = {
      status: 'error',
      latency: elapsed,
      message: `ไม่สามารถเรียกใช้งาน Gemini API ได้: ${err.message}`,
      steps
    };
  } finally {
    isTestingKey.value = false;
  }
}

function saveTargets() {
  state.userProfile.calorieTarget = Math.max(800, Number(profileForm.calorieTarget) || 2000);
  state.userProfile.carbsTarget = Math.max(10, Number(profileForm.carbsTarget) || 200);
  state.userProfile.proteinTarget = Math.max(10, Number(profileForm.proteinTarget) || 100);
  state.userProfile.fatTarget = Math.max(10, Number(profileForm.fatTarget) || 50);

  calorieStore.showToast('อัปเดตเป้าหมายโภชนาการเรียบร้อย');
  calorieStore.closeModal();
}

function confirmReset() {
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลบันทึกอาหารทั้งหมด?')) {
    calorieStore.resetAllData();
    calorieStore.closeModal();
  }
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
  max-width: 540px;
  max-height: 90vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  animation: scaleUp 0.2s ease-out;
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
}

.modal-body {
  padding: 1.2rem 1.3rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.settings-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
}

.danger-section {
  background: #fef2f2;
  border-color: #fee2e2;
}

.section-title-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.sec-icon {
  font-size: 1.2rem;
}

.sec-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.sec-desc {
  font-size: 0.75rem;
  color: #64748b;
  margin: 2px 0 0;
}

.api-key-input-group {
  display: flex;
  position: relative;
  margin-bottom: 0.6rem;
}

.key-input {
  width: 100%;
  padding: 0.65rem 2.4rem 0.65rem 0.8rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.85rem;
  font-family: monospace;
  color: #0f172a;
  outline: none;
  background: #ffffff;
}

.key-input:focus {
  border-color: var(--primary-forest, #154238);
}

.btn-toggle-key {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Free Key Instructions Box */
.key-guide-box {
  background: var(--primary-light, #EBF3F0);
  border: 1px solid rgba(21, 66, 56, 0.2);
  border-radius: 12px;
  padding: 0.65rem 0.8rem;
  margin-bottom: 0.8rem;
}

.guide-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-forest, #154238);
  display: block;
  margin-bottom: 0.3rem;
}

.guide-steps {
  font-size: 0.74rem;
  color: var(--text-main, #0F1E17);
  padding-left: 1.2rem;
  margin: 0;
  line-height: 1.5;
}

.guide-link {
  color: var(--primary-forest, #154238);
  font-weight: 700;
  text-decoration: underline;
}

.api-actions-row {
  display: flex;
  gap: 0.5rem;
}

.btn-test-key, .btn-save-key {
  flex: 1;
  padding: 0.6rem 0.5rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-test-key {
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  color: #334155;
}

.btn-test-key:hover:not(:disabled) {
  background: #f1f5f9;
}

.btn-save-key {
  background: var(--primary-forest, #154238);
  border: none;
  color: #ffffff;
}

.btn-save-key:hover {
  background: var(--primary-dark, #0D281E);
}

/* Step by Step Test Feedback Box */
.test-feedback-box {
  margin-top: 0.8rem;
  padding: 0.8rem;
  border-radius: 12px;
  font-size: 0.78rem;
}

.test-feedback-box.success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.test-feedback-box.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.latency-tag {
  background: #ffffff;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  border: 1px solid currentColor;
}

.feedback-msg {
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.feedback-steps {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.4rem;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.74rem;
}

.step-item.pass { color: #047857; }
.step-item.fail { color: #b91c1c; }

.targets-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}

.target-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.target-field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.target-input {
  padding: 0.55rem 0.7rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  background: #ffffff;
}

.btn-save-targets {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-forest, #154238);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save-targets:hover {
  background: var(--primary-dark, #0D281E);
}

.btn-reset-data {
  width: 100%;
  padding: 0.65rem;
  background: #ffffff;
  border: 1.5px solid #fca5a5;
  color: #dc2626;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-reset-data:hover {
  background: #dc2626;
  color: #ffffff;
}
</style>
