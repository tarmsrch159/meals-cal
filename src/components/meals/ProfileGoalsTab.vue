<template>
  <div class="tab-view-container">
    <!-- Header Banner -->
    <div class="tab-hero-banner">
      <div class="banner-top">
        <div>
          <span class="hero-badge">Profile & Settings</span>
          <h2 class="hero-title">เป้าหมาย & จัดการเมนูโปรด</h2>
          <p class="hero-sub">ปรับแต่งเป้าหมายโภชนาการและจัดการคลังอาหารที่คุณชื่นชอบ</p>
        </div>
      </div>
    </div>

    <!-- 1. User Profile & Target Calories Card -->
    <div class="profile-card">
      <div class="card-head-row">
        <div>
          <h3 class="card-title">เป้าหมายโภชนาการของคุณ</h3>
          <span class="card-sub">{{ state.userProfile.name || 'Champion' }} • {{ state.userProfile.goal === 'cut' ? 'ลดไขมัน (-400 kcal)' : (state.userProfile.goal === 'bulk' ? 'เพิ่มกล้ามเนื้อ (+300 kcal)' : 'รักษาน้ำหนัก') }}</span>
        </div>
        <button 
          type="button" 
          class="btn-edit-target" 
          @click="calorieStore.openBmrCalcModal"
        >
          แก้ไขเป้าหมาย
        </button>
      </div>

      <!-- Macro Goals Grid -->
      <div class="macro-targets-grid">
        <div class="target-box cal font-num">
          <span class="t-label">แคลอรี่</span>
          <div class="t-val font-num">
            <span class="t-num font-num">{{ state.userProfile.calorieTarget }}</span>
            <span class="t-unit">kcal</span>
          </div>
        </div>

        <div class="target-box carb font-num">
          <span class="t-label">คาร์บ</span>
          <div class="t-val font-num">
            <span class="t-num font-num">{{ state.userProfile.carbsTarget }}</span>
            <span class="t-unit">g</span>
          </div>
        </div>

        <div class="target-box pro font-num">
          <span class="t-label">โปรตีน</span>
          <div class="t-val font-num">
            <span class="t-num font-num">{{ state.userProfile.proteinTarget }}</span>
            <span class="t-unit">g</span>
          </div>
        </div>

        <div class="target-box fat font-num">
          <span class="t-label">ไขมัน</span>
          <div class="t-val font-num">
            <span class="t-num font-num">{{ state.userProfile.fatTarget }}</span>
            <span class="t-unit">g</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Favorites Food Library Manager -->
    <div class="favorites-section-card">
      <div class="card-head-row">
        <div>
          <h3 class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#D97706" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>เมนูโปรดของฉัน ({{ state.favorites.length }})</span>
          </h3>
          <span class="card-sub">บันทึกอาหารที่ทานบ่อยเพื่อกดเพิ่มได้ทันที</span>
        </div>
      </div>

      <div class="fav-list-stack" v-if="state.favorites.length > 0">
        <div 
          v-for="item in state.favorites" 
          :key="item.id" 
          class="fav-manage-row"
        >
          <div class="fav-info-col">
            <div class="fav-title-line">
              <span class="fav-name">{{ item.name }}</span>
              <span class="fav-kcal font-num">{{ item.calories }} kcal</span>
            </div>
            <div class="fav-sub-info font-num">
              <span>{{ item.servingSize }}</span>
              <span>• P: {{ item.protein }}g | C: {{ item.carbs }}g | F: {{ item.fat }}g</span>
            </div>
          </div>

          <div class="fav-btns-row">
            <button 
              type="button" 
              class="btn-fav-add-quick" 
              @click="calorieStore.addMealItem('breakfast', item, 1)"
              title="เพิ่มลงมื้อเช้าทันที"
            >
              + เช้า
            </button>
            <button 
              type="button" 
              class="btn-fav-add-quick" 
              @click="calorieStore.addMealItem('lunch', item, 1)"
              title="เพิ่มลงมื้อกลางวันทันที"
            >
              + เที่ยง
            </button>
            <button 
              type="button" 
              class="btn-fav-remove" 
              @click="calorieStore.toggleFavorite(item)"
              title="ลบออกจากเมนูโปรด"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="empty-fav-box" v-else>
        <p>ยังไม่มีรายการในเมนูโปรด คุณสามารถกดไอคอนดาวในการ์ดมื้ออาหารเพื่อบันทึกได้ตลอดเวลา</p>
      </div>
    </div>

    <!-- 3. AI & System Settings Card -->
    <div class="settings-action-card">
      <div class="card-head-row">
        <div>
          <h3 class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>ตั้งค่า & Gemini AI Key</span>
          </h3>
          <span class="card-sub">จัดการ API Key และการเชื่อมต่อ AI วิเคราะห์ภาพ</span>
        </div>
        <button 
          type="button" 
          class="btn-open-settings" 
          @click="calorieStore.openSettingsModal"
        >
          ตั้งค่า
        </button>
      </div>

      <div class="key-status-indicator">
        <span class="status-dot online"></span>
        <span class="status-text">Google Gemini AI พร้อมใช้งาน</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { calorieStore, state } from '../../stores/useCalorieStore.js';
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

/* Profile Card */
.profile-card, .favorites-section-card, .settings-action-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle, #E8ECE9);
  border-radius: var(--radius-xl, 24px);
  padding: 1.2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.card-head-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
}

.card-sub {
  font-size: 0.75rem;
  color: #64748B;
  margin-top: 2px;
  display: block;
}

.btn-edit-target, .btn-open-settings {
  background: var(--primary-light, #EBF3F0);
  color: var(--primary-forest, #154238);
  border: none;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.btn-edit-target:hover, .btn-open-settings:hover {
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
}

/* Macro Targets Grid */
.macro-targets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
}

.target-box {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 0.65rem 0.4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.target-box.cal {
  border-color: #CBD5E1;
  background: #FFFFFF;
}

.t-label {
  font-size: 0.65rem;
  color: #64748B;
  font-weight: 600;
}

.t-val {
  margin-top: 2px;
}

.t-num {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0F172A;
}

.t-unit {
  font-size: 0.62rem;
  color: #64748B;
  margin-left: 2px;
}

/* Favorites List Stack */
.fav-list-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fav-manage-row {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 0.75rem 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.fav-info-col {
  flex: 1;
}

.fav-title-line {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.fav-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0F172A;
}

.fav-kcal {
  font-size: 0.82rem;
  font-weight: 800;
  color: #7E22CE;
}

.fav-sub-info {
  font-size: 0.7rem;
  color: #64748B;
  margin-top: 1px;
}

.fav-btns-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-fav-add-quick {
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
  border: none;
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-fav-add-quick:hover {
  background: var(--primary-dark, #0D281E);
}

.btn-fav-remove {
  background: #FEE2E2;
  color: #EF4444;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-fav-box {
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 14px;
  padding: 1.2rem;
  text-align: center;
  font-size: 0.8rem;
  color: #64748B;
}

/* Key Status Indicator */
.key-status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  font-size: 0.78rem;
  color: #166534;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22C55E;
}
</style>
