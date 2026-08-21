<template>
  <div v-if="state.showAiHealthChatModal" class="modal-backdrop" @click.self="closeChat">
    <div class="modal-card ai-chat-modal">
      <!-- Modal Header -->
      <div class="ai-chat-header">
        <div class="header-doctor-info">
          <div class="avatar-wrap">
            <img src="/doolae_logo.png" alt="AI Doolae" class="doc-avatar" />
            <span class="online-indicator"></span>
          </div>
          <div>
            <h3 class="doc-title">
              <span>หมอ AI ดูแล (AI DOOLAE)</span>
              <span class="badge-ai-model">GPT Health</span>
            </h3>
            <p class="doc-subtitle">พร้อมให้คำปรึกษาอ้างอิงจากผลตรวจสุขภาพล่าสุดของคุณ</p>
          </div>
        </div>

        <button class="btn-close-modal" @click="closeChat">
          <X :size="18" />
        </button>
      </div>

      <!-- Quick Prompt Suggestions Chips -->
      <div class="quick-prompts-bar">
        <span class="prompts-label">คำถามยอดนิยม:</span>
        <div class="prompts-scroll">
          <button 
            v-for="(chip, idx) in suggestionChips" 
            :key="idx"
            class="chip-btn"
            @click="sendQuickPrompt(chip)"
          >
            {{ chip }}
          </button>
        </div>
      </div>

      <!-- Chat Messages Container -->
      <div class="chat-messages-scroll" ref="chatBox">
        <div 
          v-for="msg in state.healthChatMessages" 
          :key="msg.id" 
          class="chat-bubble-row"
          :class="msg.sender === 'user' ? 'row-user' : 'row-ai'"
        >
          <div v-if="msg.sender === 'ai'" class="msg-avatar">
            <img src="/doolae_logo.png" alt="AI Avatar" />
          </div>

          <div class="msg-bubble-card" :class="msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'">
            <div class="msg-text" v-html="formatMessageText(msg.text)"></div>
            <span class="msg-time">{{ msg.time }}</span>
          </div>
        </div>

        <!-- AI Typing Indicator -->
        <div v-if="isAiTyping" class="chat-bubble-row row-ai">
          <div class="msg-avatar">
            <img src="/doolae_logo.png" alt="AI Avatar" />
          </div>
          <div class="msg-bubble-card bubble-ai typing-bubble">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">หมอ AI กำลังพิมพ์คำแนะนำ...</span>
          </div>
        </div>
      </div>

      <!-- Chat Input Area -->
      <div class="chat-input-toolbar">
        <input 
          type="text" 
          v-model="inputText" 
          placeholder="พิมพ์ข้อความปรึกษาเรื่องสุขภาพ ผลตรวจ หรืออาหาร..." 
          class="chat-text-input" 
          @keyup.enter="handleSend"
          :disabled="isAiTyping"
        />
        <button 
          class="btn-send-chat" 
          @click="handleSend"
          :disabled="!inputText.trim() || isAiTyping"
        >
          <Send :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { store } from '../../stores/useAppStore.js';
import { X, Send } from 'lucide-vue-next';

const { state, sendAiChatMessage } = store;

const inputText = ref('');
const isAiTyping = ref(false);
const chatBox = ref(null);

const suggestionChips = [
  'งดของทอด 1 เดือน ไขมันจะลดไหม?',
  'ผลตรวจค่าตับและไตปกติไหม?',
  'ช่วยแนะนำเมนูอาหารสำหรับลดคอเลสเตอรอล',
  'ความดันโลหิตระดับนี้ควรออกกำลังกายแบบไหน?'
];

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight;
    }
  });
};

const closeChat = () => {
  state.showAiHealthChatModal = false;
};

const sendQuickPrompt = (text) => {
  inputText.value = text;
  handleSend();
};

const handleSend = async () => {
  const text = inputText.value.trim();
  if (!text || isAiTyping.value) return;

  inputText.value = '';
  isAiTyping.value = true;
  scrollToBottom();

  try {
    await sendAiChatMessage(text);
  } catch (e) {
    console.error(e);
  } finally {
    isAiTyping.value = false;
    scrollToBottom();
  }
};

const formatMessageText = (text) => {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
};

watch(() => state.showAiHealthChatModal, (val) => {
  if (val) {
    scrollToBottom();
  }
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(224, 242, 254, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.ai-chat-modal {
  width: 100%;
  max-width: 580px;
  height: 85vh;
  max-height: 680px;
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 119, 182, 0.18), 0 4px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid rgba(0, 180, 216, 0.25);
}

.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%);
  color: #FFFFFF;
}

.header-doctor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrap {
  position: relative;
  width: 44px;
  height: 44px;
}

.doc-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #FFFFFF;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #10B981;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
}

.doc-title {
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.badge-ai-model {
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: var(--radius-full);
}

.doc-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 2px 0 0 0;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.18);
  border: none;
  color: #FFFFFF;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Quick Prompts Bar */
.quick-prompts-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #F0F9FF;
  border-bottom: 1px solid #E0F2FE;
  overflow: hidden;
}

.prompts-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--primary-700);
  white-space: nowrap;
}

.prompts-scroll {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.prompts-scroll::-webkit-scrollbar {
  display: none;
}

.chip-btn {
  background: #FFFFFF;
  color: var(--primary-700);
  border: 1px solid #BAE6FD;
  border-radius: var(--radius-full);
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--transition-fast);
}

.chip-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary-500);
}

/* Messages Scroll Area */
.chat-messages-scroll {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #F8FAFC;
}

.chat-bubble-row {
  display: flex;
  gap: 10px;
  max-width: 85%;
}

.row-ai {
  align-self: flex-start;
}

.row-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.msg-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.msg-bubble-card {
  padding: 10px 14px;
  border-radius: 16px;
  position: relative;
}

.bubble-ai {
  background: #FFFFFF;
  color: var(--text-main);
  border: 1px solid #E2E8F0;
  border-top-left-radius: 4px;
  box-shadow: var(--shadow-xs);
}

.bubble-user {
  background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%);
  color: #FFFFFF;
  border-top-right-radius: 4px;
}

.msg-text {
  font-size: 0.85rem;
  line-height: 1.5;
}

.msg-time {
  font-size: 0.65rem;
  opacity: 0.7;
  display: block;
  text-align: right;
  margin-top: 4px;
}

.typing-bubble {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--primary-500);
  border-radius: 50%;
  animation: dotPulse 1.2s infinite ease-in-out;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.typing-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

/* Chat Input Toolbar */
.chat-input-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #FFFFFF;
  border-top: 1px solid var(--border-light);
}

.chat-text-input {
  flex: 1;
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-full);
  padding: 10px 16px;
  font-size: 0.85rem;
  outline: none;
  transition: var(--transition-fast);
}

.chat-text-input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.15);
}

.btn-send-chat {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%);
  border: none;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.btn-send-chat:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-send-chat:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
