<template>
  <div v-if="state.showAddModal" class="modal-overlay" @click="closeModal">
    <div class="modal-dialog add-task-dialog" @click.stop>
      <button class="modal-close-btn" @click="closeModal">
        <X :size="18" />
      </button>

      <div class="modal-header">
        <PlusCircle :size="24" class="header-icon" />
        <h3 class="modal-title">{{ t('addTaskTitle') }}</h3>
      </div>

      <!-- Quick Preset Suggestions -->
      <div class="preset-section">
        <span class="section-hint">เลือกจากรายการแนะนำด่วน:</span>
        <div class="preset-chips">
          <button 
            v-for="p in presets" 
            :key="p.text"
            class="preset-chip"
            @click="applyPreset(p)"
          >
            {{ p.emoji }} {{ p.text }}
          </button>
        </div>
      </div>

      <!-- Form Inputs -->
      <div class="form-group">
        <label class="form-label">
          <FileText :size="14" />
          <span>{{ t('taskName') }}</span>
        </label>
        <input 
          type="text" 
          v-model="taskText" 
          class="form-input" 
          placeholder="เช่น ชงนม 4 ออนซ์, ป้อนยาหลังอาหาร" 
          autofocus
        />
      </div>

      <div class="form-group">
        <label class="form-label">
          <Clock :size="14" />
          <span>{{ t('taskTime') }}</span>
        </label>
        <input 
          type="time" 
          v-model="taskTime" 
          class="form-input" 
        />
      </div>

      <button class="btn btn-primary btn-save" @click="handleSave">
        <Check :size="18" />
        <span>{{ t('saveTask') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store } from '../stores/useAppStore.js';
import { 
  X, 
  PlusCircle, 
  FileText, 
  Clock, 
  Check 
} from 'lucide-vue-next';

const { state, t, addTask, showToast } = store;

const taskText = ref('');
const taskTime = ref('10:00');
const taskCategory = ref('all');

const presets = [
  { emoji: '💊', text: 'ให้ยาช่วงเช้า/เย็น', time: '08:00', category: 'senior' },
  { emoji: '🩺', text: 'วัดความดัน & ชีพจร', time: '12:00', category: 'senior' },
  { emoji: '🍼', text: 'ชงนม 4 ออนซ์', time: '09:00', category: 'child' },
  { emoji: '🍲', text: 'ป้อนอาหารมื้อเที่ยง', time: '11:30', category: 'all' },
  { emoji: '😴', text: 'นอนกลางวัน 1 ชม.', time: '13:00', category: 'all' },
  { emoji: '🚶‍♂️', text: 'กายภาพบำบัดเบาๆ', time: '16:00', category: 'senior' }
];

const applyPreset = (p) => {
  taskText.value = p.text;
  taskTime.value = p.time;
  taskCategory.value = p.category;
};

const closeModal = () => {
  state.showAddModal = false;
};

const handleSave = () => {
  if (!taskText.value.trim()) {
    showToast('กรุณากรอกชื่อรายการดูแล', 'error');
    return;
  }
  addTask(taskText.value, taskTime.value, taskCategory.value);
  taskText.value = '';
};
</script>

<style scoped>
.add-task-dialog {
  max-width: 380px;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.header-icon {
  color: var(--primary-600);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-900);
}

.preset-section {
  margin-bottom: 14px;
}

.section-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preset-chip {
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-full);
  padding: 4px 10px;
  font-size: 0.72rem;
  color: var(--primary-800);
  cursor: pointer;
  transition: var(--transition-fast);
}

.preset-chip:hover {
  background: var(--primary-500);
  color: #FFFFFF;
  border-color: var(--primary-500);
}

.btn-save {
  width: 100%;
  margin-top: 6px;
}
</style>
