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
          placeholder="ค้นหาหรือพิมพ์ชื่อเมนูเพื่อวิเคราะห์ AI..." 
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
          class="btn-ai-search-action" 
          :class="{ loading: isSearchingAI }"
          @click="askGeminiExplicit"
          title="ค้นหาและวิเคราะห์สารอาหารด้วย AI (Groq / Gemini)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
          <span>ค้นหาด้วย AI</span>
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

      <!-- Quick Sub-Tabs: All / Favorites / Recent -->
      <div class="search-sub-tabs" v-if="!searchQuery">
        <button 
          type="button" 
          class="btn-sub-tab" 
          :class="{ active: activeSubTab === 'all' }"
          @click="activeSubTab = 'all'"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>แนะนำ</span>
        </button>
        <button 
          type="button" 
          class="btn-sub-tab" 
          :class="{ active: activeSubTab === 'favorites' }"
          @click="activeSubTab = 'favorites'"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>เมนูโปรด ({{ state.favorites.length }})</span>
        </button>
        <button 
          type="button" 
          class="btn-sub-tab" 
          :class="{ active: activeSubTab === 'recent' }"
          @click="activeSubTab = 'recent'"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>ล่าสุด</span>
        </button>
      </div>

      <div class="modal-scroll-area">
        <!-- Favorites Tab List -->
        <div class="favorites-tab-view" v-if="!searchQuery && activeSubTab === 'favorites'">
          <h3 class="section-label">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#D97706" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>เมนูโปรดที่บันทึกไว้</span>
          </h3>
          <div class="fav-items-grid" v-if="state.favorites.length > 0">
            <div 
              v-for="fav in state.favorites" 
              :key="fav.id" 
              class="fav-food-card"
            >
              <div class="fav-card-main">
                <div class="fav-title-row">
                  <h4 class="fav-name">{{ fav.name }}</h4>
                  <span class="fav-cal font-num">{{ fav.calories }} kcal</span>
                </div>
                <div class="fav-macros font-num">
                  <span class="m-tag pro font-num">P: {{ fav.protein }}g</span>
                  <span class="m-tag carb font-num">C: {{ fav.carbs }}g</span>
                  <span class="m-tag fat font-num">F: {{ fav.fat }}g</span>
                </div>
              </div>
              <div class="fav-actions">
                <button 
                  type="button" 
                  class="btn-quick-add-fav" 
                  @click="addFoodToMeal(fav)"
                  title="เพิ่มลงมื้ออาหาร"
                >
                  + เพิ่ม
                </button>
                <button 
                  type="button" 
                  class="btn-unfav" 
                  @click="calorieStore.toggleFavorite(fav)"
                  title="นำออกจากเมนูโปรด"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="empty-fav-hint" v-else>
            <p>ยังไม่มีเมนูโปรด กดที่ไอคอนดาวในการ์ดมื้ออาหารเพื่อบันทึกเมนูที่กินประจำไว้ที่นี่ได้เลย</p>
          </div>
        </div>

        <!-- Recent Searches Tab View -->
        <div class="recent-tab-view" v-if="!searchQuery && activeSubTab === 'recent'">
          <h3 class="section-label">🕒 ประวัติค้นหาล่าสุด</h3>
          <div class="recent-chips-wrap">
            <button 
              v-for="term in state.recentSearches" 
              :key="term"
              type="button"
              class="btn-recent-term"
              @click="applyRecentSearch(term)"
            >
              <span>{{ term }}</span>
            </button>
          </div>
        </div>

        <!-- 1. "แนะนำสำหรับคุณ" (Recommended Foods Carousel / Grid) -->
        <div class="recommend-section" v-if="!searchQuery && activeSubTab === 'all'">
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

        <!-- 2. AI Estimate Banner (When typing) -->
        <div class="ai-trigger-banner" v-if="searchQuery.trim().length >= 2 && !isSearchingAI && !aiResult">
          <div class="ai-banner-content">
            <div class="ai-text">
              <strong>วิเคราะห์โภชนาการด้วย AI:</strong>
              <span>"{{ searchQuery.trim() }}"</span>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-ask-gemini" 
            @click="askGeminiExplicit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span>วิเคราะห์ทันที</span>
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

        <!-- AI Result Highlight with Provider Logo -->
        <div v-if="aiResult" class="food-item-card ai-card">
          <div class="card-top">
            <span v-if="aiResult.aiProvider === 'groq'" class="ai-provider-pill badge-groq">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#F55036"/><path d="M12 5C8.13 5 5 8.13 5 12s3.13 7 7 7 7-3.13 7-7h-7v2.5h4.24c-.65 1.77-2.36 3-4.24 3-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5c1.15 0 2.2.43 3 1.15l1.77-1.77C15.54 5.76 13.86 5 12 5z" fill="#FFFFFF"/></svg>
              <span>Groq AI ({{ aiResult.model || 'Llama 3.3' }})</span>
            </span>
            <span v-else-if="aiResult.aiProvider === 'gemini'" class="ai-provider-pill badge-gemini">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="#4E80EE"/></svg>
              <span>Google Gemini ({{ aiResult.model || 'Flash' }})</span>
            </span>
            <span v-else class="ai-provider-pill badge-local">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <span>คลังข้อมูลไทย (Local)</span>
            </span>

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
              <div class="card-top-badges">
                <span class="food-cat-badge">{{ item.category }}</span>
                <span v-if="item.aiProvider === 'groq' || (item.source && item.source.toLowerCase().includes('groq'))" class="ai-provider-pill badge-groq">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#F55036"/><path d="M12 5C8.13 5 5 8.13 5 12s3.13 7 7 7 7-3.13 7-7h-7v2.5h4.24c-.65 1.77-2.36 3-4.24 3-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5c1.15 0 2.2.43 3 1.15l1.77-1.77C15.54 5.76 13.86 5 12 5z" fill="#FFFFFF"/></svg>
                  <span>Groq</span>
                </span>
                <span v-else-if="item.aiProvider === 'gemini' || (item.source && (item.source.toLowerCase().includes('gemini') || item.source.toLowerCase().includes('google')))" class="ai-provider-pill badge-gemini">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="#4E80EE"/></svg>
                  <span>Gemini</span>
                </span>
                <span v-else-if="item.source && item.source.includes('ฐานข้อมูล')" class="ai-provider-pill badge-local">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  <span>คลังไทย</span>
                </span>
              </div>
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
const activeSubTab = ref('all'); // 'all' | 'favorites' | 'recent'
const isSearchingAI = ref(false);
const aiResult = ref(null);

