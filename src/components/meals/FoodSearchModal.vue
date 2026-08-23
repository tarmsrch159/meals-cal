<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card-modern">
      <!-- Modal Header -->
      <div class="modal-header">
        <button type="button" class="btn-back-header" @click="closeModal" title="ปิด">
          ‹
        </button>
        <h2 class="modal-title">เพิ่มมื้ออาหาร</h2>
        <div class="header-placeholder"></div>
      </div>

      <!-- Meal Slot Pill Tabs (Clean Minimal Text Tabs) -->
      <div class="meal-pills-row">
        <button 
          v-for="slot in mealSlots" 
          :key="slot.id"
          type="button"
          class="btn-meal-pill-tab"
          :class="{ active: targetMeal === slot.id }"
          @click="targetMeal = slot.id"
        >
          <span>{{ slot.name }}</span>
        </button>
      </div>

      <!-- Search Input with AI / Scanner Shortcut -->
      <div class="search-input-wrapper">
        <svg class="search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          ref="searchInputRef"
          type="text" 
          v-model="searchQuery" 
          placeholder="ค้นหาอาหาร เช่น ข้าว, ไก่, สลัด..." 
          class="modern-search-input"
          @keyup.enter="triggerSearch"
          autocomplete="off"
        />
        <button 
          v-if="searchQuery" 
          type="button" 
          class="btn-clear-query" 
          @click="clearQuery"
        >
          ✕
        </button>
        <button 
          type="button" 
          class="btn-scan-shortcut" 
          @click="calorieStore.openScannerModal(targetMeal)"
          title="สแกนรูปภาพ AI"
        >
          <!-- Minimal Camera SVG -->
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
      </div>

      <div class="modal-scroll-area">
        <!-- 1. "แนะนำสำหรับคุณ" (Recommended Foods Carousel / Grid) -->
        <div class="recommend-section" v-if="!searchQuery">
          <h3 class="section-label">แนะนำสำหรับคุณ</h3>
          <div class="recommend-cards-scroll">
            <div 
              v-for="rec in recommendedFoods" 
              :key="rec.name"
              class="rec-food-card"
            >
              <div class="rec-img-box">
                <img :src="rec.image" :alt="rec.name" class="rec-food-img" />
              </div>
              <div class="rec-info-wrap">
                <h4 class="rec-name">{{ rec.name }}</h4>
                <div class="rec-bottom-row">
                  <span class="rec-cal font-num">{{ rec.calories }} kcal</span>
                  <button 
                    type="button" 
                    class="btn-neon-add" 
                    @click="addRecommendedFood(rec)"
                    title="เพิ่มรายการนี้"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. AI Gemini Estimate Banner (When typing) -->
        <div class="ai-trigger-banner" v-if="searchQuery.trim().length >= 2 && !isSearchingAI && !aiResult">
          <div class="ai-banner-content">
            <div class="ai-text">
              <strong>คำนวณด้วย AI Gemini:</strong>
              <span>"{{ searchQuery.trim() }}"</span>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-ask-gemini" 
            @click="askGeminiExplicit"
          >
            วิเคราะห์ทันที
          </button>
        </div>

        <!-- AI Loading Spinner -->
        <div class="ai-loading-state" v-if="isSearchingAI">
          <div class="spinner-ai"></div>
          <div class="ai-loading-text">
            <span>AI กำลังวิเคราะห์คุณค่าทางโภชนาการ...</span>
            <small>ระบบประมาณการอาหารไทยพร้อมทำงาน</small>
          </div>
        </div>

        <!-- AI Result Highlight -->
        <div v-if="aiResult" class="food-item-card ai-card">
          <div class="card-top">
            <span class="food-badge-ai">AI Gemini</span>
            <div class="serving-stepper">
              <button class="btn-step font-num" @click="adjustPortion(aiResult, -0.5)">-</button>
              <span class="step-val font-num">{{ aiResult.multiplier || 1 }}x</span>
              <button class="btn-step font-num" @click="adjustPortion(aiResult, 0.5)">+</button>
            </div>
          </div>
          <div class="card-main">
            <div class="food-title-row">
              <h4 class="food-name">{{ aiResult.name }}</h4>
              <div class="calories-pill font-num">
                <span class="cal-val font-num">{{ Math.round((aiResult.calories || 0) * (aiResult.multiplier || 1)) }}</span>
                <span class="cal-unit">kcal</span>
              </div>
            </div>
            <div class="serving-text">{{ aiResult.servingSize }}</div>
            <div class="macros-grid font-num">
              <span class="m-cell carb">C: {{ ((aiResult.carbs || 0) * (aiResult.multiplier || 1)).toFixed(0) }}g</span>
              <span class="m-cell pro">P: {{ ((aiResult.protein || 0) * (aiResult.multiplier || 1)).toFixed(0) }}g</span>
              <span class="m-cell fat">F: {{ ((aiResult.fat || 0) * (aiResult.multiplier || 1)).toFixed(0) }}g</span>
            </div>
          </div>
          <button type="button" class="btn-add-to-meal primary" @click="addFoodToMeal(aiResult)">
            + เพิ่มรายการนี้ลง{{ calorieStore.getMealTypeName(targetMeal) }}
          </button>
        </div>

        <!-- 3. Search Results List -->
        <div class="search-results-list" v-if="searchQuery">
          <div 
            v-for="item in filteredResults" 
            :key="item.id"
            class="food-item-card"
          >
            <div class="card-top">
              <span class="food-cat-badge">{{ item.category }}</span>
              <div class="serving-stepper">
                <button class="btn-step font-num" @click="adjustPortion(item, -0.5)">-</button>
                <span class="step-val font-num">{{ item.multiplier || 1 }}x</span>
                <button class="btn-step font-num" @click="adjustPortion(item, 0.5)">+</button>
              </div>
            </div>

            <div class="card-main">
              <div class="food-title-row">
                <h4 class="food-name">{{ item.name }}</h4>
                <div class="calories-pill font-num">
                  <span class="cal-val font-num">{{ Math.round((item.calories || 0) * (item.multiplier || 1)) }}</span>
                  <span class="cal-unit">kcal</span>
                </div>
              </div>
              <div class="serving-text">{{ item.servingSize }}</div>

              <div class="macros-grid font-num">
                <span class="m-cell carb">C: {{ ((item.carbs || 0) * (item.multiplier || 1)).toFixed(0) }}g</span>
                <span class="m-cell pro">P: {{ ((item.protein || 0) * (item.multiplier || 1)).toFixed(0) }}g</span>
                <span class="m-cell fat">F: {{ ((item.fat || 0) * (item.multiplier || 1)).toFixed(0) }}g</span>
              </div>
            </div>

            <button type="button" class="btn-add-to-meal" @click="addFoodToMeal(item)">
              + เพิ่มลงมื้อนี้
            </button>
          </div>
        </div>

        <!-- 4. "รายการอาหารของคุณ" (Current Logged Items in this Meal) -->
        <div class="current-meal-items-section">
          <h3 class="section-label">รายการอาหารของคุณใน{{ calorieStore.getMealTypeName(targetMeal) }}</h3>
          
          <div class="current-items-list" v-if="currentMealItems.length > 0">
            <div 
              v-for="cItem in currentMealItems" 
              :key="cItem.id"
              class="current-food-item-row"
            >
              <div class="c-thumb-box">
                <img :src="getDishAvatar(cItem.name)" :alt="cItem.name" class="c-thumb-img" />
              </div>
              <div class="c-info-col">
                <h4 class="c-name">{{ cItem.name }}</h4>
                <span class="c-sub font-num">{{ cItem.servingSize }}</span>
                <span class="c-kcal font-num">{{ Math.round(cItem.calories * (cItem.multiplier || 1)) }} kcal</span>
              </div>
              <button 
                type="button" 
                class="btn-delete-citem" 
                @click="removeItem(cItem.id)"
                title="ลบรายการนี้"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="no-items-current" v-else>
            <span>ยังไม่มีรายการอาหารใน{{ calorieStore.getMealTypeName(targetMeal) }}</span>
          </div>
        </div>
      </div>

      <!-- Bottom Neon CTA Button -->
      <div class="modal-footer-cta">
        <button 
          type="button" 
          class="btn-neon-save-meal font-num"
          @click="closeModal"
        >
          <span class="cta-label">บันทึกมื้ออาหาร</span>
          <span class="cta-summary font-num" v-if="currentMealItems.length > 0">
            <small>รวม {{ currentMealItems.length }} รายการ</small>
            <strong>{{ Math.round(currentMealTotals.calories) }} kcal</strong>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';
