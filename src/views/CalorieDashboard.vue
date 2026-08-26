<template>
  <div class="dashboard-shell">
    <!-- Top Forest Green Header -->
    <header class="hero-header">
      <div class="header-top-bar">
        <div>
          <h1 class="user-greeting">
            Hello, {{ state.userProfile.name || 'Champion' }}
          </h1>
          <p class="greeting-sub">บันทึกวันนี้ให้เป๊ะ แล้วไปให้สุด</p>
        </div>

        <div class="header-actions">
          <button 
            type="button" 
            class="btn-header-bubble" 
            @click="calorieStore.openAnalyticsModal"
            title="สถิติ & กราฟ 7 วัน"
          >
            <!-- Minimal Chart SVG -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
          </button>
          <button 
            type="button" 
            class="btn-header-bubble" 
            @click="calorieStore.copyDailySummaryToClipboard()"
            title="คัดลอกสรุปโภชนาการประจำวัน"
          >
            <!-- Minimal Share/Clipboard SVG -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button 
            type="button" 
            class="btn-header-bubble" 
            @click="calorieStore.openBmrCalcModal"
            title="คำนวณ BMR / TDEE"
          >
            <!-- Minimal Calculator SVG -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"></rect>
              <line x1="8" y1="6" x2="16" y2="6"></line>
              <line x1="16" y1="14" x2="16" y2="18"></line>
              <path d="M16 10h.01"></path>
              <path d="M12 10h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M8 14h.01"></path>
              <path d="M12 18h.01"></path>
              <path d="M8 18h.01"></path>
            </svg>
          </button>
          <button 
            type="button" 
            class="btn-header-bubble" 
            @click="calorieStore.openSettingsModal"
            title="ตั้งค่าเป้าหมาย & จัดการข้อมูล"
          >
            <!-- Minimal Settings Gear SVG -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Date Selector Pill inside Matcha Header -->
      <div class="date-picker-banner">
        <button 
          type="button" 
          class="btn-date-arrow" 
          @click="calorieStore.changeDate(-1)"
          title="วันก่อนหน้า"
        >
          ‹
        </button>

        <div class="date-pill-center">
          <span class="date-thai-text">{{ formattedDateThai }}</span>
          <button 
            v-if="!calorieStore.isToday()" 
            type="button" 
            class="btn-today-pill"
            @click="calorieStore.setToday"
          >
            วันนี้
          </button>
        </div>

        <button 
          type="button" 
          class="btn-date-arrow" 
          @click="calorieStore.changeDate(1)"
          title="วันถัดไป"
        >
          ›
        </button>
      </div>

      <!-- Top Segmented Navigation Pills -->
      <div class="top-nav-pills-bar">
        <button 
          type="button" 
          class="btn-top-pill" 
          :class="{ active: state.activeTab === 'diary' }"
          @click="calorieStore.setActiveTab('diary')"
        >
          <span class="pill-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="pill-text">ไดอารี่</span>
        </button>
        <button 
          type="button" 
          class="btn-top-pill" 
          :class="{ active: state.activeTab === 'coach' }"
          @click="calorieStore.setActiveTab('coach')"
        >
          <span class="pill-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </span>
          <span class="pill-text">AI โค้ช</span>
        </button>
        <button 
          type="button" 
          class="btn-top-pill" 
          :class="{ active: state.activeTab === 'analytics' }"
          @click="calorieStore.setActiveTab('analytics')"
        >
          <span class="pill-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
          </span>
          <span class="pill-text">สถิติ</span>
        </button>
        <button 
          type="button" 
          class="btn-top-pill" 
          :class="{ active: state.activeTab === 'profile' }"
          @click="calorieStore.setActiveTab('profile')"
        >
          <span class="pill-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="5"/>
              <path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>
          </span>
          <span class="pill-text">เป้าหมาย</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container Overlapping Header -->
    <div class="main-body-container">
      <!-- TAB 1: DIARY (บันทึกอาหาร & สรุปโภชนาการวันนี้) -->
      <template v-if="state.activeTab === 'diary'">
        <!-- 1. Main Calorie Summary Card (Pure White with Neon Lime Ring) -->
        <section class="calorie-hero-card">
          <div class="hero-card-top">
            <div class="hero-kcal-info">
              <span class="hero-card-label">แคลอรี่รวมวันนี้</span>
              <div class="hero-kcal-display font-num">
                <span class="eaten-highlight font-num">{{ dailyTotals.calories.toLocaleString() }}</span>
                <span class="target-slash font-num">/ {{ (state.userProfile.calorieTarget || 2000).toLocaleString() }} kcal</span>
              </div>
            </div>

            <!-- Circular Gauge Ring (Neon Lime) -->
            <div class="gauge-ring-wrap">
              <svg class="gauge-svg" viewBox="0 0 100 100">
                <circle
                  class="gauge-bg"
                  cx="50"
                  cy="50"
                  r="42"
                />
                <circle
                  class="gauge-fill"
                  cx="50"
                  cy="50"
                  r="42"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="ringStrokeDashoffset"
                  :class="calorieProgressClass"
                />
              </svg>
              <div class="gauge-center-val font-num">
                <span class="percent-num font-num">{{ caloriePercent }}%</span>
              </div>
            </div>
          </div>

          <!-- Target Remaining Pill Banner -->
          <div class="target-remaining-badge" :class="{ 'is-over': remainingCalories < 0 }">
            <span class="bullet-dot">•</span>
            <span v-if="remainingCalories >= 0">
              เหลืออีก <strong>{{ remainingCalories.toLocaleString() }} kcal</strong>
            </span>
            <span v-else>
              เกินเป้าหมาย <strong>{{ Math.abs(remainingCalories).toLocaleString() }} kcal</strong>
            </span>
          </div>

          <!-- 3 Macro Progress Bars (Carb, Protein, Fat) -->
          <div class="macro-bars-grid">
            <!-- Carb -->
            <div class="macro-col">
              <div class="macro-label-row">
                <span class="macro-name carb">คาร์บ</span>
                <span class="macro-val font-num">{{ dailyTotals.carbs.toFixed(0) }}/{{ state.userProfile.carbsTarget || 230 }}g</span>
              </div>
              <div class="track-bar">
                <div 
                  class="fill-bar carb"
                  :style="{ width: `${Math.min(100, (dailyTotals.carbs / (state.userProfile.carbsTarget || 1)) * 100)}%` }"
                ></div>
              </div>
            </div>

            <!-- Protein -->
            <div class="macro-col">
              <div class="macro-label-row">
                <span class="macro-name pro">โปรตีน</span>
                <span class="macro-val font-num">{{ dailyTotals.protein.toFixed(0) }}/{{ state.userProfile.proteinTarget || 120 }}g</span>
              </div>
              <div class="track-bar">
                <div 
                  class="fill-bar pro"
                  :style="{ width: `${Math.min(100, (dailyTotals.protein / (state.userProfile.proteinTarget || 1)) * 100)}%` }"
                ></div>
              </div>
            </div>

            <!-- Fat -->
            <div class="macro-col">
              <div class="macro-label-row">
                <span class="macro-name fat">ไขมัน</span>
                <span class="macro-val font-num">{{ dailyTotals.fat.toFixed(0) }}/{{ state.userProfile.fatTarget || 55 }}g</span>
              </div>
              <div class="track-bar">
                <div 
                  class="fill-bar fat"
                  :style="{ width: `${Math.min(100, (dailyTotals.fat / (state.userProfile.fatTarget || 1)) * 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Meals Section ("มื้ออาหารวันนี้") -->
        <section class="meals-list-section">
          <div class="section-title-row">
            <div>
              <h2 class="section-main-title">มื้ออาหารวันนี้</h2>
              <span class="section-sub-info">รวม {{ totalItemsCount }} รายการ</span>
            </div>

            <div class="section-actions-right">
              <button 
                type="button" 
                class="btn-add-meal-pill" 
                @click="calorieStore.openSearchModal('breakfast')"
              >
                <span class="plus-sign">+</span>
                <span>เพิ่มอาหาร</span>
              </button>

              <button 
                v-if="totalItemsCount > 0"
                type="button" 
                class="btn-clear-today-pill" 
                @click="showClearAllModal = true"
                title="ล้างอาหารทุกมื้อของวันนี้"
              >
                ล้างทั้งหมด
              </button>
            </div>
          </div>

          <!-- 4 Meal Cards Grid -->
          <div class="meals-cards-stack">
            <MealCard mealType="breakfast" />
            <MealCard mealType="lunch" />
            <MealCard mealType="dinner" />
            <MealCard mealType="snack" />
          </div>
        </section>

        <!-- 3. Detailed Macro Nutrients Breakdown Section ("สารอาหารวันนี้") -->
        <section class="macro-detail-card">
          <div class="macro-detail-header">
            <h3 class="detail-sec-title">สารอาหารวันนี้</h3>
            <span class="detail-sec-sub">แคลอรี่รวม: {{ dailyTotals.calories.toFixed(0) }} kcal</span>
          </div>

          <div class="macro-detail-list">
            <!-- Carb Row -->
            <div class="macro-detail-row">
              <div class="m-row-left">
                <div class="m-color-bullet carb"></div>
                <div class="m-row-texts">
                  <span class="m-row-title">คาร์โบไฮเดรต</span>
                  <span class="m-row-cal-sub">{{ (dailyTotals.carbs * 4).toFixed(0) }} kcal <span class="m-ratio">(4 kcal/g)</span></span>
                </div>
              </div>
              <div class="m-row-middle">
                <div class="m-prog-track">
                  <div class="m-prog-fill carb" :style="{ width: `${Math.min(100, (dailyTotals.carbs / (state.userProfile.carbsTarget || 1)) * 100)}%` }"></div>
                </div>
              </div>
              <div class="m-stat-col">
                <span class="m-stat-nums">{{ dailyTotals.carbs.toFixed(0) }} <small>/ {{ state.userProfile.carbsTarget || 230 }}g</small></span>
                <span class="m-stat-pct">{{ Math.round((dailyTotals.carbs / (state.userProfile.carbsTarget || 1)) * 100) }}%</span>
              </div>
            </div>

            <!-- Protein Row -->
            <div class="macro-detail-row">
              <div class="m-row-left">
                <div class="m-color-bullet pro"></div>
                <div class="m-row-texts">
                  <span class="m-row-title">โปรตีน</span>
                  <span class="m-row-cal-sub">{{ (dailyTotals.protein * 4).toFixed(0) }} kcal <span class="m-ratio">(4 kcal/g)</span></span>
                </div>
              </div>
              <div class="m-row-middle">
                <div class="m-prog-track">
                  <div class="m-prog-fill pro" :style="{ width: `${Math.min(100, (dailyTotals.protein / (state.userProfile.proteinTarget || 1)) * 100)}%` }"></div>
                </div>
              </div>
              <div class="m-stat-col">
                <span class="m-stat-nums">{{ dailyTotals.protein.toFixed(0) }} <small>/ {{ state.userProfile.proteinTarget || 120 }}g</small></span>
                <span class="m-stat-pct">{{ Math.round((dailyTotals.protein / (state.userProfile.proteinTarget || 1)) * 100) }}%</span>
              </div>
            </div>

            <!-- Fat Row -->
            <div class="macro-detail-row">
              <div class="m-row-left">
                <div class="m-color-bullet fat"></div>
                <div class="m-row-texts">
                  <span class="m-row-title">ไขมัน</span>
                  <span class="m-row-cal-sub">{{ (dailyTotals.fat * 9).toFixed(0) }} kcal <span class="m-ratio">(9 kcal/g)</span></span>
                </div>
              </div>
              <div class="m-row-middle">
                <div class="m-prog-track">
                  <div class="m-prog-fill fat" :style="{ width: `${Math.min(100, (dailyTotals.fat / (state.userProfile.fatTarget || 1)) * 100)}%` }"></div>
                </div>
              </div>
              <div class="m-stat-col">
                <span class="m-stat-nums">{{ dailyTotals.fat.toFixed(0) }} <small>/ {{ state.userProfile.fatTarget || 55 }}g</small></span>
                <span class="m-stat-pct">{{ Math.round((dailyTotals.fat / (state.userProfile.fatTarget || 1)) * 100) }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Water Tracker Card (Minimalist Water Bar) -->
        <section class="water-card-energetic">
          <div class="water-head">
            <div class="water-left-title">
              <div>
                <h4 class="water-sec-title">ดื่มน้ำวันนี้</h4>
                <span class="water-ml-sub font-num">{{ currentWater * 250 }} / {{ (state.userProfile.waterTarget || 8) * 250 }} ml</span>
              </div>
            </div>

            <div class="water-stepper">
              <button 
                type="button" 
                class="btn-w-step" 
                @click="calorieStore.removeWater()"
                :disabled="currentWater <= 0"
              >
                -
              </button>
              <span class="w-badge font-num">{{ currentWater }} แก้ว</span>
              <button 
                type="button" 
                class="btn-w-step" 
                @click="calorieStore.addWater()"
              >
                +
              </button>
            </div>
          </div>

          <!-- Modern segmented water level bar -->
          <div class="water-segmented-bar">
            <div 
              v-for="idx in (state.userProfile.waterTarget || 8)" 
              :key="idx"
              class="water-segment"
              :class="{ filled: idx <= currentWater }"
              @click="toggleWaterUpTo(idx)"
              :title="`บันทึกน้ำ ${idx} แก้ว`"
            ></div>
          </div>
        </section>

        <!-- 5. Energetic Streak Card -->
        <section class="streak-banner-card">
          <div class="streak-left">
            <div class="flame-neon-badge">
              <!-- Minimal Flame SVG -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"></path>
              </svg>
            </div>
            <div>
              <span class="streak-title">สถิติบันทึกต่อเนื่อง</span>
              <div class="streak-days-row font-num">
                <span class="streak-num font-num">{{ currentStreak }}</span>
                <span class="streak-unit">วัน</span>
              </div>
              <p class="streak-sub">เก่งมาก รักษาโมเมนตัมไว้ให้ดี</p>
            </div>
          </div>
        </section>
      </template>

      <!-- TAB 2: AI COACH (AI ผู้ช่วยโภชนาการ & Fasting) -->
      <AiCoachTab v-else-if="state.activeTab === 'coach'" />

      <!-- TAB 3: ANALYTICS (สถิติ & กราฟแนวโน้ม 7 วัน) -->
      <AnalyticsTab v-else-if="state.activeTab === 'analytics'" />

      <!-- TAB 4: PROFILE & GOALS (เป้าหมาย & จัดการเมนูโปรด) -->
      <ProfileGoalsTab v-else-if="state.activeTab === 'profile'" />
    </div>

    <!-- Floating Bottom Navigation Bar -->
    <MealsBottomNav />

    <!-- Clear All Meals Confirmation Modal -->
    <div class="confirm-modal-backdrop" v-if="showClearAllModal" @click.self="showClearAllModal = false">
      <div class="confirm-dialog-card">
        <h3 class="confirm-title">ยืนยันล้างข้อมูลทุกมื้อ?</h3>
        <p class="confirm-desc">
          รายการอาหารทั้งหมดใน <strong>มื้อเช้า, กลางวัน, เย็น, และของว่าง</strong> 
          ของวันที่ {{ formattedDateThai }} จะถูกล้างทั้งหมด ({{ totalItemsCount }} รายการ)
        </p>

        <div class="confirm-buttons-row">
          <button type="button" class="btn-dialog-cancel" @click="showClearAllModal = false">
            ยกเลิก
          </button>
          <button type="button" class="btn-dialog-confirm" @click="confirmClearAllMeals">
            ล้างข้อมูลทุกมื้อ
          </button>
        </div>
      </div>
    </div>

    <!-- Active Global Modals -->
    <FoodSearchModal v-if="state.activeModal === 'search'" />
    <FoodScannerModal v-if="state.activeModal === 'scanner'" />
    <QuickAddModal v-if="state.activeModal === 'quick-add'" />
    <BmrCalculatorModal v-if="state.activeModal === 'bmr-calc'" />
    <SettingsModal v-if="state.activeModal === 'settings'" />
    <WeeklyAnalyticsModal v-if="state.activeModal === 'analytics'" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { calorieStore, state } from '../stores/useCalorieStore.js';
import MealCard from '../components/meals/MealCard.vue';
import AiCoachTab from '../components/meals/AiCoachTab.vue';
import AnalyticsTab from '../components/meals/AnalyticsTab.vue';
import ProfileGoalsTab from '../components/meals/ProfileGoalsTab.vue';
import MealsBottomNav from '../components/meals/MealsBottomNav.vue';
import FoodSearchModal from '../components/meals/FoodSearchModal.vue';
import FoodScannerModal from '../components/meals/FoodScannerModal.vue';
import QuickAddModal from '../components/meals/QuickAddModal.vue';
import BmrCalculatorModal from '../components/meals/BmrCalculatorModal.vue';
import SettingsModal from '../components/meals/SettingsModal.vue';
import WeeklyAnalyticsModal from '../components/meals/WeeklyAnalyticsModal.vue';

const showClearAllModal = ref(false);

const dailyTotals = computed(() => calorieStore.getDailyTotals());
const remainingCalories = computed(() => calorieStore.getRemainingCalories());
const currentWater = computed(() => calorieStore.getWater());
const currentStreak = computed(() => calorieStore.calculateStreak());

const totalItemsCount = computed(() => {
  const meals = calorieStore.getMealsForDate();
  return (meals.breakfast?.length || 0) + (meals.lunch?.length || 0) + (meals.dinner?.length || 0) + (meals.snack?.length || 0);
});

function confirmClearAllMeals() {
  calorieStore.clearAllMealsForDate();
  showClearAllModal.value = false;
}

// Circular Gauge Ring Math (Radius 42)
const ringRadius = 42;
const ringCircumference = 2 * Math.PI * ringRadius;

const caloriePercent = computed(() => {
  const target = state.userProfile.calorieTarget || 2000;
  return Math.min(150, Math.round((dailyTotals.value.calories / target) * 100));
});

const ringStrokeDashoffset = computed(() => {
  const percent = Math.min(100, caloriePercent.value);
  return ringCircumference - (percent / 100) * ringCircumference;
});

const calorieProgressClass = computed(() => {
  if (caloriePercent.value > 105) return 'is-over';
  if (caloriePercent.value > 90) return 'is-near';
  return 'is-normal';
});

// Thai formatted date string (Mobile-optimized concise format)
const formattedDateThai = computed(() => {
  const [y, m, d] = state.selectedDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const dayName = daysOfWeek[dateObj.getDay()];
  const monthName = thaiMonths[dateObj.getMonth()];
  const thaiYear = y + 543;

  return `${dayName} ${d} ${monthName} ${thaiYear}`;
});

function toggleWaterUpTo(targetCount) {
  state.waterByDate[state.selectedDate] = targetCount;
}
</script>

<style scoped>
.dashboard-shell {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-app, #F9F9F6);
  padding-bottom: 4rem;
}

/* 1. Hero Forest Green Header */
.hero-header {
  background: linear-gradient(180deg, #154238 0%, #1E3A2F 100%);
  padding: 2.2rem 1.4rem 3.5rem;
  border-radius: 0 0 32px 32px;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  box-shadow: 0 10px 30px rgba(21, 66, 56, 0.25);
  position: relative;
}

.header-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-greeting {
  font-size: 1.55rem;
  font-weight: 900;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.5px;
}

.greeting-sub {
  font-size: 0.82rem;
  color: #A3C2B6;
  margin: 3px 0 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-header-bubble {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-header-bubble:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

/* Date Picker Banner inside Header */
.date-picker-banner {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 0.55rem 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-date-arrow {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.btn-date-arrow:hover {
  background: rgba(255, 255, 255, 0.3);
}

.date-pill-center {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-thai-text {
  font-size: 0.86rem;
  font-weight: 700;
  color: #FFFFFF;
}

.btn-today-pill {
  font-size: 0.68rem;
  font-weight: 800;
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  border: none;
  padding: 2px 8px;
  border-radius: 999px;
  cursor: pointer;
}

/* Top Segmented Navigation Pills */
.top-nav-pills-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.28);
  padding: 0.3rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.btn-top-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.5rem 0.3rem;
  border: none;
  background: transparent;
  color: #A3C2B6;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
}

.btn-top-pill:hover:not(.active) {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.08);
}

.btn-top-pill.active {
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  box-shadow: 0 4px 14px rgba(212, 255, 50, 0.3);
  font-weight: 800;
}

.btn-top-pill .pill-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 2. Main Body (Overlapping Hero) */
.main-body-container {
  padding: 0 1.2rem;
  margin-top: -2.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  z-index: 10;
}

/* Calorie Summary Card */
.calorie-hero-card {
  background: var(--surface-card, #FFFFFF);
  border-radius: var(--radius-xl, 28px);
  padding: 1.4rem 1.4rem 1.2rem;
  box-shadow: 0 8px 30px rgba(21, 66, 56, 0.08);
  border: 1px solid var(--border-subtle, #E8ECE9);
}

.hero-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
}

.hero-card-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-muted, #52665C);
  display: block;
}

.hero-kcal-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 2px;
}

.eaten-highlight {
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--primary-forest, #154238);
  letter-spacing: -1px;
  line-height: 1;
}

.target-slash {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-muted, #52665C);
}

/* Gauge Ring */
.gauge-ring-wrap {
  position: relative;
  width: 82px;
  height: 82px;
  flex-shrink: 0;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-bg {
  fill: none;
  stroke: #E8ECE9;
  stroke-width: 8;
}

.gauge-fill {
  fill: none;
  stroke: var(--accent-neon, #D4FF32);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gauge-fill.is-normal { stroke: var(--accent-neon, #D4FF32); }
.gauge-fill.is-near { stroke: #F59E0B; }
.gauge-fill.is-over { stroke: #EF4444; }

.gauge-center-val {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.percent-num {
  font-size: 0.98rem;
  font-weight: 900;
  color: var(--primary-forest, #154238);
}

/* Target Remaining Badge */
.target-remaining-badge {
  background: var(--primary-light, #EBF3F0);
  border: 1px solid rgba(21, 66, 56, 0.1);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  font-size: 0.8rem;
  color: var(--primary-forest, #154238);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}

.bullet-dot {
  font-size: 1rem;
  line-height: 1;
  color: var(--primary-forest, #154238);
}

.target-remaining-badge.is-over {
  background: #FEF2F2;
  border-color: #FECACA;
  color: #B91C1C;
}

.target-remaining-badge strong {
  font-weight: 800;
}

/* Macro Bars Grid */
.macro-bars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  padding-top: 0.9rem;
  border-top: 1px solid #F1F5F2;
}

.macro-col {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.macro-label-row {
  display: flex;
  flex-direction: column;
}

.macro-name {
  font-size: 0.72rem;
  font-weight: 700;
}

.macro-name.carb { color: var(--macro-carb, #3B82F6); }
.macro-name.pro { color: var(--macro-protein, #8B5CF6); }
.macro-name.fat { color: var(--macro-fat, #F59E0B); }

.macro-val {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin-top: 1px;
}

.track-bar {
  height: 6px;
  background: #E8ECE9;
  border-radius: 999px;
  overflow: hidden;
}

.fill-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.fill-bar.carb { background: var(--macro-carb, #3B82F6); }
.fill-bar.pro { background: var(--macro-protein, #8B5CF6); }
.fill-bar.fat { background: var(--macro-fat, #F59E0B); }

/* 3. Meals List Section */
.meals-list-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.2rem 0.2rem 0;
}

.section-main-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-main, #0F1E17);
  margin: 0;
  letter-spacing: -0.3px;
}

.section-sub-info {
  font-size: 0.74rem;
  color: var(--text-muted, #52665C);
  font-weight: 500;
}

.section-actions-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-add-meal-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.4rem 0.85rem;
  background: var(--surface-card, #FFFFFF);
  border: 1.5px solid var(--primary-forest, #154238);
  color: var(--primary-forest, #154238);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.btn-add-meal-pill:hover {
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
}

.plus-sign {
  font-size: 0.9rem;
}

.btn-clear-today-pill {
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  color: #E11D48;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-clear-today-pill:hover {
  background: #FFE4E6;
}

.meals-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* 4. Detailed Macros Card ("สารอาหารวันนี้") */
.macro-detail-card {
  background: var(--surface-card, #FFFFFF);
  border-radius: var(--radius-lg, 24px);
  padding: 1.25rem 1.35rem;
  border: 1px solid var(--border-subtle, #E8ECE9);
  box-shadow: var(--shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04));
}

.macro-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid #F1F5F2;
}

.detail-sec-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin: 0;
  letter-spacing: -0.2px;
}

.detail-sec-sub {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary-forest, #154238);
  background: var(--primary-light, #EBF3F0);
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: 0.1px;
}

.macro-detail-list {
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
}

.macro-detail-row {
  display: grid;
  grid-template-columns: minmax(130px, 1.4fr) minmax(70px, 1.6fr) minmax(85px, auto);
  align-items: center;
  gap: 0.85rem;
}

@media (max-width: 480px) {
  .macro-detail-row {
    grid-template-columns: minmax(115px, 1.3fr) minmax(50px, 1.2fr) minmax(75px, auto);
    gap: 0.55rem;
  }
}

.m-row-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.m-color-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.m-color-bullet.carb { 
  background: var(--macro-carb, #3B82F6); 
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.45); 
}
.m-color-bullet.pro { 
  background: var(--macro-protein, #8B5CF6); 
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.45); 
}
.m-color-bullet.fat { 
  background: var(--macro-fat, #F59E0B); 
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.45); 
}

.m-row-texts {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.m-row-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main, #0F1E17);
  line-height: 1.2;
  white-space: nowrap;
}

.m-row-cal-sub {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-muted, #52665C);
  line-height: 1.2;
  white-space: nowrap;
}

.m-ratio {
  opacity: 0.8;
  font-size: 0.68rem;
}

.m-row-middle {
  flex: 1;
  min-width: 0;
}

.m-prog-track {
  width: 100%;
  height: 7px;
  background: #E8ECE9;
  border-radius: 999px;
  overflow: hidden;
}

.m-prog-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.m-prog-fill.carb { background: linear-gradient(90deg, #60A5FA 0%, #3B82F6 100%); }
.m-prog-fill.pro { background: linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%); }
.m-prog-fill.fat { background: linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%); }

.m-stat-col {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  flex-shrink: 0;
}

.m-stat-nums {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  line-height: 1.2;
  white-space: nowrap;
}

.m-stat-nums small {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted, #52665C);
}

.m-stat-pct {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted, #52665C);
  line-height: 1;
}

/* 5. Streak Card */
.streak-banner-card {
  background: linear-gradient(135deg, #154238 0%, #0D281E 100%);
  border-radius: var(--radius-lg, 24px);
  padding: 1.2rem 1.4rem;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 24px rgba(21, 66, 56, 0.25);
  border: 1px solid rgba(212, 255, 50, 0.2);
}

.streak-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.flame-neon-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(212, 255, 50, 0.15);
  border: 2px solid var(--accent-neon, #D4FF32);
  color: var(--accent-neon, #D4FF32);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(212, 255, 50, 0.3);
}

.streak-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #A3C2B6;
  display: block;
}

.streak-days-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
  margin: 3px 0 2px;
}

.streak-num {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--accent-neon, #D4FF32);
  letter-spacing: -0.5px;
}

.streak-unit {
  font-size: 0.9rem;
  font-weight: 800;
  color: #FFFFFF;
}

.streak-sub {
  font-size: 0.72rem;
  color: #C2D6CE;
  margin: 0;
  font-weight: 500;
}

/* 6. Motivational Fitness Banner */
.fitness-action-banner {
  background: linear-gradient(135deg, #1E3A2F 0%, #154238 100%);
  border-radius: var(--radius-lg, 24px);
  padding: 1.3rem;
  color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(21, 66, 56, 0.2);
}

.fitness-banner-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.banner-tag {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-neon, #D4FF32);
}

.banner-quote {
  font-size: 1.05rem;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.35;
  margin: 0;
}

.btn-fitness-cta {
  align-self: flex-start;
  padding: 0.55rem 1.1rem;
  background: #FFFFFF;
  border: none;
  border-radius: 999px;
  color: var(--primary-forest, #154238);
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  margin-top: 0.3rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.15s;
}

.btn-fitness-cta:hover {
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  transform: translateY(-1px);
}

/* 7. Water Tracker Card */
.water-card-energetic {
  background: var(--surface-card, #FFFFFF);
  border-radius: var(--radius-lg, 24px);
  padding: 1.2rem;
  border: 1px solid var(--border-subtle, #E8ECE9);
  box-shadow: var(--shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04));
}

.water-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
}

.water-left-title {
  display: flex;
  align-items: center;
}

.water-sec-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin: 0;
}

.water-ml-sub {
  font-size: 0.72rem;
  color: #0284C7;
  font-weight: 700;
}

.water-stepper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-w-step {
  width: 28px;
  height: 28px;
  border: 1px solid #CBD5E1;
  background: #F8FAFC;
  color: #0F1E17;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
}

.w-badge {
  font-size: 0.82rem;
  font-weight: 800;
  color: #0284C7;
  min-width: 45px;
  text-align: center;
}

.water-segmented-bar {
  display: flex;
  gap: 6px;
  height: 12px;
}

.water-segment {
  flex: 1;
  background: #E8ECE9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.water-segment.filled {
  background: linear-gradient(90deg, #38BDF8, #0284C7);
  box-shadow: 0 0 8px rgba(2, 132, 199, 0.35);
}

/* Clear Confirmation Modal */
.confirm-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 30, 23, 0.7);
  backdrop-filter: blur(6px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.confirm-dialog-card {
  background: #FFFFFF;
  border-radius: 28px;
  width: 100%;
  max-width: 400px;
  padding: 1.6rem 1.4rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.confirm-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0F1E17;
  margin: 0 0 0.5rem;
}

.confirm-desc {
  font-size: 0.85rem;
  color: #52665C;
  line-height: 1.5;
  margin: 0 0 1.4rem;
}

.confirm-buttons-row {
  display: flex;
  gap: 0.6rem;
}

.btn-dialog-cancel {
  flex: 1;
  padding: 0.75rem;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.btn-dialog-confirm {
  flex: 1.4;
  padding: 0.75rem;
  background: #E11D48;
  border: none;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 800;
  color: #FFFFFF;
  cursor: pointer;
}
</style>
