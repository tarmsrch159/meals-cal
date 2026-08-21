<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="selectOption('dashboard')">
    <div class="modal-card feature-select-modal animate-pop">
      <!-- Modal Header -->
      <div class="modal-header-section">
        <div class="brand-pill">
          <Sparkles :size="14" class="text-cyan animate-pulse" />
          <span>DOOLAE AI HEALTH INTELLIGENCE</span>
        </div>
        <h2 class="modal-title">เลือกบริการสุขภาพ AI</h2>
        <p class="modal-subtitle">
          ระบบวิเคราะห์สุขภาพอัจฉริยะ เลือกฟีเจอร์ที่คุณต้องการใช้งาน
        </p>

        <button class="btn-close" @click="selectOption('dashboard')" title="ปิดหน้าต่าง">
          <X :size="18" />
        </button>
      </div>

      <!-- Feature Options Grid -->
      <div class="features-grid">
        <!-- Option 1: AI Health Dashboard -->
        <div 
          class="feature-card feature-dashboard"
          @click="selectOption('dashboard')"
        >
          <div class="card-badge-top">
            <span class="badge-pill cyan-badge">ภาพรวม & กราฟแนวโน้ม</span>
          </div>

          <div class="feature-icon-wrap cyan-glow">
            <Activity :size="32" class="feature-icon" />
          </div>

          <div class="feature-content">
            <h3 class="feature-heading">แดชบอร์ดสุขภาพอัจฉริยะ</h3>
            <p class="feature-desc">
              ดูคะแนนสุขภาพรวม ติดตามดัชนี 11 หมวด (คอเลสเตอรอล, ความดัน, เบาหวาน, ตับ, ไต) พร้อมกราฟแนวโน้มและปรึกษาหมอ AI
            </p>

            <div class="feature-highlights">
              <span class="hl-tag">📊 ดัชนีแล็บ 11 หมวด</span>
              <span class="hl-tag">📈 กราฟเปรียบเทียบ</span>
              <span class="hl-tag">💬 ปรึกษาหมอ AI</span>
            </div>
          </div>

          <button class="btn-action-select btn-select-dash">
            <span>เข้าสู่หน้าแดชบอร์ด</span>
            <ArrowRight :size="16" />
          </button>
        </div>

        <!-- Option 2: AI Lab Report Scanner -->
        <div 
          class="feature-card feature-scanner"
          @click="selectOption('scanner')"
        >
          <div class="card-badge-top">
            <span class="badge-pill teal-badge">AI Multimodal Vision ⚡</span>
          </div>

          <div class="feature-icon-wrap teal-glow">
            <Camera :size="32" class="feature-icon" />
          </div>

          <div class="feature-content">
            <h3 class="feature-heading">สแกนใบรายงานผลตรวจ</h3>
            <p class="feature-desc">
              ถ่ายรูปหรืออัปโหลดใบตรวจสุขภาพประจำปี / ผลแล็บโรงพยาบาล ให้ AI วิเคราะห์และแปลงค่าลงแดชบอร์ดให้อัตโนมัติในไม่กี่วินาที
            </p>

            <div class="feature-highlights">
              <span class="hl-tag">📸 ถ่ายรูป / อัปโหลด</span>
              <span class="hl-tag">⚡ แปลงค่าอัตโนมัติ</span>
              <span class="hl-tag">🎯 บันทึกประวัติทันที</span>
            </div>
          </div>

          <button class="btn-action-select btn-select-scan">
            <span>เริ่มสแกนใบตรวจ</span>
            <ArrowRight :size="16" />
          </button>
        </div>
      </div>

      <!-- Footer Quick Note -->
      <div class="modal-footer-note">
        <p>💡 คุณสามารถสลับระหว่าง <strong>แดชบอร์ด</strong> และ <strong>สแกนใบตรวจ</strong> ได้ตลอดเวลาที่แถบเมนูด้านบน</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Sparkles, Activity, Camera, ArrowRight, X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['select', 'close']);

const selectOption = (tab) => {
  emit('select', tab);
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(224, 242, 254, 0.68);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
  padding: 16px;
}

.feature-select-modal {
  width: 100%;
  max-width: 720px;
  background: #FFFFFF;
  border-radius: var(--radius-2xl, 24px);
  box-shadow: 0 25px 60px rgba(0, 119, 182, 0.2), 0 8px 24px rgba(0, 0, 0, 0.06);
  border: 1.5px solid rgba(0, 180, 216, 0.25);
  padding: 28px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.animate-pop {
  animation: modalPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPopIn {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Header */
.modal-header-section {
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 180, 216, 0.1);
  color: var(--primary-700, #0077B6);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(0, 180, 216, 0.2);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-main, #0F172A);
  margin: 2px 0 0 0;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted, #64748B);
  margin: 0;
  max-width: 480px;
}

.btn-close {
  position: absolute;
  top: -8px;
  right: -4px;
  background: #F1F5F9;
  border: none;
  color: var(--text-muted, #64748B);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #E2E8F0;
  color: var(--text-main, #0F172A);
  transform: rotate(90deg);
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.feature-card {
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  border-radius: var(--radius-xl, 18px);
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-dashboard:hover {
  border-color: #00B4D8;
  box-shadow: 0 12px 28px rgba(0, 180, 216, 0.18);
  background: linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%);
}

.feature-scanner:hover {
  border-color: #0D9488;
  box-shadow: 0 12px 28px rgba(13, 148, 136, 0.18);
  background: linear-gradient(180deg, #FFFFFF 0%, #F0FDFA 100%);
}

.card-badge-top {
  position: absolute;
  top: 12px;
  right: 12px;
}

.badge-pill {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
}

.cyan-badge {
  background: #E0F2FE;
  color: #0369A1;
}

.teal-badge {
  background: #CCFBF1;
  color: #0F766E;
}

.feature-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon-wrap {
  transform: scale(1.1) rotate(3deg);
}

.cyan-glow {
  background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%);
  color: #0077B6;
  box-shadow: 0 6px 16px rgba(0, 180, 216, 0.2);
}

.teal-glow {
  background: linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%);
  color: #0D9488;
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.2);
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.feature-heading {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main, #0F172A);
  margin: 0;
}

.feature-desc {
  font-size: 0.8rem;
  color: var(--text-muted, #64748B);
  line-height: 1.45;
  margin: 0;
}

.feature-highlights {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 4px;
}

.hl-tag {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #475569;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

/* Action Buttons */
.btn-action-select {
  width: 100%;
  padding: 10px 16px;
  border-radius: var(--radius-full, 9999px);
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-select-dash {
  background: #F0F9FF;
  color: #0077B6;
  border: 1.5px solid #BAE6FD;
}

.feature-dashboard:hover .btn-select-dash {
  background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%);
  color: #FFFFFF;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(0, 180, 216, 0.3);
}

.btn-select-scan {
  background: #F0FDFA;
  color: #0F766E;
  border: 1.5px solid #99F6E4;
}

.feature-scanner:hover .btn-select-scan {
  background: linear-gradient(135deg, #0D9488 0%, #047857 100%);
  color: #FFFFFF;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

/* Footer note */
.modal-footer-note {
  text-align: center;
  padding-top: 4px;
  border-top: 1px solid #F1F5F9;
}

.modal-footer-note p {
  font-size: 0.75rem;
  color: var(--text-muted, #64748B);
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .feature-card {
    padding: 16px;
    gap: 10px;
  }

  .feature-icon-wrap {
    width: 52px;
    height: 52px;
  }

  .modal-title {
    font-size: 1.2rem;
  }
}
</style>
