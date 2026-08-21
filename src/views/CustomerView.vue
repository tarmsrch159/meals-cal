<template>
  <div class="customer-view">
    <!-- View Mode 1: Service Hub & Category Selection -->
    <div v-if="state.customerView === 'services'" class="services-hub">
      <div class="section-intro">
        <div class="intro-text">
          <h2 class="section-title">{{ t('servicesTitle') }}</h2>
          <p class="section-subtitle">{{ t('servicesSubtitle') }}</p>
        </div>

        <!-- Quick Active Dashboard Shortcut if booked -->
        <div v-if="activeBookedTarget" class="active-shortcut-pill" @click="state.customerView = 'dashboard'">
          <span class="pulse-green"></span>
          <span class="shortcut-text">กำลังรับบริการ: <strong>{{ activeBookedTarget.name }}</strong></span>
          <button class="btn btn-sm btn-primary">ดูแดชบอร์ดติดตาม</button>
        </div>
      </div>

      <!-- Service Selection Hero Cards (3 Columns on Desktop) -->
      <div class="service-cards-grid">
        <!-- Senior Care Card -->
        <div class="service-hero-card senior-hero" @click="selectServiceCategory('senior')">
          <img 
            src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=700&auto=format&fit=crop&q=80" 
            alt="Senior Care" 
            class="hero-img"
          />
          <div class="hero-overlay">
            <div class="hero-top-badge">
              <HeartPulse :size="14" />
              <span>พยาบาล & ผู้ดูแล</span>
            </div>
            <div class="hero-text-content">
              <h3 class="hero-title">{{ t('seniorCare') }}</h3>
              <p class="hero-desc">{{ t('seniorCareDesc') }}</p>
            </div>
            <div class="hero-cta">
              <span>เลือกบริการ</span>
              <ArrowRight :size="15" />
            </div>
          </div>
        </div>

        <!-- Child Care Card -->
        <div class="service-hero-card child-hero" @click="selectServiceCategory('child')">
          <img 
            src="https://images.unsplash.com/photo-1544126592-807ade215a0b?w=700&auto=format&fit=crop&q=80" 
            alt="Child Care" 
            class="hero-img"
          />
          <div class="hero-overlay">
            <div class="hero-top-badge badge-amber">
              <Baby :size="14" />
              <span>พี่เลี้ยงเด็ก & กล้องสด</span>
            </div>
            <div class="hero-text-content">
              <h3 class="hero-title">{{ t('childCare') }}</h3>
              <p class="hero-desc">{{ t('childCareDesc') }}</p>
            </div>
            <div class="hero-cta">
              <span>เลือกบริการ</span>
              <ArrowRight :size="15" />
            </div>
          </div>
        </div>

        <!-- Transit Service Card -->
        <div class="service-hero-card transit-hero" @click="selectServiceCategory('transit')">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&auto=format&fit=crop&q=80" 
            alt="Generations Transit" 
            class="hero-img"
          />
          <div class="hero-overlay">
            <div class="hero-top-badge badge-teal">
              <Car :size="14" />
              <span>รถรับส่ง & GPS</span>
            </div>
            <div class="hero-text-content">
              <h3 class="hero-title">{{ t('transitCare') }}</h3>
              <p class="hero-desc">{{ t('transitCareDesc') }}</p>
            </div>
            <div class="hero-cta">
              <span>เลือกบริการ</span>
              <ArrowRight :size="15" />
            </div>
          </div>
        </div>

        <!-- AI Personal Health Card -->
        <div class="service-hero-card health-hero" @click="goToAiHealth">
          <img 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&auto=format&fit=crop&q=80" 
            alt="AI Personal Health" 
            class="hero-img"
          />
          <div class="hero-overlay">
            <div class="hero-top-badge badge-cyan">
              <Sparkles :size="14" />
              <span>สแกนใบแล็บ & ปรึกษาหมอ AI</span>
            </div>
            <div class="hero-text-content">
              <h3 class="hero-title">{{ t('aiHealthCare') }}</h3>
              <p class="hero-desc">{{ t('aiHealthCareDesc') }}</p>
            </div>
            <div class="hero-cta">
              <span>เปิดแดชบอร์ด</span>
              <ArrowRight :size="15" />
            </div>
          </div>
        </div>
      </div>

      <!-- Nearby Caregivers Marketplace -->
      <div class="caregivers-section">
        <div class="section-header-row">
          <div>
            <h3 class="section-heading">{{ t('findCaregiver') }}</h3>
            <p class="section-subheading">ผู้ดูแลและคนขับที่ผ่านการตรวจสอบประวัติและมาตรฐานความปลอดภัย</p>
          </div>
          <div class="filter-pills">
            <button 
              v-for="cat in [
                { key: 'all', label: 'ทั้งหมด' },
                { key: 'senior', label: '👵 ดูแลผู้สูงอายุ' },
                { key: 'child', label: '👶 พี่เลี้ยงเด็ก' },
                { key: 'transit', label: '🚗 รถรับส่ง Transit' }
              ]"
              :key="cat.key"
              class="filter-pill"
              :class="{ active: activeFilter === cat.key }"
              @click="activeFilter = cat.key"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Responsive Caregivers Grid (1 column on mobile, 2-3 on desktop) -->
        <div class="caregiver-cards-list">
          <div 
            v-for="cg in filteredCaregivers" 
            :key="cg.id" 
            class="caregiver-card"
          >
            <div class="cg-top-row">
              <div class="cg-avatar-wrapper">
                <img :src="cg.avatar" :alt="cg.name" class="cg-avatar" />
                <span class="cg-online-dot"></span>
              </div>
              <div class="cg-info">
                <div class="cg-name-row">
                  <h4 class="cg-name">{{ cg.name }}</h4>
                  <span class="cg-rate-tag">฿{{ cg.rate }}/ชม.</span>
                </div>
                <p class="cg-role">{{ cg.role }}</p>
                <div class="cg-stats-row">
                  <div class="rating-box">
                    <Star :size="12" class="star-gold" fill="#F59E0B" />
                    <span>{{ cg.rating }}</span>
                    <span class="rev-count">({{ cg.reviews }})</span>
                  </div>
                  <span class="cg-badge-pill">{{ cg.badge }}</span>
                </div>
              </div>
            </div>

            <div class="cg-skills">
              <span v-for="s in cg.skills" :key="s" class="skill-tag">✓ {{ s }}</span>
            </div>

            <div class="cg-actions-row">
              <span class="cg-exp">{{ cg.experience }}</span>
              <button class="btn btn-sm btn-primary" @click="openBookingModal(cg)">
                <CalendarCheck :size="14" />
                <span>{{ t('bookNow') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode 2: Active Care Dashboard (Responsive 2-Column Web App Layout on Desktop) -->
    <div v-else class="active-dashboard">
      <!-- Dashboard Top Header Bar -->
      <div class="dashboard-header-bar">
        <button class="btn-back-link" @click="state.customerView = 'services'">
          <ArrowLeft :size="16" />
          <span>{{ t('servicesTitle') }}</span>
        </button>

        <!-- Category switch pills -->
        <div class="category-switch-group">
          <button 
            class="cat-tab" 
            :class="{ active: state.activeTab === 'senior' }"
            @click="state.activeTab = 'senior'"
          >
            👵 ผู้สูงอายุ
          </button>
          <button 
            class="cat-tab" 
            :class="{ active: state.activeTab === 'child' }"
            @click="state.activeTab = 'child'"
          >
            👶 ดูแลเด็ก
          </button>
          <button 
            class="cat-tab" 
            :class="{ active: state.activeTab === 'transit' }"
            @click="state.activeTab = 'transit'"
          >
            🚗 รถรับส่ง
          </button>
        </div>
      </div>

      <!-- Desktop 2-Column Layout -->
      <div class="desktop-dashboard-layout">
        <!-- Left Main Column: Live Tracking & Visual Feeds -->
        <div class="dashboard-main-col">
          <!-- Active Booking Banner -->
          <div class="glass-card active-caregiver-banner" :class="'banner-' + state.activeTab">
            <div class="banner-badge">
              <span class="pulse-dot-white"></span>
              <span>{{ t('activeBookingBanner') }} ({{ state.activeTab === 'child' ? 'พี่เลี้ยงเด็ก' : (state.activeTab === 'transit' ? 'รถรับส่ง' : 'ผู้ดูแลผู้สูงอายุ') }})</span>
            </div>
            
            <div class="banner-content">
              <div class="caregiver-quick-info">
                <img :src="currentCaregiver.avatar" :alt="currentCaregiver.name" class="banner-avatar" />
                <div>
                  <h3 class="banner-name">{{ currentCaregiver.name }}</h3>
                  <p class="banner-sub">{{ currentCaregiver.role }} • ฿{{ currentCaregiver.rate }} บาท/ชม.</p>
                </div>
              </div>

              <div class="banner-btn-group">
                <a :href="'tel:' + currentCaregiver.phone" class="banner-call-btn" @click.prevent="handleCallCaregiver">
                  <Phone :size="14" />
                  <span>โทรด่วน</span>
                </a>
                <button class="banner-cancel-btn" @click="handleCancelService">
                  <XCircle :size="14" />
                  <span>เปลี่ยน</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 1. Real-time GPS Tracker & Route -->
          <div id="map-section" class="glass-card">
            <div class="card-title-row">
              <h3 class="card-title">
                <Navigation :size="16" class="title-icon" />
                <span>{{ t('gpsTrackerTitle') }}</span>
              </h3>
              <span class="badge badge-success">GPS สด Real-time</span>
            </div>
            <LeafletMap />
          </div>

          <!-- 2. If Child Care: Live Nanny Camera -->
          <div v-if="state.activeTab === 'child'" class="glass-card glass-card-child">
            <div class="card-title-row">
              <h3 class="card-title">
                <Video :size="16" class="title-icon" />
                <span>{{ t('nannyCamTitle') }}</span>
              </h3>
            </div>
            <LiveCameraView />
          </div>

          <!-- 3. If Senior Care: Latest Doctor Visit Report (Redesigned with High Readability & Clean Spacing) -->
          <div v-if="state.activeTab === 'senior'" class="glass-card glass-card-senior">
            <div class="card-title-row">
              <div class="report-heading-wrap">
                <div class="report-icon-box">
                  <Hospital :size="18" />
                </div>
                <div>
                  <h3 class="card-title">{{ t('docReportTitle') }}</h3>
                  <span class="report-subtitle">ข้อมูลอัปเดตจากแพทย์และการปรับขนาดยา</span>
                </div>
              </div>
              <span class="report-date-badge">{{ state.doctorReport.date }}</span>
            </div>

            <!-- Structured Clean Doctor Report Sections -->
            <div class="doc-report-structured-list">
              <!-- Hospital & Clinic -->
              <div class="doc-section-card">
                <div class="doc-sec-header">
                  <Hospital :size="15" class="doc-sec-icon text-cyan" />
                  <span class="doc-sec-label">{{ t('hospitalName') }}</span>
                </div>
                <div class="doc-sec-body font-bold text-main">
                  {{ state.doctorReport.hospital }}
                </div>
              </div>

              <!-- Doctor Diagnosis -->
              <div class="doc-section-card">
                <div class="doc-sec-header">
                  <Stethoscope :size="15" class="doc-sec-icon text-blue" />
                  <span class="doc-sec-label">{{ t('diagnosis') }}</span>
                </div>
                <div class="doc-sec-body text-body">
                  {{ state.doctorReport.diagnosis }}
                </div>
              </div>

              <!-- Medication Changes (Highlighted) -->
              <div class="doc-section-card med-highlight-card">
                <div class="doc-sec-header">
                  <Pill :size="15" class="doc-sec-icon text-amber" />
                  <span class="doc-sec-label text-amber-dark">{{ t('medUpdate') }}</span>
                  <span class="med-alert-pill">สำคัญ</span>
                </div>
                <div class="doc-sec-body med-body-text">
                  {{ state.doctorReport.medChanges }}
                </div>
              </div>

              <!-- Next Appointment & Expenses -->
              <div class="doc-bottom-grid">
                <div class="doc-mini-card">
                  <div class="mini-card-header">
                    <Calendar :size="14" class="text-blue" />
                    <span>{{ t('nextAppt') }}</span>
                  </div>
                  <div class="mini-card-val">{{ state.doctorReport.nextAppt }}</div>
                </div>

                <div class="doc-mini-card">
                  <div class="mini-card-header">
                    <Receipt :size="14" class="text-green" />
                    <span>{{ t('expenses') }}</span>
                  </div>
                  <div class="mini-card-val text-green-dark">{{ state.doctorReport.expenses }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side Column: Checklist, Live Chat & SOS -->
        <div class="dashboard-side-col">
          <!-- Daily Care Checklist -->
          <div id="checklist-section" class="glass-card">
            <div class="card-title-row">
              <div class="checklist-heading-wrap">
                <h3 class="card-title">
                  <ClipboardCheck :size="17" class="title-icon" />
                  <span>{{ t('dailyCareList') }}</span>
                </h3>
                <div class="progress-pill">
                  <span class="progress-pct">{{ progressPercent }}% {{ t('completed') }}</span>
                </div>
              </div>
              <button class="btn btn-sm btn-primary btn-add-task-header" @click="state.showAddModal = true">
                <Plus :size="14" />
                <span>เพิ่มรายการ</span>
              </button>
            </div>

            <!-- Progress Bar -->
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>

            <!-- Checklist items -->
            <div class="checklist-container">
              <div 
                v-for="item in sortedChecklist" 
                :key="item.id" 
                class="checklist-item"
                :class="{ checked: item.done }"
                @click="toggleTask(item.id)"
              >
                <div class="checklist-left">
                  <div class="custom-checkbox">
                    <Check v-if="item.done" :size="14" />
                  </div>
                  <div class="checklist-info">
                    <span class="checklist-title">{{ item.text }}</span>
                    <span class="checklist-time">🕒 {{ item.time }} น.</span>
                  </div>
                </div>
                <button class="btn-delete" @click.stop="deleteTask(item.id)" title="ลบรายการ">
                  <Trash2 :size="15" />
                </button>
              </div>
            </div>
          </div>

          <!-- In-app Live Chat with Caregiver -->
          <div id="chat-section" class="glass-card">
            <div class="card-title-row">
              <h3 class="card-title">
                <MessageSquare :size="16" class="title-icon" />
                <span>{{ t('liveChat') }} ({{ currentCaregiver.name }})</span>
              </h3>
              <span class="chat-online-badge">🟢 ออนไลน์</span>
            </div>

            <!-- Chat Stream -->
            <div class="chat-stream-box custom-scroll" ref="chatBoxRef">
              <div 
                v-for="msg in state.chatMessages" 
                :key="msg.id" 
                class="chat-bubble-wrap"
                :class="msg.sender === 'customer' ? 'bubble-right' : 'bubble-left'"
              >
                <div class="chat-sender-name">{{ msg.senderName }}</div>
                <div class="chat-bubble">
                  <p class="chat-text">{{ msg.text }}</p>
                  <span class="chat-time">{{ msg.time }}</span>
                </div>
              </div>
            </div>

            <!-- Quick Reply Chips -->
            <div class="quick-reply-chips">
              <button 
                v-for="phrase in ['ขอบคุณมากครับ', 'ทานยาเรียบร้อยไหมครับ', 'ฝากดูแลเรื่องน้ำดื่มด้วยครับ', 'กำลังกลับถึงบ้านครับ']"
                :key="phrase"
                class="reply-chip"
                @click="quickSend(phrase)"
              >
                {{ phrase }}
              </button>
            </div>

            <!-- Chat Input Bar -->
            <div class="chat-input-bar">
              <input 
                type="text" 
                v-model="newChatText" 
                class="form-input chat-input" 
                :placeholder="t('chatPlaceholder')"
                @keydown.enter="handleSendChat"
              />
              <button class="btn btn-primary btn-send" @click="handleSendChat">
                <Send :size="15" />
              </button>
            </div>
          </div>

          <!-- 24/7 SOS Emergency Button Card -->
          <div class="glass-card sos-quick-card">
            <div class="sos-card-content">
              <div class="sos-icon-wrap">
                <AlertTriangle :size="24" />
              </div>
              <div class="sos-text-wrap">
                <h4 class="sos-card-title">ขอความช่วยเหลือฉุกเฉิน 24 ชม.</h4>
                <p class="sos-card-desc">โทรสายด่วนกู้ชีพ 1669 หรือแชร์พิกัด GPS อัตโนมัติ</p>
              </div>
            </div>
            <button class="btn btn-sos btn-desktop-sos" @click="state.showSosModal = true">
              <AlertTriangle :size="18" />
              <span>{{ t('sosBtnText') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { store } from '../stores/useAppStore.js';
import LeafletMap from '../components/LeafletMap.vue';
import LiveCameraView from '../components/LiveCameraView.vue';
import { 
  HeartPulse, 
  Baby, 
  Car, 
  ArrowRight, 
  ArrowLeft, 
  Star, 
  CalendarCheck, 
  Navigation, 
  Video, 
  Hospital, 
  Stethoscope,
  Pill,
  Calendar,
  Receipt,
  ClipboardCheck, 
  Plus, 
  Check, 
  Trash2, 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  Phone, 
  XCircle,
  Sparkles,
  Activity
} from 'lucide-vue-next';

const { state, t, showToast, toggleTask, deleteTask, sendChatMessage, cancelBooking } = store;

const activeFilter = ref('all');
const newChatText = ref('');
const chatBoxRef = ref(null);

const activeBookedTarget = computed(() => {
  if (state.activeTab === 'child') return state.bookedNanny || state.caregivers[3];
  if (state.activeTab === 'transit') return state.bookedDriver || state.caregivers[2];
  return state.bookedCaregiver || state.caregivers[0];
});

const currentCaregiver = computed(() => activeBookedTarget.value);

const filteredCaregivers = computed(() => {
  if (activeFilter.value === 'all') return state.caregivers;
  return state.caregivers.filter(c => c.category === activeFilter.value);
});

const sortedChecklist = computed(() => {
  return [...state.checklist].sort((a, b) => a.time.localeCompare(b.time));
});

const progressPercent = computed(() => {
  if (state.checklist.length === 0) return 0;
  const done = state.checklist.filter(c => c.done).length;
  return Math.round((done / state.checklist.length) * 100);
});

const selectServiceCategory = (cat) => {
  state.activeTab = cat;
  state.customerView = 'dashboard';
};

const goToAiHealth = () => {
  state.customerView = 'ai-health';
  state.bottomNavTab = 'health';
};

const openBookingModal = (caregiver) => {
  state.bookingTarget = caregiver;
};

const handleSendChat = () => {
  if (!newChatText.value.trim()) return;
  sendChatMessage(newChatText.value, 'customer');
  newChatText.value = '';
  scrollToChatBottom();
};

const quickSend = (phrase) => {
  sendChatMessage(phrase, 'customer');
  scrollToChatBottom();
};

const scrollToChatBottom = () => {
  nextTick(() => {
    if (chatBoxRef.value) {
      chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
    }
  });
};

const handleCallCaregiver = () => {
  showToast(`📞 กำลังโทรออกหา ${currentCaregiver.value.name}...`, 'info');
};

const handleCancelService = () => {
  cancelBooking(state.activeTab);
  state.customerView = 'services';
};
</script>

<style scoped>
.customer-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-intro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--primary-900);
}

.section-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.active-shortcut-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #F0FDF4;
  border: 1.5px solid #86EFAC;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  cursor: pointer;
  box-shadow: var(--shadow-xs);
}

.pulse-green {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.shortcut-text {
  font-size: 0.78rem;
  color: #166534;
}

/* Service Hero Cards Grid */
.service-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .service-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .service-cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.service-hero-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 180px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
}

.service-hero-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(15, 23, 42, 0.88) 100%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #FFFFFF;
}

.hero-top-badge {
  align-self: flex-start;
  background: rgba(0, 180, 216, 0.9);
  backdrop-filter: blur(8px);
  padding: 3px 9px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
}

.badge-amber {
  background: rgba(245, 158, 11, 0.95);
}

.badge-teal {
  background: rgba(13, 148, 136, 0.95);
}

.badge-cyan {
  background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%);
  box-shadow: 0 2px 8px rgba(0, 180, 216, 0.4);
}