import { searchLocalFood, THAI_FOOD_DATABASE } from '../../data/thaiFoodDb.js';
import { estimateNutritionWithGemini } from '../../services/nutritionApi.js';

const searchInputRef = ref(null);
const targetMeal = ref(state.selectedMealType || 'breakfast');
const searchQuery = ref('');
const isSearchingAI = ref(false);
const aiResult = ref(null);

const mealSlots = [
  { id: 'breakfast', name: 'เช้า' },
  { id: 'lunch', name: 'กลางวัน' },
  { id: 'dinner', name: 'เย็น' },
  { id: 'snack', name: 'ของว่าง' }
];

// Recommended foods with realistic images
const recommendedFoods = [
  {
    name: 'อกไก่ย่าง + ข้าวกล้อง',
    calories: 420,
    protein: 36,
    carbs: 52,
    fat: 6,
    servingSize: '1 จาน (350g)',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=180&auto=format&fit=crop&q=80',
    source: 'เมนูแนะนำ'
  },
  {
    name: 'แซลมอนย่าง + มันหวาน',
    calories: 450,
    protein: 34,
    carbs: 42,
    fat: 14,
    servingSize: '1 จาน (300g)',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=180&auto=format&fit=crop&q=80',
    source: 'เมนูแนะนำ'
  },
  {
    name: 'สลัดอกไก่ไข่ต้ม',
    calories: 350,
    protein: 32,
    carbs: 18,
    fat: 12,
    servingSize: '1 ชาม (300g)',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=180&auto=format&fit=crop&q=80',
    source: 'เมนูแนะนำ'
  }
];

