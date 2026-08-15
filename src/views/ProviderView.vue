<template>
  <div class="provider-view">
    <!-- Desktop Responsive Grid Layout -->
    <div class="provider-desktop-layout">
      <!-- Left Column: Availability, Earnings & Incoming Jobs -->
      <div class="provider-left-col">
        <!-- 1. Availability Status Bar -->
        <div class="glass-card status-card">
          <div class="status-left">
            <div class="status-dot-wrap">
              <span :class="state.isOnline ? 'pulse-online' : 'dot-offline'"></span>
            </div>
            <div>
              <h3 class="status-heading">{{ state.isOnline ? t('online') : t('offline') }}</h3>
              <p class="status-desc">{{ state.isOnline ? 'ระบบพร้อมรับและจับคู่งานอัตโนมัติ' : 'กดเปิดออนไลน์เพื่อเริ่มรับงาน' }}</p>
            </div>
          </div>
          <button 
            class="btn btn-sm" 
            :class="state.isOnline ? 'btn-secondary' : 'btn-primary'"
            @click="toggleAvailability"
          >
            <Power :size="14" />
            <span>{{ state.isOnline ? 'สลับเป็น Offline' : 'เปิดสถานะ Online' }}</span>
          </button>
        </div>

        <!-- 2. Daily Earnings & Performance Stats -->
        <div class="glass-card earnings-hero">
          <div class="earnings-header">
            <div class="earnings-label-wrap">
              <Wallet :size="18" />
              <span>{{ t('todayEarnings') }}</span>
            </div>
            <span class="payout-badge">โอนเงินเข้าบัญชีอัตโนมัติ</span>
          </div>
          <div class="earnings-amount">฿{{ state.providerEarnings.toLocaleString() }}.00</div>
          
          <div class="stats-row-grid">
            <div class="stat-box">
              <span class="stat-num">{{ state.providerJobsCount }}</span>
              <span class="stat-lbl">{{ t('completedJobsToday') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <span class="stat-num text-amber">★ 4.95</span>
              <span class="stat-lbl">{{ t('ratingScore') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <span class="stat-num text-green">100%</span>
              <span class="stat-lbl">อัตราความตรงเวลา</span>
            </div>
          </div>
        </div>

        <!-- 3. Incoming Job Requests Queue -->
        <div class="incoming-section">
          <div class="section-title-row">
            <h3 class="section-title">
              <Inbox :size="18" class="title-icon" />
              <span>{{ t('incomingJobs') }} ({{ state.incomingJobs.length }} งานใหม่)</span>
            </h3>
            <span class="badge badge-warning">เร่งด่วน</span>
          </div>

          <div class="jobs-list">
            <div 
              v-for="job in state.incomingJobs" 
              :key="job.id" 
              class="job-card"
              :class="{ 'urgent-card': job.urgent }"
            >
              <div class="job-card-header">
                <div class="job-type-pill" :class="'pill-' + job.type">
                  {{ job.type === 'child' ? '👶 ดูแลเด็ก' : (job.type === 'transit' ? '🚗 รถรับส่ง' : '👵 ผู้สูงอายุ') }}
                </div>
                <div class="job-payout-pill">฿{{ job.payout }} ({{ job.duration }})</div>
              </div>

              <h4 class="job-title">{{ job.title }}</h4>
              
              <div class="job-meta-list">
                <div class="job-meta-item">
                  <User :size="14" />
                  <span>ผู้ว่าจ้าง: <strong>{{ job.clientName }}</strong></span>
                </div>
                <div class="job-meta-item">
                  <MapPin :size="14" />
                  <span>{{ job.location }}</span>
                </div>
              </div>

              <div class="job-card-actions">
                <button class="btn btn-sm btn-secondary btn-decline" @click="declineJob(job.id)">
                  <X :size="14" />
                  <span>{{ t('declineJob') }}</span>
                </button>
                <button class="btn btn-sm btn-primary btn-accept" @click="acceptJob(job)">
                  <Check :size="14" />
                  <span>{{ t('acceptJob') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Active Duty Workplace / Health, Checklist & Messenger Chat -->
      <div class="provider-right-col">
        <!-- Active Job Card (if on duty) or Ready Guide -->
        <div v-if="state.acceptedJob" class="glass-card active-job-banner">
          <div class="duty-badge">
            <span class="pulse-duty"></span>
            <span>{{ t('activeJobTitle') }}</span>
          </div>

          <div class="duty-content">
            <div>
              <h3 class="duty-title">{{ state.acceptedJob.title }}</h3>
              <p class="duty-client">ผู้ว่าจ้าง: {{ state.acceptedJob.clientName }} • {{ state.acceptedJob.clientPhone }}</p>
            </div>
            <a :href="'tel:' + state.acceptedJob.clientPhone" class="btn btn-sm btn-call" @click="handleCallClient">
              <Phone :size="14" />
              <span>โทรหาลูกค้า</span>
            </a>
          </div>
        </div>

        <div v-else class="glass-card ready-guide-card">
          <div class="guide-icon">
            <Sparkles :size="24" />
          </div>
          <h3 class="guide-title">พร้อมรับงานบริการ</h3>
          <p class="guide-desc">เมื่อกดรับงานจากรายการด้านซ้าย คุณสามารถใช้เครื่องมือบันทึกสุขภาพ สัญญาณชีพ และรายงานแพทย์ได้ที่นี่</p>
        </div>

        <!-- Health & Vitals Logging Tools -->
        <div class="glass-card">
          <div class="log-tabs-nav">
            <button 
              class="log-tab-btn" 
              :class="{ active: state.logTab === 'vitals' }"
              @click="state.logTab = 'vitals'"
            >
              🩺 สัญญาณชีพ & สุขภาพ
            </button>
            <button 
              class="log-tab-btn" 
              :class="{ active: state.logTab === 'doctor' }"
              @click="state.logTab = 'doctor'"
            >
              🏥 รายงานพบแพทย์
            </button>
            <button 
              class="log-tab-btn" 
              :class="{ active: state.logTab === 'child' }"
              @click="state.logTab = 'child'"
            >
              🍼 กิจกรรม/การดื่มนม
            </button>
          </div>

          <!-- Tool 1: Vitals Logger -->
          <div v-if="state.logTab === 'vitals'" class="log-form-panel">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">{{ t('bloodPressure') }}</label>
                <input type="text" v-model="vitalsForm.bp" class="form-input" placeholder="เช่น 120/80" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('bloodSugar') }}</label>
                <input type="text" v-model="vitalsForm.sugar" class="form-input" placeholder="เช่น 105" />
              </div>
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">{{ t('heartRate') }}</label>
                <input type="text" v-model="vitalsForm.hr" class="form-input" placeholder="เช่น 74 bpm" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('temp') }}</label>
                <input type="text" v-model="vitalsForm.temp" class="form-input" placeholder="เช่น 36.6 °C" />
              </div>
            </div>
            <button class="btn btn-primary btn-submit-log" @click="handleSubmitVitals">
              <Activity :size="16" />
              <span>{{ t('submitVitals') }}</span>
            </button>
          </div>

          <!-- Tool 2: Doctor Report Submitter -->
          <div v-else-if="state.logTab === 'doctor'" class="log-form-panel">
            <div class="form-group">
              <label class="form-label">{{ t('hospitalName') }}</label>
              <input type="text" v-model="docForm.hospital" class="form-input" placeholder="เช่น รพ.รามาธิบดี แผนกหัวใจ" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('diagnosis') }}</label>
              <textarea v-model="docForm.diagnosis" class="form-textarea" rows="2" placeholder="คำวินิจฉัยและคำแนะนำแพทย์..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('medUpdate') }}</label>
              <input type="text" v-model="docForm.medChanges" class="form-input" placeholder="เช่น เพิ่มยาบำรุง 1 เม็ดก่อนนอน" />
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">{{ t('nextAppt') }}</label>
                <input type="text" v-model="docForm.nextAppt" class="form-input" placeholder="15 ก.ย. 09:00" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('expenses') }}</label>
                <input type="text" v-model="docForm.expenses" class="form-input" placeholder="1,200 บาท" />
              </div>
            </div>
            <button class="btn btn-primary btn-submit-log" @click="handleSubmitDoctor">
              <FileCheck :size="16" />
              <span>ส่งรายงานพบแพทย์ให้ญาติ</span>
            </button>
          </div>

          <!-- Tool 3: Child Activity Logger -->
          <div v-else class="log-form-panel">
            <div class="form-group">
              <label class="form-label">ประเภทกิจกรรม</label>
              <select v-model="childForm.type" class="form-select">
                <option value="milk">🍼 ป้อนนม / อาหาร</option>
                <option value="sleep">😴 นอนกลางวัน / พักผ่อน</option>
                <option value="diaper">🧷 เปลี่ยนผ้าอ้อม</option>
                <option value="activity">🎨 เล่นกิจกรรมส่งเสริมทักษะ</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">รายละเอียด</label>
              <input type="text" v-model="childForm.detail" class="form-input" placeholder="เช่น ชงนม 4 ออนซ์ ดื่มหมดขวด อารมณ์ดี" />
            </div>
            <button class="btn btn-child btn-submit-log" @click="handleSubmitChildLog">
              <Baby :size="16" />
              <span>{{ t('submitChildLog') }}</span>
            </button>
          </div>
        </div>

        <!-- Shared Daily Care Checklist (Clean spacing & icons) -->
        <div id="care-section" class="glass-card">
          <div class="card-title-row">
            <h3 class="card-title">
              <ClipboardList :size="17" class="title-icon" />
              <span>{{ t('dailyCareList') }} (ติ๊กเมื่อทำเสร็จ)</span>
            </h3>
            <span class="badge badge-primary">{{ completedCount }}/{{ state.checklist.length }} เสร็จ</span>
          </div>

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
                  <div class="checklist-time-row">
                    <Clock :size="12" class="clock-icon" />
                    <span>{{ item.time }} น.</span>
                  </div>
                </div>
              </div>
              <span class="status-tag" :class="item.done ? 'tag-done' : 'tag-pending'">
                {{ item.done ? 'เสร็จแล้ว' : 'รอดำเนินการ' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 4. Real-time Messenger Chat with Customer (Complete Redesign) -->
        <div id="chat-section" class="glass-card chat-card-container">
          <div class="chat-room-header">
            <div class="chat-user-info">
              <div class="chat-avatar-wrap">
                <User :size="18" />
                <span class="avatar-online-dot"></span>
              </div>
              <div>
                <h3 class="chat-room-title">
                  {{ state.acceptedJob ? state.acceptedJob.clientName : 'คุณศรัณย์ (ผู้ว่าจ้าง)' }}
                </h3>
                <span class="chat-room-status">🟢 กำลังสนทนาแบบเรียลไทม์</span>
              </div>
            </div>

            <a 
              :href="'tel:' + (state.acceptedJob ? state.acceptedJob.clientPhone : '0812345678')" 
              class="chat-header-call-btn" 
              @click="handleCallClient"
            >
              <Phone :size="13" />
              <span>โทรหาลูกค้า</span>
            </a>
          </div>

          <!-- Chat Messages Stream -->
          <div class="chat-stream-box custom-scroll" ref="providerChatRef">
            <div class="chat-date-separator">
              <span>💬 สนทนาการดูแลประจำวัน</span>
            </div>

            <div 
              v-for="msg in state.chatMessages" 
              :key="msg.id" 
              class="chat-bubble-row"
              :class="msg.sender === 'provider' ? 'row-outgoing' : 'row-incoming'"
            >
              <!-- Incoming avatar (Client) -->
              <div v-if="msg.sender !== 'provider'" class="msg-avatar-icon">
                <User :size="14" />
              </div>

              <div class="bubble-content-wrap">
                <span class="sender-label">{{ msg.senderName }}</span>
                <div class="message-bubble">
                  <p class="bubble-text">{{ msg.text }}</p>
                  <span class="bubble-timestamp">{{ msg.time }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Reply Chips for Caregivers -->
          <div class="quick-reply-bar">
            <span class="quick-hint">ข้อความด่วน:</span>
            <div class="reply-chips-scroll">
              <button 
                v-for="phrase in [
                  '✓ รับทราบครับ/ค่ะ', 
                  '💊 ให้ยาเช้าเรียบร้อยแล้วครับ', 
                  '🩺 วัดความดันปกติครับ', 
                  '🍲 ทานอาหารมื้อนี้เรียบร้อยครับ', 
                  '😴 กำลังพาพักผ่อนครับ'
                ]"
                :key="phrase"
                class="reply-chip"
                @click="quickSend(phrase)"
              >
                {{ phrase }}
              </button>
            </div>
          </div>

          <!-- Chat Input Bar -->
          <div class="chat-input-row">
            <input 
              type="text" 
              v-model="providerMsgInput" 
              class="form-input provider-chat-input" 
              placeholder="พิมพ์ข้อความตอบกลับลูกค้า..."
              @keydown.enter="handleProviderSend"
            />
            <button class="btn btn-primary btn-chat-send" @click="handleProviderSend" :disabled="!providerMsgInput.trim()">
              <Send :size="15" />
            </button>
          </div>
        </div>

        <!-- Final Complete Job Button (If active job exists) -->
        <button v-if="state.acceptedJob" class="btn btn-success btn-finish-job" @click="handleCompleteJob">
          <CheckCircle2 :size="20" />
          <span>{{ t('completeJobBtn') }} (รับค่าจ้าง ฿{{ state.acceptedJob.payout }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { store } from '../stores/useAppStore.js';
import { 
  Power, 
  Wallet, 
  Inbox, 
  User, 
  MapPin, 
  X, 
  Check, 
  Phone, 
  Activity, 
  FileCheck, 
  Baby, 
  ClipboardList, 
  Send, 
  CheckCircle2,
  Sparkles,
  Clock 
} from 'lucide-vue-next';

const { 
  state, 
  t, 
  showToast, 
  toggleTask, 
  sendChatMessage, 
  acceptJob, 
  completeJob, 
  logVitals, 
  logDoctorReport, 
  logChildActivity 
} = store;

const providerMsgInput = ref('');
const providerChatRef = ref(null);

const vitalsForm = ref({
  bp: '122/80',
  sugar: '105',
  hr: '74',
  temp: '36.6'
});

const docForm = ref({
  hospital: state.doctorReport.hospital,
  diagnosis: state.doctorReport.diagnosis,
  medChanges: state.doctorReport.medChanges,
  nextAppt: state.doctorReport.nextAppt,
  expenses: state.doctorReport.expenses
});

const childForm = ref({
  type: 'milk',
  detail: 'ชงนม 4 ออนซ์ ดื่มหมดขวด อารมณ์ดี'
});

const sortedChecklist = computed(() => {
  return [...state.checklist].sort((a, b) => a.time.localeCompare(b.time));
});

const completedCount = computed(() => {
  return state.checklist.filter(c => c.done).length;
});

const toggleAvailability = () => {
  state.isOnline = !state.isOnline;
  showToast(state.isOnline ? '🟢 สลับเป็นสถานะ: พร้อมรับงาน (Online)' : '🔴 สลับเป็นสถานะ: ปิดรับงาน (Offline)', 'info');
};

const declineJob = (jobId) => {
  state.incomingJobs = state.incomingJobs.filter(j => j.id !== jobId);
  showToast('ข้ามงานนี้เรียบร้อยแล้ว', 'info');
};

const handleSubmitVitals = () => {
  logVitals(vitalsForm.value.bp, vitalsForm.value.sugar, vitalsForm.value.hr, vitalsForm.value.temp);
};

const handleSubmitDoctor = () => {
  logDoctorReport(docForm.value);
};

const handleSubmitChildLog = () => {
  logChildActivity(childForm.value.type, childForm.value.detail);
};

const handleProviderSend = () => {
  if (!providerMsgInput.value.trim()) return;
  sendChatMessage(providerMsgInput.value, 'provider');
  providerMsgInput.value = '';
  scrollToChatBottom();
};

const quickSend = (phrase) => {
  sendChatMessage(phrase, 'provider');
  scrollToChatBottom();
};

const scrollToChatBottom = () => {
  nextTick(() => {
    if (providerChatRef.value) {
      providerChatRef.value.scrollTop = providerChatRef.value.scrollHeight;
    }
  });
};

const handleCallClient = () => {
  showToast(`📞 กำลังโทรออกหาลูกค้า (${state.acceptedJob?.clientName || 'คุณศรัณย์'})...`, 'info');
};

const handleCompleteJob = () => {
  completeJob();
};
</script>

<style scoped>
.provider-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.provider-desktop-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 860px) {
  .provider-desktop-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.provider-left-col,
.provider-right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Status Card */
.status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pulse-online {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
  display: block;
}

.dot-offline {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #EF4444;
  display: block;
}

.status-heading {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-900);
}

.status-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Earnings Hero */
.earnings-hero {
  background: var(--grad-primary);
  color: #FFFFFF;
  padding: 22px;
}

.earnings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.earnings-label-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  opacity: 0.9;
  font-weight: 600;
}

.payout-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
}

.earnings-amount {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 8px 0 18px;
  letter-spacing: -0.02em;
}

.stats-row-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-md);
  padding: 12px 8px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 1.1rem;
  font-weight: 700;
}