.hero-title {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}

.hero-desc {
  font-size: 0.75rem;
  opacity: 0.9;
  margin-top: 3px;
}

.hero-cta {
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #67E8F9;
}

/* Caregivers marketplace */
.caregivers-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.section-heading {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--primary-900);
}

.section-subheading {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.filter-pills {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.filter-pill {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: #FFFFFF;
  border: 1px solid var(--primary-200);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-fast);
}

.filter-pill.active {
  background: var(--primary-500);
  color: #FFFFFF;
  border-color: var(--primary-500);
  box-shadow: var(--shadow-xs);
}

.caregiver-cards-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 640px) {
  .caregiver-cards-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .caregiver-cards-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.caregiver-card {
  background: #FFFFFF;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--primary-100);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: var(--transition-smooth);
}

.caregiver-card:hover {
  border-color: var(--primary-400);
  box-shadow: var(--shadow-md);
}

.cg-top-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cg-avatar-wrapper {
  position: relative;
  width: 54px;
  height: 54px;
  flex-shrink: 0;
}

.cg-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-300);
}

.cg-online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10B981;
  border: 2px solid #FFFFFF;
}

.cg-info {
  flex: 1;
}

.cg-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cg-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--primary-900);
}

.cg-rate-tag {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--primary-700);
  background: var(--primary-50);
  padding: 2px 8px;
  border-radius: 6px;
}

