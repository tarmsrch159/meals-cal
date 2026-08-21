<template>
  <div class="ai-health-dashboard">
    <!-- Top Action Bar -->
    <div class="dashboard-action-bar">
      <div class="header-titles">
        <h2 class="dash-main-title">
          <Activity :size="20" class="text-cyan" />
          <span>แดชบอร์ดสุขภาพอัจฉริยะ (AI Health)</span>
        </h2>
        <p class="dash-main-subtitle">วิเคราะห์ผลแล็บและติดตามดัชนีสุขภาพ 11 รายการ ด้วย AI</p>
      </div>

      <div class="header-action-buttons">
        <button class="btn btn-sm btn-outline-cyan" @click="openScanner">
          <Camera :size="15" />
          <span>สแกนใบตรวจ</span>
        </button>
        <button class="btn btn-sm btn-primary btn-ai-chat" @click="openDoctorChat">
          <Sparkles :size="15" />
          <span>✨ ปรึกษาหมอ AI</span>
        </button>
      </div>
    </div>

    <!-- Health Score Hero Slider & Bento Cards -->
    <div class="health-hero-section">
      <!-- 1. Health Score Ring Card -->
      <div class="glass-card score-hero-card">
        <div class="score-circle" :style="scoreRingStyle">
          <span class="score-value">{{ currentScore }}</span>
          <span class="score-max">/100</span>
        </div>
        <div class="score-details">
          <div class="score-badge-row">
            <h3 class="score-card-title">คะแนนสุขภาพรวม</h3>
            <button class="ai-doolae-badge" @click="openDoctorChat">
              <Sparkles :size="12" />
              <span>AI DOOLAE</span>
            </button>
          </div>
          <p class="score-status-summary">
            สุขภาพโดยรวม <strong>{{ scoreLevelText }}</strong>
            <br>
            <span class="score-sub-note">{{ scoreAdviceNote }}</span>
          </p>
        </div>
      </div>

      <!-- 2. Health Score Trend Graph Card -->
      <div class="glass-card chart-hero-card">
        <div class="chart-header-row">
          <span class="chart-title">
            <TrendingUp :size="15" class="text-cyan" />
            <span>แนวโน้มคะแนนสุขภาพ (4 เดือนล่าสุด)</span>
          </span>
          <span class="badge badge-success">+13 คะแนน</span>
        </div>
        <div class="chart-canvas-wrapper">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Period & History Selector Bar -->
    <div class="period-selector-bar glass-card">
      <div class="selector-left">
        <Calendar :size="16" class="text-cyan" />
        <span class="selector-label">แสดงผลตรวจประจำงวด:</span>
      </div>
      <div class="selector-right">
        <select 
          :value="state.healthMonth" 
          @change="onMonthChange($event.target.value)" 
          class="custom-month-select"
        >
          <option value="latest">ผลตรวจล่าสุด ({{ currentHealthData.reportDate || 'ปัจจุบัน' }})</option>
          <option value="jun2026">มิถุนายน 2569 (ประจำเดือน)</option>
          <option value="may2026">พฤษภาคม 2569 (ประจำเดือน)</option>
          <option value="apr2026">เมษายน 2569 (ประจำเดือน)</option>
        </select>
      </div>
    </div>

    <!-- Health Metrics Grid (11 Bento Cards) -->
    <div class="bento-metrics-header">
      <h3 class="bento-heading">
        <FileText :size="16" class="text-cyan" />
        <span>ดัชนีสุขภาพ 11 หมวด ({{ currentHealthData.reportDate || 'อัปเดตล่าสุด' }})</span>
      </h3>
      <span class="metrics-legend">
        <span class="legend-dot green"></span> ปกติ
        <span class="legend-dot yellow"></span> เฝ้าระวัง
        <span class="legend-dot red"></span> เสี่ยงสูง
      </span>
    </div>

    <div class="bento-grid">
      <!-- 1. BMI -->
      <div class="bento-card">
        <div class="m-title">
          <span class="m-icon">⚖️</span>
          <span>ดัชนีมวลกาย (BMI)</span>
        </div>
        <div class="m-data">
          <div class="m-result" :class="getStatusClass(currentHealthData.bmi?.status)">
            {{ currentHealthData.bmi?.value || '--' }} <span class="m-unit">kg/m²</span>
          </div>
          <div class="m-normal">ค่าปกติ: 18.5 - 22.9</div>
        </div>
      </div>

      <!-- 2. Blood Pressure -->
      <div class="bento-card">
        <div class="m-title">
          <span class="m-icon">🫀</span>
          <span>ความดันโลหิต (BP)</span>
        </div>
        <div class="m-data">
          <div class="m-result" :class="getStatusClass(currentHealthData.bloodPressure?.status)">
            {{ currentHealthData.bloodPressure?.value || '--' }} <span class="m-unit">mmHg</span>
          </div>
          <div class="m-normal">ค่าปกติ: 90-140 / 60-90</div>
        </div>
      </div>

      <!-- 3. Pulse Rate -->
      <div class="bento-card">
        <div class="m-title">
          <span class="m-icon">❤️</span>
          <span>อัตราการเต้นชีพจร</span>
        </div>
        <div class="m-data">
          <div class="m-result" :class="getStatusClass(currentHealthData.pulse?.status)">
            {{ currentHealthData.pulse?.value || '--' }} <span class="m-unit">bpm</span>
          </div>
          <div class="m-normal">ค่าปกติ: 60 - 90</div>
        </div>
      </div>

      <!-- 4. Blood Glucose (FBS) -->
      <div class="bento-card">
        <div class="m-title">
          <span class="m-icon">🍬</span>
          <span>ระดับน้ำตาล (FBS)</span>
        </div>
        <div class="m-data">
          <div class="m-result" :class="getStatusClass(currentHealthData.glucose?.status)">
            {{ currentHealthData.glucose?.value || '--' }} <span class="m-unit">mg/dL</span>
          </div>
          <div class="m-normal">ค่าปกติ: 70 - 100</div>
        </div>
      </div>

      <!-- 5. Complete Blood Count (CBC) -->
      <div class="bento-card span-2">
        <div class="m-title">
          <span class="m-icon">🩸</span>
          <span>ความสมบูรณ์ของเม็ดเลือด (CBC)</span>
        </div>
        <div class="sub-metric">
          <span class="sub-name">Monocyte</span>
          <div class="m-data">
            <div class="sub-value" :class="getStatusClass(currentHealthData.cbc_monocyte?.status)">
              {{ currentHealthData.cbc_monocyte?.value || '--' }} <span class="m-unit">%</span>
            </div>
            <div class="m-normal">ค่าปกติ: 0 - 8%</div>
          </div>
        </div>
      </div>

      <!-- 6. Lipid Profile -->
      <div class="bento-card span-2">
        <div class="m-title">
          <span class="m-icon">🛢️</span>
          <span>ตรวจไขมันในเลือด (Lipid Profile)</span>
        </div>
        <div class="sub-metrics-grid-3">
          <div class="sub-metric-item">
            <span class="sub-label">Cholesterol</span>
            <div class="sub-val" :class="getStatusClass(currentHealthData.lipid?.cholesterol?.status)">
              {{ currentHealthData.lipid?.cholesterol?.value || '--' }} <span class="m-unit-sm">mg/dL</span>
            </div>
            <span class="sub-norm">ปกติ: &lt; 200</span>
          </div>
          <div class="sub-metric-item">
            <span class="sub-label">Triglyceride</span>
            <div class="sub-val" :class="getStatusClass(currentHealthData.lipid?.triglyceride?.status)">
              {{ currentHealthData.lipid?.triglyceride?.value || '--' }} <span class="m-unit-sm">mg/dL</span>
            </div>
            <span class="sub-norm">ปกติ: &lt; 150</span>
          </div>
          <div class="sub-metric-item">
            <span class="sub-label">HDL (ไขมันดี)</span>
            <div class="sub-val" :class="getStatusClass(currentHealthData.lipid?.hdl?.status)">
              {{ currentHealthData.lipid?.hdl?.value || '--' }} <span class="m-unit-sm">mg/dL</span>
            </div>
            <span class="sub-norm">ปกติ: &gt; 40</span>
          </div>
        </div>
      </div>

      <!-- 7. Kidney Function -->
      <div class="bento-card span-2">
        <div class="m-title">
          <span class="m-icon">💧</span>
          <span>ตรวจการทำงานของไต (Kidney Function)</span>
        </div>
        <div class="sub-metrics-grid-3">
          <div class="sub-metric-item">
            <span class="sub-label">BUN</span>
            <div class="sub-val" :class="getStatusClass(currentHealthData.kidney?.bun?.status)">
              {{ currentHealthData.kidney?.bun?.value || '--' }} <span class="m-unit-sm">mg/dL</span>
            </div>
            <span class="sub-norm">ปกติ: 7 - 20</span>
          </div>
          <div class="sub-metric-item">
            <span class="sub-label">Creatinine</span>
            <div class="sub-val" :class="getStatusClass(currentHealthData.kidney?.creatinine?.status)">
              {{ currentHealthData.kidney?.creatinine?.value || '--' }} <span class="m-unit-sm">mg/dL</span>
            </div>
            <span class="sub-norm">ปกติ: 0.6 - 1.2</span>
          </div>
          <div class="sub-metric-item">
            <span class="sub-label">eGFR</span>
            <div class="sub-val" :class="getStatusClass(currentHealthData.kidney?.egfr?.status)">
              {{ currentHealthData.kidney?.egfr?.value || '--' }}
            </div>
            <span class="sub-norm">ปกติ: &gt; 60</span>
          </div>
        </div>
      </div>

      <!-- 8. Liver Function -->
      <div class="bento-card span-2">
        <div class="m-title">
          <span class="m-icon">🩺</span>
          <span>ตรวจการทำงานของตับ (Liver LFT)</span>
        </div>
        <div class="sub-metrics-grid-3">
          <div class="sub-metric-item">
            <span class="sub-label">ALP</span>
            <div class="sub-val" :class="getStatusClass(currentHealthData.liver?.alp?.status)">
              {{ currentHealthData.liver?.alp?.value || '--' }} <span class="m-unit-sm">U/L</span>
            </div>
            <span class="sub-norm">ปกติ: 30 - 120</span>
          </div>
          <div class="sub-metric-item">
            <span class="sub-label">AST (SGOT)</span>
            <div class="sub-val" :class="getStatusClass(currentHealthData.liver?.ast?.status)">
              {{ currentHealthData.liver?.ast?.value || '--' }} <span class="m-unit-sm">U/L</span>
            </div>
            <span class="sub-norm">ปกติ: 0 - 35</span>
          </div>
          <div class="sub-metric-item">
            <span class="sub-label">ALT (SGPT)</span>
            <div class="sub-val" :class="getStatusClass(currentHealthData.liver?.alt?.status)">
              {{ currentHealthData.liver?.alt?.value || '--' }} <span class="m-unit-sm">U/L</span>
            </div>
            <span class="sub-norm">ปกติ: 0 - 45</span>
          </div>
        </div>
      </div>

      <!-- 9. Urine & 10. Stool -->
      <div class="bento-card">
        <div class="m-title">
          <span class="m-icon">🧪</span>
          <span>ปัสสาวะ (Urine)</span>
        </div>
        <div class="m-data">
          <div class="m-result font-medium" :class="getStatusClass(currentHealthData.urine?.status)">
            {{ currentHealthData.urine?.value || 'ปกติ' }}
          </div>
          <div class="m-normal">เกณฑ์: ไม่พบความผิดปกติ</div>
        </div>
      </div>

      <div class="bento-card">
        <div class="m-title">
          <span class="m-icon">💩</span>
          <span>อุจจาระ (Stool)</span>
        </div>
        <div class="m-data">
          <div class="m-result font-medium" :class="getStatusClass(currentHealthData.stool?.status)">
            {{ currentHealthData.stool?.value || 'ปกติ' }}
          </div>
          <div class="m-normal">เกณฑ์: ไม่พบเม็ดเลือด/พยาธิ</div>
        </div>
      </div>

      <!-- 11. Uric Acid -->
      <div class="bento-card span-2">
        <div class="m-title">
          <span class="m-icon">🦴</span>
          <span>ระดับกรดยูริค (Uric Acid)</span>
        </div>
        <div class="m-data flex-between">
          <div class="m-normal m-0">ค่าปกติ: 3.6 - 7.0 mg/dL</div>
          <div class="m-result" :class="getStatusClass(currentHealthData.uricAcid?.status)">
            {{ currentHealthData.uricAcid?.value || '--' }} <span class="m-unit">mg/dL</span>
          </div>
        </div>
      </div>

      <!-- Doctor & AI Recommendation -->
      <div class="bento-card span-2 doctor-rec-card">
        <div class="rec-header">
          <div class="rec-title-wrap">
            <span class="rec-avatar-badge">👨‍⚕️</span>
            <div>
              <h4 class="rec-heading">สรุปคำแนะนำจากแพทย์ & AI DOOLAE</h4>
              <span class="rec-sub">วิเคราะห์ผลเลือดร่วมกับประวัติสุขภาพ</span>
            </div>
          </div>
          <button class="btn btn-xs btn-primary" @click="openDoctorChat">
            <MessageSquare :size="13" />
            <span>คุยกับหมอ AI</span>
          </button>
        </div>
        <div class="rec-content">
          {{ currentHealthData.doctorRecommendation || 'ผลตรวจสุขภาพโดยรวมอยู่ในเกณฑ์ดี โปรดรักษาพฤติกรรมการรับประทานอาหารที่มีประโยชน์และออกกำลังกายสม่ำเสมอ' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { store } from '../../stores/useAppStore.js';
import { 
  Activity, 
  Camera, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  FileText, 
  MessageSquare 
} from 'lucide-vue-next';
import Chart from 'chart.js/auto';

const emit = defineEmits(['open-scanner', 'open-chat']);
const { state, loadHealthDataForMonth } = store;

const chartCanvas = ref(null);
let chartInstance = null;

const currentHealthData = computed(() => {
  if (state.healthMonth === 'latest') {
    return state.healthData;
  }
  return state.healthHistory[state.healthMonth] || state.healthData;
});

const currentScore = computed(() => {
  return store.calculateHealthScore(currentHealthData.value);
});

const scoreRingStyle = computed(() => {
  const score = currentScore.value;
  let color = '#00B4D8';
  if (score >= 80) color = '#10B981';
  else if (score >= 65) color = '#F59E0B';
  else color = '#EF4444';

  return {
    background: `conic-gradient(${color} ${score}%, #E2E8F0 0)`
  };
});

const scoreLevelText = computed(() => {
  const s = currentScore.value;
  if (s >= 85) return 'ดีเยี่ยม';
  if (s >= 75) return 'ค่อนข้างดี';
  if (s >= 60) return 'ปานกลาง (ต้องเฝ้าระวัง)';
  return 'เสี่ยง (ควรพบแพทย์)';
});

const scoreAdviceNote = computed(() => {
  const d = currentHealthData.value;
  if (d.lipid?.cholesterol?.status === 'danger') {
    return 'มีจุดที่ต้องเฝ้าระวัง 1 รายการ: คอเลสเตอรอลในเลือด';
  }
  if (d.bloodPressure?.status === 'warning' || d.bloodPressure?.status === 'danger') {
    return 'มีจุดที่ต้องเฝ้าระวัง: ระดับความดันโลหิต';
  }
  return 'ดัชนีสุขภาพส่วนใหญ่อยู่ในเกณฑ์มาตรฐาน';
});

const getStatusClass = (status) => {
  if (status === 'danger') return 'text-danger';
  if (status === 'warning') return 'text-warning';
  return 'text-normal';
};

const onMonthChange = (val) => {
  loadHealthDataForMonth(val);
};

const openScanner = () => {
  emit('open-scanner');
};

const openDoctorChat = () => {
  emit('open-chat');
};

const initChart = () => {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  let gradient = ctx.createLinearGradient(0, 0, 0, 100);
  gradient.addColorStop(0, 'rgba(0, 180, 216, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 180, 216, 0.0)');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['เม.ย. 69', 'พ.ค. 69', 'มิ.ย. 69', 'ก.ค. (ล่าสุด)'],
      datasets: [{
        label: 'คะแนนสุขภาพ',
        data: [72, 75, 82, currentScore.value],
        borderColor: '#00B4D8',
        backgroundColor: gradient,
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0077B6',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Kanit' },
          bodyFont: { family: 'Kanit', size: 13 },
          padding: 8,
          displayColors: false,
          callbacks: {
            label: (context) => `คะแนนสุขภาพ: ${context.parsed.y} คะแนน`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 50,
          max: 100,
          grid: {
            color: 'rgba(0,0,0,0.04)',
            drawBorder: false
          },
          ticks: {
            font: { family: 'Kanit', size: 11 },
            stepSize: 10
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Kanit', size: 11 }
          }
        }
      }
    }
  });
};

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

