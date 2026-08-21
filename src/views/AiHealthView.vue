<template>
  <div class="ai-health-view">
    <!-- Entry / Welcome Feature Selector Modal Popup -->
    <AiHealthFeatureModal 
      :is-open="showFeatureModal" 
      @select="handleFeatureSelect" 
      @close="showFeatureModal = false" 
    />

    <!-- View Switcher Tabs (Dashboard vs Scanner) -->
    <div class="health-view-nav-bar">
      <button class="btn-back-link" @click="handleBack">
        <ArrowLeft :size="16" />
        <span>{{ backButtonLabel }}</span>
      </button>

      <div class="health-view-tabs">
        <button 
          class="h-tab-btn" 
          :class="{ active: currentTab === 'dashboard' }"
          @click="currentTab = 'dashboard'"
        >
          <Activity :size="15" />
          <span>แดชบอร์ดสุขภาพ</span>
        </button>

        <button 
          class="h-tab-btn" 
          :class="{ active: currentTab === 'scanner' }"
          @click="currentTab = 'scanner'"
        >
          <Camera :size="15" />
          <span>สแกนใบตรวจ</span>
        </button>
      </div>

      <div class="nav-bar-spacer"></div>
    </div>

    <!-- Active Sub-View -->
    <div class="health-view-body">
      <AiHealthDashboard 
        v-if="currentTab === 'dashboard'" 
        @open-scanner="currentTab = 'scanner'"
        @open-chat="state.showAiHealthChatModal = true"
      />

      <AiHealthScanner 
        v-else 
        @close="currentTab = 'dashboard'"
        @completed="onScanCompleted"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { store } from '../stores/useAppStore.js';
import { ArrowLeft, Activity, Camera } from 'lucide-vue-next';
import AiHealthDashboard from '../components/health/AiHealthDashboard.vue';
import AiHealthScanner from '../components/health/AiHealthScanner.vue';
import AiHealthFeatureModal from '../components/health/AiHealthFeatureModal.vue';

const { state } = store;
const currentTab = ref('dashboard');
const showFeatureModal = ref(true);

const handleFeatureSelect = (tab) => {
  currentTab.value = tab;
  showFeatureModal.value = false;
};

onMounted(() => {
  showFeatureModal.value = true;
});

const backButtonLabel = computed(() => {
  if (currentTab.value === 'scanner') {
    return 'กลับไปแดชบอร์ด';
  }
  return state.role === 'customer' ? 'บริการทั้งหมด' : 'หน้างานผู้ดูแล';
});

const handleBack = () => {
  if (currentTab.value === 'scanner') {
    currentTab.value = 'dashboard';
    return;
  }
  if (state.role === 'customer') {
    state.customerView = 'services';
    state.bottomNavTab = 'home';
  } else {
    state.bottomNavTab = 'home';
  }
};

const onScanCompleted = () => {
  currentTab.value = 'dashboard';
};
</script>

<style scoped>
.ai-health-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
}

.health-view-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 4px;
}

.btn-back-link {
  background: none;
  border: none;
  color: var(--primary-700);
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.btn-back-link:hover {
  background: rgba(0, 180, 216, 0.08);
}

.health-view-tabs {
  display: flex;
  background: rgba(0, 180, 216, 0.1);
  padding: 4px;
  border-radius: var(--radius-full);
  gap: 4px;
}

.h-tab-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.h-tab-btn.active {
  background: #FFFFFF;
  color: var(--primary-700);
  box-shadow: var(--shadow-xs);
}

.nav-bar-spacer {
  width: 110px;
}

@media (max-width: 640px) {
  .nav-bar-spacer {
    display: none;
  }
}

.health-view-body {
  width: 100%;
}
</style>
