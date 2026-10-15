<template>
  <div class="backdrop" @click.self="close">
    <section class="modal">
      <header><h2>สแกนบาร์โค้ดอาหาร</h2><button type="button" @click="close">✕</button></header>
      <p class="note">สแกนเพื่ออ่านเลขบาร์โค้ดได้ในอุปกรณ์นี้ โดยไม่ส่งข้อมูลไปฐานข้อมูลหรือบริการภายนอก จากนั้นกรอกฉลากโภชนาการเพื่อบันทึกอาหาร</p>
      <video v-if="cameraOn" ref="video" autoplay playsinline></video>
      <button v-if="!barcode && !cameraOn" class="primary" type="button" @click="startCamera">เปิดกล้องสแกน</button>
      <p v-if="error" class="error">{{ error }}</p>
      <label>เลขบาร์โค้ด
        <input v-model="barcode" inputmode="numeric" placeholder="สแกนหรือกรอกเลขบาร์โค้ด" />
      </label>
      <div v-if="barcode" class="catalog-status" :class="catalogFound ? 'is-found' : 'not-found'">
        <span class="status-icon">{{ catalogFound ? '✓' : '!' }}</span>
        <div><strong>{{ catalogFound ? 'พบสินค้าในรายการออฟไลน์' : 'ยังไม่มีสินค้าในรายการออฟไลน์' }}</strong><p>{{ catalogMessage }}</p></div>
      </div>
      <form @submit.prevent="saveFood">
        <label>ชื่ออาหาร <input v-model="food.name" required placeholder="ชื่อบนฉลาก" /></label>
        <div class="grid">
          <label>พลังงาน (kcal)<input v-model.number="food.calories" type="number" min="0" required /></label>
          <label>โปรตีน (g)<input v-model.number="food.protein" type="number" min="0" step="0.1" /></label>
          <label>คาร์บ (g)<input v-model.number="food.carbs" type="number" min="0" step="0.1" /></label>
          <label>ไขมัน (g)<input v-model.number="food.fat" type="number" min="0" step="0.1" /></label>
        </div>
        <button class="primary" type="submit">เพิ่มลง{{ mealName }}</button>
      </form>
      <small>รายการสินค้าอยู่ในตัวแอปและใช้งานออฟไลน์ได้ มีเฉพาะสินค้าตัวอย่างที่รองรับในขณะนี้</small>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { calorieStore, state } from '../../stores/useCalorieStore.js';
import { BARCODE_FOOD_CATALOG } from '../../data/barcodeFoodCatalog.js';

const video = ref(null);
const cameraOn = ref(false);
const barcode = ref('');
const error = ref('');
const catalogMessage = ref('');
const catalogFound = ref(false);
const mealName = calorieStore.getMealTypeName(state.selectedMealType);
const food = ref({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
let stream;
let timer;
let detector;

watch(barcode, (value) => {
  const product = BARCODE_FOOD_CATALOG[String(value || '').trim()];
  catalogFound.value = Boolean(product);
  if (product) {
    food.value.name = product.name;
    catalogMessage.value = `${product.servingSize} · ตรวจฉลากและกรอกสารอาหารก่อนบันทึก`;
  } else if (value) {
    catalogMessage.value = 'กรอกชื่อและข้อมูลโภชนาการจากฉลากได้เลย';
  } else {
    catalogMessage.value = '';
  }
});

async function startCamera() {
  try {
    if (!('BarcodeDetector' in window)) throw new Error('เบราว์เซอร์นี้ยังไม่รองรับการอ่านบาร์โค้ดผ่านกล้อง กรุณากรอกเลขจากฉลาก');
    detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    cameraOn.value = true;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    video.value.srcObject = stream;
    scanFrame();
  } catch (err) {
    error.value = err.message || 'เปิดกล้องไม่สำเร็จ';
    stopCamera();
  }
}

async function scanFrame() {
  if (!cameraOn.value || !video.value) return;
  try {
    const codes = await detector.detect(video.value);
    if (codes.length) {
      barcode.value = codes[0].rawValue;
      stopCamera();
      return;
    }
  } catch { /* Continue scanning the next frame. */ }
  timer = window.setTimeout(scanFrame, 250);
}

function stopCamera() {
  cameraOn.value = false;
  window.clearTimeout(timer);
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
}

function saveFood() {
  calorieStore.addMealItem(state.selectedMealType, { ...food.value, nameEn: barcode.value ? `Barcode ${barcode.value}` : '', servingSize: '1 หน่วย' });
  calorieStore.showToast('เพิ่มอาหารจากฉลากเรียบร้อย');
  close();
}

function close() {
  stopCamera();
  calorieStore.closeModal();
}

onBeforeUnmount(stopCamera);
</script>

<style scoped>
.backdrop{position:fixed;inset:0;z-index:1200;background:#102b2580;backdrop-filter:blur(4px);display:grid;place-items:center;padding:16px}.modal{background:#fff;border:1px solid #e3ece7;border-radius:22px;padding:22px;width:min(500px,100%);max-height:92vh;overflow:auto;color:#173c35;box-shadow:0 24px 70px #102b2540}.modal header{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid #edf1ee}.modal header h2{font-size:1.2rem;margin:0}.modal header button{border:0;background:#f0f5f2;color:#476257;border-radius:50%;width:36px;height:36px;cursor:pointer}.note,small{color:#71827b;line-height:1.55}.modal label{display:grid;gap:6px;margin:12px 0;color:#425d54;font-size:.86rem;font-weight:700}.modal input{width:100%;padding:11px 12px;border:1px solid #d8e2dd;border-radius:11px;background:#fbfcfb;color:#173c35;font:inherit;outline:none}.modal input:focus{border-color:#43816a;box-shadow:0 0 0 3px #43816a18}.grid{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}.primary{width:100%;padding:12px;background:#154238;color:white;border:0;border-radius:11px;font-weight:700;margin:8px 0;cursor:pointer}.primary:hover{background:#205c4c}video{width:100%;max-height:250px;object-fit:cover;border-radius:14px;background:#102b25}.error{color:#a84e43}.catalog-status{display:flex;align-items:flex-start;gap:.65rem;margin:10px 0;padding:11px 12px;border:1px solid;border-radius:12px}.catalog-status.is-found{color:#286148;background:#eef6f0;border-color:#d5e8da}.catalog-status.not-found{color:#80652b;background:#fbf7e9;border-color:#eee3bd}.status-icon{display:grid;place-items:center;flex:0 0 23px;height:23px;border-radius:50%;background:#ffffffb8;font-weight:800}.catalog-status strong{font-size:.82rem}.catalog-status p{margin:.2rem 0 0;font-size:.76rem;line-height:1.45}
</style>
