<template>
  <div class="ai-health-scanner">
    <!-- Header -->
    <div class="scanner-header-bar">
      <div class="scanner-title-badge">
        <Camera :size="18" class="text-cyan" />
        <span>AI สแกนใบรายงานผลตรวจ</span>
      </div>
    </div>

    <!-- Viewfinder Area -->
    <div class="viewfinder-container">
      <div class="viewfinder-box">
        <!-- Live Video Element -->
        <video 
          ref="videoEl" 
          autoplay 
          playsinline 
          class="camera-video-feed" 
          :class="{ 'video-hidden': !cameraActive || cameraError }"
        ></video>
        
        <!-- Snapshot Canvas (Hidden) -->
        <canvas ref="canvasEl" style="display: none;"></canvas>

        <!-- Preview Image if captured/uploaded -->
        <img 
          v-if="previewUrl" 
          :src="previewUrl" 
          alt="Scanned Preview" 
          class="preview-image" 
        />

        <!-- Scanner Guidelines & HUD Animation -->
        <div v-if="!previewUrl" class="scan-hud-frame">
          <div class="hud-corner top-left"></div>
          <div class="hud-corner top-right"></div>
          <div class="hud-corner bottom-left"></div>
          <div class="hud-corner bottom-right"></div>
          <div class="scan-laser-line"></div>
        </div>

        <!-- Camera Fallback Alert -->
        <div v-if="cameraError && !previewUrl" class="camera-fallback-msg">
          <AlertCircle :size="32" class="text-amber" />
          <p class="fallback-text">
            ไม่สามารถเปิดกล้องได้โดยตรง<br>
            กรุณาใช้ปุ่ม <strong>"อัปโหลดเอกสาร / ถ่ายรูป"</strong> ด้านล่าง
          </p>
        </div>
      </div>

      <!-- Controls & Status -->
      <div class="scanner-controls-area">
        <p class="guide-caption">
          {{ previewUrl ? 'ตรวจทานรูปภาพก่อนส่งให้ AI วิเคราะห์' : 'วางใบรายงานผลตรวจสุขภาพให้อยู่ในกรอบ และมีแสงสว่างเพียงพอ' }}
        </p>

        <!-- Hidden Native File Inputs -->
        <input 
          type="file" 
          ref="fileInputCamera" 
          accept="image/*,application/pdf" 
          capture="environment" 
          style="display: none;" 
          @change="onFileSelected"
        />
        <input 
          type="file" 
          ref="fileInputUpload" 
          accept="image/*,application/pdf" 
          style="display: none;" 
          @change="onFileSelected"
        />

        <!-- Actions -->
        <div v-if="!previewUrl" class="action-btn-stack">
          <button 
            class="btn btn-primary btn-lg btn-scan-trigger" 
            @click="triggerCapture"
            :disabled="isAnalyzing"
          >
            <Camera :size="20" />
            <span>ถ่ายรูป & ให้ AI วิเคราะห์</span>
          </button>

          <button 
            class="btn btn-secondary btn-lg btn-upload-trigger" 
            @click="triggerUpload"
            :disabled="isAnalyzing"
          >
            <UploadCloud :size="18" />
            <span>📁 อัปโหลดรูปภาพ หรือ PDF</span>
          </button>
        </div>

        <div v-else class="action-btn-stack">
          <button 
            class="btn btn-primary btn-lg btn-scan-trigger" 
            @click="submitForAnalysis"
            :disabled="isAnalyzing"
          >
            <Sparkles :size="20" />
            <span>ยืนยันและเริ่มวิเคราะห์ AI</span>
          </button>

          <button 
            class="btn btn-secondary btn-lg" 
            @click="retakePhoto"
            :disabled="isAnalyzing"
          >
            <RefreshCw :size="16" />
            <span>ถ่าย / เลือกใหม่</span>
          </button>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isAnalyzing" class="ai-loading-overlay">
        <div class="ai-loading-card">
          <div class="ai-spinner"></div>
          <h3 class="ai-loading-title">กำลังส่งข้อมูลให้ AI วิเคราะห์...</h3>
          <p class="ai-loading-desc">
            AI กำลังสกัดดัชนีสุขภาพ 11 รายการและสรุปคำแนะนำจากแพทย์<br>
            โปรดรอสักครู่ (ประมาณ 5-10 วินาที)
          </p>
          <div class="analysis-steps">
            <span class="step-pill">1. อ่านตัวอักษร OCR</span>
            <span class="step-pill">2. สกัดค่าแล็บ & ค่าปกติ</span>
            <span class="step-pill">3. ประเมินความเสี่ยง</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { store } from '../../stores/useAppStore.js';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-vue-next';

const emit = defineEmits(['close', 'completed']);
const { analyzeHealthReport, showToast } = store;

const videoEl = ref(null);
const canvasEl = ref(null);
const fileInputCamera = ref(null);
const fileInputUpload = ref(null);

const cameraActive = ref(false);
const cameraError = ref(false);
const previewUrl = ref(null);
const selectedFile = ref(null);
const isAnalyzing = ref(false);

