<template>
  <Transition name="toast-anim">
    <div v-if="state.toast.show" :class="['toast-container', `toast-${state.toast.type || 'success'}`]">
      <div class="toast-icon">
        <component :is="iconComponent" :size="18" />
      </div>
      <div class="toast-text">{{ state.toast.message }}</div>
      <button class="toast-close" @click="state.toast.show = false">
        <X :size="14" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { store } from '../stores/useAppStore.js';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';

const { state } = store;

const iconComponent = computed(() => {
  if (state.toast.type === 'error') return AlertCircle;
  if (state.toast.type === 'info') return Info;
  return CheckCircle2;
});
</script>

<style scoped>
.toast-container {
  position: absolute;
  top: 75px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: var(--radius-full);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 90%;
  min-width: 280px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.toast-success {
  background: rgba(16, 185, 129, 0.95);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.toast-info {
  background: rgba(0, 180, 216, 0.95);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.toast-error {
  background: rgba(239, 68, 68, 0.95);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-text {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
}

.toast-close:hover {
  color: #FFFFFF;
}

.toast-anim-enter-active,
.toast-anim-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-anim-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.9);
}

.toast-anim-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.9);
}
</style>
