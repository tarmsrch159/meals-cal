<template>
  <div v-if="state.bookingTarget" class="modal-overlay" @click="closeModal">
    <div class="modal-dialog booking-dialog" @click.stop>
      <button class="modal-close-btn" @click="closeModal">
        <X :size="18" />
      </button>

      <!-- Target Header -->
      <div class="target-profile">
        <img :src="target.avatar" :alt="target.name" class="target-avatar" />
        <div class="target-info">
          <span class="category-tag" :class="'tag-' + target.category">
            {{ target.category === 'child' ? '👶 ดูแลเด็ก' : (target.category === 'transit' ? '🚗 รถรับส่ง' : '👵 ผู้สูงอายุ') }}
          </span>
          <h3 class="target-name">{{ target.name }}</h3>
          <p class="target-role">{{ target.role }}</p>
          <div class="target-rating">
            <Star :size="13" class="star-icon" fill="#F59E0B" />
            <span class="rating-num">{{ target.rating }}</span>
            <span class="reviews-count">({{ target.reviews }} รีวิว)</span>
          </div>
        </div>
      </div>

      <hr class="divider" />

      <!-- Duration Selection -->
      <div class="booking-section">
        <label class="section-label">
          <Clock :size="15" />
          <span>{{ t('serviceHours') }}</span>
        </label>
        
        <div class="hours-stepper">
          <button class="step-btn" :disabled="hours <= 1" @click="hours--">-</button>
          <span class="hours-display">{{ hours }} ชั่วโมง</span>
          <button class="step-btn" :disabled="hours >= 12" @click="hours++">+</button>
        </div>

        <div class="quick-chips">
          <button 
            v-for="h in [2, 4, 6, 8]" 
            :key="h"
            class="chip-btn"
            :class="{ active: hours === h }"
            @click="hours = h"
          >
            {{ h }} ชม.
          </button>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="summary-card">
        <div class="summary-row">
          <span>อัตราค่าบริการ ({{ hours }} ชม. x ฿{{ target.rate }})</span>
          <span>฿{{ basePrice.toLocaleString() }}</span>
        </div>
        <div class="summary-row">
          <span>ค่าประกันอุบัติเหตุและคุ้มครอง</span>
          <span class="free-text">ฟรี</span>
        </div>
        <hr class="summary-divider" />
        <div class="summary-row total-row">
          <span>{{ t('totalAmount') }}</span>
          <span class="total-price">฿{{ basePrice.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="payment-method-box">
        <div class="method-header">
          <QrCode :size="16" />
          <span>{{ t('paymentPromptPay') }}</span>
        </div>
        <div class="qr-mockup">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=DooLaeCareBooking" alt="PromptPay QR" class="qr-img" />
          <span class="qr-hint">สแกนชำระเงินผ่านแอปธนาคารทุกแห่ง</span>
        </div>
      </div>

      <!-- Submit Action -->
      <button class="btn btn-primary btn-submit" @click="handleConfirm">
        <ShieldCheck :size="18" />
        <span>{{ t('confirmBookingPay') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { store } from '../stores/useAppStore.js';
import { 
  X, 
  Star, 
  Clock, 
  QrCode, 
  ShieldCheck 
} from 'lucide-vue-next';

const { state, t, bookService } = store;
const hours = ref(4);

const target = computed(() => state.bookingTarget || {});

const basePrice = computed(() => {
  return (target.value.rate || 200) * hours.value;
});

const closeModal = () => {
  state.bookingTarget = null;
};

const handleConfirm = () => {
  bookService(target.value, hours.value);
};
</script>

<style scoped>
.booking-dialog {
  max-width: 400px;
}

.target-profile {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.target-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-400);
  box-shadow: 0 4px 10px rgba(0, 180, 216, 0.15);
}

.target-info {
  display: flex;
  flex-direction: column;
}

.category-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  width: fit-content;
  margin-bottom: 2px;
}

.tag-senior {
  background: #E0F2FE;
  color: #0369A1;
}

.tag-child {
  background: #FEF3C7;
  color: #B45309;
}

.tag-transit {
  background: #CCFBF1;
  color: #0F766E;
}

.target-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary-900);
}

.target-role {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.target-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.star-icon {
  color: #F59E0B;
}

.rating-num {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-main);
}

.reviews-count {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.divider {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 12px 0;
}

.booking-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.section-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary-800);
  display: flex;
  align-items: center;
  gap: 6px;
}

.hours-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F8FAFC;
  border: 1.5px solid var(--primary-200);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
}

.step-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 1px solid var(--primary-300);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-700);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.step-btn:hover:not(:disabled) {
  background: var(--primary-500);
  color: #FFFFFF;
}

.step-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hours-display {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-900);
}

.quick-chips {
  display: flex;
  gap: 6px;
}

.chip-btn {
  flex: 1;
  padding: 6px 0;
  background: #FFFFFF;
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition-fast);
}

.chip-btn.active {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: #FFFFFF;
}

.summary-card {
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: var(--radius-sm);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--text-main);
}

.free-text {
  color: #059669;
  font-weight: 700;
}

.summary-divider {
  border: none;
  border-top: 1px dashed #BAE6FD;
  margin: 4px 0;
}

.total-row {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary-900);
}

.total-price {
  color: var(--primary-700);
  font-size: 1.1rem;
}

.payment-method-box {
  background: #FAF5FF;
  border: 1px solid #E9D5FF;
  border-radius: var(--radius-sm);
  padding: 10px;
  margin-bottom: 16px;
  text-align: center;
}

.method-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #7E22CE;
  margin-bottom: 8px;
}

.qr-mockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.qr-img {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  border: 1px solid #D8B4FE;
  background: #FFF;
  padding: 4px;
}

.qr-hint {
  font-size: 0.65rem;
  color: #6B21A8;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  font-size: 0.95rem;
}
</style>