.text-amber {
  color: #FDE68A;
}

.text-green {
  color: #86EFAC;
}

.stat-lbl {
  font-size: 0.7rem;
  opacity: 0.85;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
}

/* Incoming Jobs */
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-900);
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  color: var(--primary-600);
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-card {
  background: #FFFFFF;
  border: 1.5px solid var(--primary-100);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: var(--transition-smooth);
}

.job-card:hover {
  border-color: var(--primary-400);
  box-shadow: var(--shadow-md);
}

.job-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-type-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.pill-senior {
  background: #E0F2FE;
  color: #0369A1;
}

.pill-child {
  background: #FEF3C7;
  color: #B45309;
}

.pill-transit {
  background: #CCFBF1;
  color: #0F766E;
}

.job-payout-pill {
  font-size: 0.85rem;
  font-weight: 800;
  color: #15803D;
  background: #DCFCE7;
  padding: 3px 10px;
  border-radius: 6px;
}

.job-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary-900);
}

.job-meta-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.job-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.job-card-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
  margin-top: 6px;
}

/* Active Duty Workplace */
.active-job-banner {
  background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
  color: #FFFFFF;
}

.ready-guide-card {
  text-align: center;
  padding: 24px;
  background: #F0F9FF;
  border: 1.5px dashed #BAE6FD;
}

