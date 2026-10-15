<template>
  <div class="dashboard-shell">
    <!-- Top Forest Green Header -->
    <header class="hero-header">
      <div class="header-top-bar">
        <div>
          <h1 class="user-greeting">
            Hello, {{ state.userProfile.name || 'Champion' }}
          </h1>
          <p class="greeting-sub">บันทึกวันนี้ให้เป๊ะ แล้วไปให้สุด</p>
        </div>

        <div class="header-actions">
          <button 
            type="button" 
            class="btn-header-bubble" 
            @click="calorieStore.openAnalyticsModal"
            title="สถิติ & กราฟ 7 วัน"
          >
            <!-- Minimal Chart SVG -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
          </button>
          <button 
            type="button" 
            class="btn-header-bubble" 
            @click="calorieStore.copyDailySummaryToClipboard()"
            title="คัดลอกสรุปโภชนาการประจำวัน"
          >
            <!-- Minimal Share/Clipboard SVG -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button 
            type="button" 
            class="btn-header-bubble" 
            @click="calorieStore.openBmrCalcModal"
            title="คำนวณ BMR / TDEE"
          >
            <!-- Minimal Calculator SVG -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"></rect>
              <line x1="8" y1="6" x2="16" y2="6"></line>
              <line x1="16" y1="14" x2="16" y2="18"></line>
              <path d="M16 10h.01"></path>
              <path d="M12 10h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M8 14h.01"></path>
              <path d="M12 18h.01"></path>
              <path d="M8 18h.01"></path>
            </svg>
          </button>
          <button 
            type="button" 
            class="btn-header-bubble" 
            @click="calorieStore.openSettingsModal"
            title="ตั้งค่าเป้าหมาย & จัดการข้อมูล"
          >
            <!-- Minimal Settings Gear SVG -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Date Selector Pill inside Matcha Header -->
      <div class="date-picker-banner">
        <button 
          type="button" 
          class="btn-date-arrow" 
          @click="calorieStore.changeDate(-1)"
          title="วันก่อนหน้า"
        >
          ‹
        </button>

        <div class="date-pill-center">
          <span class="date-thai-text">{{ formattedDateThai }}</span>
          <button type="button" class="date-calendar-trigger" @click="toggleCalendar" :aria-expanded="showCalendar" aria-label="เลือกวันที่">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
          </button>
          <button 
            v-if="!calorieStore.isToday()" 
            type="button" 
            class="btn-today-pill"
            @click="calorieStore.setToday"
          >
            วันนี้
          </button>
        </div>

        <button 
          type="button" 
          class="btn-date-arrow" 
          @click="calorieStore.changeDate(1)"
          title="วันถัดไป"
        >
          ›
        </button>
      </div>
      <div v-if="showCalendar" class="calendar-popover" @click.stop>
        <div class="calendar-heading">
          <button type="button" class="calendar-nav" @click="moveCalendarMonth(-1)" aria-label="เดือนก่อนหน้า">‹</button>
          <strong>{{ calendarMonthLabel }}</strong>
          <button type="button" class="calendar-nav" @click="moveCalendarMonth(1)" aria-label="เดือนถัดไป" :disabled="isCurrentCalendarMonth">›</button>
        </div>
        <div class="calendar-grid calendar-weekdays"><span v-for="day in weekdayLabels" :key="day">{{ day }}</span></div>
        <div class="calendar-grid">
          <button v-for="day in calendarDays" :key="day.date" type="button" class="calendar-day" :class="{ muted: !day.currentMonth, selected: day.date === state.selectedDate, today: day.date === todayDate }" :disabled="day.date > todayDate" @click="selectCalendarDate(day.date)">{{ day.dayNumber }}</button>
        </div>
        <button v-if="!calorieStore.isToday()" type="button" class="calendar-today" @click="goToToday">กลับไปวันนี้</button>
      </div>

      <!-- Top Segmented Navigation Pills -->
      <div class="top-nav-pills-bar">
        <button 
          type="button" 
          class="btn-top-pill" 
          :class="{ active: state.activeTab === 'diary' }"
          @click="calorieStore.setActiveTab('diary')"
        >
          <span class="pill-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="pill-text">ไดอารี่</span>
        </button>
        <button 
          type="button" 
          class="btn-top-pill" 
          :class="{ active: state.activeTab === 'coach' }"
          @click="calorieStore.setActiveTab('coach')"
        >
          <span class="pill-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </span>
          <span class="pill-text">AI โค้ช</span>
        </button>
        <button 
          type="button" 
          class="btn-top-pill" 
          :class="{ active: state.activeTab === 'analytics' }"
          @click="calorieStore.setActiveTab('analytics')"
        >
          <span class="pill-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
          </span>
          <span class="pill-text">สถิติ</span>
        </button>
        <button 
          type="button" 
          class="btn-top-pill" 
          :class="{ active: state.activeTab === 'profile' }"
          @click="calorieStore.setActiveTab('profile')"
        >
          <span class="pill-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="5"/>
              <path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>
          </span>
          <span class="pill-text">เป้าหมาย</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container Overlapping Header -->
    <div class="main-body-container">
      <!-- TAB 1: DIARY (บันทึกอาหาร & สรุปโภชนาการวันนี้) -->
      <template v-if="state.activeTab === 'diary'">
        <!-- 1. Main Calorie Summary Card (Pure White with Neon Lime Ring) -->
        <section class="calorie-hero-card">
          <div class="hero-card-top">
            <div class="hero-kcal-info">
              <span class="hero-card-label">แคลอรี่รวมวันนี้</span>
              <div class="hero-kcal-display font-num">
                <span class="eaten-highlight font-num">{{ dailyTotals.calories.toLocaleString() }}</span>
                <span class="target-slash font-num">/ {{ dailyCalorieTarget.toLocaleString() }} kcal</span>
              </div>
            </div>

            <!-- Circular Gauge Ring (Neon Lime) -->
            <div class="gauge-ring-wrap">
              <svg class="gauge-svg" viewBox="0 0 100 100">
                <circle
                  class="gauge-bg"
                  cx="50"
                  cy="50"
                  r="42"
                />
                <circle
                  class="gauge-fill"
                  cx="50"
                  cy="50"
                  r="42"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="ringStrokeDashoffset"
                  :class="calorieProgressClass"
                />
              </svg>
              <div class="gauge-center-val font-num">
                <span class="percent-num font-num">{{ caloriePercent }}%</span>
              </div>
            </div>
          </div>

          <!-- Target Remaining Pill Banner -->
          <div class="target-remaining-badge" :class="{ 'is-over': remainingCalories < 0 }">
            <span class="bullet-dot">•</span>
            <span v-if="remainingCalories >= 0">
              เหลืออีก <strong>{{ remainingCalories.toLocaleString() }} kcal</strong>
            </span>
            <span v-else>
              เกินเป้าหมาย <strong>{{ Math.abs(remainingCalories).toLocaleString() }} kcal</strong>
            </span>
          </div>

          <!-- 3 Macro Progress Bars (Carb, Protein, Fat) -->
          <div class="macro-bars-grid">
            <!-- Carb -->
            <div class="macro-col">
              <div class="macro-label-row">
                <span class="macro-name carb">คาร์บ</span>
                <span class="macro-val font-num">{{ dailyTotals.carbs.toFixed(0) }}/{{ state.userProfile.carbsTarget || 230 }}g</span>
              </div>
              <div class="track-bar">
                <div 
                  class="fill-bar carb"
                  :style="{ width: `${Math.min(100, (dailyTotals.carbs / (state.userProfile.carbsTarget || 1)) * 100)}%` }"
                ></div>
              </div>
            </div>

            <!-- Protein -->
            <div class="macro-col">
              <div class="macro-label-row">
                <span class="macro-name pro">โปรตีน</span>
                <span class="macro-val font-num">{{ dailyTotals.protein.toFixed(0) }}/{{ state.userProfile.proteinTarget || 120 }}g</span>
              </div>
              <div class="track-bar">
                <div 
                  class="fill-bar pro"
                  :style="{ width: `${Math.min(100, (dailyTotals.protein / (state.userProfile.proteinTarget || 1)) * 100)}%` }"
                ></div>
              </div>
            </div>

            <!-- Fat -->
            <div class="macro-col">
              <div class="macro-label-row">
                <span class="macro-name fat">ไขมัน</span>
                <span class="macro-val font-num">{{ dailyTotals.fat.toFixed(0) }}/{{ state.userProfile.fatTarget || 55 }}g</span>
              </div>
              <div class="track-bar">
                <div 
                  class="fill-bar fat"
                  :style="{ width: `${Math.min(100, (dailyTotals.fat / (state.userProfile.fatTarget || 1)) * 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Meals Section ("มื้ออาหารวันนี้") -->
        <section class="meals-list-section">
          <div v-if="totalItemsCount === 0" class="diary-empty-state">
            <div class="empty-state-icon">🍽️</div>
            <h2>{{ calorieStore.isToday() ? 'เริ่มบันทึกมื้อแรกของวันนี้' : 'วันนี้ยังไม่มีรายการอาหาร' }}</h2>
            <p>เพิ่มอาหารจากเมนู ค้นหา หรือกรอกข้อมูลเองได้ และข้อมูลจะบันทึกไว้ในอุปกรณ์นี้</p>
            <button type="button" class="btn-add-meal-pill" @click="calorieStore.openSearchModal('breakfast')">+ เพิ่มอาหารมื้อแรก</button>
            <button type="button" class="btn-clear-today-pill" @click="calorieStore.openQuickAddModal('breakfast')">กรอกข้อมูลเอง</button>
          </div>
          <div class="section-title-row">
            <div>
              <h2 class="section-main-title">มื้ออาหารวันนี้</h2>
              <span class="section-sub-info">รวม {{ totalItemsCount }} รายการ</span>
            </div>

            <div class="section-actions-right">
              <button 
                type="button" 
                class="btn-add-meal-pill" 
                @click="calorieStore.openSearchModal('breakfast')"
              >
                <span class="plus-sign">+</span>
                <span>เพิ่มอาหาร</span>
              </button>

              <button 
                v-if="totalItemsCount > 0"
                type="button" 
                class="btn-clear-today-pill" 
                @click="showClearAllModal = true"
                title="ล้างอาหารทุกมื้อของวันนี้"
              >
                ล้างทั้งหมด
              </button>
            </div>
          </div>

          <!-- 4 Meal Cards Grid -->
          <div class="meals-cards-stack">
            <MealCard mealType="breakfast" />
            <MealCard mealType="lunch" />
            <MealCard mealType="dinner" />
            <MealCard mealType="snack" />
          </div>
        </section>

        <!-- 3. Detailed Macro Nutrients Breakdown Section ("สารอาหารวันนี้") -->
        <section class="macro-detail-card">
          <div class="macro-detail-header">
            <h3 class="detail-sec-title">สารอาหารวันนี้</h3>
            <span class="detail-sec-sub">แคลอรี่รวม: {{ dailyTotals.calories.toFixed(0) }} kcal</span>
          </div>

          <div class="macro-detail-list">
            <!-- Carb Row -->
            <div class="macro-detail-row">
              <div class="m-row-left">
                <div class="m-color-bullet carb"></div>
                <div class="m-row-texts">
                  <span class="m-row-title">คาร์โบไฮเดรต</span>
                  <span class="m-row-cal-sub">{{ (dailyTotals.carbs * 4).toFixed(0) }} kcal <span class="m-ratio">(4 kcal/g)</span></span>
                </div>
              </div>
              <div class="m-row-middle">
                <div class="m-prog-track">
                  <div class="m-prog-fill carb" :style="{ width: `${Math.min(100, (dailyTotals.carbs / (state.userProfile.carbsTarget || 1)) * 100)}%` }"></div>
                </div>
              </div>
              <div class="m-stat-col">
                <span class="m-stat-nums">{{ dailyTotals.carbs.toFixed(0) }} <small>/ {{ state.userProfile.carbsTarget || 230 }}g</small></span>
                <span class="m-stat-pct">{{ Math.round((dailyTotals.carbs / (state.userProfile.carbsTarget || 1)) * 100) }}%</span>
              </div>
            </div>

            <!-- Protein Row -->
            <div class="macro-detail-row">
              <div class="m-row-left">
                <div class="m-color-bullet pro"></div>
                <div class="m-row-texts">
                  <span class="m-row-title">โปรตีน</span>
                  <span class="m-row-cal-sub">{{ (dailyTotals.protein * 4).toFixed(0) }} kcal <span class="m-ratio">(4 kcal/g)</span></span>
                </div>
              </div>
              <div class="m-row-middle">
                <div class="m-prog-track">
                  <div class="m-prog-fill pro" :style="{ width: `${Math.min(100, (dailyTotals.protein / (state.userProfile.proteinTarget || 1)) * 100)}%` }"></div>
                </div>
              </div>
              <div class="m-stat-col">
                <span class="m-stat-nums">{{ dailyTotals.protein.toFixed(0) }} <small>/ {{ state.userProfile.proteinTarget || 120 }}g</small></span>
                <span class="m-stat-pct">{{ Math.round((dailyTotals.protein / (state.userProfile.proteinTarget || 1)) * 100) }}%</span>
              </div>
            </div>

            <!-- Fat Row -->
            <div class="macro-detail-row">
              <div class="m-row-left">
                <div class="m-color-bullet fat"></div>
                <div class="m-row-texts">
                  <span class="m-row-title">ไขมัน</span>
                  <span class="m-row-cal-sub">{{ (dailyTotals.fat * 9).toFixed(0) }} kcal <span class="m-ratio">(9 kcal/g)</span></span>
                </div>
              </div>
              <div class="m-row-middle">
                <div class="m-prog-track">
                  <div class="m-prog-fill fat" :style="{ width: `${Math.min(100, (dailyTotals.fat / (state.userProfile.fatTarget || 1)) * 100)}%` }"></div>
                </div>
              </div>
              <div class="m-stat-col">
                <span class="m-stat-nums">{{ dailyTotals.fat.toFixed(0) }} <small>/ {{ state.userProfile.fatTarget || 55 }}g</small></span>
                <span class="m-stat-pct">{{ Math.round((dailyTotals.fat / (state.userProfile.fatTarget || 1)) * 100) }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Water Tracker Card (Minimalist Water Bar) -->
        <section class="water-card-energetic">
          <div class="water-head">
            <div class="water-left-title">
              <div>
                <h4 class="water-sec-title">ดื่มน้ำวันนี้</h4>
                <span class="water-ml-sub font-num">{{ currentWater * 250 }} / {{ (state.userProfile.waterTarget || 8) * 250 }} ml</span>
              </div>
            </div>

            <div class="water-stepper">
              <button 
                type="button" 
                class="btn-w-step" 
                @click="calorieStore.removeWater()"
                :disabled="currentWater <= 0"
              >
                -
              </button>
              <span class="w-badge font-num">{{ currentWater }} แก้ว</span>
              <button 
                type="button" 
                class="btn-w-step" 
                @click="calorieStore.addWater()"
              >
                +
              </button>
            </div>
          </div>

          <!-- Modern segmented water level bar -->
          <div class="water-segmented-bar">
            <div 
              v-for="idx in (state.userProfile.waterTarget || 8)" 
              :key="idx"
              class="water-segment"
              :class="{ filled: idx <= currentWater }"
              @click="toggleWaterUpTo(idx)"
              :title="`บันทึกน้ำ ${idx} แก้ว`"
            ></div>
          </div>
        </section>

        <section class="water-card-energetic exercise-card">
          <div class="water-head">
            <div><h4 class="water-sec-title">กิจกรรมวันนี้</h4><span class="water-ml-sub">เผาผลาญเพิ่ม {{ exerciseCalories }} kcal · เป้าหมายวันนี้ {{ dailyCalorieTarget }} kcal</span></div>
            <button type="button" class="btn-add-meal-pill" @click="showExerciseForm = !showExerciseForm">{{ showExerciseForm ? 'ยกเลิก' : '+ เพิ่มกิจกรรม' }}</button>
          </div>
          <form v-if="showExerciseForm" class="exercise-form" @submit.prevent="addExercise">
            <span class="exercise-form-label">เลือกกิจกรรม</span>
            <div class="activity-choice-grid">
              <button v-for="activity in activityOptions" :key="activity.id" type="button" class="activity-choice" :class="{ selected: exerciseForm.type === activity.id }" @click="exerciseForm.type = activity.id">
                <span class="activity-emoji">{{ activity.icon }}</span><span>{{ activity.name }}</span>
              </button>
            </div>
            <label class="duration-field"><span>ระยะเวลา</span><div><input v-model.number="exerciseForm.minutes" type="number" min="1" required placeholder="เช่น 30" aria-label="ระยะเวลาเป็นนาที" /><span>นาที</span></div></label>
            <div class="exercise-preview"><span class="preview-icon">{{ exerciseTypes[exerciseForm.type].icon }}</span><div class="preview-copy"><strong>{{ exerciseTypes[exerciseForm.type].name }}{{ exerciseForm.minutes ? ` ${exerciseForm.minutes} นาที` : '' }}</strong><span>น้ำหนัก {{ state.userProfile.weight }} kg · เผาผลาญโดยประมาณ</span></div><strong class="preview-kcal">{{ estimatedExerciseCalories }} <small>kcal</small></strong></div>
            <button class="exercise-save" type="submit" :disabled="!exerciseForm.minutes">บันทึกกิจกรรม</button>
          </form>
          <div v-if="todayExercises.length" class="exercise-list">
            <div v-for="item in todayExercises" :key="item.id" class="exercise-row"><span>{{ item.name }} · {{ item.minutes }} นาที</span><strong>+{{ item.calories }} kcal</strong><button type="button" @click="calorieStore.removeExercise(item.id)" aria-label="ลบกิจกรรม">ลบ</button></div>
          </div>
          <p v-else class="water-ml-sub">บันทึกกิจกรรมเพื่อเพิ่มพลังงานที่ใช้ได้ในเป้าหมายวันนี้</p>
        </section>

        <!-- 5. Energetic Streak Card -->
        <section class="streak-banner-card">
          <div class="streak-left">
            <div class="flame-neon-badge">
              <!-- Minimal Flame SVG -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"></path>
              </svg>
            </div>
            <div>
              <span class="streak-title">สถิติบันทึกต่อเนื่อง</span>
              <div class="streak-days-row font-num">
                <span class="streak-num font-num">{{ currentStreak }}</span>
                <span class="streak-unit">วัน</span>
              </div>
              <p class="streak-sub">เก่งมาก รักษาโมเมนตัมไว้ให้ดี</p>
            </div>
          </div>
        </section>
      </template>

      <!-- TAB 2: AI COACH (AI ผู้ช่วยโภชนาการ & Fasting) -->
      <AiCoachTab v-else-if="state.activeTab === 'coach'" />

      <!-- TAB 3: ANALYTICS (สถิติ & กราฟแนวโน้ม 7 วัน) -->
      <AnalyticsTab v-else-if="state.activeTab === 'analytics'" />

      <!-- TAB 4: PROFILE & GOALS (เป้าหมาย & จัดการเมนูโปรด) -->
      <ProfileGoalsTab v-else-if="state.activeTab === 'profile'" />
    </div>

    <!-- Floating Bottom Navigation Bar -->
    <MealsBottomNav />

    <!-- Clear All Meals Confirmation Modal -->
    <div class="confirm-modal-backdrop" v-if="showClearAllModal" @click.self="showClearAllModal = false">
      <div class="confirm-dialog-card">
        <h3 class="confirm-title">ยืนยันล้างข้อมูลทุกมื้อ?</h3>
        <p class="confirm-desc">
          รายการอาหารทั้งหมดใน <strong>มื้อเช้า, กลางวัน, เย็น, และของว่าง</strong> 
          ของวันที่ {{ formattedDateThai }} จะถูกล้างทั้งหมด ({{ totalItemsCount }} รายการ)
        </p>

        <div class="confirm-buttons-row">
          <button type="button" class="btn-dialog-cancel" @click="showClearAllModal = false">
            ยกเลิก
          </button>
          <button type="button" class="btn-dialog-confirm" @click="confirmClearAllMeals">
            ล้างข้อมูลทุกมื้อ
          </button>
        </div>
      </div>
    </div>

    <!-- Active Global Modals -->
    <FoodSearchModal v-if="state.activeModal === 'search'" />
    <FoodScannerModal v-if="state.activeModal === 'scanner'" />
    <BarcodeScannerModal v-if="state.activeModal === 'barcode-scanner'" />
    <QuickAddModal v-if="state.activeModal === 'quick-add'" />
    <BmrCalculatorModal v-if="state.activeModal === 'bmr-calc'" />
    <SettingsModal v-if="state.activeModal === 'settings'" />
    <WeeklyAnalyticsModal v-if="state.activeModal === 'analytics'" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { calorieStore, state } from '../stores/useCalorieStore.js';
import MealCard from '../components/meals/MealCard.vue';
import AiCoachTab from '../components/meals/AiCoachTab.vue';
import AnalyticsTab from '../components/meals/AnalyticsTab.vue';
import ProfileGoalsTab from '../components/meals/ProfileGoalsTab.vue';
import MealsBottomNav from '../components/meals/MealsBottomNav.vue';
import FoodSearchModal from '../components/meals/FoodSearchModal.vue';
import FoodScannerModal from '../components/meals/FoodScannerModal.vue';
import QuickAddModal from '../components/meals/QuickAddModal.vue';
import BmrCalculatorModal from '../components/meals/BmrCalculatorModal.vue';
import SettingsModal from '../components/meals/SettingsModal.vue';
import WeeklyAnalyticsModal from '../components/meals/WeeklyAnalyticsModal.vue';
import BarcodeScannerModal from '../components/meals/BarcodeScannerModal.vue';

const showClearAllModal = ref(false);
const showExerciseForm = ref(false);
const exerciseForm = ref({ type: 'walk', minutes: null });
const todayDate = calorieStore.getTodayDateString();
const showCalendar = ref(false);
const calendarMonth = ref(new Date(`${state.selectedDate}T00:00:00`));
const weekdayLabels = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const dailyTotals = computed(() => calorieStore.getDailyTotals());
const remainingCalories = computed(() => calorieStore.getRemainingCalories());
const currentWater = computed(() => calorieStore.getWater());
const currentStreak = computed(() => calorieStore.calculateStreak());
const todayExercises = computed(() => calorieStore.getExercises());
const exerciseCalories = computed(() => calorieStore.getExerciseCalories());
const dailyCalorieTarget = computed(() => (state.userProfile.calorieTarget || 2000) + exerciseCalories.value);
const exerciseTypes = { walk: { name: 'เดินเร็ว', icon: '🚶', met: 4.3 }, run: { name: 'วิ่ง', icon: '🏃', met: 8.3 }, cycle: { name: 'ปั่นจักรยาน', icon: '🚴', met: 7.5 }, strength: { name: 'เวทเทรนนิ่ง', icon: '🏋️', met: 5 }, swim: { name: 'ว่ายน้ำ', icon: '🏊', met: 6 } };
const activityOptions = Object.entries(exerciseTypes).map(([id, item]) => ({ id, ...item }));
const estimatedExerciseCalories = computed(() => Math.round((exerciseTypes[exerciseForm.value.type]?.met || 4) * 3.5 * (Number(state.userProfile.weight) || 65) / 200 * (Number(exerciseForm.value.minutes) || 0)));
function addExercise() {
  calorieStore.addExercise({ name: exerciseTypes[exerciseForm.value.type].name, type: exerciseForm.value.type, minutes: Number(exerciseForm.value.minutes), calories: estimatedExerciseCalories.value });
  exerciseForm.value = { type: 'walk', minutes: null };
  showExerciseForm.value = false;
}

const totalItemsCount = computed(() => {
  const meals = calorieStore.getMealsForDate();
  return (meals.breakfast?.length || 0) + (meals.lunch?.length || 0) + (meals.dinner?.length || 0) + (meals.snack?.length || 0);
});

function confirmClearAllMeals() {
  calorieStore.clearAllMealsForDate();
  showClearAllModal.value = false;
}

const calendarMonthLabel = computed(() => new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(calendarMonth.value));
const isCurrentCalendarMonth = computed(() => calendarMonth.value.getFullYear() === new Date(`${todayDate}T00:00:00`).getFullYear() && calendarMonth.value.getMonth() === new Date(`${todayDate}T00:00:00`).getMonth());
const calendarDays = computed(() => {
  const year = calendarMonth.value.getFullYear();
  const month = calendarMonth.value.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const previousCount = new Date(year, month, 0).getDate();
  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstWeekday + 1;
    const date = dayNumber < 1
      ? new Date(year, month - 1, previousCount + dayNumber)
      : dayNumber > count
        ? new Date(year, month + 1, dayNumber - count)
        : new Date(year, month, dayNumber);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { date: dateString, dayNumber: date.getDate(), currentMonth: date.getMonth() === month };
  });
});

