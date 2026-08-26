<template>
  <div class="tab-view-container">
    <!-- Header Banner -->
    <div class="tab-hero-banner">
      <div class="banner-top">
        <div>
          <span class="hero-badge">Weekly Trends</span>
          <h2 class="hero-title">สถิติ & กราฟแนวโน้ม 7 วัน</h2>
          <p class="hero-sub">วิเคราะห์ความสม่ำเสมอและภาพรวมสารอาหารรายสัปดาห์</p>
        </div>
      </div>
    </div>

    <!-- 1. Key Metrics Cards Row -->
    <div class="metrics-summary-grid">
      <div class="metric-box">
        <span class="m-label">แคลอรี่เฉลี่ย</span>
        <div class="m-val-row font-num">
          <span class="m-num font-num">{{ stats.avgCals.toLocaleString() }}</span>
          <span class="m-unit">kcal</span>
        </div>
        <span class="m-sub font-num">เป้า {{ stats.targetCal.toLocaleString() }}k</span>
      </div>

      <div class="metric-box">
        <span class="m-label">Deficit สะสม</span>
        <div class="m-val-row font-num" :class="stats.weeklyDeficit >= 0 ? 'text-green' : 'text-orange'">
          <span class="m-num font-num">{{ stats.weeklyDeficit >= 0 ? '-' : '+' }}{{ Math.abs(stats.weeklyDeficit).toLocaleString() }}</span>
          <span class="m-unit">kcal</span>
        </div>
        <span class="m-sub">
          {{ stats.weeklyDeficit >= 0 ? 'เผาผลาญไขมัน' : 'พลังงานเกิน' }}
        </span>
      </div>

      <div class="metric-box streak-metric">
        <span class="m-label">Streak สะสม</span>
        <div class="m-val-row font-num">
          <span class="m-num font-num">{{ currentStreak }}</span>
          <span class="m-unit">วัน</span>
        </div>
        <span class="m-sub">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4FF32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:2px;">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>
          </svg>
          บันทึกต่อเนื่อง
        </span>
      </div>
    </div>

    <!-- 2. Interactive 7-Day Calorie Bar Chart -->
    <div class="chart-section-card">
      <div class="chart-header">
        <h4 class="chart-title">กราฟแคลอรี่ 7 วันย้อนหลัง</h4>
        <span class="target-legend">
          <span class="legend-line"></span>
          <span>เป้าหมาย ({{ stats.targetCal }} kcal)</span>
        </span>
      </div>

      <div class="bar-chart-wrap">
        <div class="chart-bars-row">
          <div 
            v-for="day in stats.days" 
            :key="day.dateStr"
            class="chart-col"
            :class="{ active: day.isSelected, today: day.isToday }"
            @click="selectDay(day.dateStr)"
          >
            <!-- Tooltip on hover/active -->
            <div class="bar-tooltip font-num" v-if="hoveredDate === day.dateStr || day.isSelected">
              <span class="tip-cal font-num">{{ day.calories }} kcal</span>
              <span class="tip-date">{{ day.dayShort }} {{ day.dayNum }}</span>
            </div>

            <div 
              class="bar-track-area"
              @mouseenter="hoveredDate = day.dateStr"
              @mouseleave="hoveredDate = null"
            >
              <!-- Target Line Reference -->
              <div class="target-dash-line" :style="{ bottom: `${targetLinePercent}%` }"></div>

              <!-- The Dynamic Bar -->
              <div 
                class="bar-fill"
                :class="getBarColorClass(day)"
                :style="{ height: `${Math.min(100, Math.max(8, (day.calories / maxChartScale) * 100))}%` }"
              >
                <span class="bar-top-cal font-num" v-if="day.calories > 0">{{ day.calories }}</span>
              </div>
            </div>

            <!-- Day Labels -->
            <div class="day-label-group">
              <span class="day-short-name">{{ day.dayShort }}</span>
              <span class="day-num-badge font-num" :class="{ 'is-today': day.isToday }">{{ day.dayNum }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Macro Distribution Average & Water Consistency -->
    <div class="details-split-grid">
      <!-- Average Macro Split Card -->
      <div class="split-card">
        <div class="split-card-header">
          <h4 class="card-mini-title">สัดส่วนสารอาหารเฉลี่ย/วัน</h4>
          <span class="macro-total-badge font-num">รวม {{ Math.round((stats.avgCarbs * 4) + (stats.avgProtein * 4) + (stats.avgFat * 9)) }} kcal</span>
        </div>

        <div class="macro-split-bars">
          <!-- Carb -->
          <div class="macro-stat-item">
            <div class="m-stat-top">
              <div class="m-name-group">
                <span class="m-tag-circle carb"></span>
                <span class="m-name">คาร์โบไฮเดรต</span>
              </div>
              <div class="m-val-group font-num">
                <span class="m-qty">{{ stats.avgCarbs }}g</span>
                <span class="m-pct-badge carb">({{ carbCaloriesPercent }}%)</span>
              </div>
            </div>
            <div class="m-bar-track">
              <div class="m-bar-fill carb" :style="{ width: `${carbCaloriesPercent}%` }"></div>
            </div>
          </div>

          <!-- Protein -->
          <div class="macro-stat-item">
            <div class="m-stat-top">
              <div class="m-name-group">
                <span class="m-tag-circle pro"></span>
                <span class="m-name">โปรตีน</span>
              </div>
              <div class="m-val-group font-num">
                <span class="m-qty">{{ stats.avgProtein }}g</span>
                <span class="m-pct-badge pro">({{ proteinCaloriesPercent }}%)</span>
              </div>
            </div>
            <div class="m-bar-track">
              <div class="m-bar-fill pro" :style="{ width: `${proteinCaloriesPercent}%` }"></div>
            </div>
          </div>

          <!-- Fat -->
          <div class="macro-stat-item">
            <div class="m-stat-top">
              <div class="m-name-group">
                <span class="m-tag-circle fat"></span>
                <span class="m-name">ไขมัน</span>
              </div>
              <div class="m-val-group font-num">
                <span class="m-qty">{{ stats.avgFat }}g</span>
                <span class="m-pct-badge fat">({{ fatCaloriesPercent }}%)</span>
              </div>
            </div>
            <div class="m-bar-track">
              <div class="m-bar-fill fat" :style="{ width: `${fatCaloriesPercent}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Water Habit Consistency -->
      <div class="split-card">
        <div class="split-card-header">
          <h4 class="card-mini-title">ความสม่ำเสมอในการดื่มน้ำ</h4>
          <span class="water-met-badge font-num">{{ daysMetWater }}/7 วัน</span>
        </div>
        <div class="water-days-grid">
          <div 
            v-for="day in stats.days" 
            :key="day.dateStr"
            class="water-day-pill"
            :class="{ met: day.water >= 8 }"
            :title="`${day.dayShort}: ${day.water * 250} ml (${day.water} แก้ว)`"
          >
            <span class="w-day-name">{{ day.dayShort }}</span>
            <span class="w-glasses-num font-num">{{ day.water }}/8</span>
          </div>
        </div>
        <p class="water-sub-insight">
          ดื่มน้ำครบเป้าหมาย <strong>{{ daysMetWater }} จาก 7 วัน</strong> ที่ผ่านมา 💧
        </p>
      </div>
    </div>

    <!-- 4. Jump to Selected Day in Diary -->
    <div class="quick-jump-banner">
      <div>
        <span class="jump-label">ดูรายละเอียดของวันที่:</span>
        <strong class="jump-date font-num">{{ state.selectedDate }}</strong>
      </div>
      <button 
        type="button" 
        class="btn-view-day" 
        @click="goToDiaryWithDate"
      >
        เปิดในหน้าไดอารี่ ›
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';

const hoveredDate = ref(null);

const stats = computed(() => calorieStore.getSevenDayStats());
const currentStreak = computed(() => calorieStore.calculateStreak());

const maxChartScale = computed(() => {
  const maxDay = Math.max(...stats.value.days.map(d => d.calories), stats.value.targetCal);
  return Math.max(2500, Math.ceil((maxDay * 1.15) / 500) * 500);
});

const targetLinePercent = computed(() => {
  return Math.min(95, Math.round((stats.value.targetCal / maxChartScale.value) * 100));
});

function getBarColorClass(day) {
  if (day.calories === 0) return 'empty';
  const pct = (day.calories / stats.value.targetCal) * 100;
  if (pct > 110) return 'over';
  if (pct >= 85) return 'perfect';
  return 'normal';
}

function selectDay(dateStr) {
  calorieStore.setDate(dateStr);
}

function goToDiaryWithDate() {
  calorieStore.setActiveTab('diary');
}

const totalMacroEnergy = computed(() => {
  const c = stats.value.avgCarbs * 4;
  const p = stats.value.avgProtein * 4;
  const f = stats.value.avgFat * 9;
  return Math.max(1, c + p + f);
});

const carbCaloriesPercent = computed(() => Math.round(((stats.value.avgCarbs * 4) / totalMacroEnergy.value) * 100));
const proteinCaloriesPercent = computed(() => Math.round(((stats.value.avgProtein * 4) / totalMacroEnergy.value) * 100));
const fatCaloriesPercent = computed(() => Math.round(((stats.value.avgFat * 9) / totalMacroEnergy.value) * 100));

const daysMetWater = computed(() => {
  return stats.value.days.filter(d => d.water >= 8).length;
});
</script>

<style scoped>
.tab-view-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.tab-hero-banner {
  background: linear-gradient(135deg, #154238 0%, #1E3A2F 100%);
  border-radius: var(--radius-xl, 24px);
  padding: 1.4rem;
  color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(21, 66, 56, 0.15);
}

.hero-badge {
  display: inline-block;
  background: rgba(212, 255, 50, 0.15);
  border: 1px solid rgba(212, 255, 50, 0.3);
  color: var(--accent-neon, #D4FF32);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  margin-bottom: 0.35rem;
}

.hero-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}

.hero-sub {
  font-size: 0.78rem;
  color: #A3C2B6;
  margin: 2px 0 0;
}

/* Metrics Summary Grid */
.metrics-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.metric-box {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle, #E8ECE9);
  border-radius: 18px;
  padding: 0.85rem 0.7rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.m-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748B;
}

.m-val-row {
  margin: 0.35rem 0;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.m-num {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0F172A;
}

.m-unit {
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748B;
}

.m-sub {
  font-size: 0.64rem;
  color: #94A3B8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-green .m-num { color: #16A34A; }
.text-orange .m-num { color: #EA580C; }

/* Chart Section Card */
.chart-section-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle, #E8ECE9);
  border-radius: var(--radius-xl, 24px);
  padding: 1.2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.chart-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
}

.target-legend {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: #64748B;
}

.legend-line {
  width: 14px;
  height: 2px;
  background: #94A3B8;
  border-radius: 2px;
}

.bar-chart-wrap {
  position: relative;
  height: 190px;
  padding-top: 1.5rem;
}

.chart-bars-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  position: relative;
}

.chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  cursor: pointer;
  position: relative;
}

.bar-track-area {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
}

.target-dash-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  border-top: 1px dashed #CBD5E1;
  z-index: 1;
  pointer-events: none;
}

.bar-fill {
  width: 32px;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
}

.bar-fill.perfect {
  background: linear-gradient(180deg, #154238 0%, #1E3A2F 100%);
  box-shadow: 0 2px 8px rgba(21, 66, 56, 0.2);
}

.bar-fill.normal {
  background: #64748B;
}

.bar-fill.over {
  background: #EF4444;
}

.bar-fill.empty {
  background: #E2E8F0;
  height: 8px !important;
}

.chart-col.active .bar-fill {
  outline: 2px solid var(--accent-neon, #D4FF32);
  outline-offset: 1px;
}

.bar-top-cal {
  position: absolute;
  top: -16px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #475569;
}

.day-label-group {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.day-short-name {
  font-size: 0.72rem;
  color: #64748B;
  font-weight: 600;
}

.day-num-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: #334155;
}

.day-num-badge.is-today {
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
  padding: 1px 6px;
  border-radius: 999px;
}

/* Tooltip */
.bar-tooltip {
  position: absolute;
  top: -24px;
  background: #0F172A;
  color: #FFFFFF;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.62rem;
  display: flex;
  gap: 4px;
  white-space: nowrap;
  z-index: 10;
}

/* Details Split Grid */
.details-split-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .details-split-grid {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }
}

.split-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle, #E8ECE9);
  border-radius: var(--radius-lg, 20px);
  padding: 1.15rem 1.25rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
  width: 100%;
}

.split-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #F1F5F2;
}