.guide-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.guide-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-900);
}

.guide-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.duty-badge {
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

.pulse-duty {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34D399;
}

.duty-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.duty-title {
  font-size: 1.05rem;
  font-weight: 700;
}

.duty-client {
  font-size: 0.75rem;
  opacity: 0.9;
}

.btn-call {
  background: #FFFFFF;
  color: #0369A1;
  font-weight: 700;
}

/* Log Tools Navigation */
.log-tabs-nav {
  display: flex;
  background: #F1F5F9;
  border-radius: var(--radius-full);
  padding: 4px;
  margin-bottom: 14px;
}

.log-tab-btn {
  flex: 1;
  border: none;
  background: none;
  padding: 8px 0;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition-fast);
}

.log-tab-btn.active {
  background: #FFFFFF;
  color: var(--primary-800);
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.log-form-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-submit-log {
  width: 100%;
  padding: 12px;
  margin-top: 4px;
}

/* Checklist Details in Provider View */
.checklist-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checklist-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.checklist-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.35;
}

.checklist-time-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
}

.clock-icon {
  color: var(--primary-600);
}

.status-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
}

.tag-done {
  background: #DCFCE7;
  color: #166534;
}

.tag-pending {
  background: #FEF3C7;
  color: #B45309;
}

/* ==========================================================================
   Messenger-Grade Chat UI in Provider View
   ========================================================================== */