function applyRecentSearch(term) {
  searchQuery.value = term;
}

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

let searchAiDebounceTimer = null;

watch(searchQuery, (newVal) => {
  const q = newVal.trim();
  if (searchAiDebounceTimer) clearTimeout(searchAiDebounceTimer);

  if (!q) {
    localResults.value = THAI_FOOD_DATABASE.map(item => ({ ...item, multiplier: 1 }));
    aiResult.value = null;
    return;
  }
  localResults.value = searchLocalFood(q).map(item => ({ ...item, multiplier: 1 }));

  // Auto-trigger AI calculation with 500ms debounce
  if (q.length >= 2) {
    searchAiDebounceTimer = setTimeout(() => {
      askGeminiExplicit();
    }, 500);
  }
});

function clearQuery() {
  if (searchAiDebounceTimer) clearTimeout(searchAiDebounceTimer);
  searchQuery.value = '';
  aiResult.value = null;
}

function triggerSearch() {
  if (searchQuery.value.trim()) {
    if (searchAiDebounceTimer) clearTimeout(searchAiDebounceTimer);
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
  padding: 0.8rem 8.5rem 0.8rem 2.6rem;
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
  right: 126px;
  top: 50%;
  transform: translateY(-50%);
  background: #CBD5E1;
  color: #FFFFFF;
  border: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-ai-search-action {
  position: absolute;
  right: 42px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0.32rem 0.65rem;
  background: linear-gradient(135deg, #FF6B4A 0%, #F55036 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(245, 80, 54, 0.25);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-ai-search-action:hover {
  transform: translateY(-50%) scale(1.03);
  box-shadow: 0 3px 8px rgba(245, 80, 54, 0.35);
}

.btn-ai-search-action.loading {
  opacity: 0.7;
  pointer-events: none;
}

.btn-scan-shortcut {
  position: absolute;
  right: 8px;
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

/* Search Sub-Tabs */
.search-sub-tabs {
  display: flex;
  gap: 0.35rem;
  padding: 0.2rem 1.4rem 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.btn-sub-tab {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-sub-tab.active {
  background: var(--primary-light, #EBF3F0);
  border-color: var(--primary-forest, #154238);
  color: var(--primary-forest, #154238);
}

/* Favorites Tab View */
.favorites-tab-view, .recent-tab-view {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.fav-items-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fav-food-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.75rem 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.fav-card-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fav-title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.fav-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.fav-cal {
  font-size: 0.84rem;
  font-weight: 800;
  color: #7e22ce;
}

.fav-macros {
  display: flex;
  gap: 0.3rem;
}

.fav-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-quick-add-fav {
  background: var(--primary-forest, #154238);
  color: #ffffff;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-quick-add-fav:hover {
  background: var(--primary-dark, #0D281E);
}

.btn-unfav {
  background: #fef3c7;
  color: #d97706;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-fav-hint {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  padding: 1.2rem;
  text-align: center;
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
}

/* Recent Chips Wrap */
.recent-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.btn-recent-term {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-recent-term:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
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

.card-top-badges {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.food-cat-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--primary-light, #EBF3F0);
  color: var(--primary-forest, #154238);
  padding: 1px 6px;
  border-radius: 6px;
}

.ai-provider-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.2;
}

.ai-provider-pill.badge-groq {
  background: #FFF1EE;
  border: 1px solid #FFCCBC;
  color: #D83B20;
}

.ai-provider-pill.badge-gemini {
  background: #EEF4FF;
  border: 1px solid #C7D9FE;
  color: #1A56DB;
}

.ai-provider-pill.badge-local {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #15803D;
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