const localResults = ref([]);

onMounted(() => {
  targetMeal.value = state.selectedMealType || 'breakfast';
  localResults.value = THAI_FOOD_DATABASE.map(item => ({ ...item, multiplier: 1 }));
  
  nextTick(() => {
    if (searchInputRef.value) searchInputRef.value.focus();
  });
});

const currentMealItems = computed(() => {
  const meals = calorieStore.getMealsForDate();
  return meals[targetMeal.value] || [];
});

const currentMealTotals = computed(() => {
  return calorieStore.getMealTotals(targetMeal.value);
});

const filteredResults = computed(() => {
  return localResults.value.slice(0, 15);
});

watch(searchQuery, (newVal) => {
  const q = newVal.trim();
  if (!q) {
    localResults.value = THAI_FOOD_DATABASE.map(item => ({ ...item, multiplier: 1 }));
    aiResult.value = null;
    return;
  }
  localResults.value = searchLocalFood(q).map(item => ({ ...item, multiplier: 1 }));
});

function clearQuery() {
  searchQuery.value = '';
  aiResult.value = null;
}

function triggerSearch() {
  if (filteredResults.value.length === 0 && searchQuery.value.trim()) {
    askGeminiExplicit();
  }
}

async function askGeminiExplicit() {
  const q = searchQuery.value.trim();
  if (!q) return;

  isSearchingAI.value = true;
  aiResult.value = null;

  try {
    const result = await estimateNutritionWithGemini(q);
    aiResult.value = { ...result, multiplier: 1 };
  } catch (err) {
    console.error('AI estimate error:', err);
  } finally {
    isSearchingAI.value = false;
  }
}

function adjustPortion(item, delta) {
  const current = item.multiplier || 1;
  const next = Math.round((current + delta) * 10) / 10;
  if (next >= 0.5 && next <= 5) item.multiplier = next;
}