.chat-card-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1.5px solid rgba(0, 180, 216, 0.2);
}

.chat-room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #F1F5F9;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-avatar-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.avatar-online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #10B981;
  border: 1.5px solid #FFFFFF;
}

.chat-room-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary-900);
  line-height: 1.2;
}

.chat-room-status {
  font-size: 0.68rem;
  color: #059669;
  font-weight: 600;
}

.chat-header-call-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #166534;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  text-decoration: none;
  transition: var(--transition-fast);
}

.chat-header-call-btn:hover {
  background: #DCFCE7;
}

/* Chat Stream */
.chat-stream-box {
  background: #F8FAFC;
  border: 1px solid var(--primary-100);
  border-radius: var(--radius-md);
  padding: 14px;
  height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-date-separator {
  text-align: center;
  margin: 4px 0;
}

.chat-date-separator span {
  background: #E2E8F0;
  color: var(--text-muted);
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.chat-bubble-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 85%;
}

.row-outgoing {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.row-incoming {
  align-self: flex-start;
}

.msg-avatar-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E2E8F0;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 4px;
}

.bubble-content-wrap {
  display: flex;
  flex-direction: column;
}

.row-outgoing .bubble-content-wrap {
  align-items: flex-end;
}

.row-incoming .bubble-content-wrap {
  align-items: flex-start;
}

.sender-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-bottom: 3px;
  font-weight: 500;
}