.cg-role {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.cg-stats-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 3px;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-main);
}

.star-gold {
  color: #F59E0B;
}

.rev-count {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.cg-badge-pill {
  background: #F0FDF4;
  color: #166534;
  border: 1px solid #BBF7D0;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-size: 0.65rem;
  font-weight: 700;
}

.cg-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-tag {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  padding: 3px 7px;
  border-radius: 5px;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.cg-actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #F1F5F9;
  padding-top: 10px;
}

.cg-exp {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* Dashboard View Mode */
.active-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.btn-back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FFFFFF;
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-full);
  padding: 7px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary-800);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-back-link:hover {
  background: var(--primary-50);
}

.category-switch-group {
  display: flex;
  background: #E2E8F0;
  border-radius: var(--radius-full);
  padding: 3px;
}

.cat-tab {
  border: none;
  background: none;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
}

.cat-tab.active {
  background: #FFFFFF;
  color: var(--primary-900);
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Dashboard 2-Column Responsive Layout */
.dashboard-main-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-side-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Active Caregiver Banner */
.active-caregiver-banner {
  color: #FFFFFF;
  background: var(--grad-primary);
}

.banner-child {
  background: var(--grad-child);
}

.banner-transit {
  background: var(--grad-transit);
}

.banner-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.pulse-dot-white {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.caregiver-quick-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.banner-name {
  font-size: 1.05rem;
  font-weight: 700;
}

.banner-sub {
  font-size: 0.75rem;
  opacity: 0.9;
}

.banner-btn-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.banner-call-btn {
  background: #FFFFFF;
  color: var(--primary-800);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.banner-cancel-btn {
  background: rgba(0, 0, 0, 0.25);
  border: none;
  color: #FFFFFF;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.68rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Card titles */
.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.card-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--primary-900);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: var(--primary-600);
}

/* Redesigned Doctor Report Styles (High Readability & Proper Line Spacing) */
.report-heading-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.report-subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
  display: block;
}

.report-date-badge {
  background: #E0F2FE;
  color: #0369A1;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
}

.doc-report-structured-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doc-section-card {
  background: #FFFFFF;
  border: 1px solid rgba(0, 180, 216, 0.15);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.doc-sec-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.doc-sec-icon {
  flex-shrink: 0;
}

.text-cyan {
  color: #00B4D8;
}

.text-blue {
  color: #0284C7;
}

.text-amber {
  color: #D97706;
}

.text-amber-dark {
  color: #92400E;
}

.text-green {
  color: #059669;
}

.text-green-dark {
  color: #065F46;
}

.doc-sec-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.doc-sec-body {
  font-size: 0.85rem;
  line-height: 1.55;
  padding-left: 21px;
}

.font-bold {
  font-weight: 700;
}

.text-main {
  color: var(--text-main);
}

.text-body {
  color: #334155;
}

.med-highlight-card {
  background: #FFFBEB;
  border: 1.5px solid #FDE68A;
}

.med-alert-pill {
  background: #FEF3C7;
  color: #B45309;
  border: 1px solid #FCD34D;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  margin-left: auto;
}

.med-body-text {
  color: #92400E;
  font-weight: 600;
  background: #FFFFFF;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #F59E0B;
  margin-left: 21px;
}

.doc-bottom-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 540px) {
  .doc-bottom-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.doc-mini-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-card-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
}

.mini-card-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
  padding-left: 19px;
}