function addFoodToMeal(item) {
  calorieStore.addMealItem(targetMeal.value, item, item.multiplier || 1);
  searchQuery.value = '';
  aiResult.value = null;
}

function addRecommendedFood(rec) {
  calorieStore.addMealItem(targetMeal.value, rec, 1);
}

function removeItem(itemId) {
  calorieStore.removeMealItem(targetMeal.value, itemId);
}

function getDishAvatar(name) {
  if (name.includes('ไก่') || name.includes('ข้าว')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80';
  if (name.includes('สลัด') || name.includes('ผัก')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&auto=format&fit=crop&q=80';
  if (name.includes('ปลา') || name.includes('แซลมอน')) return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=120&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=120&auto=format&fit=crop&q=80';
}

function closeModal() {
  calorieStore.closeModal();
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 30, 23, 0.72);
  backdrop-filter: blur(8px);
  z-index: 2500;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card-modern {
  background: #FFFFFF;
  border-radius: var(--radius-xl, 32px);
  width: 100%;
  max-width: 520px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(21, 66, 56, 0.3);
  overflow: hidden;
  animation: popScale 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popScale {
  from { transform: scale(0.93); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.4rem 0.6rem;
}

.btn-back-header {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-app, #F9F9F6);
  border: 1px solid var(--border-subtle, #E8ECE9);
  color: var(--text-main, #0F1E17);
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-main, #0F1E17);
  margin: 0;
}

.header-placeholder {
  width: 36px;
}

/* Meal Pills Row */
.meal-pills-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  padding: 0.5rem 1.4rem;
}

.btn-meal-pill-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.3rem;
  border-radius: 999px;
  border: 1px solid #E8ECE9;
  background: var(--bg-app, #F9F9F6);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted, #52665C);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-meal-pill-tab.active {
  background: var(--primary-forest, #154238);
  border-color: var(--primary-forest, #154238);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(21, 66, 56, 0.25);
}

/* Search Input */
.search-input-wrapper {
  position: relative;
  margin: 0.7rem 1.4rem 0.4rem;
}

.search-ico {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8E9E96;
}

.modern-search-input {
  width: 100%;
  padding: 0.8rem 4.5rem 0.8rem 2.6rem;
  border-radius: 16px;
  border: 1.5px solid #E2E8F0;
  background: var(--bg-app, #F9F9F6);
  font-size: 0.92rem;
  color: var(--text-main, #0F1E17);
  outline: none;
  transition: all 0.2s;
}

.modern-search-input:focus {
  background: #FFFFFF;
  border-color: var(--primary-forest, #154238);
  box-shadow: 0 0 0 3px rgba(21, 66, 56, 0.1);
}

.btn-clear-query {
  position: absolute;
  right: 42px;
  top: 50%;
  transform: translateY(-50%);
  background: #CBD5E1;
  color: #FFFFFF;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.65rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-scan-shortcut {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary-light, #EBF3F0);
  border: none;
  color: var(--primary-forest, #154238);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scroll Area */
.modal-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0.6rem 1.4rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.section-label {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin: 0 0 0.65rem;
}

/* Recommended Cards Scroll */
.recommend-cards-scroll {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.rec-food-card {
  background: var(--surface-card, #FFFFFF);
  border: 1px solid var(--border-subtle, #E8ECE9);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.rec-img-box {
  width: 100%;
  height: 90px;
  background: #F1F5F2;
}

.rec-food-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rec-info-wrap {
  padding: 0.55rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
}

.rec-name {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-main, #0F1E17);
  margin: 0 0 0.35rem;
  line-height: 1.2;
}

.rec-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rec-cal {
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--text-muted, #52665C);
}

.btn-neon-add {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-neon, #D4FF32);
  border: none;
  color: var(--accent-neon-text, #0E251D);
  font-size: 0.95rem;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(212, 255, 50, 0.4);
  transition: transform 0.15s;
}

.btn-neon-add:hover {
  transform: scale(1.15);
}

/* AI Trigger Banner */
.ai-trigger-banner {
  background: linear-gradient(135deg, #EBF3F0 0%, #F0F6F3 100%);
  border: 1px solid rgba(21, 66, 56, 0.2);
  border-radius: 14px;
  padding: 0.65rem 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-banner-content {
  display: flex;
  align-items: center;
}

.ai-text {
  font-size: 0.78rem;
  color: var(--primary-forest, #154238);
}

.ai-text strong { display: block; }

.btn-ask-gemini {
  padding: 0.45rem 0.8rem;
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.ai-loading-state {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background: var(--bg-app, #F9F9F6);
  border-radius: 12px;
}

.spinner-ai {
  width: 22px;
  height: 22px;
  border: 3px solid #E2E8F0;
  border-top-color: var(--primary-forest, #154238);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Cards in List */
.food-item-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle, #E8ECE9);
  border-radius: 16px;
  padding: 0.85rem;
  margin-bottom: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-cat-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--primary-light, #EBF3F0);
  color: var(--primary-forest, #154238);
  padding: 1px 6px;
  border-radius: 6px;
}

.food-badge-ai {
  font-size: 0.72rem;
  font-weight: 800;
  background: #EDE9FE;
  color: #6D28D9;
  padding: 2px 7px;
  border-radius: 6px;
}

.serving-stepper {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 1px;
}

.btn-step {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  font-weight: 800;
  cursor: pointer;
}

.step-val {
  font-size: 0.74rem;
  font-weight: 800;
  min-width: 22px;
  text-align: center;
}

.food-title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.food-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin: 0;
}

.calories-pill {
  font-size: 0.95rem;
  font-weight: 900;
  color: var(--primary-forest, #154238);
}

.serving-text {
  font-size: 0.72rem;
  color: var(--text-muted, #52665C);
}

.macros-grid {
  display: flex;
  gap: 0.6rem;
  font-size: 0.72rem;
  font-weight: 700;
}

.m-cell.carb { color: var(--macro-carb, #3B82F6); }
.m-cell.pro { color: var(--macro-protein, #8B5CF6); }
.m-cell.fat { color: var(--macro-fat, #F59E0B); }

.btn-add-to-meal {
  width: 100%;
  padding: 0.6rem;
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-add-to-meal.primary {
  background: #6366F1;
}

/* Current Logged Meal Items */
.current-meal-items-section {
  display: flex;
  flex-direction: column;
}

.current-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.current-food-item-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.85rem;
  background: var(--bg-app, #F9F9F6);
  border: 1px solid var(--border-subtle, #E8ECE9);
  border-radius: 16px;
}

.c-thumb-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.c-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.c-info-col {
  flex: 1;
  min-width: 0;
}

.c-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.c-sub {
  font-size: 0.7rem;
  color: var(--text-muted, #52665C);
  display: block;
}

.c-kcal {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--primary-forest, #154238);
}

.btn-delete-citem {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #FEE2E2;
  color: #EF4444;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.no-items-current {
  padding: 1.2rem;
  text-align: center;
  font-size: 0.82rem;
  color: #8E9E96;
  background: var(--bg-app, #F9F9F6);
  border-radius: 14px;
  border: 1px dashed #CBD5E1;
}

/* Bottom Neon CTA Button */
.modal-footer-cta {
  padding: 0.9rem 1.4rem 1.2rem;
  border-top: 1px solid #F1F5F2;
  background: #FFFFFF;
}

.btn-neon-save-meal {
  width: 100%;
  padding: 0.95rem 1.2rem;
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  border: none;
  border-radius: 18px;
  font-size: 1.05rem;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 6px 20px rgba(212, 255, 50, 0.4);
  transition: all 0.15s ease;
}

.btn-neon-save-meal:hover {
  background: var(--accent-neon-hover, #C5F325);
  transform: translateY(-1px);
}

.cta-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.95rem;
  line-height: 1.1;
}

.cta-summary small {
  font-size: 0.65rem;
  font-weight: 700;
  opacity: 0.8;
}
</style>
