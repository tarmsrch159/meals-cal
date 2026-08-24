<template>
  <div class="fasting-timer-card">
    <div class="fasting-head">
      <div class="head-left">
        <div class="timer-icon-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div>
          <h4 class="fasting-title">Intermittent Fasting (IF)</h4>
          <span class="fasting-sub-plan font-num">แผน {{ state.fasting.plan || '16:8' }}</span>
        </div>
      </div>

      <!-- Plan Selector Dropdown/Chips -->
      <div class="plan-chips">
        <button 
          v-for="p in availablePlans" 
          :key="p.name"
          type="button"
          class="btn-plan-pill"
          :class="{ active: state.fasting.plan === p.name }"
          @click="selectPlan(p)"
        >
          {{ p.name }}
        </button>
      </div>
    </div>

    <!-- Active Fasting Timer State -->
    <div v-if="state.fasting.isFasting" class="fasting-active-body">
      <div class="timer-ring-section">
        <!-- SVG Circular Ring -->
        <div class="fasting-ring-wrap">
          <svg class="ring-svg" viewBox="0 0 100 100">
            <circle class="ring-bg" cx="50" cy="50" r="42" />
            <circle 
              class="ring-fill" 
              cx="50" 
              cy="50" 
              r="42"
              :stroke-dasharray="ringCircumference"
              :stroke-dashoffset="ringStrokeDashoffset"
            />
          </svg>
          <div class="ring-center-content font-num">
            <span class="elapsed-clock font-num">{{ timerData.hoursFormatted }}</span>
            <span class="ring-percent font-num">{{ timerData.percent }}%</span>
          </div>
        </div>

        <div class="timer-status-info">
          <div class="window-badge fasting">
            <span class="pulse-dot"></span>
            <span>ช่วง Fasting (อดอาหาร)</span>
          </div>
          <span class="rem-time-sub font-num">{{ timerData.remainingHoursFormatted }}</span>
          <span class="start-time-tag font-num" v-if="state.fasting.startTime">
            เริ่มเมื่อ {{ formattedStartTime }}
          </span>
        </div>
      </div>

      <button 
        type="button" 
        class="btn-stop-fasting" 
        @click="stopFasting"
      >
        สิ้นสุดช่วง Fasting
      </button>
    </div>

    <!-- Idle / Ready to Fast State -->
    <div v-else class="fasting-idle-body">
      <div class="idle-info-row">
        <div class="idle-text-col">
          <span class="window-badge eating">
            <span>ช่วง Eating (ทานอาหารได้)</span>
          </span>
          <p class="idle-desc">
            พร้อมเริ่มนับชั่วโมงงดอาหาร สำหรับแผน <strong>{{ state.fasting.plan }} (อด {{ state.fasting.durationHours }} ชม.)</strong>
          </p>
        </div>

        <button 
          type="button" 
          class="btn-start-fasting font-num" 
          @click="startFasting"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>เริ่ม Fasting</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';

const availablePlans = [
  { name: '14:10', hours: 14 },
  { name: '16:8', hours: 16 },
  { name: '18:6', hours: 18 },
  { name: '20:4', hours: 20 }
];

const timerData = ref(calorieStore.getFastingProgress());
let intervalId = null;

onMounted(() => {
  timerData.value = calorieStore.getFastingProgress();
  intervalId = setInterval(() => {
    timerData.value = calorieStore.getFastingProgress();
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

function selectPlan(p) {
  calorieStore.setFastingPlan(p.name, p.hours);
}

function startFasting() {
  calorieStore.startFasting(state.fasting.plan || '16:8', state.fasting.durationHours || 16);
  timerData.value = calorieStore.getFastingProgress();
}

function stopFasting() {
  calorieStore.stopFasting();
  timerData.value = calorieStore.getFastingProgress();
}

// Circular progress calculations
const ringRadius = 42;
const ringCircumference = 2 * Math.PI * ringRadius;

const ringStrokeDashoffset = computed(() => {
  const pct = Math.min(100, timerData.value.percent || 0);
  return ringCircumference - (pct / 100) * ringCircumference;
});

const formattedStartTime = computed(() => {
  if (!state.fasting.startTime) return '';
  const d = new Date(state.fasting.startTime);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} น.`;
});
</script>

<style scoped>
.fasting-timer-card {
  background: var(--surface-card, #FFFFFF);
  border-radius: var(--radius-xl, 24px);
  padding: 1.1rem 1.2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-subtle, #E8ECE9);
}

.fasting-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timer-icon-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--primary-light, #EBF3F0);
  color: var(--primary-forest, #154238);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fasting-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.fasting-sub-plan {
  font-size: 0.72rem;
  color: #64748b;
  display: block;
}

.plan-chips {
  display: flex;
  gap: 0.25rem;
}

.btn-plan-pill {
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-plan-pill.active {
  background: var(--primary-forest, #154238);
  color: #ffffff;
  border-color: var(--primary-forest, #154238);
}

/* Active Fasting View */
.fasting-active-body {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.timer-ring-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  border-radius: 18px;
  padding: 0.8rem 1rem;
  border: 1px solid #e2e8f0;
}

.fasting-ring-wrap {
  position: relative;
  width: 76px;
  height: 76px;
  flex-shrink: 0;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 8;
}

.ring-fill {
  fill: none;
  stroke: var(--accent-neon, #D4FF32);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.ring-center-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.elapsed-clock {
  font-size: 0.76rem;
  font-weight: 800;
  color: #0f172a;
}

.ring-percent {
  font-size: 0.6rem;
  color: #64748b;
  font-weight: 600;
}

.timer-status-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.window-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  width: fit-content;
}

.window-badge.fasting {
  background: #ECFDF5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.window-badge.eating {
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B981;
  animation: pulseDot 1.5s infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.rem-time-sub {
  font-size: 0.86rem;
  font-weight: 800;
  color: #0f172a;
}

.start-time-tag {
  font-size: 0.68rem;
  color: #64748b;
}

.btn-stop-fasting {
  width: 100%;
  padding: 0.55rem;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  color: #475569;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-stop-fasting:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* Idle State */
.fasting-idle-body {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 0.8rem 1rem;
}

.idle-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.idle-text-col {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.idle-desc {
  font-size: 0.76rem;
  color: #475569;
  margin: 0;
  line-height: 1.35;
}

.btn-start-fasting {
  background: var(--primary-forest, #154238);
  color: #ffffff;
  border: none;
  padding: 0.65rem 1rem;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  box-shadow: 0 4px 12px rgba(21, 66, 56, 0.2);
}

.btn-start-fasting:hover {
  background: var(--primary-dark, #0D281E);
}
</style>