/* Checklist Styling */
.checklist-heading-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.progress-pill {
  background: var(--primary-100);
  color: var(--primary-800);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
}

.btn-add-task-header {
  padding: 6px 14px;
  font-size: 0.78rem;
}

.progress-track {
  height: 8px;
  background: #E2E8F0;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 14px;
}

.progress-fill {
  height: 100%;
  background: var(--grad-primary);
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.checklist-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.checklist-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
}

.checklist-time {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
}

.btn-delete {
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.btn-delete:hover {
  color: #EF4444;
  background: #FEE2E2;
}

/* Chat Styling */
.chat-online-badge {
  font-size: 0.72rem;
  color: #10B981;
  font-weight: 700;
  background: #ECFDF5;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.chat-stream-box {
  background: #F8FAFC;
  border: 1px solid var(--primary-100);
  border-radius: var(--radius-sm);
  padding: 12px;
  height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
}

.chat-bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.bubble-right {
  align-self: flex-end;
  align-items: flex-end;
}

.bubble-left {
  align-self: flex-start;
  align-items: flex-start;
}

.chat-sender-name {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-bottom: 3px;
}

.chat-bubble {
  padding: 9px 13px;
  border-radius: 14px;
  font-size: 0.82rem;
  line-height: 1.45;
  box-shadow: var(--shadow-xs);
}

.bubble-right .chat-bubble {
  background: var(--grad-primary);
  color: #FFFFFF;
  border-bottom-right-radius: 2px;
}

.bubble-left .chat-bubble {
  background: #FFFFFF;
  color: var(--text-main);
  border: 1px solid #E2E8F0;
  border-bottom-left-radius: 2px;
}

.chat-time {
  display: block;
  font-size: 0.62rem;
  opacity: 0.8;
  text-align: right;
  margin-top: 3px;
}

.quick-reply-chips {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 6px;
}

.reply-chip {
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-full);
  padding: 5px 12px;
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
  cursor: pointer;
}

.reply-chip:hover {
  background: var(--primary-100);
  color: var(--primary-800);
}

.chat-input-bar {
  display: flex;
  gap: 8px;
}

.chat-input {
  margin-bottom: 0;
  padding: 10px 14px;
}

.btn-send {
  padding: 0 16px;
}

/* SOS Quick Card */
.sos-quick-card {
  background: linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%);
  border: 1.5px solid #FECDD3;
}

.sos-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.sos-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #EF4444;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sos-card-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #991B1B;
}

.sos-card-desc {
  font-size: 0.75rem;
  color: #B91C1C;
}

.btn-desktop-sos {
  width: 100%;
  padding: 12px;
  font-size: 0.92rem;
}
</style>
