<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">คำนวณ BMR / TDEE & ตั้งเป้าหมาย</h2>
          <p class="modal-subtitle">คำนวณพลังงานที่ร่างกายต้องการต่อวันตามสรีระและกิจกรรม</p>
        </div>
        <button type="button" class="btn-close" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <!-- Gender selector -->
        <div class="form-group">
          <label class="form-label">เพศ</label>
          <div class="gender-selector">
            <button 
              type="button" 
              class="btn-gender" 
              :class="{ active: form.gender === 'male' }"
              @click="form.gender = 'male'"
            >
              ชาย
            </button>
            <button 
              type="button" 
              class="btn-gender" 
              :class="{ active: form.gender === 'female' }"
              @click="form.gender = 'female'"
            >
              หญิง
            </button>
          </div>
        </div>

        <!-- Age, Weight, Height Grid -->
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">อายุ (ปี)</label>
            <input type="number" v-model.number="form.age" class="form-input" min="10" max="100" />
          </div>
          <div class="form-group">
            <label class="form-label">น้ำหนัก (kg)</label>
            <input type="number" v-model.number="form.weight" class="form-input" min="30" max="250" />
          </div>
          <div class="form-group">
            <label class="form-label">ส่วนสูง (cm)</label>
            <input type="number" v-model.number="form.height" class="form-input" min="100" max="230" />
          </div>
        </div>

        <!-- Activity Level -->
        <div class="form-group">
          <label class="form-label">ระดับกิจกรรมในชีวิตประจำวัน</label>
          <select v-model="form.activityLevel" class="form-select">
            <option value="sedentary">นั่งทำงานอยู่กับที่ ไม่ออกกำลังกาย (x1.2)</option>
            <option value="light">ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์ (x1.375)</option>
            <option value="moderate">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์ (x1.55)</option>
            <option value="heavy">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์ (x1.725)</option>
            <option value="athlete">นักกีฬา / ใช้แรงงานหนักตลอดวัน (x1.9)</option>
          </select>
        </div>

        <!-- Goal Selection -->
        <div class="form-group">
          <label class="form-label">เป้าหมายของคุณ</label>
          <div class="goal-selector">
            <button 
              type="button" 
              class="btn-goal" 
              :class="{ active: form.goal === 'lose' }"
              @click="form.goal = 'lose'"
            >
              ลดน้ำหนัก (-500 kcal)
            </button>
            <button 
              type="button" 
              class="btn-goal" 
              :class="{ active: form.goal === 'maintain' }"
              @click="form.goal = 'maintain'"
            >
              รักษาน้ำหนัก (สมดุล)
            </button>
            <button 
              type="button" 
              class="btn-goal" 
              :class="{ active: form.goal === 'gain' }"
              @click="form.goal = 'gain'"
            >
              เพิ่มน้ำหนัก / สร้างกล้าม (+400 kcal)
            </button>
          </div>
        </div>

        <!-- Diet Type / Macro Split -->
        <div class="form-group">
          <label class="form-label">สัดส่วนสารอาหาร (Diet Strategy)</label>
          <select v-model="form.dietType" class="form-select">
            <option value="balanced">สมดุลทั่วไป (Carb 50% / Protein 25% / Fat 25%)</option>
            <option value="high_protein">ไฮโปรตีน ฟิตหุ่น (Carb 35% / Protein 35% / Fat 30%)</option>
            <option value="low_carb">โลว์คาร์บ (Carb 20% / Protein 40% / Fat 40%)</option>
            <option value="keto">คีโตเจนิก (Carb 5% / Protein 25% / Fat 70%)</option>
          </select>
        </div>

        <!-- Calculated Live Result Box -->
        <div class="calculated-preview-box">
          <div class="calc-row">
            <div class="calc-stat">
              <span class="c-label">BMR (เผาผลาญพื้นฐาน)</span>
              <span class="c-num font-num">{{ calculated.bmr }} <span class="c-unit">kcal</span></span>
            </div>
            <div class="calc-stat">
              <span class="c-label">TDEE (ใช้พลังงานรวม)</span>
              <span class="c-num font-num">{{ calculated.tdee }} <span class="c-unit">kcal</span></span>
            </div>
          </div>

          <div class="target-highlight-card">
            <span class="target-title">เป้าหมายแคลอรี่แนะนำต่อวัน</span>
            <div class="target-num-display">
              <span class="num">{{ calculated.calorieTarget }}</span>
              <span class="unit">kcal / วัน</span>
            </div>

            <!-- Target Macros Breakdown -->
            <div class="target-macros-row">
              <span class="tm-pill carb">🍞 คาร์บ {{ calculated.carbsTarget }}g</span>
              <span class="tm-pill pro">🥩 โปรตีน {{ calculated.proteinTarget }}g</span>
              <span class="tm-pill fat">🥑 ไขมัน {{ calculated.fatTarget }}g</span>
            </div>
          </div>
        </div>

        <button type="button" class="btn-apply-targets" @click="applyTargets">
          🎯 บันทึกและใช้เป้าหมายนี้
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';