.message-bubble {
  padding: 10px 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.row-incoming .message-bubble {
  background: #FFFFFF;
  color: var(--text-main);
  border: 1px solid #E2E8F0;
  border-radius: 16px 16px 16px 4px;
}

.row-outgoing .message-bubble {
  background: var(--grad-primary);
  color: #FFFFFF;
  border-radius: 16px 16px 4px 16px;
}

.bubble-text {
  font-size: 0.84rem;
  line-height: 1.45;
  margin: 0;
}

.bubble-timestamp {
  display: block;
  font-size: 0.62rem;
  opacity: 0.75;
  text-align: right;
  margin-top: 4px;
}

/* Quick Reply Chips */
.quick-reply-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.quick-hint {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.reply-chips-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px 0;
}

.reply-chip {
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-full);
  padding: 5px 12px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  cursor: pointer;
  transition: var(--transition-fast);
}

.reply-chip:hover {
  background: var(--primary-100);
  border-color: var(--primary-300);
  color: var(--primary-800);
}

/* Input Row */
.chat-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1.5px solid var(--primary-200);
  border-radius: var(--radius-full);
  padding: 4px 6px 4px 14px;
  transition: var(--transition-fast);
}

.chat-input-row:focus-within {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.15);
}

.provider-chat-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 0.88rem;
  outline: none;
  box-shadow: none !important;
  margin-bottom: 0;
}

.btn-chat-send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-chat-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-finish-job {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: #FFFFFF;
  padding: 16px;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  border-radius: var(--radius-md);
}

.btn-finish-job:hover {
  filter: brightness(1.05);
}
</style>
