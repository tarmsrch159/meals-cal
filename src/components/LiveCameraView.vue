<template>
  <div class="cam-card">
    <div class="cam-header">
      <div class="cam-live-indicator">
        <span class="live-blink"></span>
        <span class="live-tag">{{ t('camLive') }}</span>
      </div>
      <div class="cam-selector">
        <select v-model="selectedCam" class="cam-dropdown">
          <option value="living">กล้อง #1 - ห้องนั่งเล่น (Living Room)</option>
          <option value="nursery">กล้อง #2 - ห้องนอนน้อง (Nursery)</option>
        </select>
      </div>
    </div>

    <!-- Video Viewport Simulator -->
    <div class="video-container">
      <img 
        :src="selectedCam === 'living' ? 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=600&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80'" 
        alt="Live Nanny Feed" 
        class="video-feed"
      />
      <div class="video-overlay-grid"></div>

      <!-- Top Overlay Stats -->
      <div class="video-top-overlay">
        <span class="quality-tag">1080P HD • 30 FPS</span>
        <span class="timestamp-tag">{{ currentTime }}</span>
      </div>

      <!-- Snapshot Flash Effect -->
      <div v-if="showFlash" class="snapshot-flash"></div>
    </div>

    <!-- Camera Control Bar -->
    <div class="cam-controls">
      <button 
        class="ctrl-btn" 
        :class="{ active: isTalking }"
        @mousedown="startTalking"
        @mouseup="stopTalking"
        @touchstart.prevent="startTalking"
        @touchend.prevent="stopTalking"
      >
        <Mic :size="16" />
        <span>{{ isTalking ? 'กำลังพูด...' : t('camTalk') }}</span>
      </button>

      <button 
        class="ctrl-btn" 
        :class="{ muted: isMuted }"
        @click="toggleMute"
      >
        <component :is="isMuted ? VolumeX : Volume2" :size="16" />
        <span>{{ isMuted ? 'เปิดเสียง' : t('camMute') }}</span>
      </button>

      <button class="ctrl-btn" @click="takeSnapshot">
        <Camera :size="16" />
        <span>{{ t('camSnap') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { store } from '../stores/useAppStore.js';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  Camera 
} from 'lucide-vue-next';

const { t, showToast } = store;

const selectedCam = ref('living');
const isMuted = ref(false);
const isTalking = ref(false);
const showFlash = ref(false);
const currentTime = ref('');

let timeInterval = null;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('th-TH');
};

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  showToast(isMuted.value ? '🔇 ปิดเสียงกล้องเรียบร้อย' : '🔊 เปิดรับฟังเสียงกล้องแล้ว', 'info');
};

const startTalking = () => {
  isTalking.value = true;
};

const stopTalking = () => {
  isTalking.value = false;
  showToast('🎙️ ส่งเสียงพูดผ่านลำโพงกล้องเรียบร้อยแล้ว', 'info');
};

const takeSnapshot = () => {
  showFlash.value = true;
  setTimeout(() => {
    showFlash.value = false;
  }, 250);
  showToast('📸 บันทึกภาพถ่ายจากกล้องลงในแกลเลอรีแล้ว!', 'success');
};
</script>

<style scoped>
.cam-card {
  background: #FFFFFF;
  border-radius: var(--radius-md);
  border: 1px solid var(--accent-child);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.cam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #FEF3C7;
  border-bottom: 1px solid #FDE68A;
}

.cam-live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-blink {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #DC2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.4);
  animation: blinkRed 1.2s infinite;
}

@keyframes blinkRed {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.live-tag {
  font-size: 0.72rem;
  font-weight: 800;
  color: #B91C1C;
  letter-spacing: 0.04em;
}

.cam-dropdown {
  background: #FFFFFF;
  border: 1px solid #FCD34D;
  border-radius: var(--radius-full);
  padding: 3px 8px;
  font-size: 0.7rem;
  color: #92400E;
  font-weight: 600;
  outline: none;
}

.video-container {
  position: relative;
  width: 100%;
  height: 180px;
  background: #000000;
  overflow: hidden;
}

.video-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-top-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quality-tag {
  background: rgba(0, 0, 0, 0.65);
  color: #10B981;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.timestamp-tag {
  background: rgba(0, 0, 0, 0.65);
  color: #FFFFFF;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
}

.snapshot-flash {
  position: absolute;
  inset: 0;
  background: #FFFFFF;
  animation: flashAnim 0.25s ease-out;
}

@keyframes flashAnim {
  0% { opacity: 0.9; }
  100% { opacity: 0; }
}

.cam-controls {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  background: #FFFBEB;
}

.ctrl-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: var(--radius-sm);
  background: #FFFFFF;
  border: 1px solid #FCD34D;
  font-size: 0.72rem;
  font-weight: 600;
  color: #92400E;
  cursor: pointer;
  transition: var(--transition-fast);
}

.ctrl-btn:hover {
  background: #FEF3C7;
}

.ctrl-btn.active {
  background: #F59E0B;
  color: #FFFFFF;
  border-color: #D97706;
}

.ctrl-btn.muted {
  color: #DC2626;
  border-color: #FCA5A5;
  background: #FEF2F2;
}
</style>