const form = reactive({
  gender: state.userProfile.gender || 'male',
  age: state.userProfile.age || 28,
  weight: state.userProfile.weight || 65,
  height: state.userProfile.height || 170,
  activityLevel: state.userProfile.activityLevel || 'moderate',
  goal: state.userProfile.goal || 'maintain',
  dietType: state.userProfile.dietType || 'balanced'
});

const calculated = computed(() => calorieStore.calculateBmrTdee(form));

function applyTargets() {
  state.userProfile.gender = form.gender;
  state.userProfile.age = form.age;
  state.userProfile.weight = form.weight;
  state.userProfile.height = form.height;
  state.userProfile.activityLevel = form.activityLevel;
  state.userProfile.goal = form.goal;
  state.userProfile.dietType = form.dietType;

  calorieStore.applyBmrCalculation(calculated.value);
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
  max-width: 520px;
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
  font-size: 1.15rem;
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
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}

.gender-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.btn-gender {
  padding: 0.6rem;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.btn-gender.active {
  border-color: var(--primary-forest, #154238);
  background: var(--primary-light, #EBF3F0);
  color: var(--primary-forest, #154238);
}

.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  background: #f8fafc;
}

.form-input:focus, .form-select:focus {
  background: #ffffff;
  border-color: var(--primary-forest, #154238);
}

.goal-selector {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.btn-goal {
  padding: 0.55rem 0.8rem;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-goal.active {
  background: var(--primary-light, #EBF3F0);
  border-color: var(--primary-forest, #154238);
  color: var(--primary-forest, #154238);
  font-weight: 700;
}

/* Calculated Box */
.calculated-preview-box {
  background: linear-gradient(135deg, #154238 0%, #0D281E 100%);
  border: 1px solid rgba(212, 255, 50, 0.25);
  border-radius: 20px;
  padding: 1.1rem;
  color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(21, 66, 56, 0.25);
}

.calc-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 0.8rem;
}

.calc-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.c-label {
  font-size: 0.72rem;
  color: #A3C2B6;
  font-weight: 600;
}

.c-num {
  font-size: 1.4rem;
  font-weight: 900;
  color: #FFFFFF;
}

.c-unit {
  font-size: 0.68rem;
  color: #C2D6CE;
}

.target-highlight-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 0.8rem;
  text-align: center;
}

.target-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #A3C2B6;
  display: block;
  margin-bottom: 0.2rem;
}

.target-num-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.target-num-display .num {
  font-size: 2rem;
  font-weight: 900;
  color: #15803D;
}

.target-num-display .unit {
  font-size: 0.85rem;
  font-weight: 700;
  color: #166534;
}

.target-macros-row {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tm-pill {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: #ffffff;
}

.tm-pill.carb { color: #2563EB; }
.tm-pill.pro { color: #059669; }
.tm-pill.fat { color: #D97706; }

.btn-apply-targets {
  width: 100%;
  padding: 0.85rem;
  background: #10B981;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
  transition: background 0.15s;
}

.btn-apply-targets:hover {
  background: #059669;
}
</style>
