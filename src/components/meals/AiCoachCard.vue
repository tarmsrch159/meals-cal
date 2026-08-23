<template>
  <div class="ai-coach-card">
    <div class="coach-header">
      <div class="coach-title-wrap">
        <div class="ai-sparkle-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/>
            <path d="M19 17v4"/>
            <path d="M3 5h4"/>
            <path d="M17 19h4"/>
          </svg>
        </div>
        <div>
          <h3 class="coach-main-title">AI ผู้ช่วยโภชนาการประจำวัน</h3>
          <span class="coach-sub-title">วิเคราะห์สารอาหาร & แนะนำมื้อถัดไปเฉพาะคุณ</span>
        </div>
      </div>

      <div class="coach-header-right" v-if="coachData?.healthScore">
        <div class="score-pill font-num">
          <span class="score-label">คะแนนสุขภาพ</span>
          <span class="score-value font-num">{{ coachData.healthScore }}<small>/100</small></span>
        </div>
      </div>
    </div>

    <!-- Real-time Macro Insights Bar -->
    <div class="macro-insights-row">
      <div class="insight-pill" :class="proteinInsight.status">
        <span class="pill-dot"></span>
        <span>{{ proteinInsight.text }}</span>
      </div>
      <div class="insight-pill" :class="calorieInsight.status">
        <span class="pill-dot"></span>
        <span>{{ calorieInsight.text }}</span>
      </div>
    </div>

    <!-- AI Daily Analysis Message -->
    <div class="coach-bubble" v-if="coachData">
      <p class="coach-analysis-text">{{ coachData.dailyAnalysis }}</p>
      <div class="coach-tip-row" v-if="coachData.nutritionTip">
        <span class="tip-badge">💡 เคล็ดลับ</span>
        <span class="tip-text">{{ coachData.nutritionTip }}</span>
      </div>
      <span class="coach-source-tag font-num" v-if="coachData.source">
        ⚡ ขับเคลื่อนโดย {{ coachData.source }}
      </span>
    </div>

    <!-- Action & Target Meal Selector -->
    <div class="recommend-action-box" :class="{ 'has-recs': coachData?.recommendations?.length }">
      <div class="slot-select-row">
        <span class="select-label">แนะนำสำหรับมื้อ:</span>
        <div class="slot-chips">
          <button 
            v-for="slot in ['lunch', 'dinner', 'snack']" 
            :key="slot"
            type="button" 
            class="btn-slot-chip" 
            :class="{ active: selectedSlot === slot }"
            @click="selectedSlot = slot"
          >
            {{ calorieStore.getMealTypeName(slot) }}
          </button>
        </div>
      </div>

      <button 
        type="button" 
        class="btn-generate-recs" 
        :disabled="isLoading" 
        @click="fetchAiRecommendations"
      >
        <span v-if="!isLoading" class="btn-inner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 21h5v-5"/>
          </svg>
          <span>{{ coachData ? 'วิเคราะห์ใหม่ & แนะนำเมนู' : '✨ ให้ AI แนะนำมื้อถัดไป' }}</span>
        </span>
        <span v-else class="loading-state">
          <span class="spinner-dot"></span>
          <span>Gemini AI กำลังคำนวณสารอาหาร...</span>
        </span>
      </button>
    </div>

    <!-- Recommendations Cards Stack -->
    <div class="recs-list" v-if="coachData?.recommendations?.length">
      <div 
        v-for="(rec, idx) in coachData.recommendations" 
        :key="idx" 
        class="rec-item-card"
      >
        <div class="rec-top-row">
          <div class="rec-title-group">
            <span class="rec-order-badge font-num">#{{ idx + 1 }}</span>
            <div>
              <h4 class="rec-name">{{ rec.name }}</h4>
              <span class="rec-name-en" v-if="rec.nameEn">{{ rec.nameEn }}</span>
            </div>
          </div>

          <div class="rec-cals font-num">
            <span class="cal-val font-num">{{ rec.calories }}</span>
            <span class="cal-unit">kcal</span>
          </div>
        </div>

        <p class="rec-reason" v-if="rec.reason">
          {{ rec.reason }}
        </p>

        <div class="rec-bottom-bar">
          <div class="rec-macros font-num">
            <span class="m-tag pro font-num">P: {{ rec.protein }}g</span>
            <span class="m-tag carb font-num">C: {{ rec.carbs }}g</span>
            <span class="m-tag fat font-num">F: {{ rec.fat }}g</span>
          </div>

          <button 
            type="button" 
            class="btn-add-rec" 
            @click="addRecommendedMeal(rec)"
          >
            <span>+ บันทึกลง{{ calorieStore.getMealTypeName(selectedSlot) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';
import { getAiMealRecommendation } from '../../services/nutritionApi.js';

const isLoading = ref(false);
const selectedSlot = ref('dinner');

// Determine appropriate default next meal slot based on current hour
onMounted(() => {
  const hr = new Date().getHours();
  if (hr < 11) {
    selectedSlot.value = 'lunch';
  } else if (hr < 16) {
    selectedSlot.value = 'dinner';
  } else {
    selectedSlot.value = 'snack';
  }

  // Load cached advice if present
  if (state.aiCoachCache && state.aiCoachCache[state.selectedDate]) {
    coachData.value = state.aiCoachCache[state.selectedDate];
  }
});

const coachData = ref(null);

const dailyTotals = computed(() => calorieStore.getDailyTotals());
const remaining = computed(() => {
  const totals = dailyTotals.value;
  const p = state.userProfile;
  return {
    calories: p.calorieTarget - totals.calories,
    protein: Math.round(((p.proteinTarget || 120) - totals.protein) * 10) / 10,
    carbs: Math.round(((p.carbsTarget || 230) - totals.carbs) * 10) / 10,
    fat: Math.round(((p.fatTarget || 55) - totals.fat) * 10) / 10
  };
});

// Quick Insights
const proteinInsight = computed(() => {
  const remP = remaining.value.protein;
  if (remP <= 5) return { status: 'pass', text: '💪 โปรตีนถึงเป้าแล้วยอดเยี่ยม' };
  if (remP <= 25) return { status: 'warn', text: `🥩 โปรตีนยังขาดอีก ${remP}g` };
  return { status: 'alert', text: `🥩 แนะนำเน้นโปรตีนเพิ่ม ${remP}g` };
});

const calorieInsight = computed(() => {
  const remC = remaining.value.calories;
  if (remC < 0) return { status: 'alert', text: `⚠️ เกินเป้าหมาย ${Math.abs(remC)} kcal` };
  if (remC <= 300) return { status: 'warn', text: `⚡ เหลือโควต้า ${remC} kcal` };
  return { status: 'pass', text: `🥗 เหลือโควต้า ${remC} kcal` };
});

async function fetchAiRecommendations() {
  isLoading.value = true;
  try {
    const meals = calorieStore.getMealsForDate();
    const eatenList = [
      ...(meals.breakfast || []),
      ...(meals.lunch || []),
      ...(meals.dinner || []),
      ...(meals.snack || [])
    ];

    const targets = {
      calorieTarget: state.userProfile.calorieTarget || 2000,
      proteinTarget: state.userProfile.proteinTarget || 120,
      carbsTarget: state.userProfile.carbsTarget || 230,
      fatTarget: state.userProfile.fatTarget || 55
    };

    const res = await getAiMealRecommendation({
      dailyTotals: dailyTotals.value,
      targets,
      remaining: remaining.value,
      eatenList,
      nextMealSlot: calorieStore.getMealTypeName(selectedSlot.value),
      goal: state.userProfile.goal || 'maintain'
    });

    coachData.value = res;
    // Cache for this date
    if (!state.aiCoachCache) state.aiCoachCache = {};
    state.aiCoachCache[state.selectedDate] = res;

    calorieStore.showToast(`AI แนะนำ 3 เมนูสำหรับ ${calorieStore.getMealTypeName(selectedSlot.value)} แล้ว! ✨`);
  } catch (err) {
    console.error('AI Coach error:', err);
    calorieStore.showToast('ไม่สามารถดึงข้อมูล AI ได้ ใช้คำแนะนำโภชนาการสำรอง', 'info');
  } finally {
    isLoading.value = false;
  }
}

function addRecommendedMeal(rec) {
  calorieStore.addMealItem(selectedSlot.value, {
    name: rec.name,
    nameEn: rec.nameEn || '',
    calories: rec.calories,
    protein: rec.protein,
    carbs: rec.carbs,
    fat: rec.fat,
    fiber: rec.fiber || 2,
    sodium: rec.sodium || 500,
    servingSize: rec.servingSize || '1 จาน',
    healthTip: rec.reason || '',
    source: 'AI Coach แนะนำ'
  }, 1);
}
</script>

<style scoped>
.ai-coach-card {
  background: linear-gradient(135deg, #154238 0%, #1E3A2F 60%, #14352B 100%);
  border-radius: var(--radius-xl, 28px);
  padding: 1.4rem;
  color: #FFFFFF;
  box-shadow: 0 10px 30px rgba(21, 66, 56, 0.2);
  border: 1px solid rgba(212, 255, 50, 0.2);
  position: relative;
  overflow: hidden;
}

.ai-coach-card::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(212, 255, 50, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.coach-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
}

.coach-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.ai-sparkle-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(212, 255, 50, 0.15);
  border: 1px solid rgba(212, 255, 50, 0.35);
  color: var(--accent-neon, #D4FF32);
  display: flex;
  align-items: center;
  justify-content: center;
}

.coach-main-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0;
}

.coach-sub-title {
  font-size: 0.74rem;
  color: #A3C2B6;
  display: block;
}

.score-pill {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(212, 255, 50, 0.3);
  padding: 0.3rem 0.65rem;
  border-radius: 12px;
  text-align: right;
}

.score-label {
  font-size: 0.62rem;
  color: #A3C2B6;
  display: block;
}

.score-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--accent-neon, #D4FF32);
}

.score-value small {
  font-size: 0.65rem;
  color: #FFFFFF;
  opacity: 0.7;
}

/* Macro Insights Row */
.macro-insights-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.insight-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
  color: #E2E8F0;
}

