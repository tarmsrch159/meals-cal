// Meals & Calorie Tracker State Management Store (Vue 3 Reactive Store)
import { reactive, watch } from 'vue';
import { getGeminiApiKey, setGeminiApiKey } from '../services/nutritionApi.js';

const STORAGE_KEY = 'meals_cal_app_state_v1';

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initial Sample Meals for Today so the user immediately sees a lively and functional tracker
const todayStr = getTodayDateString();

const defaultState = {
  selectedDate: todayStr,
  
  // Meals categorized by date and meal slot: { [dateStr]: { breakfast: [], lunch: [], dinner: [], snack: [] } }
  mealsByDate: {
    [todayStr]: {
      breakfast: [
        {
          id: 'init_1',
          name: 'โจ๊กหมูใส่ไข่',
          calories: 320,
          protein: 18,
          carbs: 42,
          fat: 9,
          fiber: 1,
          sodium: 720,
          servingSize: '1 ชาม (400g)',
          multiplier: 1,
          time: '08:15',
          source: 'ฐานข้อมูลอาหารไทย'
        },
        {
          id: 'init_2',
          name: 'อเมริกาโน่เย็น (ไม่ใส่น้ำตาล)',
          calories: 5,
          protein: 0.3,
          carbs: 0.8,
          fat: 0.1,
          fiber: 0,
          sodium: 5,
          servingSize: '1 แก้ว',
          multiplier: 1,
          time: '08:30',
          source: 'ฐานข้อมูลอาหารไทย'
        }
      ],
      lunch: [
        {
          id: 'init_3',
          name: 'ข้าวมันไก่ตอน',
          calories: 596,
          protein: 28,
          carbs: 68,
          fat: 24,
          fiber: 1.5,
          sodium: 780,
          servingSize: '1 จาน (350g)',
          multiplier: 1,
          time: '12:30',
          source: 'ฐานข้อมูลอาหารไทย'
        }
      ],
      dinner: [
        {
          id: 'init_4',
          name: 'สุกี้น้ำรวมมิตร (กุ้ง/หมู/ไก่)',
          calories: 320,
          protein: 26,
          carbs: 34,
          fat: 8,
          fiber: 4.5,
          sodium: 980,
          servingSize: '1 ชาม (450g)',
          multiplier: 1,
          time: '18:45',
          source: 'ฐานข้อมูลอาหารไทย'
        }
      ],
      snack: [
        {
          id: 'init_5',
          name: 'กล้วยหอมทอง 7-Eleven (1 ลูก)',
          calories: 110,
          protein: 1.2,
          carbs: 27,
          fat: 0.3,
          fiber: 3.0,
          sodium: 1,
          servingSize: '1 ลูก',
          multiplier: 1,
          time: '15:00',
          source: '7-Eleven'
        }
      ]
    }
  },

  // Water intake in glasses (250ml per glass)
  waterByDate: {
    [todayStr]: 5
  },

  // User Profile & Macro Targets
  userProfile: {
    name: 'คุณผู้ใช้',
    calorieTarget: 2000,
    proteinTarget: 120, // g
    carbsTarget: 230,   // g
    fatTarget: 55,      // g
    waterTarget: 8,     // glasses (2000ml)
    weight: 65,         // kg
    height: 170,        // cm
    age: 28,
    gender: 'male',     // 'male' | 'female'
    activityLevel: 'moderate', // 'sedentary', 'light', 'moderate', 'heavy'
    goal: 'maintain',   // 'lose', 'maintain', 'gain'
    dietType: 'balanced' // 'balanced', 'high_protein', 'low_carb', 'keto'
  },

  // Recent food searches
  recentSearches: ['ข้าวมันไก่', 'ส้มตำไทย', 'กะเพราหมูกรอบ', 'ชาไทยเย็น', 'อกไก่ 7-11'],

  // Active Modals & UI State
  activeModal: null, // 'search' | 'scanner' | 'quick-add' | 'bmr-calc' | 'settings' | 'food-detail'
  selectedMealType: 'breakfast', // 'breakfast' | 'lunch' | 'dinner' | 'snack'
  selectedFoodDetail: null,
  toast: null,
  isLoadingAI: false
};

