<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">ตั้งค่าระบบ & สารอาหาร</h2>
          <p class="modal-subtitle">จัดการผู้ให้บริการ AI, เป้าหมายแคลอรี่ และข้อมูลของคุณ</p>
        </div>
        <button type="button" class="btn-close" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <!-- 1. AI Provider & Key Management -->
        <div class="settings-section ai-settings-section">
          <div class="section-title-row">
            <div>
              <h4 class="sec-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
                <span>ผู้ให้บริการ AI (AI Provider)</span>
              </h4>
              <p class="sec-desc">เลือก AI หลักสำหรับการคำนวณโภชนาการและสแกนภาพ (ระบบมี Failover อัตโนมัติ)</p>
            </div>
          </div>

          <!-- Provider Switcher -->
          <div class="ai-provider-switcher">
            <button 
              type="button" 
              class="btn-provider-choice" 
              :class="{ active: activeProvider === 'groq' }"
              @click="switchProvider('groq')"
            >
              <div class="provider-icon groq">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#F55036"/><path d="M12 5C8.13 5 5 8.13 5 12s3.13 7 7 7 7-3.13 7-7h-7v2.5h4.24c-.65 1.77-2.36 3-4.24 3-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5c1.15 0 2.2.43 3 1.15l1.77-1.77C15.54 5.76 13.86 5 12 5z" fill="#FFFFFF"/></svg>
              </div>
              <div class="provider-info">
                <strong>Groq Cloud</strong>
                <small>ความเร็วสูงพิเศษ (Compound Mini / 120B)</small>
              </div>
              <span class="active-tag" v-if="activeProvider === 'groq'">หลัก</span>
            </button>

            <button 
              type="button" 
              class="btn-provider-choice" 
              :class="{ active: activeProvider === 'gemini' }"
              @click="switchProvider('gemini')"
            >
              <div class="provider-icon gemini">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="#4E80EE"/></svg>
              </div>
              <div class="provider-info">
                <strong>Google Gemini</strong>
                <small>วิเคราะห์แม่นยำสูง (Gemini 2.5 Flash / Vision)</small>
              </div>
              <span class="active-tag" v-if="activeProvider === 'gemini'">หลัก</span>
            </button>
          </div>

          <!-- Connection Diagnostic Test Button -->
          <div class="ai-test-row">
            <button 
              type="button" 
              class="btn-test-ai font-num" 
              :disabled="isTestingAi"
              @click="runConnectionTest"
            >
              <span v-if="!isTestingAi">⚡ ทดสอบสถานะการเชื่อมต่อ AI ทั้งหมด</span>
              <span v-else class="testing-state">
                <span class="spinner-mini"></span>
                <span>กำลังทดสอบการเชื่อมต่อ...</span>
              </span>
            </button>
          </div>

          <!-- Test Results Status Box -->
          <div class="test-results-box" v-if="testResults">
            <div class="test-item" :class="testResults.groq.status">
              <span class="dot" :class="testResults.groq.status"></span>
              <div class="test-detail">
                <strong>Groq Cloud:</strong>
                <span>{{ testResults.groq.message }}</span>
              </div>
            </div>
            <div class="test-item" :class="testResults.gemini.status">
              <span class="dot" :class="testResults.gemini.status"></span>
              <div class="test-detail">
                <strong>Google Gemini:</strong>
                <span>{{ testResults.gemini.message }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Manual Daily Targets Adjustments -->
        <div class="settings-section">
          <div class="section-title-row">
            <div>
              <h4 class="sec-title">เป้าหมายสารอาหารรายวัน</h4>
              <p class="sec-desc">ปรับเปลี่ยนตัวเลขเป้าหมายแคลอรี่และสารอาหารได้โดยตรง</p>
            </div>
          </div>

          <div class="targets-form-grid">
            <div class="target-field">
              <label class="field-label">
                <span class="label-bullet cal"></span>
                <span>แคลอรี่ (kcal)</span>
              </label>
              <input 
                type="number" 
                v-model.number="profileForm.calorieTarget" 
                class="target-input font-num" 
                placeholder="2000"
              />
            </div>
            <div class="target-field">
              <label class="field-label">
                <span class="label-bullet carb"></span>
                <span>คาร์โบไฮเดรต (g)</span>
              </label>
              <input 
                type="number" 
                v-model.number="profileForm.carbsTarget" 
                class="target-input font-num" 
                placeholder="230"
              />
            </div>
            <div class="target-field">
              <label class="field-label">
                <span class="label-bullet pro"></span>
                <span>โปรตีน (g)</span>
              </label>
              <input 
                type="number" 
                v-model.number="profileForm.proteinTarget" 
                class="target-input font-num" 
                placeholder="120"
              />
            </div>
            <div class="target-field">
              <label class="field-label">
                <span class="label-bullet fat"></span>
                <span>ไขมัน (g)</span>
              </label>
              <input 
                type="number" 
                v-model.number="profileForm.fatTarget" 
                class="target-input font-num" 
                placeholder="55"
              />
            </div>
          </div>

          <button type="button" class="btn-save-targets" @click="saveTargets">
            บันทึกเป้าหมาย
          </button>
        </div>

        <!-- 3. Data Management & Reset -->
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
import { setAiProviderPreference, testAiConnection } from '../../services/nutritionApi.js';
import { isGroqActive } from '../../services/aiService.js';

const activeProvider = ref(isGroqActive() ? 'groq' : 'gemini');
const isTestingAi = ref(false);
const testResults = ref(null);

onMounted(() => {
  activeProvider.value = isGroqActive() ? 'groq' : 'gemini';
});

function switchProvider(p) {
  activeProvider.value = p;
  setAiProviderPreference(p);
  calorieStore.showToast(`เปลี่ยน AI หลักเป็น ${p === 'groq' ? 'Groq Cloud' : 'Google Gemini'} เรียบร้อย ✨`);
}

async function runConnectionTest() {
  isTestingAi.value = true;
  testResults.value = null;
  try {
    const res = await testAiConnection('all');
    testResults.value = res;
    if (res.groq.status === 'online' || res.gemini.status === 'online') {
      calorieStore.showToast('✅ การทดสอบการเชื่อมต่อ AI พร้อมใช้งานสมบูรณ์');
    } else {
      calorieStore.showToast('⚠️ ตรวจพบปัญหาการเชื่อมต่อ กรุณาตรวจสอบ API Key', 'error');
    }
  } catch (err) {
    console.error('Test error:', err);
    calorieStore.showToast('เกิดข้อผิดพลาดในการทดสอบ', 'error');
  } finally {
    isTestingAi.value = false;
  }
}

const profileForm = reactive({
  calorieTarget: state.userProfile.calorieTarget || 2000,
  carbsTarget: state.userProfile.carbsTarget || 230,
  proteinTarget: state.userProfile.proteinTarget || 120,
  fatTarget: state.userProfile.fatTarget || 55
});

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
  max-width: 500px;
  max-height: 90vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  animation: scaleUp 0.2s ease-out;
  box-sizing: border-box;
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

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.76rem;
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
  flex-shrink: 0;
}