let mediaStream = null;

const startCamera = async () => {
  try {
    cameraError.value = false;
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false
    });
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream;
      cameraActive.value = true;
    }
  } catch (err) {
    console.warn('Camera stream error:', err);
    cameraError.value = true;
    cameraActive.value = false;
  }
};

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  cameraActive.value = false;
};

const triggerCapture = () => {
  if (cameraError.value || !cameraActive.value) {
    if (fileInputCamera.value) {
      fileInputCamera.value.click();
    }
    return;
  }

  // Capture frame from video feed
  if (videoEl.value && canvasEl.value) {
    const video = videoEl.value;
    const canvas = canvasEl.value;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `health_report_${Date.now()}.jpg`, { type: 'image/jpeg' });
        selectedFile.value = file;
        previewUrl.value = URL.createObjectURL(blob);
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  }
};

const triggerUpload = () => {
  if (fileInputUpload.value) {
    fileInputUpload.value.click();
  }
};

const onFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  selectedFile.value = file;
  if (file.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file);
  } else {
    // PDF icon or indicator preview
    previewUrl.value = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80';
  }
  stopCamera();
};

const retakePhoto = () => {
  previewUrl.value = null;
  selectedFile.value = null;
  if (fileInputCamera.value) fileInputCamera.value.value = '';
  if (fileInputUpload.value) fileInputUpload.value.value = '';
  startCamera();
};

const submitForAnalysis = async () => {
  if (!selectedFile.value) {
    showToast('กรุณาเลือกหรือถ่ายภาพใบตรวจก่อนครับ', 'warning');
    return;
  }

  isAnalyzing.value = true;
  try {
    await analyzeHealthReport(selectedFile.value);
    showToast('🎉 AI วิเคราะห์ผลตรวจเรียบร้อยแล้ว!', 'success');
    emit('completed');
  } catch (err) {
    console.error('Scan error:', err);
    showToast('เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง', 'warning');
  } finally {
    isAnalyzing.value = false;
  }
};

const goBack = () => {
  stopCamera();
  emit('close');
};

onMounted(() => {
  startCamera();
});

onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
.ai-health-scanner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  position: relative;
}

.scanner-header-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
}

.scanner-title-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  background: rgba(0, 180, 216, 0.08);
  padding: 6px 16px;
  border-radius: var(--radius-full);
}

.viewfinder-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.viewfinder-box {
  width: 100%;
  aspect-ratio: 4 / 3;
  max-height: 420px;
  background: #0F172A;
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-video-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-hidden {
  display: none;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

/* Scanner HUD Frame */
.scan-hud-frame {
  position: absolute;
  top: 18px;
  left: 18px;
  right: 18px;
  bottom: 18px;
  pointer-events: none;
}

.hud-corner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-color: #00B4D8;
  border-style: solid;
}

.hud-corner.top-left {
  top: 0;
  left: 0;
  border-width: 4px 0 0 4px;
  border-top-left-radius: 12px;
}

.hud-corner.top-right {
  top: 0;
  right: 0;
  border-width: 4px 4px 0 0;
  border-top-right-radius: 12px;
}

.hud-corner.bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 4px 4px;
  border-bottom-left-radius: 12px;
}

.hud-corner.bottom-right {
  bottom: 0;
  right: 0;
  border-width: 0 4px 4px 0;
  border-bottom-right-radius: 12px;
}

.scan-laser-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #22D3EE 50%, transparent 100%);
  box-shadow: 0 0 12px #22D3EE;
  animation: scanMove 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes scanMove {
  0% { top: 5%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 92%; opacity: 0; }
}

.camera-fallback-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  color: #FFFFFF;
  gap: 12px;
}

.fallback-text {
  font-size: 0.85rem;
  color: #CBD5E1;
  line-height: 1.5;
}

/* Scanner Controls Area */
.scanner-controls-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.guide-caption {
  font-size: 0.82rem;
  color: var(--text-muted);
  text-align: center;
  max-width: 90%;
  margin: 0;
}

.action-btn-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 420px;
}

.btn-scan-trigger {
  box-shadow: 0 6px 20px rgba(0, 180, 216, 0.4);
}

.btn-upload-trigger {
  border: 1.5px solid var(--border-light);
  background: var(--surface-white);
  color: var(--text-main);
}

.btn-upload-trigger:hover {
  background: var(--surface-subtle);
}

/* AI Loading Overlay */
.ai-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.ai-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  max-width: 380px;
}

.ai-spinner {
  width: 52px;
  height: 52px;
  border: 4px solid rgba(255, 255, 255, 0.15);
  border-top: 4px solid #00B4D8;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-loading-title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.ai-loading-desc {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
}

.analysis-steps {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px;
}

.step-pill {
  background: rgba(255, 255, 255, 0.1);
  color: #67E8F9;
  font-size: 0.68rem;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(103, 232, 249, 0.3);
}

.text-cyan { color: var(--primary-500); }
.text-amber { color: #F59E0B; }
</style>