watch(() => state.healthData, () => {
  nextTick(() => {
    initChart();
  });
}, { deep: true });
</script>

<style scoped>
.ai-health-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.dashboard-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 4px 0;
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dash-main-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.dash-main-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.header-action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-outline-cyan {
  background: rgba(0, 180, 216, 0.08);
  color: var(--primary-600);
  border: 1.5px solid var(--primary-400);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-outline-cyan:hover {
  background: var(--primary-50);
  border-color: var(--primary-600);
}

.btn-ai-chat {
  background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 180, 216, 0.35);
  transition: var(--transition-fast);
}

.btn-ai-chat:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 180, 216, 0.45);
}

/* Health Hero Section */
.health-hero-section {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .health-hero-section {
    grid-template-columns: 1fr;
  }
}

.score-hero-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 180, 216, 0.25);
  background: linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%);
  position: relative;
  overflow: hidden;
}

.score-hero-card::before {
  content: '';
  position: absolute;
  top: -30px;
  left: -30px;
  width: 100px;
  height: 100px;
  background: rgba(0, 180, 216, 0.15);
  filter: blur(30px);
  border-radius: 50%;
}

.score-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 180, 216, 0.18);
}

.score-circle::after {
  content: "";
  position: absolute;
  width: 74px;
  height: 74px;
  background: #FFFFFF;
  border-radius: 50%;
}

