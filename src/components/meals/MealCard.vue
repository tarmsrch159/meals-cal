<template>
  <div class="meal-card-energetic" :class="[mealType, { 'is-expanded': isExpanded }]">
    <!-- Card Summary Row (Click to toggle details or actions) -->
    <div class="meal-summary-row" @click="isExpanded = !isExpanded">
      <!-- Left Dish Image Avatar (Clean, no floating emoji badge) -->
      <div class="meal-thumb-box">
        <img :src="mealThumbImage" :alt="calorieStore.getMealTypeName(mealType)" class="meal-thumb-img" />
      </div>

      <!-- Center Info -->
      <div class="meal-main-info">
        <div class="meal-title-line">
          <span class="meal-type-label">{{ calorieStore.getMealTypeName(mealType) }}</span>
          <span class="meal-count-tag" v-if="items.length > 0">
            {{ items.length }} รายการ
          </span>
        </div>

        <div class="meal-food-summary" v-if="items.length > 0">
          {{ foodSummaryText }}
        </div>
        <div class="meal-empty-hint" v-else>
          ยังไม่ได้บันทึกอาหารในมื้อนี้
        </div>

        <!-- Macro tags row (Carb | Pro | Fat) -->
        <div class="meal-macro-tags" v-if="totals.calories > 0">
          <span class="macro-txt carb">{{ totals.carbs.toFixed(0) }}g C</span>
          <span class="macro-sep">|</span>
          <span class="macro-txt pro">{{ totals.protein.toFixed(0) }}g P</span>
          <span class="macro-sep">|</span>
          <span class="macro-txt fat">{{ totals.fat.toFixed(0) }}g F</span>
        </div>
      </div>

      <!-- Right Calories & Chevron -->
      <div class="meal-right-col">
        <div class="meal-kcal-val font-num">
          <span class="num">{{ Math.round(totals.calories) }}</span>
          <span class="unit">kcal</span>
        </div>
        <span class="chevron-toggle" :class="{ rotated: isExpanded }">›</span>
      </div>
    </div>

    <!-- Collapsible / Expanded Details Section -->
    <div class="meal-expanded-panel" v-if="isExpanded">
      <!-- Inline Confirmation for Clearing this Meal -->
      <transition name="fade-slide">
        <div class="clear-confirm-banner" v-if="showClearConfirm">
          <div class="confirm-text">
            <span>ยืนยันล้างอาหารใน <strong>{{ calorieStore.getMealTypeName(mealType) }}</strong> ทั้งหมด {{ items.length }} รายการ?</span>
          </div>
          <div class="confirm-actions">
            <button type="button" class="btn-confirm-cancel" @click="showClearConfirm = false">
              ยกเลิก
            </button>
            <button type="button" class="btn-confirm-delete" @click="handleClearMeal">
              ยืนยันล้าง
            </button>
          </div>
        </div>
      </transition>

      <!-- 1-Tap Quick Suggestions Chips -->
      <div class="quick-chips-wrapper">
        <div class="quick-chips-header">
          <span class="quick-title">เมนูด่วน:</span>
          <span class="quick-sub">แตะเพื่อเพิ่มทันที</span>
        </div>
        <div class="quick-chips-scroll">
          <button 
            v-for="preset in quickPresets" 
            :key="preset.name"
            type="button"
            class="btn-quick-chip"
            @click.stop="addPresetItem(preset)"
            :title="`เพิ่ม ${preset.name} (${preset.calories} kcal) ทันที`"
          >
            <span class="chip-plus">+</span>
            <span class="chip-name">{{ preset.name }}</span>
            <span class="chip-cal font-num">{{ preset.calories }}k</span>
          </button>
        </div>
      </div>

      <!-- Item Rows List -->
      <div class="meal-items-list" v-if="items.length > 0">
        <div 
          v-for="item in items" 
          :key="item.id" 
          class="meal-item-row"
        >
          <div class="item-info">
            <div class="item-name-wrap">
              <span class="item-name">{{ item.name }}</span>
            </div>
            
            <div class="item-details">
              <span class="item-serving">{{ item.servingSize }}</span>

              <!-- AI Provider Mini Badge -->
              <span v-if="getItemAiProvider(item) === 'groq'" class="mini-ai-badge badge-groq" title="วิเคราะห์โดย Groq AI">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#F55036"/><path d="M12 5C8.13 5 5 8.13 5 12s3.13 7 7 7 7-3.13 7-7h-7v2.5h4.24c-.65 1.77-2.36 3-4.24 3-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5c1.15 0 2.2.43 3 1.15l1.77-1.77C15.54 5.76 13.86 5 12 5z" fill="#FFFFFF"/></svg>
                <span>Groq</span>
              </span>
              <span v-else-if="getItemAiProvider(item) === 'gemini'" class="mini-ai-badge badge-gemini" title="วิเคราะห์โดย Google Gemini">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="#4E80EE"/></svg>
                <span>Gemini</span>
              </span>
              <span v-else-if="getItemAiProvider(item) === 'local'" class="mini-ai-badge badge-local" title="ฐานข้อมูลอาหารไทย (Local)">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <span>Local</span>
              </span>

              <span class="item-macros font-num">
                (P: {{ (item.protein * (item.multiplier || 1)).toFixed(0) }}g • 
                 C: {{ (item.carbs * (item.multiplier || 1)).toFixed(0) }}g • 
                 F: {{ (item.fat * (item.multiplier || 1)).toFixed(0) }}g)
              </span>
            </div>
          </div>

          <div class="item-actions">
            <!-- Portion Multiplier Control -->
            <div class="multiplier-control">
              <button 
                type="button" 
                class="btn-mult font-num" 
                @click.stop="adjustMultiplier(item, -0.5)"
                :disabled="item.multiplier <= 0.5"
                title="ลดสัดส่วน"
              >
                -
              </button>
              <span class="mult-value font-num">{{ item.multiplier }}x</span>
              <button 
                type="button" 
                class="btn-mult font-num" 
                @click.stop="adjustMultiplier(item, 0.5)"
                :disabled="item.multiplier >= 5"
                title="เพิ่มสัดส่วน"
              >
                +
              </button>
            </div>

            <!-- Total Calories for this item -->
            <div class="item-calories font-num">
              <span class="item-cal-num">{{ Math.round(item.calories * (item.multiplier || 1)) }}</span>
              <span class="item-cal-unit">kcal</span>
            </div>

            <!-- Favorite Toggle Button (Clean SVG Star) -->
            <button 
              type="button" 
              class="btn-fav-item" 
              :class="{ active: calorieStore.isFavorite(item.name) }"
              @click.stop="calorieStore.toggleFavorite(item)" 
              :title="calorieStore.isFavorite(item.name) ? 'นำออกจากเมนูโปรด' : 'บันทึกเป็นเมนูโปรด'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" :fill="calorieStore.isFavorite(item.name) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>

            <!-- Delete Item Button (Clean SVG X) -->
            <button 
              type="button" 
              class="btn-remove-item" 
              @click.stop="removeItem(item.id)" 
              title="ลบรายการนี้"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div class="meal-actions-footer">
        <button 
          type="button" 
          class="btn-action-primary" 
          @click.stop="openSearch"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>เพิ่มอาหาร</span>
        </button>

        <button 
          type="button" 
          class="btn-action-secondary" 
          @click.stop="openScanner"
          title="สแกนรูปภาพอาหารด้วย AI"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span>AI สแกน</span>
        </button>

        <button 
          type="button" 
          class="btn-action-secondary" 
          @click.stop="openQuickAdd"
          title="ใส่ข้อมูลเองด่วน"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>เพิ่มเอง</span>
        </button>

        <button 
          v-if="items.length > 0 && !showClearConfirm" 
          type="button" 
          class="btn-action-clear" 
          @click.stop="showClearConfirm = true"
          title="ล้างมื้อนี้"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>ล้าง</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { calorieStore } from '../../stores/useCalorieStore.js';

