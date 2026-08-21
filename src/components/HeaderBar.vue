<template>
  <header class="app-header">
    <!-- Brand Logo & Title -->
    <div class="brand-container" @click="handleBrandClick">
      <div class="logo-wrapper">
        <img src="/doolae_logo.png" alt="Doo-Lae Logo" class="brand-logo" />
        <div class="logo-glow"></div>
      </div>
      <div class="brand-info">
        <div class="brand-title-wrap">
          <span class="brand-name">{{ t('brandName') }}</span>
        </div>
        <span class="brand-subtitle">{{ t('brandTagline') }}</span>
      </div>
    </div>

    <!-- Desktop Center Navigation Menu (Visible on Desktop / Web App) -->
    <nav v-if="state.isLoggedIn" class="desktop-nav-menu">
      <button 
        class="desktop-nav-item" 
        :class="{ active: state.customerView === 'services' && state.bottomNavTab === 'home' }" 
        @click="navigate('home')"
      >
        <Home :size="16" />
        <span>{{ state.role === 'customer' ? 'บริการทั้งหมด' : 'หน้างาน' }}</span>
      </button>

      <button 
        class="desktop-nav-item" 
        :class="{ active: state.customerView === 'ai-health' || state.bottomNavTab === 'health' }" 
        @click="navigate('health')"
      >
        <Activity :size="16" class="text-cyan" />
        <span>สุขภาพ AI</span>
      </button>

      <button 
        class="desktop-nav-item" 
        :class="{ active: state.bottomNavTab === 'care' }" 
        @click="navigate('care')"
      >
        <ClipboardList :size="16" />
        <span>รายการดูแล</span>
        <span v-if="pendingTasksCount > 0" class="nav-count-badge">{{ pendingTasksCount }}</span>
      </button>

      <button 
        class="desktop-nav-item" 
        :class="{ active: state.bottomNavTab === 'map' }" 
        @click="navigate('map')"
      >
        <MapPin :size="16" />
        <span>พิกัด GPS</span>
      </button>

      <button 
        class="desktop-nav-item" 
        :class="{ active: state.bottomNavTab === 'chat' }" 
        @click="navigate('chat')"
      >
        <MessageSquare :size="16" />
        <span>แชทสด</span>
        <span class="nav-count-badge">3</span>
      </button>
    </nav>

    <!-- Header Right Actions (Role, SOS, Lang, Frame, Profile) -->
    <div class="header-actions">
      <!-- Desktop Quick SOS Action -->
      <button v-if="state.isLoggedIn" class="action-btn sos-top-btn" @click="state.showSosModal = true">
        <AlertTriangle :size="14" />
        <span>SOS 24ชม.</span>
      </button>

      <!-- Role Switcher -->
      <button 
        v-if="state.isLoggedIn" 
        class="action-btn role-toggle-btn"
        :class="state.role === 'provider' ? 'role-btn-provider' : 'role-btn-customer'" 
        @click="toggleRole"
        :title="'สลับโหมด: ' + (state.role === 'provider' ? 'ผู้ใช้บริการ' : 'ผู้ดูแล')"
      >
        <component :is="state.role === 'provider' ? Stethoscope : User" :size="14" />
        <span class="role-btn-text">{{ state.role === 'provider' ? 'ผู้ดูแล' : 'ผู้ใช้บริการ' }}</span>
      </button>

      <!-- Language Switch -->
      <button 
        class="action-btn lang-btn" 
        @click="toggleLang"
        :title="'สลับภาษา / Switch Language (' + state.lang + ')'"
      >
        <Globe :size="14" />
        <span>{{ state.lang }}</span>
      </button>

      <!-- Frame Mode Toggle (Desktop only) -->
      <button 
        class="action-btn frame-btn" 
        :class="{ 'frame-btn-active': state.isDesktopFrame }"
        @click="toggleFrameMode"
        :title="state.isDesktopFrame ? 'ขยายเป็น Web App เต็มหน้าจอ' : 'จำลองขนาดมือถือ'"
      >
        <component :is="state.isDesktopFrame ? Maximize2 : Smartphone" :size="14" />
        <span class="frame-btn-text">{{ state.isDesktopFrame ? 'ขยายจอ' : 'กรอบมือถือ' }}</span>
      </button>

      <!-- User Info & Logout -->
      <div v-if="state.isLoggedIn" class="user-profile-wrap">
        <div class="user-pill" :title="state.activeUser">
          <UserCheck :size="13" />
          <span class="user-email-text">{{ state.activeUser.split('@')[0] }}</span>
        </div>

        <button class="action-btn logout-btn" @click="handleLogout" :title="t('logout')">
          <LogOut :size="14" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { store } from '../stores/useAppStore.js';
