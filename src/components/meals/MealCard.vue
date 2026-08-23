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
              <span class="item-source-badge" v-if="item.source">
                {{ item.source }}
              </span>
            </div>
            
            <div class="item-details">
              <span class="item-serving">{{ item.servingSize }}</span>
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

            <!-- Favorite Toggle Button -->
            <button 
              type="button" 
              class="btn-fav-item" 
              :class="{ active: calorieStore.isFavorite(item.name) }"
              @click.stop="calorieStore.toggleFavorite(item)" 
              :title="calorieStore.isFavorite(item.name) ? 'นำออกจากเมนูโปรด' : 'บันทึกเป็นเมนูโปรด'"
            >
              {{ calorieStore.isFavorite(item.name) ? '★' : '☆' }}
            </button>

            <!-- Delete Item Button -->
            <button 
              type="button" 
              class="btn-remove-item" 
              @click.stop="removeItem(item.id)" 
              title="ลบรายการนี้"
            >
              ✕
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
          <span>+ เพิ่มอาหาร</span>
        </button>

        <button 
          type="button" 
          class="btn-action-secondary" 
          @click.stop="openScanner"
          title="สแกนรูปภาพอาหารด้วย AI"
        >
          <span>AI สแกน</span>
        </button>

        <button 
          type="button" 
          class="btn-action-secondary" 
          @click.stop="openQuickAdd"
          title="ใส่ข้อมูลเองด่วน"
        >
          <span>เพิ่มเอง</span>
        </button>

        <button 
          v-if="items.length > 0 && !showClearConfirm"
          type="button" 
          class="btn-action-clear" 
          @click.stop="showClearConfirm = true"
          title="ล้างมื้อนี้"
        >
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

/* 1-Tap Quick Chips */
.quick-chips-wrapper {
  background: var(--bg-app, #F9F9F6);
  border: 1px solid var(--border-subtle, #E8ECE9);
  border-radius: 14px;
  padding: 0.55rem 0.75rem;
}

.quick-chips-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.45rem;
}

.quick-title {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary-forest, #154238);
}

.quick-sub {
  font-size: 0.68rem;
  color: var(--text-muted, #52665C);
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
  border: 1px solid #E2E8F0;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #1E293B;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.btn-quick-chip:hover {
  background: #F0FDF4;
  border-color: #86EFAC;
  color: #15803D;
  transform: translateY(-1px);
}

.chip-plus {
  font-weight: 900;
  color: var(--primary-forest, #154238);
}

.chip-cal {
  font-size: 0.65rem;
  background: var(--primary-light, #EBF3F0);
  color: var(--primary-forest, #154238);
  padding: 1px 5px;
  border-radius: 999px;
  font-weight: 800;
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
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-main, #0F1E17);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-source-badge {
  font-size: 0.65rem;
  padding: 1px 5px;
  border-radius: 4px;
  background: #E2E8F0;
  color: #475569;
  font-weight: 600;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--text-muted, #52665C);
  margin-top: 1px;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  min-width: 50px;
}

.item-cal-num {
  font-size: 0.98rem;
  font-weight: 800;
  color: #0F1E17;
}

.item-cal-unit {
  font-size: 0.65rem;
  color: #64748B;
  margin-left: 2px;
}

.btn-fav-item {
  width: 24px;
  height: 24px;
  border: none;
  background: #F1F5F9;
  color: #94A3B8;
  font-size: 1rem;
  line-height: 1;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-fav-item.active {
  background: #FEF3C7;
  color: #D97706;
}

.btn-remove-item {
  width: 24px;
  height: 24px;
  border: none;
  background: #FEE2E2;
  color: #EF4444;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

/* Action Buttons Footer */
.meal-actions-footer {
  display: flex;
  gap: 0.45rem;
}

.btn-action-primary {
  flex: 1.8;
  padding: 0.65rem 0.8rem;
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(21, 66, 56, 0.2);
  transition: all 0.15s;
}

.btn-action-primary:hover {
  background: var(--primary-dark, #0D281E);
  transform: translateY(-1px);
}

.btn-action-secondary {
  flex: 1;
  padding: 0.65rem 0.5rem;
  background: var(--primary-light, #EBF3F0);
  border: 1px solid rgba(21, 66, 56, 0.15);
  color: var(--primary-forest, #154238);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-action-secondary:hover {
  background: #DEEAE5;
  transform: translateY(-1px);
}

.btn-action-clear {
  padding: 0.65rem 0.75rem;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  color: #E11D48;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-action-clear:hover {
  background: #FFE4E6;
}
</style>