.insight-pill .pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.insight-pill.pass .pill-dot { background: #4ADE80; box-shadow: 0 0 6px #4ADE80; }
.insight-pill.warn .pill-dot { background: #FBBF24; box-shadow: 0 0 6px #FBBF24; }
.insight-pill.alert .pill-dot { background: #F87171; box-shadow: 0 0 6px #F87171; }

/* Coach Bubble */
.coach-bubble {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.coach-analysis-text {
  font-size: 0.82rem;
  line-height: 1.45;
  color: #F1F5F9;
  margin: 0 0 0.5rem;
}

.coach-tip-row {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  background: rgba(212, 255, 50, 0.1);
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  font-size: 0.74rem;
  color: #E2E8F0;
}

.tip-badge {
  font-weight: 700;
  color: var(--accent-neon, #D4FF32);
  white-space: nowrap;
}

.coach-source-tag {
  font-size: 0.65rem;
  color: #6EE7B7;
  display: block;
  margin-top: 0.4rem;
  text-align: right;
  opacity: 0.8;
}

/* Recommend Action Box */
.recommend-action-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.slot-select-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.select-label {
  font-size: 0.76rem;
  color: #CBD5E1;
  font-weight: 600;
}

.slot-chips {
  display: flex;
  gap: 0.3rem;
}

.btn-slot-chip {
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: #E2E8F0;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-slot-chip.active {
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  border-color: var(--accent-neon, #D4FF32);
  font-weight: 700;
}

.btn-generate-recs {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  border: none;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(212, 255, 50, 0.35);
  transition: all 0.15s;
}

.btn-generate-recs:hover:not(:disabled) {
  background: #C5F325;
  transform: translateY(-1px);
}

.btn-generate-recs:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.btn-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
}

.spinner-dot {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Recommendations List */
.recs-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1rem;
}

.rec-item-card {
  background: #FFFFFF;
  color: #0F1E17;
  border-radius: 16px;
  padding: 0.9rem 1rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.rec-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.rec-title-group {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
}

.rec-order-badge {
  background: var(--primary-light, #EBF3F0);
  color: var(--primary-forest, #154238);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 6px;
}

.rec-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
}

.rec-name-en {
  font-size: 0.72rem;
  color: #64748B;
  display: block;
}

.rec-cals {
  text-align: right;
  background: #FAF5FF;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #F3E8FF;
}

.cal-val {
  font-size: 1rem;
  font-weight: 800;
  color: #7E22CE;
}

.cal-unit {
  font-size: 0.62rem;
  color: #6B21A8;
  margin-left: 2px;
}

.rec-reason {
  font-size: 0.76rem;
  color: #475569;
  line-height: 1.35;
  margin: 0;
  background: #F8FAFC;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
}

.rec-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.3rem;
}

.rec-macros {
  display: flex;
  gap: 0.35rem;
}

.m-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}

.m-tag.pro { background: var(--macro-protein-bg, #F5F3FF); color: var(--macro-protein, #8B5CF6); }
.m-tag.carb { background: var(--macro-carb-bg, #EFF6FF); color: var(--macro-carb, #3B82F6); }
.m-tag.fat { background: var(--macro-fat-bg, #FFFBEB); color: var(--macro-fat, #F59E0B); }

.btn-add-rec {
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-add-rec:hover {
  background: var(--primary-dark, #0D281E);
}
</style>