import {
  Globe,
  LogOut,
  User,
  Stethoscope,
  Smartphone,
  Maximize2,
  Home,
  Activity,
  ClipboardList,
  MapPin,
  MessageSquare,
  AlertTriangle,
  UserCheck
} from 'lucide-vue-next';

const { state, t, showToast } = store;

const pendingTasksCount = computed(() => {
  return state.checklist.filter(c => !c.done).length;
});

const toggleLang = () => {
  state.lang = state.lang === 'TH' ? 'EN' : 'TH';
  showToast(state.lang === 'TH' ? 'เปลี่ยนภาษาเป็น: ภาษาไทย' : 'Language switched to: English', 'info');
};

const toggleRole = () => {
  state.role = state.role === 'customer' ? 'provider' : 'customer';
  showToast(`สลับสู่โหมด: ${state.role === 'customer' ? 'ผู้ใช้บริการ (Customer)' : 'ผู้ดูแล (Provider)'}`, 'info');
};

const toggleFrameMode = () => {
  state.isDesktopFrame = !state.isDesktopFrame;
  showToast(state.isDesktopFrame ? '📱 สลับเป็น: โหมดกรอบมือถือ' : '💻 สลับเป็น: โหมด Web App เต็มหน้าจอ', 'info');
};

const navigate = (tab) => {
  state.bottomNavTab = tab;
  if (state.role === 'customer') {
    if (tab === 'home') {
      state.customerView = 'services';
    } else if (tab === 'health') {
      state.customerView = 'ai-health';
    } else {
      state.customerView = 'dashboard';
      setTimeout(() => {
        const el = document.getElementById(tab + '-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  } else {
    if (tab === 'health') {
      state.customerView = 'ai-health';
    }
  }
};

const handleBrandClick = () => {
  if (state.role === 'customer') {
    state.customerView = 'services';
    state.bottomNavTab = 'home';
  }
};

const handleLogout = () => {
  state.isLoggedIn = false;
  state.authStep = 1;
  showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
};
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 180, 216, 0.15);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 14px rgba(0, 180, 216, 0.05);
  min-height: 60px;
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-wrapper {
  position: relative;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}

.brand-logo {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 3px 10px rgba(0, 180, 216, 0.2);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  position: relative;
  z-index: 2;
}

.logo-glow {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: var(--grad-primary);
  filter: blur(5px);
  opacity: 0.4;
  z-index: 1;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-title-wrap {
  display: flex;
  align-items: center;
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 800;
  background: var(--grad-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  white-space: nowrap;
}

.brand-subtitle {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}

/* Desktop Navigation Menu */
.desktop-nav-menu {
  display: none;
  align-items: center;
  gap: 4px;
  background: #F1F5F9;
  border-radius: var(--radius-full);
  padding: 4px 6px;
}

@media (min-width: 900px) {
  .desktop-nav-menu {
    display: flex;
  }
}

.desktop-nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: none;
  background: none;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
}

.desktop-nav-item:hover {
  background: rgba(255, 255, 255, 0.8);
  color: var(--primary-800);
}

.desktop-nav-item.active {
  background: #FFFFFF;
  color: var(--primary-700);
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.nav-count-badge {
  background: #EF4444;
  color: #FFFFFF;
  font-size: 0.62rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  border: none;
  border-radius: var(--radius-full);
  padding: 6px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
}

.sos-top-btn {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: #FFFFFF;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
  display: none;
}

@media (min-width: 640px) {
  .sos-top-btn {
    display: inline-flex;
  }
}

.role-btn-customer {
  background: var(--primary-100);
  color: var(--primary-800);
  border: 1px solid var(--primary-300);
}

.role-btn-provider {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.lang-btn {
  background: var(--primary-50);
  color: var(--primary-800);
  border: 1px solid var(--primary-200);
}

.frame-btn {
  background: #F1F5F9;
  color: #475569;
  border: 1px solid #E2E8F0;
  display: none;
}

@media (min-width: 768px) {
  .frame-btn {
    display: inline-flex;
  }
}

.frame-btn-active {
  background: #FEF3C7;
  color: #B45309;
  border-color: #FDE68A;
}

.user-profile-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-pill {
  display: none;
  align-items: center;
  gap: 4px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  color: var(--text-main);
  font-weight: 600;
}

@media (min-width: 1024px) {
  .user-pill {
    display: inline-flex;
  }
}

.logout-btn {
  background: #FFE4E6;
  color: #E11D48;
  border: 1px solid #FECDD3;
  padding: 6px 8px;
}

@media (max-width: 640px) {
  .app-header {
    padding: 8px 12px;
  }
  .brand-name {
    font-size: 1.05rem;
  }
  .brand-subtitle {
    font-size: 0.62rem;
  }
  .role-btn-text,
  .frame-btn-text {
    display: none;
  }
}
</style>
