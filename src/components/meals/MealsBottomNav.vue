<template>
  <nav class="meals-bottom-nav">
    <div class="nav-container">
      <button 
        type="button" 
        class="nav-tab-btn" 
        :class="{ active: state.activeTab === 'diary' }"
        @click="calorieStore.setActiveTab('diary')"
      >
        <div class="nav-icon-wrap">
          <!-- Minimal Home/Diary SVG -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span class="nav-label">ไดอารี่</span>
      </button>

      <button 
        type="button" 
        class="nav-tab-btn" 
        :class="{ active: state.activeTab === 'coach' }"
        @click="calorieStore.setActiveTab('coach')"
      >
        <div class="nav-icon-wrap">
          <!-- Minimal Sparkle SVG -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
          <span class="badge-ai-dot"></span>
        </div>
        <span class="nav-label">AI โค้ช</span>
      </button>

      <button 
        type="button" 
        class="nav-tab-btn" 
        :class="{ active: state.activeTab === 'analytics' }"
        @click="calorieStore.setActiveTab('analytics')"
      >
        <div class="nav-icon-wrap">
          <!-- Minimal Chart SVG -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"/>
            <path d="M18 17V9"/>
            <path d="M13 17V5"/>
            <path d="M8 17v-3"/>
          </svg>
        </div>
        <span class="nav-label">สถิติ</span>
      </button>

      <button 
        type="button" 
        class="nav-tab-btn" 
        :class="{ active: state.activeTab === 'profile' }"
        @click="calorieStore.setActiveTab('profile')"
      >
        <div class="nav-icon-wrap">
          <!-- Minimal User & Target SVG -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="5"/>
            <path d="M20 21a8 8 0 0 0-16 0"/>
          </svg>
        </div>
        <span class="nav-label">เป้าหมาย</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { calorieStore, state } from '../../stores/useCalorieStore.js';
</script>

<style scoped>
.meals-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0.6rem 1rem 1rem;
  z-index: 900;
  pointer-events: none;
}

.nav-container {
  width: 100%;
  max-width: 480px;
  background: rgba(21, 66, 56, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 255, 50, 0.25);
  border-radius: 999px;
  box-shadow: 0 12px 36px rgba(21, 66, 56, 0.35);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 0.35rem;
  pointer-events: auto;
}

.nav-tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0.45rem 0.2rem;
  background: transparent;
  border: none;
  color: #A3C2B6;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.nav-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.badge-ai-dot {
  position: absolute;
  top: -2px;
  right: -4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-neon, #D4FF32);
  box-shadow: 0 0 8px var(--accent-neon, #D4FF32);
}

.nav-tab-btn.active {
  background: rgba(212, 255, 50, 0.15);
  color: var(--accent-neon, #D4FF32);
}

.nav-tab-btn.active .nav-icon-wrap {
  transform: translateY(-1px);
}

.nav-tab-btn:hover:not(.active) {
  color: #FFFFFF;
}
</style>
