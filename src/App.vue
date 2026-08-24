<template>
  <div class="app-root">
    <!-- Toast Notification Banner -->
    <transition name="toast-slide">
      <div 
        v-if="state.toast" 
        class="global-toast" 
        :class="state.toast.type"
      >
        <span class="toast-icon">
          <!-- Info Icon -->
          <svg v-if="state.toast.type === 'info'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <!-- Error Icon -->
          <svg v-else-if="state.toast.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <!-- Success / Energy Icon -->
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </span>
        <span class="toast-text">{{ state.toast.message }}</span>
      </div>
    </transition>

    <!-- Main Application View -->
    <main class="main-content-wrap">
      <CalorieDashboard />
    </main>
  </div>
</template>

<script setup>
import { state } from './stores/useCalorieStore.js';
import CalorieDashboard from './views/CalorieDashboard.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Thai:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Prompt:wght@300;400;500;600;700;800;900&display=swap');

/* Modern Energetic Sports Theme Design Tokens */
:root {
  --primary-forest: #154238;
  --primary-matcha: #1E3A2F;
  --primary-dark: #0D281E;
  --primary-light: #EBF3F0;
  --primary-subtle: #F0F6F3;
  
  --accent-neon: #D4FF32;
  --accent-neon-hover: #C5F325;
  --accent-neon-text: #0E251D;
  --accent-neon-glow: rgba(212, 255, 50, 0.4);
  
  --bg-app: #F9F9F6;
  --bg-subtle: #F3F4EE;
  --surface-card: #FFFFFF;
  --surface-card-subtle: #F8FAF8;
  --border-subtle: #E8ECE9;
  
  /* Macro Tags */
  --macro-carb: #3B82F6;
  --macro-carb-bg: #EFF6FF;
  --macro-protein: #8B5CF6;
  --macro-protein-bg: #F5F3FF;
  --macro-fat: #F59E0B;
  --macro-fat-bg: #FFFBEB;
  
  /* Typography Colors */
  --text-main: #0F1E17;
  --text-muted: #52665C;
  --text-light: #8E9E96;
  --text-white: #FFFFFF;
  
  /* Shadows */
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.04);
  --shadow-card-hover: 0 8px 30px rgba(21, 66, 56, 0.08);
  --shadow-neon: 0 4px 16px rgba(212, 255, 50, 0.35);
  
  /* Radii */
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-full: 9999px;
  
  /* Fonts - Unified Prompt + IBM Plex Sans Thai for mobile and desktop */
  --font-thai: 'Prompt', 'IBM Plex Sans Thai', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-num: 'Prompt', 'Plus Jakarta Sans', 'IBM Plex Sans Thai', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: var(--font-thai);
  -webkit-tap-highlight-color: transparent;
}

body {
  background-color: var(--bg-app);
  background-image: 
    radial-gradient(at 0% 0%, rgba(21, 66, 56, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(212, 255, 50, 0.06) 0px, transparent 50%);
  color: var(--text-main);
  font-family: var(--font-thai);
  min-height: 100vh;
  margin: 0;
  padding: 0;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  -webkit-text-size-adjust: 100%;
}

.app-root {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  font-family: var(--font-thai);
}

.main-content-wrap {
  width: 100%;
}

/* Number font utility */
.font-num {
  font-family: var(--font-num) !important;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.2px;
}

/* Global Toast */
.global-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-forest);
  color: #ffffff;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 10px 30px rgba(21, 66, 56, 0.35);
  border: 1px solid rgba(212, 255, 50, 0.3);
  z-index: 3000;
  pointer-events: none;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-toast.info {
  background: var(--primary-matcha);
  border-color: rgba(255, 255, 255, 0.2);
}

.global-toast.error {
  background: #991b1b;
  border-color: #fca5a5;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
