<template>
  <div class="tab-view-container">
    <!-- Header Banner -->
    <div class="tab-hero-banner">
      <div class="banner-top">
        <div>
          <span class="hero-badge">AI Assistant</span>
          <h2 class="hero-title">ผู้ช่วยโภชนาการ & Fasting</h2>
          <p class="hero-sub">วางแผนมื้ออาหารและนับชั่วโมง IF ให้แม่นยำด้วย AI</p>
        </div>
      </div>
    </div>

    <!-- 1. AI Coach Card -->
    <AiCoachCard />

    <!-- 2. Intermittent Fasting (IF) Timer Card -->
    <FastingTimerCard />

    <!-- 3. Motivational Fitness & BMR Card -->
    <section class="fitness-action-banner">
      <div class="fitness-banner-content">
        <span class="banner-tag">BMR & TDEE</span>
        <h3 class="banner-quote">คำนวณพลังงานที่ร่างกายเผาผลาญจริงเพื่อปรับเป้าหมาย</h3>
        <button 
          type="button" 
          class="btn-fitness-cta" 
          @click="calorieStore.openBmrCalcModal"
        >
          <span>คำนวณ BMR & TDEE อัตโนมัติ</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { calorieStore } from '../../stores/useCalorieStore.js';
import AiCoachCard from './AiCoachCard.vue';
import FastingTimerCard from './FastingTimerCard.vue';
</script>

<style scoped>
.tab-view-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.tab-hero-banner {
  background: linear-gradient(135deg, #154238 0%, #1E3A2F 100%);
  border-radius: var(--radius-xl, 24px);
  padding: 1.4rem;
  color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(21, 66, 56, 0.15);
}

.hero-badge {
  display: inline-block;
  background: rgba(212, 255, 50, 0.15);
  border: 1px solid rgba(212, 255, 50, 0.3);
  color: var(--accent-neon, #D4FF32);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  margin-bottom: 0.35rem;
}

.hero-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}

.hero-sub {
  font-size: 0.78rem;
  color: #A3C2B6;
  margin: 2px 0 0;
}

/* Fitness Banner */
.fitness-action-banner {
  background: #FFFFFF;
  border-radius: var(--radius-xl, 24px);
  padding: 1.2rem;
  border: 1px solid var(--border-subtle, #E8ECE9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.banner-tag {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--primary-forest, #154238);
  background: var(--primary-light, #EBF3F0);
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 0.4rem;
}

.banner-quote {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 0.8rem;
  line-height: 1.35;
}

.btn-fitness-cta {
  width: 100%;
  padding: 0.7rem;
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-fitness-cta:hover {
  background: var(--primary-dark, #0D281E);
}
</style>
