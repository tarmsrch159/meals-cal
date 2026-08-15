<template>
  <nav class="bottom-nav">
    <button 
      class="nav-item" 
      :class="{ active: state.bottomNavTab === 'home' }"
      @click="navigate('home')"
    >
      <div class="icon-wrap">
        <Home :size="20" />
      </div>
      <span class="nav-label">{{ state.role === 'customer' ? 'บริการ' : 'หน้างาน' }}</span>
    </button>

    <button 
      class="nav-item" 
      :class="{ active: state.bottomNavTab === 'care' }"
      @click="navigate('care')"
    >
      <div class="icon-wrap">
        <ClipboardList :size="20" />
        <span v-if="pendingTasksCount > 0" class="badge-dot">{{ pendingTasksCount }}</span>
      </div>
      <span class="nav-label">รายการดูแล</span>
    </button>

    <button 
      class="nav-item" 
      :class="{ active: state.bottomNavTab === 'map' }"
      @click="navigate('map')"
    >
      <div class="icon-wrap">
        <MapPin :size="20" />
      </div>
      <span class="nav-label">พิกัด GPS</span>
    </button>

    <button 
      class="nav-item" 
      :class="{ active: state.bottomNavTab === 'chat' }"
      @click="navigate('chat')"
    >
      <div class="icon-wrap">
        <MessageSquare :size="20" />
        <span class="badge-dot">3</span>
      </div>
      <span class="nav-label">แชทสด</span>
    </button>

    <button 
      class="nav-item" 
      :class="{ active: state.bottomNavTab === 'profile' }"
      @click="navigate('profile')"
    >
      <div class="icon-wrap">
        <UserCircle :size="20" />
      </div>
      <span class="nav-label">สลับโหมด</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { store } from '../stores/useAppStore.js';
import { 
  Home, 
  ClipboardList, 
  MapPin, 
  MessageSquare, 
  UserCircle 
} from 'lucide-vue-next';

const { state, showToast } = store;

const pendingTasksCount = computed(() => {
  return state.checklist.filter(c => !c.done).length;
});

const navigate = (tab) => {
  state.bottomNavTab = tab;
  if (state.role === 'customer') {
    if (tab === 'home') {
      state.customerView = 'services';
    } else if (tab === 'care') {
      state.customerView = 'dashboard';
      setTimeout(() => {
        const el = document.getElementById('checklist-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (tab === 'map') {
      state.customerView = 'dashboard';
      setTimeout(() => {
        const el = document.getElementById('map-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (tab === 'chat') {
      state.customerView = 'dashboard';
      setTimeout(() => {
        const el = document.getElementById('chat-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (tab === 'profile') {
      state.role = state.role === 'customer' ? 'provider' : 'customer';
      showToast(`สลับสู่โหมด: ${state.role === 'customer' ? 'ผู้ใช้บริการ (Customer)' : 'ผู้ดูแล (Provider)'}`, 'info');
    }
  } else {
    // Provider Mode
    if (tab === 'profile') {
      state.role = 'customer';
      showToast('สลับสู่โหมด: ผู้ใช้บริการ (Customer)', 'info');
    } else {
      setTimeout(() => {
        const el = document.getElementById(tab + '-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 62px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(0, 180, 216, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 4px;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
}

/* Inside simulated desktop frame mode */
.frame-mode .bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex !important;
}

/* Hide on wide desktop screens when NOT in frame mode */
@media (min-width: 900px) {
  .app-shell:not(.frame-mode) .bottom-nav {
    display: none;
  }
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px 0;
  transition: var(--transition-fast);
  position: relative;
  min-height: 48px;
}

.icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-dot {
  position: absolute;
  top: -4px;
  right: -8px;
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
  border: 1.5px solid #FFFFFF;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 600;
  transition: var(--transition-fast);
}

.nav-item.active {
  color: var(--primary-600);
}

.nav-item.active .icon-wrap {
  transform: translateY(-2px);
}

.nav-item.active .nav-label {
  font-weight: 700;
}
</style>
