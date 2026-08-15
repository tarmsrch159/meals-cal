<template>
  <div v-if="state.showSosModal" class="modal-overlay" @click="closeModal">
    <div class="modal-dialog sos-dialog" @click.stop>
      <button class="modal-close-btn" @click="closeModal">
        <X :size="18" />
      </button>

      <!-- Siren & Alert Icon -->
      <div class="sos-header">
        <div class="siren-circle">
          <AlertOctagon :size="38" class="siren-icon" />
          <div class="siren-pulse"></div>
        </div>
        <h2 class="sos-title">{{ t('sosTitle') }}</h2>
        <p class="sos-desc">ระบบช่วยเหลือฉุกเฉินตลอด 24 ชั่วโมง พร้อมระบุพิกัด GPS อัตโนมัติ</p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="sos-actions">
        <!-- 1669 Hotline -->
        <a href="tel:1669" class="sos-btn-main" @click="handleCall1669">
          <div class="btn-left">
            <PhoneCall :size="24" />
            <div class="btn-text">
              <span class="btn-primary-text">{{ t('sosCall1669') }}</span>
              <span class="btn-sub-text">ศูนย์รับแจ้งเหตุและสั่งการการแพทย์ฉุกเฉิน</span>
            </div>
          </div>
          <ChevronRight :size="20" />
        </a>

        <!-- Family Contact -->
        <button class="sos-btn-secondary" @click="handleCallFamily">
          <div class="btn-left">
            <HeartHandshake :size="22" />
            <div class="btn-text">
              <span class="btn-primary-text">{{ t('sosCallFamily') }}</span>
              <span class="btn-sub-text">คุณศรัณย์ (ญาติ) - 081-234-5678</span>
            </div>
          </div>
          <ChevronRight :size="20" />
        </button>

        <!-- Broadcast GPS -->
        <button class="sos-btn-outline" :class="{ 'is-broadcasting': isBroadcasting }" @click="handleBroadcastGps">
          <Radio :size="20" :class="{ 'spin-anim': isBroadcasting }" />
          <span>{{ isBroadcasting ? 'กำลังกระจายสัญญาณพิกัด GPS ไปยังศูนย์กู้ภัย...' : t('sosBroadcast') }}</span>
        </button>
      </div>

      <!-- GPS Coord Box -->
      <div class="gps-preview-card">
        <div class="gps-header">
          <Navigation :size="14" />
          <span>พิกัดปัจจุบันของคุณ (GPS Live):</span>
        </div>
        <div class="gps-coord">13.7563° N, 100.5018° E (พญาไท, กรุงเทพฯ)</div>
        <div class="gps-status">
          <span class="pulse-dot"></span>
          <span>ความแม่นยำสูง (รัศมี 5 เมตร)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store } from '../stores/useAppStore.js';
import { 
  X, 
  AlertOctagon, 
  PhoneCall, 
  HeartHandshake, 
  Radio, 
  ChevronRight, 
  Navigation 
} from 'lucide-vue-next';

const { state, t, showToast } = store;
const isBroadcasting = ref(false);

const closeModal = () => {
  state.showSosModal = false;
};

const handleCall1669 = () => {
  showToast('📞 กำลังต่อสายไปยัง 1669 สายด่วนการแพทย์ฉุกเฉิน...', 'error');
};

const handleCallFamily = () => {
  showToast('📞 กำลังโทรออกหาผู้ติดต่อฉุกเฉิน (คุณศรัณย์)...', 'info');
};

const handleBroadcastGps = () => {
  isBroadcasting.value = true;
  showToast('📡 ส่งสัญญาณพิกัดฉุกเฉินไปยังศูนย์ประสานงานเรียบร้อยแล้ว!', 'error');
  setTimeout(() => {
    isBroadcasting.value = false;
  }, 4000);
};
</script>

<style scoped>
.sos-dialog {
  border: 2px solid #F87171;
  background: linear-gradient(180deg, #FFF1F2 0%, #FFFFFF 30%);
}

.sos-header {
  text-align: center;
  margin-bottom: 20px;
}

.siren-circle {
  width: 76px;
  height: 76px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  position: relative;
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
}

.siren-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 3px solid #EF4444;
  opacity: 0.8;
  animation: pulseRing 1.5s infinite;
}

@keyframes pulseRing {
  0% { transform: scale(0.95); opacity: 0.9; }
  100% { transform: scale(1.3); opacity: 0; }
}

.sos-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #B91C1C;
  line-height: 1.2;
}

.sos-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.sos-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.sos-btn-main {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: #FFFFFF;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.35);
  transition: var(--transition-fast);
}

.sos-btn-main:active {
  transform: scale(0.98);
}

.btn-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.btn-primary-text {
  font-size: 0.95rem;
  font-weight: 700;
}

.btn-sub-text {
  font-size: 0.7rem;
  opacity: 0.85;
}

.sos-btn-secondary {
  background: #FFFFFF;
  border: 1.5px solid #FCA5A5;
  color: #991B1B;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: var(--transition-fast);
}

.sos-btn-secondary:hover {
  background: #FEF2F2;
}

.sos-btn-outline {
  background: #FEE2E2;
  border: 1.5px dashed #EF4444;
  color: #B91C1C;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.gps-preview-card {
  background: #FFFFFF;
  border: 1px solid #FEE2E2;
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 0.75rem;
}

.gps-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-weight: 600;
}

.gps-coord {
  font-weight: 700;
  color: var(--primary-900);
  margin: 2px 0 4px;
}

.gps-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #059669;
  font-size: 0.7rem;
  font-weight: 600;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}
</style>