const props = defineProps({
  mealType: {
    type: String,
    required: true,
    validator: (v) => ['breakfast', 'lunch', 'dinner', 'snack'].includes(v)
  }
});

const isExpanded = ref(true);
const showClearConfirm = ref(false);

const mealsData = computed(() => calorieStore.getMealsForDate());
const items = computed(() => mealsData.value[props.mealType] || []);
const totals = computed(() => calorieStore.getMealTotals(props.mealType));
const quickPresets = computed(() => calorieStore.getQuickPresetsForMeal(props.mealType));

// Realistic curated food thumbnail image
const mealThumbImage = computed(() => {
  const thumbs = {
    breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=160&auto=format&fit=crop&q=80',
    lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160&auto=format&fit=crop&q=80',
    dinner: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=160&auto=format&fit=crop&q=80',
    snack: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=160&auto=format&fit=crop&q=80'
  };
  return thumbs[props.mealType] || thumbs.breakfast;
});

const foodSummaryText = computed(() => {
  if (items.value.length === 0) return '';
  return items.value.map(it => it.name).join(' + ');
});

function openSearch() {
  calorieStore.openSearchModal(props.mealType);
}

function openScanner() {
  calorieStore.openScannerModal(props.mealType);
}

function openQuickAdd() {
  calorieStore.openQuickAddModal(props.mealType);
}