.card-mini-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin: 0;
}

.macro-total-badge, .water-met-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary-forest, #154238);
  background: var(--primary-light, #EBF3F0);
  padding: 2px 8px;
  border-radius: 999px;
}

.macro-split-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.macro-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.m-stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
}

.m-name-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
}

.m-tag-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.m-tag-circle.carb { background: var(--macro-carb, #3B82F6); }
.m-tag-circle.pro { background: var(--macro-protein, #8B5CF6); }
.m-tag-circle.fat { background: var(--macro-fat, #F59E0B); }

.m-name {
  font-weight: 700;
  color: var(--text-main, #0F1E17);
}

.m-val-group {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  white-space: nowrap;
}

.m-qty {
  font-weight: 800;
  color: var(--text-main, #0F1E17);
}

.m-pct-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted, #52665C);
}

.m-bar-track {
  width: 100%;
  height: 6px;
  background: #E8ECE9;
  border-radius: 999px;
  overflow: hidden;
}

.m-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.m-bar-fill.carb { background: linear-gradient(90deg, #60A5FA 0%, #3B82F6 100%); }
.m-bar-fill.pro { background: linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%); }
.m-bar-fill.fat { background: linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%); }

.water-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.water-day-pill {
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 0.45rem 0.2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all 0.15s;
}

.water-day-pill.met {
  background: #EFF6FF;
  border-color: #60A5FA;
  color: #1D4ED8;
  font-weight: 800;
}

.w-day-name {
  font-size: 0.68rem;
  color: #64748B;
  font-weight: 600;
}

.w-glasses-num {
  font-size: 0.75rem;
  font-weight: 800;
}

.water-sub-insight {
  font-size: 0.76rem;
  color: #64748B;
  margin: 0;
  line-height: 1.4;
}

/* Quick Jump Banner */
.quick-jump-banner {
  background: var(--primary-light, #EBF3F0);
  border: 1px solid rgba(21, 66, 56, 0.15);
  border-radius: 16px;
  padding: 0.85rem 1.1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.jump-label {
  font-size: 0.78rem;
  color: #64748B;
  margin-right: 0.4rem;
}

.jump-date {
  color: var(--primary-forest, #154238);
}

.btn-view-day {
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-view-day:hover {
  background: var(--primary-dark, #0D281E);
}

@media (max-width: 480px) {
  .details-split-grid {
    grid-template-columns: 1fr;
  }
  .bar-fill {
    width: 24px;
  }
  .m-num {
    font-size: 1.1rem;
  }
  .metrics-summary-grid {
    gap: 0.35rem;
  }
  .metric-box {
    padding: 0.7rem 0.5rem;
  }
}
</style>
