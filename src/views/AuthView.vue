<template>
  <div class="auth-view-container">
    <!-- Step 1: Login / Sign Up Form -->
    <div v-if="state.authStep === 1" class="auth-card">
      <div class="auth-brand-header">
        <div class="logo-hero-wrap">
          <img src="/doolae_logo.png" alt="Doo-Lae" class="hero-logo" />
          <div class="hero-glow"></div>
        </div>
        <h1 class="auth-title">{{ t('welcomeTitle') }}</h1>
        <p class="auth-slogan">{{ t('brandSubtitle') }}</p>
      </div>

      <!-- Tab Switcher -->
      <div class="auth-tabs">
        <button 
          class="auth-tab" 
          :class="{ active: authMode === 'login' }"
          @click="authMode = 'login'"
        >
          {{ t('loginBtn') }}
        </button>
        <button 
          class="auth-tab" 
          :class="{ active: authMode === 'register' }"
          @click="authMode = 'register'"
        >
          {{ t('registerBtn') }}
        </button>
      </div>

      <!-- Form Inputs -->
      <form class="auth-form" @submit.prevent="handleProceed">
        <div class="form-group">
          <label class="form-label">
            <Mail :size="14" />
            <span>{{ t('emailPhone') }}</span>
          </label>
          <input 
            type="text" 
            v-model="emailInput" 
            class="form-input" 
            placeholder="เช่น saran.w@rmutsb.ac.th" 
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <Lock :size="14" />
            <span>{{ t('password') }}</span>
          </label>
          <input 
            type="password" 
            v-model="passwordInput" 
            class="form-input" 
            placeholder="••••••••" 
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-auth-submit">
          <span>{{ authMode === 'login' ? t('loginBtn') : t('registerBtn') }}</span>
          <ArrowRight :size="18" />
        </button>
      </form>

      <!-- Quick Demo Login Button -->
      <button class="btn btn-secondary btn-demo" @click="handleQuickDemo">
        <Sparkles :size="16" class="sparkle-icon" />
        <span>{{ t('guestDemo') }}</span>
      </button>

      <div class="divider-text">
        <span>หรือเข้าสู่ระบบด้วย</span>
      </div>

      <!-- Social Logins -->
      <div class="social-login-grid">
        <button class="social-btn" @click="handleSocialLogin('Google')">
          <svg class="social-svg" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
          </svg>
          <span>Google</span>
        </button>

        <button class="social-btn" @click="handleSocialLogin('Apple ID')">
          <svg class="social-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.35-.58.67-.99 1.74-.88 2.76 1 .08 2.03-.51 2.59-1.26z"/>
          </svg>
          <span>Apple ID</span>
        </button>
      </div>
    </div>

    <!-- Step 2: Role Selection -->
    <div v-else class="auth-card role-select-card">
      <div class="auth-brand-header">
        <h2 class="auth-title">{{ t('selectRoleTitle') }}</h2>
        <p class="auth-slogan">{{ t('selectRoleDesc') }}</p>
      </div>

      <div class="roles-grid">
        <!-- Customer Role -->
        <div 
          class="role-option-card customer-role" 
          @click="selectRole('customer')"
        >
          <div class="role-icon-box">
            <HeartHandshake :size="28" />
          </div>
          <div class="role-text-box">
            <h3 class="role-option-title">{{ t('roleCustomer') }}</h3>
            <p class="role-option-sub">{{ t('roleCustomerSub') }}</p>
            <div class="role-badges">
              <span class="badge badge-primary">👵 ดูแลผู้สูงอายุ</span>
              <span class="badge badge-warning">👶 ดูแลเด็ก</span>
              <span class="badge badge-success">🚗 รถรับส่ง</span>
            </div>
          </div>
          <ChevronRight :size="22" class="role-arrow" />
        </div>

        <!-- Provider Role -->
        <div 
          class="role-option-card provider-role" 
          @click="selectRole('provider')"
        >
          <div class="role-icon-box provider-icon">
            <Stethoscope :size="28" />
          </div>
          <div class="role-text-box">
            <h3 class="role-option-title">{{ t('roleProvider') }}</h3>
            <p class="role-option-sub">{{ t('roleProviderSub') }}</p>
            <div class="role-badges">
              <span class="badge badge-success">🟢 รับงานทันที</span>
              <span class="badge badge-primary">📈 บันทึกสุขภาพ</span>
              <span class="badge badge-warning">💰 รายได้รายวัน</span>
            </div>
          </div>
          <ChevronRight :size="22" class="role-arrow" />
        </div>
      </div>

      <button class="btn btn-secondary btn-back" @click="state.authStep = 1">
        <ArrowLeft :size="16" />
        <span>ย้อนกลับไปหน้าเข้าสู่ระบบ</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store } from '../stores/useAppStore.js';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  HeartHandshake, 
  Stethoscope, 
  ChevronRight 
} from 'lucide-vue-next';

