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
          {{ stats.weeklyDeficit >= 0 ? '📉 เผาผลาญไขมัน' : '📈 พลังงานเกิน' }}
        </span>
      </div>

      <div class="metric-box streak-metric">
        <span class="m-label">Streak สะสม</span>
        <div class="m-val-row font-num">
          <span class="m-num font-num">{{ currentStreak }}</span>
          <span class="m-unit">วัน</span>
        </div>
        <span class="m-sub">🔥 บันทึกต่อเนื่อง</span>
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
        <h4 class="card-mini-title">สัดส่วนสารอาหารเฉลี่ย/วัน</h4>
        <div class="macro-split-bars">
          <!-- Carb -->
          <div class="macro-stat-row">
            <div class="m-tag-circle carb"></div>
            <div class="m-stat-text">
              <span class="m-name">คาร์โบไฮเดรต</span>
              <span class="m-qty font-num">{{ stats.avgCarbs }}g <small>({{ carbCaloriesPercent }}%)</small></span>
            </div>
          </div>

          <!-- Protein -->
          <div class="macro-stat-row">
            <div class="m-tag-circle pro"></div>
            <div class="m-stat-text">
              <span class="m-name">โปรตีน</span>
              <span class="m-qty font-num">{{ stats.avgProtein }}g <small>({{ proteinCaloriesPercent }}%)</small></span>
            </div>
          </div>

          <!-- Fat -->
          <div class="macro-stat-row">
            <div class="m-tag-circle fat"></div>
            <div class="m-stat-text">
              <span class="m-name">ไขมัน</span>
              <span class="m-qty font-num">{{ stats.avgFat }}g <small>({{ fatCaloriesPercent }}%)</small></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Water Habit Consistency -->
      <div class="split-card">
        <h4 class="card-mini-title">ความสม่ำเสมอในการดื่มน้ำ</h4>
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
          ดื่มน้ำครบเป้าหมาย {{ daysMetWater }} จาก 7 วันที่ผ่านมา 💧
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
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.split-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle, #E8ECE9);
  border-radius: var(--radius-lg, 18px);
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.card-mini-title {
  font-size: 0.84rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 0.7rem;
}

.macro-split-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.macro-stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.m-tag-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.m-tag-circle.carb { background: var(--macro-carb, #3B82F6); }
.m-tag-circle.pro { background: var(--macro-protein, #8B5CF6); }
.m-tag-circle.fat { background: var(--macro-fat, #F59E0B); }

.m-stat-text {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.74rem;
}

.m-name {
  color: #475569;
  font-weight: 600;
}

.m-qty {
  font-weight: 700;
  color: #0F172A;
}

.m-qty small {
  color: #64748B;
  font-weight: 500;
}

/* Water Days Grid */
.water-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 0.6rem;
}

.water-day-pill {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0.35rem 0.1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.water-day-pill.met {
  background: #EFF6FF;
  border-color: #93C5FD;
  color: #1D4ED8;
}

.w-day-name {
  font-size: 0.62rem;
  color: #64748B;
}

.w-glasses-num {
  font-size: 0.68rem;
  font-weight: 700;
}

.water-sub-insight {
  font-size: 0.72rem;
  color: #64748B;
  margin: 0;
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
}
</style>