.modal-body {
  padding: 1.2rem 1.3rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  box-sizing: border-box;
}

.settings-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.1rem;
  box-sizing: border-box;
}

.ai-settings-section {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
}

.section-title-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
}

.sec-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.sec-desc {
  font-size: 0.74rem;
  color: #64748b;
  margin: 2px 0 0;
  line-height: 1.35;
}

/* AI Provider Switcher */
.ai-provider-switcher {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.btn-provider-choice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.btn-provider-choice:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-provider-choice.active {
  background: #f0fdf4;
  border-color: var(--primary-forest, #154238);
  box-shadow: 0 2px 8px rgba(21, 66, 56, 0.1);
}

.provider-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.provider-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.provider-info strong {
  font-size: 0.88rem;
  color: #0f172a;
}

.provider-info small {
  font-size: 0.72rem;
  color: #64748b;
}

.active-tag {
  background: var(--primary-forest, #154238);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
}

/* Connection Test */
.ai-test-row {
  margin-top: 0.4rem;
}

.btn-test-ai {
  width: 100%;
  padding: 0.6rem;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-test-ai:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
}

.testing-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.spinner-mini {
  width: 12px;
  height: 12px;
  border: 2px solid #cbd5e1;
  border-top-color: var(--primary-forest, #154238);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.test-results-box {
  margin-top: 0.6rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.7rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.test-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.test-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.online { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
.dot.error { background: #ef4444; }

.test-detail {
  color: #475569;
}

.test-detail strong {
  color: #0f172a;
  margin-right: 4px;
}

/* Targets Form */
.targets-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.target-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.label-bullet {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.label-bullet.cal { background: var(--primary-forest, #154238); }
.label-bullet.carb { background: var(--macro-carb, #3B82F6); }
.label-bullet.pro { background: var(--macro-protein, #8B5CF6); }
.label-bullet.fat { background: var(--macro-fat, #F59E0B); }

.target-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.65rem 0.75rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  outline: none;
  background: #ffffff;
  transition: all 0.15s ease;
}

.target-input:focus {
  border-color: var(--primary-forest, #154238);
  box-shadow: 0 0 0 3px rgba(21, 66, 56, 0.12);
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
  box-shadow: 0 4px 12px rgba(21, 66, 56, 0.2);
  transition: all 0.15s;
}

.btn-save-targets:hover {
  background: var(--primary-dark, #0D281E);
  transform: translateY(-1px);
}

.danger-section {
  background: #fef2f2;
  border-color: #fee2e2;
}

.btn-reset-data {
  width: 100%;
  padding: 0.65rem;
  background: #ffffff;
  border: 1.5px solid #fca5a5;
  color: #dc2626;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-reset-data:hover {
  background: #dc2626;
  color: #ffffff;
}
</style>