const { state, t, showToast } = store;

const authMode = ref('login');
const emailInput = ref(state.activeUser || 'saran.w@rmutsb.ac.th');
const passwordInput = ref('123456');

const handleProceed = () => {
  state.activeUser = emailInput.value;
  state.authStep = 2;
};

const handleQuickDemo = () => {
  emailInput.value = 'saran.w@rmutsb.ac.th';
  state.activeUser = emailInput.value;
  state.authStep = 2;
  showToast('🎉 เข้าสู่ระบบ Demo เรียบร้อย! กรุณาเลือกบทบาท', 'info');
};

const handleSocialLogin = (provider) => {
  emailInput.value = `user_${provider.toLowerCase()}@doolae.com`;
  state.activeUser = emailInput.value;
  state.authStep = 2;
  showToast(`เข้าสู่ระบบด้วย ${provider} สำเร็จ`, 'success');
};

const selectRole = (role) => {
  state.role = role;
  state.isLoggedIn = true;
  state.customerView = 'services';
  state.bottomNavTab = 'home';
  showToast(`ยินดีต้อนรับคุณ ${state.activeUser}! เข้าสู่โหมด ${role === 'customer' ? 'ผู้ใช้บริการ' : 'ผู้ดูแล'}`, 'success');
};
</script>

<style scoped>
.auth-view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 10px 0;
}

.auth-card {
  width: 100%;
  max-width: 390px;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  box-shadow: 0 12px 36px rgba(0, 180, 216, 0.12);
}

.auth-brand-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo-hero-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
}

.hero-logo {
  width: 100%;
  height: 100%;
  border-radius: 22px;
  object-fit: cover;
  border: 3px solid #FFFFFF;
  box-shadow: 0 8px 24px rgba(0, 180, 216, 0.3);
  position: relative;
  z-index: 2;
}

.hero-glow {
  position: absolute;
  inset: -6px;
  border-radius: 26px;
  background: var(--grad-primary);
  filter: blur(12px);
  opacity: 0.5;
  z-index: 1;
}

.auth-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--primary-900);
}

.auth-slogan {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.auth-tabs {
  display: flex;
  background: #F1F5F9;
  border-radius: var(--radius-full);
  padding: 4px;
  margin-bottom: 16px;
}

.auth-tab {
  flex: 1;
  border: none;
  background: none;
  padding: 8px 0;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition-fast);
}

.auth-tab.active {
  background: #FFFFFF;
  color: var(--primary-800);
  box-shadow: var(--shadow-xs);
  font-weight: 700;
}

.btn-auth-submit {
  width: 100%;
  margin-top: 6px;
  padding: 13px;
}

.btn-demo {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  font-size: 0.85rem;
  background: #F0FDF4;
  border-color: #BBF7D0;
  color: #166534;
}

.btn-demo:hover {
  background: #DCFCE7;
}

.sparkle-icon {
  color: #16A34A;
}

.divider-text {
  position: relative;
  text-align: center;
  margin: 16px 0;
}

.divider-text::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #E2E8F0;
}

.divider-text span {
  position: relative;
  background: #FFFFFF;
  padding: 0 10px;
  font-size: 0.72rem;
  color: var(--text-light);
}

.social-login-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: var(--transition-fast);
}

.social-btn:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.social-svg {
  width: 18px;
  height: 18px;
}

/* Role Selector Step */
.roles-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}

.role-option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-light);
  background: #FFFFFF;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.role-option-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.customer-role {
  border-color: #BAE6FD;
  background: linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%);
}

.customer-role:hover {
  border-color: var(--primary-500);
}

.provider-role {
  border-color: #BBF7D0;
  background: linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%);
}

.provider-role:hover {
  border-color: #22C55E;
}

.role-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.provider-icon {
  background: #DCFCE7;
  color: #166534;
}

.role-text-box {
  flex: 1;
}

.role-option-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.role-option-sub {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 2px 0 6px;
}

.role-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-arrow {
  color: var(--text-light);
}

.btn-back {
  width: 100%;
  font-size: 0.8rem;
  padding: 8px;
}
</style>
