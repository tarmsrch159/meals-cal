<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">เพิ่มรายการเองด่วน</h2>
          <p class="modal-subtitle">บันทึกลงใน: {{ calorieStore.getMealTypeName(targetMeal) }}</p>
        </div>
        <button type="button" class="btn-close" @click="closeModal">✕</button>
      </div>

      <!-- Meal Selector -->
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

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">ชื่ออาหาร / รายการ *</label>
          <input 
            type="text" 
            v-model="foodName" 
            placeholder="เช่น สลัดอกไก่, เวย์โปรตีน 1 สกู๊ป, กล้วยหอม" 
            class="form-input"
            required
            ref="nameInputRef"
          />
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">พลังงาน (แคลอรี่) *</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                v-model.number="calories" 
                placeholder="0" 
                class="form-input" 
                required 
                min="0"
              />
              <span class="unit-tag">kcal</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">ปริมาณ / หน่วย</label>
            <input 
              type="text" 
              v-model="servingSize" 
              placeholder="1 จาน / 1 แก้ว" 
              class="form-input"
            />
          </div>
        </div>

        <!-- Optional Macros Section -->
        <div class="macros-collapsible">
          <div class="macro-section-title">สารอาหารหลัก (ไม่บังคับ):</div>
          <div class="macro-inputs-grid">
            <div class="form-group">
              <label class="form-label carb-text">คาร์โบไฮเดรต</label>
              <div class="input-with-unit">
                <input type="number" v-model.number="carbs" placeholder="0" class="form-input" step="0.1" min="0" />
                <span class="unit-tag">g</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label pro-text">โปรตีน</label>
              <div class="input-with-unit">
                <input type="number" v-model.number="protein" placeholder="0" class="form-input" step="0.1" min="0" />
                <span class="unit-tag">g</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label fat-text">ไขมัน</label>
              <div class="input-with-unit">
                <input type="number" v-model.number="fat" placeholder="0" class="form-input" step="0.1" min="0" />
                <span class="unit-tag">g</span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" class="btn-submit">
          + บันทึกรายการ
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';

const targetMeal = ref(state.selectedMealType || 'breakfast');
const foodName = ref('');
const calories = ref(null);
const carbs = ref(null);
const protein = ref(null);
const fat = ref(null);
const servingSize = ref('1 จาน');
const nameInputRef = ref(null);

onMounted(() => {
  targetMeal.value = state.selectedMealType || 'breakfast';
  nextTick(() => {
    if (nameInputRef.value) nameInputRef.value.focus();
  });
});

function handleSubmit() {
  if (!foodName.value.trim() || calories.value === null) return;

  const item = {
    name: foodName.value.trim(),
    calories: Number(calories.value) || 0,
    protein: Number(protein.value) || 0,
    carbs: Number(carbs.value) || 0,
    fat: Number(fat.value) || 0,
    fiber: 0,
    sodium: 0,
    servingSize: servingSize.value || '1 หน่วยบริโภค',
    source: 'เพิ่มเอง'
  };

  calorieStore.addMealItem(targetMeal.value, item, 1);
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
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
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
}

.btn-slot-tab.active {
  background: var(--primary-forest, #154238);
  border-color: var(--primary-forest, #154238);
  color: #ffffff;
}

.modal-body {
  padding: 1.2rem 1.3rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
}

.carb-text { color: var(--macro-carb, #3B82F6); }
.pro-text { color: var(--macro-protein, #8B5CF6); }
.fat-text { color: var(--macro-fat, #F59E0B); }

.form-input {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.92rem;
  color: #0f172a;
  outline: none;
  background: #f8fafc;
}

.form-input:focus {
  background: #ffffff;
  border-color: var(--primary-forest, #154238);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.input-with-unit {
  position: relative;
}

.unit-tag {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 600;
}

.macros-collapsible {
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.8rem;
  border: 1px solid #e2e8f0;
}

.macro-section-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.5rem;
}

.macro-inputs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.btn-submit {
  width: 100%;
  padding: 0.85rem;
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 900;
  cursor: pointer;
  margin-top: 0.4rem;
  box-shadow: 0 4px 14px rgba(212, 255, 50, 0.4);
  transition: all 0.15s;
}

.btn-submit:hover {
  background: var(--accent-neon-hover, #C5F325);
  transform: translateY(-1px);
}
</style>