function removeItem(itemId) {
  calorieStore.removeMealItem(props.mealType, itemId);
}

function adjustMultiplier(item, delta) {
  const current = item.multiplier || 1;
  const next = Math.round((current + delta) * 10) / 10;
  if (next >= 0.5 && next <= 5) {
    calorieStore.updateMealItemMultiplier(props.mealType, item.id, next);
  }
}

function addPresetItem(preset) {
  calorieStore.addMealItem(props.mealType, preset, 1);
}

function handleClearMeal() {
  calorieStore.clearMeal(props.mealType);
  showClearConfirm.value = false;
}

function getItemAiProvider(item) {
  if (item.aiProvider) return item.aiProvider;
  const src = (item.source || '').toLowerCase();
  if (src.includes('groq')) return 'groq';
  if (src.includes('gemini') || src.includes('google')) return 'gemini';
  if (src.includes('ฐานข้อมูล') || src.includes('local') || src.includes('ไทย') || src.includes('off_')) return 'local';
  return null;
}
</script>

<style scoped>
.meal-card-energetic {
  background: var(--surface-card, #ffffff);
  border-radius: var(--radius-lg, 24px);
  border: 1px solid var(--border-subtle, #E8ECE9);
  padding: 1.1rem;
  box-shadow: var(--shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04));
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.meal-card-energetic:hover {
  box-shadow: var(--shadow-card-hover, 0 8px 30px rgba(21, 66, 56, 0.08));
  border-color: rgba(21, 66, 56, 0.15);
}

/* Summary Row */
.meal-summary-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  cursor: pointer;
  user-select: none;
}

.meal-thumb-box {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.meal-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.meal-card-energetic:hover .meal-thumb-img {
  transform: scale(1.06);
}

.meal-main-info {
  flex: 1;
  min-width: 0;
}

.meal-title-line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.meal-type-label {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  letter-spacing: -0.2px;
}

.meal-count-tag {
  font-size: 0.68rem;
  font-weight: 700;
  background: var(--primary-light, #EBF3F0);
  color: var(--primary-forest, #154238);
  padding: 1px 6px;
  border-radius: 999px;
}

.meal-food-summary {
  font-size: 0.78rem;
  font-weight: 600;
  color: #334D41;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.meal-empty-hint {
  font-size: 0.74rem;
  color: #8E9E96;
  font-weight: 500;
  margin-top: 1px;
}

.meal-macro-tags {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 3px;
  font-size: 0.72rem;
  font-weight: 700;
}

.macro-txt.carb { color: var(--macro-carb, #3B82F6); }
.macro-txt.pro { color: var(--macro-protein, #8B5CF6); }
.macro-txt.fat { color: var(--macro-fat, #F59E0B); }
.macro-sep { color: #CBD5E1; font-size: 0.65rem; }

.meal-right-col {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: right;
  flex-shrink: 0;
}

.meal-kcal-val {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.meal-kcal-val .num {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-main, #0F1E17);
  line-height: 1.1;
}

.meal-kcal-val .unit {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted, #52665C);
}

.chevron-toggle {
  font-size: 1.3rem;
  font-weight: 400;
  color: #94A3B8;
  transition: transform 0.25s ease;
  line-height: 1;
}

.chevron-toggle.rotated {
  transform: rotate(90deg);
}

/* Expanded Panel */
.meal-expanded-panel {
  margin-top: 0.9rem;
  padding-top: 0.8rem;
  border-top: 1px dashed #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

/* Clear Confirmation Banner */
.clear-confirm-banner {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  padding: 0.65rem 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.confirm-text {
  font-size: 0.76rem;
  color: #991B1B;
}

.confirm-actions {
  display: flex;
  gap: 0.35rem;
}

.btn-confirm-cancel {
  padding: 0.25rem 0.6rem;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 0.74rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.btn-confirm-delete {
  padding: 0.25rem 0.65rem;
  background: #DC2626;
  border: none;
  border-radius: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #FFFFFF;
  cursor: pointer;
}

/* 1-Tap Quick Chips (Warm Apricot / Honey Amber Theme) */
.quick-chips-wrapper {
  background: linear-gradient(135deg, #FFFDF7 0%, #FFF4E5 100%);
  border: 1px solid #FED7AA;
  border-radius: 14px;
  padding: 0.55rem 0.75rem;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.04);
}

.quick-chips-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.45rem;
}

.quick-title {
  font-size: 0.76rem;
  font-weight: 800;
  color: #C2410C;
}

.quick-sub {
  font-size: 0.68rem;
  color: #9A3412;
}

.quick-chips-scroll {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.quick-chips-scroll::-webkit-scrollbar { display: none; }

.btn-quick-chip {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.65rem;
  background: #FFFFFF;
  border: 1px solid #FDBA74;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #7C2D12;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}

.btn-quick-chip:hover {
  background: #FFEDD5;
  border-color: #FB923C;
  color: #9A3412;
  transform: translateY(-1px);
}

.chip-plus {
  font-weight: 900;
  color: #EA580C;
}

.chip-cal {
  font-size: 0.65rem;
  background: #FFEDD5;
  color: #C2410C;
  padding: 1px 6px;
  border-radius: 999px;
  font-weight: 800;
}

/* AI Provider Badges (Groq / Gemini / Local) */
.mini-ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1.2;
}

.mini-ai-badge.badge-groq {
  background: #FFF1EE;
  border: 1px solid #FFCCBC;
  color: #D83B20;
}

.mini-ai-badge.badge-gemini {
  background: #EEF4FF;
  border: 1px solid #C7D9FE;
  color: #1A56DB;
}

.mini-ai-badge.badge-local {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #15803D;
}

/* Meal Items List */
.meal-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meal-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.85rem;
  background: var(--bg-app, #F9F9F6);
  border-radius: 14px;
  border: 1px solid var(--border-subtle, #E8ECE9);
}

.item-info {
  flex: 1;
  min-width: 0;
  margin-right: 0.5rem;
}

.item-name-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main, #0F1E17);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: var(--text-muted, #52665C);
  margin-top: 2px;
  flex-wrap: wrap;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
}

.multiplier-control {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 1px;
}

.btn-mult {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: #334155;
  font-weight: 800;
  cursor: pointer;
  border-radius: 4px;
}

.mult-value {
  font-size: 0.75rem;
  font-weight: 800;
  color: #0F1E17;
  min-width: 24px;
  text-align: center;
}

.item-calories {
  text-align: right;
  min-width: 48px;
}

.item-cal-num {
  font-size: 0.96rem;
  font-weight: 800;
  color: #0F1E17;
}

.item-cal-unit {
  font-size: 0.62rem;
  color: #64748B;
  margin-left: 2px;
}

.btn-fav-item {
  width: 26px;
  height: 26px;
  border: none;
  background: #F1F5F9;
  color: #94A3B8;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-fav-item:hover {
  background: #FEF3C7;
  color: #D97706;
}

.btn-fav-item.active {
  background: #FEF3C7;
  color: #D97706;
}

.btn-remove-item {
  width: 26px;
  height: 26px;
  border: none;
  background: #FEE2E2;
  color: #EF4444;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-remove-item:hover {
  background: #FECACA;
  color: #DC2626;
}

/* Action Buttons Footer */
.meal-actions-footer {
  display: flex;
  gap: 0.45rem;
  align-items: stretch;
}

.btn-action-primary {
  flex: 1.4;
  padding: 0.65rem 0.75rem;
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(21, 66, 56, 0.2);
  transition: all 0.15s;
}

.btn-action-primary:hover {
  background: var(--primary-dark, #0D281E);
  transform: translateY(-1px);
}

.btn-action-secondary {
  flex: 1;
  padding: 0.65rem 0.55rem;
  background: var(--primary-light, #EBF3F0);
  border: 1px solid rgba(21, 66, 56, 0.12);
  color: var(--primary-forest, #154238);
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  white-space: nowrap;
  transition: all 0.15s;
}

.btn-action-secondary:hover {
  background: #DEEAE5;
  transform: translateY(-1px);
}

.btn-action-clear {
  padding: 0.65rem 0.7rem;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  color: #E11D48;
  border-radius: 12px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  white-space: nowrap;
  transition: all 0.15s;
}

.btn-action-clear:hover {
  background: #FFE4E6;
}

@media (max-width: 440px) {
  .meal-actions-footer {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr auto;
    gap: 0.35rem;
  }

  .btn-action-primary {
    padding: 0.6rem 0.4rem;
    font-size: 0.76rem;
    gap: 0.2rem;
  }

  .btn-action-secondary {
    padding: 0.6rem 0.35rem;
    font-size: 0.74rem;
    gap: 0.2rem;
  }

  .btn-action-clear {
    padding: 0.6rem 0.5rem;
    font-size: 0.74rem;
  }
}
</style>