function toggleCalendar() {
  if (!showCalendar.value) calendarMonth.value = new Date(`${state.selectedDate}T00:00:00`);
  showCalendar.value = !showCalendar.value;
}
function moveCalendarMonth(delta) { calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + delta, 1); }
function selectCalendarDate(date) { if (date <= todayDate) calorieStore.setDate(date); showCalendar.value = false; }
function goToToday() { calorieStore.setToday(); calendarMonth.value = new Date(`${todayDate}T00:00:00`); showCalendar.value = false; }
function handleCalendarOutsideClick(event) { if (!event.target.closest('.date-picker-banner')) showCalendar.value = false; }
onMounted(() => document.addEventListener('click', handleCalendarOutsideClick));
onBeforeUnmount(() => document.removeEventListener('click', handleCalendarOutsideClick));

// Circular Gauge Ring Math (Radius 42)
const ringRadius = 42;
const ringCircumference = 2 * Math.PI * ringRadius;

const caloriePercent = computed(() => {
  const target = dailyCalorieTarget.value;
  return Math.min(150, Math.round((dailyTotals.value.calories / target) * 100));
});

const ringStrokeDashoffset = computed(() => {
  const percent = Math.min(100, caloriePercent.value);
  return ringCircumference - (percent / 100) * ringCircumference;
});