.score-circle span {
  position: relative;
  z-index: 1;
}

.score-value {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--primary-700);
  line-height: 1;
}

.score-max {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.score-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.score-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.ai-doolae-badge {
  background: linear-gradient(135deg, #00B4D8, #0077B6);
  color: #ffffff;
  border: none;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.score-status-summary {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin: 0;
}

.score-status-summary strong {
  color: var(--primary-700);
}

.score-sub-note {
  font-size: 0.72rem;
  color: var(--text-light);
}

/* Chart Hero Card */
.chart-hero-card {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(0, 180, 216, 0.2);
}

.chart-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.chart-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-canvas-wrapper {
  width: 100%;
  height: 90px;
  position: relative;
}

/* Period Selector Bar */
.period-selector-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 180, 216, 0.18);
  gap: 12px;
  flex-wrap: wrap;
}

.selector-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
}

.custom-month-select {
  background: var(--surface-white);
  color: var(--text-main);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.custom-month-select:focus {
  border-color: var(--primary-500);
}

/* Bento Grid */
.bento-metrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.bento-heading {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.metrics-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 3px;
}

.legend-dot.green { background: #10B981; }
.legend-dot.yellow { background: #F59E0B; }
.legend-dot.red { background: #EF4444; }

.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.bento-card {
  background: var(--surface-white);
  border: 1px solid rgba(0, 180, 216, 0.15);
  border-radius: var(--radius-md);
  padding: 14px;
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  transition: var(--transition-fast);
}

.bento-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: rgba(0, 180, 216, 0.35);
}

.bento-card.span-2 {
  grid-column: span 2;
}

.m-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.m-icon {
  font-size: 1rem;
}

.m-data {
  display: flex;
  flex-direction: column;
}

.m-result {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.m-unit {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: normal;
}

.m-unit-sm {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: normal;
}

.m-normal {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 3px;
}

/* Sub-metrics */
.sub-metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.sub-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-main);
}

.sub-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.sub-metrics-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 4px;
}

.sub-metric-item {
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid #E2E8F0;
}

.sub-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
}

.sub-val {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 2px 0;
}

.sub-norm {
  font-size: 0.62rem;
  color: var(--text-light);
}

/* Color classes */
.text-normal { color: #10B981 !important; }
.text-warning { color: #D97706 !important; }
.text-danger { color: #DC2626 !important; }
.text-cyan { color: var(--primary-500) !important; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.m-0 { margin: 0 !important; }

/* Doctor & AI Rec Card */
.doctor-rec-card {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  border: 1px solid #86EFAC;
  padding: 16px;
}

.rec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
}

.rec-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rec-avatar-badge {
  font-size: 1.5rem;
}

.rec-heading {
  font-size: 0.88rem;
  font-weight: 700;
  color: #166534;
  margin: 0;
}

.rec-sub {
  font-size: 0.7rem;
  color: #15803D;
}

.rec-content {
  font-size: 0.82rem;
  color: #14532D;
  line-height: 1.55;
}
</style>