// Load initial state from LocalStorage if available
function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultState,
        ...parsed,
        selectedDate: parsed.selectedDate || getTodayDateString(),
        mealsByDate: { ...defaultState.mealsByDate, ...(parsed.mealsByDate || {}) },
        waterByDate: { ...defaultState.waterByDate, ...(parsed.waterByDate || {}) },
        userProfile: { ...defaultState.userProfile, ...(parsed.userProfile || {}) }
      };
    }
  } catch (e) {
    console.error('Failed to load saved calorie state:', e);
  }
  return defaultState;
}

export const state = reactive(loadSavedState());

// Auto-save to LocalStorage on changes
watch(
  () => [state.mealsByDate, state.waterByDate, state.userProfile, state.recentSearches],
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedDate: state.selectedDate,
        mealsByDate: state.mealsByDate,
        waterByDate: state.waterByDate,
        userProfile: state.userProfile,
        recentSearches: state.recentSearches
      }));
    } catch (e) {
      console.warn('Failed to save calorie state to localStorage:', e);
    }
  },
  { deep: true }
);

// Store Actions & Helper Methods
export const calorieStore = {
  state,

  // Toast Notification
  showToast(message, type = 'success') {
    state.toast = { message, type, id: Date.now() };
    setTimeout(() => {
      if (state.toast && state.toast.id === state.toast.id) {
        state.toast = null;
      }
    }, 3000);
  },

  // Modal Controls
  openSearchModal(mealType = 'breakfast') {
    state.selectedMealType = mealType;
    state.activeModal = 'search';
  },

  openScannerModal(mealType = 'breakfast') {
    state.selectedMealType = mealType;
    state.activeModal = 'scanner';
  },

  openQuickAddModal(mealType = 'breakfast') {
    state.selectedMealType = mealType;
    state.activeModal = 'quick-add';
  },

  openBmrCalcModal() {
    state.activeModal = 'bmr-calc';
  },

  openSettingsModal() {
    state.activeModal = 'settings';
  },

  openFoodDetail(foodItem, mealType) {
    if (mealType) state.selectedMealType = mealType;
    state.selectedFoodDetail = foodItem;
    state.activeModal = 'food-detail';
  },

  closeModal() {
    state.activeModal = null;
    state.selectedFoodDetail = null;
  },

  // Date Navigation
  setDate(dateStr) {
    state.selectedDate = dateStr;
  },

  changeDate(daysDelta) {
    const parts = state.selectedDate.split('-');
    const curr = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    curr.setDate(curr.getDate() + daysDelta);
    
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    state.selectedDate = `${year}-${month}-${day}`;
  },

  setToday() {
    state.selectedDate = getTodayDateString();
  },

  isToday() {
    return state.selectedDate === getTodayDateString();
  },

  // Meals Data Operations
  ensureDateEntry(dateStr = state.selectedDate) {
    if (!state.mealsByDate[dateStr]) {
      state.mealsByDate[dateStr] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };
    }
  },

  getMealsForDate(dateStr = state.selectedDate) {
    this.ensureDateEntry(dateStr);
    return state.mealsByDate[dateStr];
  },

  addMealItem(mealType, foodItem, multiplier = 1) {
    this.ensureDateEntry(state.selectedDate);
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newItem = {
      id: 'meal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: foodItem.name,
      nameEn: foodItem.nameEn || '',
      calories: Math.round(Number(foodItem.calories) || 0),
      protein: Math.round((Number(foodItem.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(foodItem.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(foodItem.fat) || 0) * 10) / 10,
      fiber: Math.round((Number(foodItem.fiber) || 0) * 10) / 10,
      sodium: Math.round(Number(foodItem.sodium) || 0),
      servingSize: foodItem.servingSize || '1 หน่วยบริโภค',
      multiplier: Number(multiplier) || 1,
      time: timeStr,
      healthTip: foodItem.healthTip || '',
      source: foodItem.source || 'เพิ่มเอง'
    };

    state.mealsByDate[state.selectedDate][mealType].push(newItem);
    
    // Add to recent searches if unique
    if (foodItem.name && !state.recentSearches.includes(foodItem.name)) {
      state.recentSearches.unshift(foodItem.name);
      if (state.recentSearches.length > 8) state.recentSearches.pop();
    }

    this.showToast(`เพิ่ม "${foodItem.name}" ใน${this.getMealTypeName(mealType)}เรียบร้อย`);
  },

  removeMealItem(mealType, itemId) {
    this.ensureDateEntry(state.selectedDate);
    const list = state.mealsByDate[state.selectedDate][mealType];
    const index = list.findIndex(item => item.id === itemId);
    if (index !== -1) {
      const removed = list.splice(index, 1)[0];
      this.showToast(`ลบ "${removed.name}" แล้ว`, 'info');
    }
  },

  updateMealItemMultiplier(mealType, itemId, newMultiplier) {
    this.ensureDateEntry(state.selectedDate);
    const list = state.mealsByDate[state.selectedDate][mealType];
    const item = list.find(it => it.id === itemId);
    if (item) {
      item.multiplier = Math.max(0.25, Math.min(10, Number(newMultiplier) || 1));
    }
  },

  clearMeal(mealType, dateStr = state.selectedDate) {
    this.ensureDateEntry(dateStr);
    const count = (state.mealsByDate[dateStr][mealType] || []).length;
    state.mealsByDate[dateStr][mealType] = [];
    this.showToast(`ล้างรายการ${this.getMealTypeName(mealType)}เรียบร้อย (${count} รายการ)`, 'info');
  },

  clearAllMealsForDate(dateStr = state.selectedDate) {
    this.ensureDateEntry(dateStr);
    state.mealsByDate[dateStr] = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    this.showToast('ล้างรายการอาหารทุกมื้อของวันนี้เรียบร้อยแล้ว', 'info');
  },

  // Preset popular quick additions for instant 1-tap logging
  getQuickPresetsForMeal(mealType) {
    const presets = {
      breakfast: [
        { name: 'ไข่ต้ม (1 ฟอง)', calories: 75, protein: 6.5, carbs: 0.5, fat: 5, servingSize: '1 ฟอง (50g)', source: 'เมนูด่วน' },
        { name: 'ข้าวต้มหมู', calories: 250, protein: 12, carbs: 38, fat: 5, servingSize: '1 ถ้วย (300g)', source: 'เมนูด่วน' },
        { name: 'อเมริกาโน่เย็น (ไม่หวาน)', calories: 5, protein: 0.3, carbs: 0.8, fat: 0.1, servingSize: '1 แก้ว (22 oz)', source: 'เมนูด่วน' },
        { name: 'กล้วยหอมทอง', calories: 110, protein: 1.2, carbs: 27, fat: 0.3, servingSize: '1 ลูก (100g)', source: 'เมนูด่วน' },
        { name: 'นมจืดไขมันต่ำ (1 แก้ว)', calories: 120, protein: 8, carbs: 12, fat: 4, servingSize: '1 แก้ว (240ml)', source: 'เมนูด่วน' }
      ],
      lunch: [
        { name: 'ข้าวมันไก่ตอน', calories: 596, protein: 28, carbs: 68, fat: 24, servingSize: '1 จาน (350g)', source: 'เมนูด่วน' },
        { name: 'กะเพราหมูสับไข่ดาว', calories: 630, protein: 29, carbs: 62, fat: 30, servingSize: '1 จาน (380g)', source: 'เมนูด่วน' },
        { name: 'ก๋วยเตี๋ยวเรือน้ำตกหมู', calories: 380, protein: 20, carbs: 52, fat: 10, servingSize: '1 ชาม (400g)', source: 'เมนูด่วน' },
        { name: 'ข้าวสวย (1 ทัพพี)', calories: 80, protein: 1.5, carbs: 18, fat: 0.2, servingSize: '1 ทัพพี (60g)', source: 'เมนูด่วน' },
        { name: 'ส้มตำไทย', calories: 120, protein: 3, carbs: 26, fat: 1, servingSize: '1 จาน (200g)', source: 'เมนูด่วน' }
      ],
      dinner: [
        { name: 'สุกี้น้ำรวมมิตร', calories: 320, protein: 26, carbs: 34, fat: 8, servingSize: '1 ชาม (450g)', source: 'เมนูด่วน' },
        { name: 'อกไก่ย่าง (อกล้วน)', calories: 165, protein: 31, carbs: 0, fat: 3.5, servingSize: '1 ชิ้น (150g)', source: 'เมนูด่วน' },
        { name: 'ยำวุ้นเส้นรวมมิตร', calories: 220, protein: 14, carbs: 32, fat: 4, servingSize: '1 จาน (250g)', source: 'เมนูด่วน' },
        { name: 'สลัดผักอกไก่ (น้ำใส)', calories: 210, protein: 24, carbs: 16, fat: 5, servingSize: '1 จาน (250g)', source: 'เมนูด่วน' },
        { name: 'ต้มยำกุ้งน้ำใส', calories: 140, protein: 18, carbs: 8, fat: 3, servingSize: '1 ถ้วย (300g)', source: 'เมนูด่วน' }
      ],
      snack: [
        { name: 'ชาไทยเย็น (หวานน้อย)', calories: 180, protein: 4, carbs: 28, fat: 6, servingSize: '1 แก้ว (22 oz)', source: 'เมนูด่วน' },
        { name: 'เวย์โปรตีน (1 สกู๊ป)', calories: 120, protein: 24, carbs: 3, fat: 1.5, servingSize: '1 แก้ว (300ml)', source: 'เมนูด่วน' },
        { name: 'โยเกิร์ตธรรมชาติ', calories: 90, protein: 5, carbs: 12, fat: 2.5, servingSize: '1 ถ้วย (135g)', source: 'เมนูด่วน' },
        { name: 'อัลมอนด์อบ (1 กำมือ)', calories: 160, protein: 6, carbs: 6, fat: 14, servingSize: '30 กรัม (約 23 เม็ด)', source: 'เมนูด่วน' },
        { name: 'แอปเปิ้ลเขียว (1 ลูก)', calories: 80, protein: 0.5, carbs: 20, fat: 0.3, servingSize: '1 ลูก (150g)', source: 'เมนูด่วน' }
      ]
    };
    return presets[mealType] || [];
  },

  // Water Tracking
  getWater(dateStr = state.selectedDate) {
    return state.waterByDate[dateStr] || 0;
  },

  addWater(dateStr = state.selectedDate) {
    if (!state.waterByDate[dateStr]) state.waterByDate[dateStr] = 0;
    state.waterByDate[dateStr] = Math.min(20, state.waterByDate[dateStr] + 1);
  },

  removeWater(dateStr = state.selectedDate) {
    if (!state.waterByDate[dateStr]) return;
    state.waterByDate[dateStr] = Math.max(0, state.waterByDate[dateStr] - 1);
  },

  // Nutrition Calculation Helpers
  getMealTotals(mealType, dateStr = state.selectedDate) {
    this.ensureDateEntry(dateStr);
    const items = state.mealsByDate[dateStr][mealType] || [];
    
    return items.reduce(
      (acc, item) => {
        const mult = item.multiplier || 1;
        acc.calories += (item.calories || 0) * mult;
        acc.protein += (item.protein || 0) * mult;
        acc.carbs += (item.carbs || 0) * mult;
        acc.fat += (item.fat || 0) * mult;
        acc.fiber += (item.fiber || 0) * mult;
        acc.sodium += (item.sodium || 0) * mult;
        acc.count += 1;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, count: 0 }
    );
  },

  getDailyTotals(dateStr = state.selectedDate) {
    const b = this.getMealTotals('breakfast', dateStr);
    const l = this.getMealTotals('lunch', dateStr);
    const d = this.getMealTotals('dinner', dateStr);
    const s = this.getMealTotals('snack', dateStr);

    const calories = Math.round(b.calories + l.calories + d.calories + s.calories);
    const protein = Math.round((b.protein + l.protein + d.protein + s.protein) * 10) / 10;
    const carbs = Math.round((b.carbs + l.carbs + d.carbs + s.carbs) * 10) / 10;
    const fat = Math.round((b.fat + l.fat + d.fat + s.fat) * 10) / 10;
    const fiber = Math.round((b.fiber + l.fiber + d.fiber + s.fiber) * 10) / 10;
    const sodium = Math.round(b.sodium + l.sodium + d.sodium + s.sodium);

    return { calories, protein, carbs, fat, fiber, sodium };
  },

  getRemainingCalories(dateStr = state.selectedDate) {
    const daily = this.getDailyTotals(dateStr);
    return state.userProfile.calorieTarget - daily.calories;
  },

  getMealTypeName(type) {
    const map = {
      breakfast: 'มื้อเช้า',
      lunch: 'มื้อกลางวัน',
      dinner: 'มื้อเย็น',
      snack: 'ของว่าง & เครื่องดื่ม'
    };
    return map[type] || type;
  },

  getMealIcon(type) {
    const map = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return map[type] || '🍽️';
  },

  // Calculate BMR & TDEE based on Harris-Benedict & Mifflin-St Jeor formulas
  calculateBmrTdee(profileData) {
    const p = { ...state.userProfile, ...profileData };
    const weight = Number(p.weight) || 65;
    const height = Number(p.height) || 170;
    const age = Number(p.age) || 28;
    const gender = p.gender || 'male';

    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity Multiplier
    const activityMultipliers = {
      sedentary: 1.2,      // นั่งทำงานอยู่กับที่ ไม่ออกกำลังกาย
      light: 1.375,        // ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์
      moderate: 1.55,      // ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์
      heavy: 1.725,        // ออกกำลังกายหนัก 6-7 วัน/สัปดาห์
      athlete: 1.9         // นักกีฬา/ทำงานใช้แรงหนักมาก
    };

    const multiplier = activityMultipliers[p.activityLevel] || 1.375;
    const tdee = Math.round(bmr * multiplier);

    // Goal adjustments
    let calorieTarget = tdee;
    if (p.goal === 'lose') {
      calorieTarget = Math.round(tdee - 500); // 500 kcal deficit
    } else if (p.goal === 'gain') {
      calorieTarget = Math.round(tdee + 400); // 400 kcal surplus
    }

    // Macro Split calculation
    let carbPercent = 0.50;
    let proteinPercent = 0.25;
    let fatPercent = 0.25;

    if (p.dietType === 'high_protein') {
      carbPercent = 0.35;
      proteinPercent = 0.35;
      fatPercent = 0.30;
    } else if (p.dietType === 'low_carb') {
      carbPercent = 0.20;
      proteinPercent = 0.40;
      fatPercent = 0.40;
    } else if (p.dietType === 'keto') {
      carbPercent = 0.05;
      proteinPercent = 0.25;
      fatPercent = 0.70;
    }

    const carbsTarget = Math.round((calorieTarget * carbPercent) / 4);
    const proteinTarget = Math.round((calorieTarget * proteinPercent) / 4);
    const fatTarget = Math.round((calorieTarget * fatPercent) / 9);

    return {
      bmr: Math.round(bmr),
      tdee,
      calorieTarget: Math.max(1200, calorieTarget),
      carbsTarget,
      proteinTarget,
      fatTarget
    };
  },

  applyBmrCalculation(calculated) {
    state.userProfile.calorieTarget = calculated.calorieTarget;
    state.userProfile.carbsTarget = calculated.carbsTarget;
    state.userProfile.proteinTarget = calculated.proteinTarget;
    state.userProfile.fatTarget = calculated.fatTarget;
    this.showToast('อัปเดตเป้าหมายแคลอรี่และสารอาหารเรียบร้อย');
  },

  resetAllData() {
    state.mealsByDate = { [getTodayDateString()]: { breakfast: [], lunch: [], dinner: [], snack: [] } };
    state.waterByDate = { [getTodayDateString()]: 0 };
    localStorage.removeItem(STORAGE_KEY);
    this.showToast('รีเซ็ตข้อมูลทั้งหมดแล้ว', 'info');
  }
};