const calorieProgressClass = computed(() => {
  if (caloriePercent.value > 105) return 'is-over';
  if (caloriePercent.value > 90) return 'is-near';
  return 'is-normal';
});

// Thai formatted date string (Mobile-optimized concise format)
const formattedDateThai = computed(() => {
  const [y, m, d] = state.selectedDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const dayName = daysOfWeek[dateObj.getDay()];
  const monthName = thaiMonths[dateObj.getMonth()];
  const thaiYear = y + 543;

  return `${dayName} ${d} ${monthName} ${thaiYear}`;
});

function toggleWaterUpTo(targetCount) {
  state.waterByDate[state.selectedDate] = targetCount;
}
</script>

<style scoped>
.exercise-card { margin-top: 1rem; padding: 1.1rem; border: 1px solid #e1ebe6; border-radius: 20px; background: linear-gradient(135deg,#fff 0%,#f4f8f5 100%); box-shadow: 0 8px 24px #173c350a; }
.exercise-form { display: grid; gap: .8rem; margin: 1rem 0 .25rem; padding: 1rem; border-radius: 16px; background: #f8faf8; border: 1px solid #e3ece7; }
.exercise-form-label,.duration-field>span { color:#425d54; font-size:.82rem; font-weight:750; }
.activity-choice-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.5rem; }
.activity-choice { min-height:76px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.35rem; padding:.5rem .25rem; color:#52655e; background:#fff; border:1px solid #dce6e1; border-radius:13px; font-size:.72rem; font-weight:700; cursor:pointer; transition:.18s ease; }
.activity-choice:hover { border-color:#7da393; transform:translateY(-1px); }
.activity-choice.selected { color:#154238; background:#e8f2ed; border:1.5px solid #34745d; box-shadow:0 0 0 3px #34745d12; }
.activity-emoji { font-size:1.25rem; line-height:1; }
.duration-field { display:grid; gap:.4rem; }
.duration-field div { display:flex; align-items:center; border:1px solid #d8e2dd; border-radius:11px; background:white; padding-right:.8rem; color:#7b8a84; }
.duration-field input { width:100%; min-width:0; padding:.75rem; border:0; outline:0; background:transparent; color:#163c33; font:inherit; }
.exercise-preview { display:flex; align-items:center; gap:.7rem; padding:.8rem .9rem; border:1px solid #dceae2; border-radius:13px; background:linear-gradient(110deg,#edf5f0,#f7faf8); }
.preview-icon { display:grid; place-items:center; width:40px; height:40px; flex:0 0 40px; border-radius:12px; background:#fff; font-size:1.25rem; }
.preview-copy { display:grid; gap:.2rem; flex:1; min-width:0; }
.preview-copy strong { color:#214c3d; font-size:.88rem; }
.preview-copy span { color:#7a8f86; font-size:.7rem; }
.preview-kcal { color:#154238; font-size:1.25rem; white-space:nowrap; }
.preview-kcal small { font-size:.7rem; }
.exercise-save { width:100%; padding:.8rem; border:0; border-radius:11px; color:white; background:#154238; font-weight:750; cursor:pointer; }
.exercise-save:disabled { opacity:.45; cursor:not-allowed; }
.exercise-list { margin-top:.75rem; }
.exercise-row { display:flex; align-items:center; gap:.75rem; padding:.65rem .2rem; border-top:1px solid #e2e8e0; color:#52655e; font-size:.88rem; }
.exercise-row span { flex:1; }
.exercise-row strong { color:#24624c; }
.exercise-row button { padding:.35rem .6rem; border:0; border-radius:8px; color:#9b5147; background:#fbefed; font-size:.75rem; }
@media (max-width:430px) { .activity-choice-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
</style>

<style scoped>
.dashboard-shell {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-app, #F9F9F6);
  padding-bottom: 4rem;
}

/* 1. Hero Forest Green Header */
.hero-header {
  background: linear-gradient(180deg, #154238 0%, #1E3A2F 100%);
  padding: 2.2rem 1.4rem 3.5rem;
  border-radius: 0 0 32px 32px;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  box-shadow: 0 10px 30px rgba(21, 66, 56, 0.25);
  position: relative;
}

.header-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-greeting {
  font-size: 1.55rem;
  font-weight: 900;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.5px;
}

.greeting-sub {
  font-size: 0.82rem;
  color: #A3C2B6;
  margin: 3px 0 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-header-bubble {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-header-bubble:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

/* Date Picker Banner inside Header */
.date-picker-banner {
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 0.55rem 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-date-arrow {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.btn-date-arrow:hover {
  background: rgba(255, 255, 255, 0.3);
}

.date-pill-center {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.date-calendar-trigger { width:30px; height:30px; display:grid; place-items:center; padding:0; border:1px solid rgba(255,255,255,.2); border-radius:9px; background:rgba(255,255,255,.1); color:#D4FF32; cursor:pointer; transition:background .15s,transform .15s; }
.date-calendar-trigger:hover { background:rgba(255,255,255,.2); transform:translateY(-1px); }
.date-calendar-trigger svg { width:16px; height:16px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.calendar-popover { position:absolute; z-index:40; top:calc(100% + 8px); left:50%; width:min(320px,calc(100vw - 40px)); padding:14px; transform:translateX(-50%); border:1px solid #DDE9E1; border-radius:18px; background:#FFF; color:#173E33; box-shadow:0 18px 45px rgba(13,45,34,.22); }
.calendar-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.calendar-heading strong { color:#173E33; font-size:.94rem; font-weight:800; }
.calendar-nav { width:30px; height:30px; border:0; border-radius:9px; background:#F1F6F2; color:#285C4C; font-size:1.35rem; line-height:1; cursor:pointer; }
.calendar-nav:hover:not(:disabled) { background:#E4EFE7; }
.calendar-nav:disabled { opacity:.35; cursor:default; }
.calendar-grid { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:3px; }
.calendar-weekdays { margin-bottom:5px; color:#84958C; font-size:.68rem; font-weight:700; text-align:center; }
.calendar-weekdays span { padding:5px 0; }
.calendar-day { aspect-ratio:1; border:0; border-radius:10px; background:transparent; color:#334A40; font:inherit; font-size:.77rem; cursor:pointer; }
.calendar-day:hover:not(:disabled) { background:#EDF4EE; }
.calendar-day.muted { color:#B4C0B9; }
.calendar-day.selected { background:#D4FF32; color:#173E33; font-weight:900; box-shadow:0 3px 9px rgba(176,218,26,.28); }
.calendar-day.today:not(.selected) { outline:1.5px solid #A8C5B3; outline-offset:-2px; font-weight:800; }
.calendar-day:disabled { color:#D7DED9; cursor:default; }
.calendar-today { display:block; margin:10px auto 0; padding:6px 12px; border:0; border-radius:999px; background:#EDF4EE; color:#285C4C; font:inherit; font-size:.72rem; font-weight:800; cursor:pointer; }
.diary-empty-state { margin: 1rem 0; padding: 1.5rem; border-radius: 20px; background: #fff; text-align: center; box-shadow: 0 8px 24px rgba(20, 50, 35, .06); }
.empty-state-icon { font-size: 2rem; }
.diary-empty-state h2 { margin: .45rem 0; color: var(--text-main, #0F1E17); font-size: 1.05rem; }
.diary-empty-state p { margin: .35rem auto 1rem; max-width: 340px; color: var(--text-muted, #52665C); font-size: .84rem; }
.diary-empty-state button { margin: 0 .2rem; }

.date-thai-text {
  font-size: 0.86rem;
  font-weight: 700;
  color: #FFFFFF;
}

.btn-today-pill {
  font-size: 0.68rem;
  font-weight: 800;
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  border: none;
  padding: 2px 8px;
  border-radius: 999px;
  cursor: pointer;
}

/* Top Segmented Navigation Pills */
.top-nav-pills-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.28);
  padding: 0.3rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.btn-top-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.5rem 0.3rem;
  border: none;
  background: transparent;
  color: #A3C2B6;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
}

.btn-top-pill:hover:not(.active) {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.08);
}

.btn-top-pill.active {
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  box-shadow: 0 4px 14px rgba(212, 255, 50, 0.3);
  font-weight: 800;
}

.btn-top-pill .pill-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 2. Main Body (Overlapping Hero) */
.main-body-container {
  padding: 0 1.2rem;
  margin-top: -2.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  z-index: 10;
}

/* Calorie Summary Card */
.calorie-hero-card {
  background: var(--surface-card, #FFFFFF);
  border-radius: var(--radius-xl, 28px);
  padding: 1.4rem 1.4rem 1.2rem;
  box-shadow: 0 8px 30px rgba(21, 66, 56, 0.08);
  border: 1px solid var(--border-subtle, #E8ECE9);
}

.hero-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
}

.hero-card-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-muted, #52665C);
  display: block;
}

.hero-kcal-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 2px;
}

.eaten-highlight {
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--primary-forest, #154238);
  letter-spacing: -1px;
  line-height: 1;
}

.target-slash {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-muted, #52665C);
}

/* Gauge Ring */
.gauge-ring-wrap {
  position: relative;
  width: 82px;
  height: 82px;
  flex-shrink: 0;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-bg {
  fill: none;
  stroke: #E8ECE9;
  stroke-width: 8;
}

.gauge-fill {
  fill: none;
  stroke: var(--accent-neon, #D4FF32);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gauge-fill.is-normal { stroke: var(--accent-neon, #D4FF32); }
.gauge-fill.is-near { stroke: #F59E0B; }
.gauge-fill.is-over { stroke: #EF4444; }

.gauge-center-val {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.percent-num {
  font-size: 0.98rem;
  font-weight: 900;
  color: var(--primary-forest, #154238);
}

/* Target Remaining Badge */
.target-remaining-badge {
  background: var(--primary-light, #EBF3F0);
  border: 1px solid rgba(21, 66, 56, 0.1);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  font-size: 0.8rem;
  color: var(--primary-forest, #154238);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}

.bullet-dot {
  font-size: 1rem;
  line-height: 1;
  color: var(--primary-forest, #154238);
}

.target-remaining-badge.is-over {
  background: #FEF2F2;
  border-color: #FECACA;
  color: #B91C1C;
}

.target-remaining-badge strong {
  font-weight: 800;
}

/* Macro Bars Grid */
.macro-bars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  padding-top: 0.9rem;
  border-top: 1px solid #F1F5F2;
}

.macro-col {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.macro-label-row {
  display: flex;
  flex-direction: column;
}

.macro-name {
  font-size: 0.72rem;
  font-weight: 700;
}

.macro-name.carb { color: var(--macro-carb, #3B82F6); }
.macro-name.pro { color: var(--macro-protein, #8B5CF6); }
.macro-name.fat { color: var(--macro-fat, #F59E0B); }

.macro-val {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin-top: 1px;
}

.track-bar {
  height: 6px;
  background: #E8ECE9;
  border-radius: 999px;
  overflow: hidden;
}

.fill-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.fill-bar.carb { background: var(--macro-carb, #3B82F6); }
.fill-bar.pro { background: var(--macro-protein, #8B5CF6); }
.fill-bar.fat { background: var(--macro-fat, #F59E0B); }

/* 3. Meals List Section */
.meals-list-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.2rem 0.2rem 0;
}

.section-main-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-main, #0F1E17);
  margin: 0;
  letter-spacing: -0.3px;
}

.section-sub-info {
  font-size: 0.74rem;
  color: var(--text-muted, #52665C);
  font-weight: 500;
}

.section-actions-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-add-meal-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.4rem 0.85rem;
  background: var(--surface-card, #FFFFFF);
  border: 1.5px solid var(--primary-forest, #154238);
  color: var(--primary-forest, #154238);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.btn-add-meal-pill:hover {
  background: var(--primary-forest, #154238);
  color: #FFFFFF;
}

.plus-sign {
  font-size: 0.9rem;
}

.btn-clear-today-pill {
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  color: #E11D48;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-clear-today-pill:hover {
  background: #FFE4E6;
}

.meals-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* 4. Detailed Macros Card ("สารอาหารวันนี้") */
.macro-detail-card {
  background: var(--surface-card, #FFFFFF);
  border-radius: var(--radius-lg, 24px);
  padding: 1.25rem 1.35rem;
  border: 1px solid var(--border-subtle, #E8ECE9);
  box-shadow: var(--shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04));
}

.macro-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid #F1F5F2;
}

.detail-sec-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin: 0;
  letter-spacing: -0.2px;
}

.detail-sec-sub {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary-forest, #154238);
  background: var(--primary-light, #EBF3F0);
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: 0.1px;
}

.macro-detail-list {
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
}

.macro-detail-row {
  display: grid;
  grid-template-columns: minmax(130px, 1.4fr) minmax(70px, 1.6fr) minmax(85px, auto);
  align-items: center;
  gap: 0.85rem;
}

@media (max-width: 480px) {
  .macro-detail-row {
    grid-template-columns: minmax(115px, 1.3fr) minmax(50px, 1.2fr) minmax(75px, auto);
    gap: 0.55rem;
  }
}

.m-row-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.m-color-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.m-color-bullet.carb { 
  background: var(--macro-carb, #3B82F6); 
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.45); 
}
.m-color-bullet.pro { 
  background: var(--macro-protein, #8B5CF6); 
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.45); 
}
.m-color-bullet.fat { 
  background: var(--macro-fat, #F59E0B); 
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.45); 
}

.m-row-texts {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.m-row-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main, #0F1E17);
  line-height: 1.2;
  white-space: nowrap;
}

.m-row-cal-sub {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-muted, #52665C);
  line-height: 1.2;
  white-space: nowrap;
}

.m-ratio {
  opacity: 0.8;
  font-size: 0.68rem;
}

.m-row-middle {
  flex: 1;
  min-width: 0;
}

.m-prog-track {
  width: 100%;
  height: 7px;
  background: #E8ECE9;
  border-radius: 999px;
  overflow: hidden;
}

.m-prog-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.m-prog-fill.carb { background: linear-gradient(90deg, #60A5FA 0%, #3B82F6 100%); }
.m-prog-fill.pro { background: linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%); }
.m-prog-fill.fat { background: linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%); }

.m-stat-col {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  flex-shrink: 0;
}

.m-stat-nums {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  line-height: 1.2;
  white-space: nowrap;
}

.m-stat-nums small {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted, #52665C);
}

.m-stat-pct {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted, #52665C);
  line-height: 1;
}

/* 5. Streak Card */
.streak-banner-card {
  background: linear-gradient(135deg, #154238 0%, #0D281E 100%);
  border-radius: var(--radius-lg, 24px);
  padding: 1.2rem 1.4rem;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 24px rgba(21, 66, 56, 0.25);
  border: 1px solid rgba(212, 255, 50, 0.2);
}

.streak-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.flame-neon-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(212, 255, 50, 0.15);
  border: 2px solid var(--accent-neon, #D4FF32);
  color: var(--accent-neon, #D4FF32);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(212, 255, 50, 0.3);
}

.streak-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #A3C2B6;
  display: block;
}

.streak-days-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
  margin: 3px 0 2px;
}

.streak-num {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--accent-neon, #D4FF32);
  letter-spacing: -0.5px;
}

.streak-unit {
  font-size: 0.9rem;
  font-weight: 800;
  color: #FFFFFF;
}

.streak-sub {
  font-size: 0.72rem;
  color: #C2D6CE;
  margin: 0;
  font-weight: 500;
}

/* 6. Motivational Fitness Banner */
.fitness-action-banner {
  background: linear-gradient(135deg, #1E3A2F 0%, #154238 100%);
  border-radius: var(--radius-lg, 24px);
  padding: 1.3rem;
  color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(21, 66, 56, 0.2);
}

.fitness-banner-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.banner-tag {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-neon, #D4FF32);
}

.banner-quote {
  font-size: 1.05rem;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.35;
  margin: 0;
}

.btn-fitness-cta {
  align-self: flex-start;
  padding: 0.55rem 1.1rem;
  background: #FFFFFF;
  border: none;
  border-radius: 999px;
  color: var(--primary-forest, #154238);
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  margin-top: 0.3rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.15s;
}

.btn-fitness-cta:hover {
  background: var(--accent-neon, #D4FF32);
  color: var(--accent-neon-text, #0E251D);
  transform: translateY(-1px);
}

/* 7. Water Tracker Card */
.water-card-energetic {
  background: var(--surface-card, #FFFFFF);
  border-radius: var(--radius-lg, 24px);
  padding: 1.2rem;
  border: 1px solid var(--border-subtle, #E8ECE9);
  box-shadow: var(--shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04));
}

.water-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
}

.water-left-title {
  display: flex;
  align-items: center;
}

.water-sec-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main, #0F1E17);
  margin: 0;
}

.water-ml-sub {
  font-size: 0.72rem;
  color: #0284C7;
  font-weight: 700;
}

.water-stepper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-w-step {
  width: 28px;
  height: 28px;
  border: 1px solid #CBD5E1;
  background: #F8FAFC;
  color: #0F1E17;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
}

.w-badge {
  font-size: 0.82rem;
  font-weight: 800;
  color: #0284C7;
  min-width: 45px;
  text-align: center;
}

.water-segmented-bar {
  display: flex;
  gap: 6px;
  height: 12px;
}

.water-segment {
  flex: 1;
  background: #E8ECE9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.water-segment.filled {
  background: linear-gradient(90deg, #38BDF8, #0284C7);
  box-shadow: 0 0 8px rgba(2, 132, 199, 0.35);
}

/* Clear Confirmation Modal */
.confirm-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 30, 23, 0.7);
  backdrop-filter: blur(6px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.confirm-dialog-card {
  background: #FFFFFF;
  border-radius: 28px;
  width: 100%;
  max-width: 400px;
  padding: 1.6rem 1.4rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.confirm-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0F1E17;
  margin: 0 0 0.5rem;
}

.confirm-desc {
  font-size: 0.85rem;
  color: #52665C;
  line-height: 1.5;
  margin: 0 0 1.4rem;
}

.confirm-buttons-row {
  display: flex;
  gap: 0.6rem;
}

.btn-dialog-cancel {
  flex: 1;
  padding: 0.75rem;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.btn-dialog-confirm {
  flex: 1.4;
  padding: 0.75rem;
  background: #E11D48;
  border: none;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 800;
  color: #FFFFFF;
  cursor: pointer;
}
</style>
