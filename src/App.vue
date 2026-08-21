<template>
  <div class="desktop-wrapper">
    <div class="app-shell" :class="{ 'frame-mode': state.isDesktopFrame }">
      <!-- Top Sticky Header -->
      <HeaderBar />

      <!-- Global Toast Container -->
      <ToastMessage />

      <!-- Main Scrollable Viewport -->
      <main class="main-viewport">
        <!-- Not logged in: Show Auth / Login Screen -->
        <AuthView v-if="!state.isLoggedIn" />

        <!-- Logged in: Render depending on Role and Bottom Nav Tab -->
        <template v-else>
          <!-- Dedicated AI Health Intelligence View -->
          <AiHealthView v-if="state.customerView === 'ai-health'" />

          <!-- Customer View -->
          <CustomerView v-else-if="state.role === 'customer'" />

          <!-- Provider / Caregiver View -->
          <ProviderView v-else />
        </template>
      </main>

      <!-- Global Bottom Navigation Bar (Visible when logged in) -->
      <BottomNav v-if="state.isLoggedIn" />

      <!-- Global Interactive Modals -->
      <SosModal />
      <BookingModal />
      <AddTaskModal />
      <AiHealthChatModal />
    </div>
  </div>
</template>

<script setup>
import { store } from './stores/useAppStore.js';
import HeaderBar from './components/HeaderBar.vue';
import BottomNav from './components/BottomNav.vue';
import ToastMessage from './components/ToastMessage.vue';
import SosModal from './components/SosModal.vue';
import BookingModal from './components/BookingModal.vue';
import AddTaskModal from './components/AddTaskModal.vue';
import AiHealthChatModal from './components/health/AiHealthChatModal.vue';
import AuthView from './views/AuthView.vue';
import CustomerView from './views/CustomerView.vue';
import ProviderView from './views/ProviderView.vue';
import AiHealthView from './views/AiHealthView.vue';

const { state } = store;
</script>

<style>
/* Global scoped or root layout overrides if needed */
</style>
