/* ==========================================================================
   ดูแล (Doo-Lae) - Generations Care & Transit
   React Application (Single Page Application Architecture)
   ========================================================================== */

const { useState, useEffect, useRef } = React;

// Logo Image URL (embedded base64 / relative path)
const LOGO_SRC = "https://img.icons8.com/color/96/000000/medical-heart.png"; 

// ==========================================================================
// 🌐 Translations Dictionary (TH / EN)
// ==========================================================================
const TRANSLATIONS = {
  TH: {
    brandName: "ดูแล (Doo-Lae)",
    brandTagline: "Generations Care & Transit",
    welcomeTitle: "ยินดีต้อนรับสู่ 'ดูแล'",
    welcomeSlogan: "ดูแลคนที่คุณรักและการเดินทางด้วยหัวใจ",
    emailPhone: "อีเมล หรือ เบอร์โทรศัพท์",
    password: "รหัสผ่าน",
    loginBtn: "เข้าสู่ระบบ",
    signupLink: "ยังไม่มีบัญชี? สมัครสมาชิกที่นี่",
    socialGoogle: "เข้าสู่ระบบด้วย Google",
    socialApple: "เข้าสู่ระบบด้วย Apple ID",
    
    roleCustomer: "👤 ผู้ใช้บริการ / ญาติ",
    roleProvider: "🧑‍⚕️ ผู้รับจ้าง / ผู้ดูแล",
    switchRole: "สลับโหมดผู้ใช้งาน",
    
    seniorCare: "ดูแลผู้สูงอายุ",
    childCare: "ดูแลเด็ก",
    transitService: "บริการรับส่ง Transit",
    
    liveCamTitle: "🎥 กล้องดูเด็ก Real-time (Live Nanny Cam)",
    camStatusLive: "🔴 กำลังถ่ายทอดสด",
    camMicTalk: "พูดคุยโต้ตอบ",
    camMute: "ปิดเสียง",
    
    gpsTitle: "📍 พิกัด GPS & สถานะ Real-time",
    gpsStatusOk: "สถานะ: ปกติ (อยู่ในเขตปลอดภัย)",
    gpsLocation: "บ้านพญาไท, กรุงเทพฯ",
    gpsEta: "คาดว่าจะถึงในอีก 12 นาที",
    
    nearbyCaregivers: "ผู้ดูแลและคนขับใกล้คุณ",
    bookNow: "จองเวลา",
    rateHour: "บาท/ชม.",
    
    dailyChecklist: "📋 รายการดูแลประจำวัน",
    progress: "ความคืบหน้า",
    medication: "ให้ยาช่วงเช้า (08:00 น.)",
    bloodPressure: "วัดความดันโลหิต (12:00 น.)",
    physicalTherapy: "ทำกายภาพบำบัดผ่อนคลาย",
    napTime: "นอนกลางวัน (13:00 น.)",
    
    sosButton: "🔴 SOS โทรฉุกเฉิน 24 ชม.",
    sosModalTitle: "🚨 แจ้งเตือนฉุกเฉิน (SOS Emergency Call)",
    sosCall1669: "โทร 1669 สายด่วนกู้ชีพ",
    sosCallRelative: "โทรหาญาติฉุกเฉิน",
    sosBroadcastGps: "แชร์พิกัด GPS ไปยังศูนย์กู้ภัย",
    close: "ปิดหน้าต่าง",

    // Provider Mode
    providerStatus: "สถานะพร้อมรับงาน",
    providerOnline: "🟢 พร้อมรับงาน (Online)",
    providerOffline: "🔴 ปิดรับงาน (Offline)",
    earningsToday: "รายได้สะสมวันนี้",
    newJobRequests: "📥 งานใหม่ที่เข้ามา",
    acceptJob: "กดรับงาน",
    rejectJob: "ข้ามงานนี้",
    logVitalsTitle: "📝 บันทึกสุขภาพ & ทานยา",
    submitLog: "ส่งข้อมูลอัปเดตให้ญาติ"
  },
  EN: {
    brandName: "Doo-Lae",
    brandTagline: "Generations Care & Transit",
    welcomeTitle: "Welcome to Doo-Lae",
    welcomeSlogan: "Generations Care & Safe Transit with Heart",
    emailPhone: "Email or Phone Number",
    password: "Password",
    loginBtn: "Log In",
    signupLink: "Don't have an account? Sign Up",
    socialGoogle: "Continue with Google",
    socialApple: "Continue with Apple ID",
    
    roleCustomer: "👤 Customer / Family",
    roleProvider: "🧑‍⚕️ Caregiver / Driver",
    switchRole: "Switch Mode",
    
    seniorCare: "Senior Care",
    childCare: "Child Care",
    transitService: "Transit Service",
    
    liveCamTitle: "🎥 Live Nanny Cam (Real-time)",
    camStatusLive: "🔴 LIVE STREAM",
    camMicTalk: "2-Way Talk",
    camMute: "Mute Audio",
    
    gpsTitle: "📍 Real-time GPS Tracking",
    gpsStatusOk: "Status: Normal (Safe Zone)",
    gpsLocation: "Phaya Thai, Bangkok",
    gpsEta: "Estimated arrival in 12 mins",
    
    nearbyCaregivers: "Nearby Caregivers & Drivers",
    bookNow: "Book Now",
    rateHour: "THB/hr",
    
    dailyChecklist: "📋 Daily Care Checklist",
    progress: "Progress",
    medication: "Morning Medication (08:00 AM)",
    bloodPressure: "Check Blood Pressure (12:00 PM)",
    physicalTherapy: "Physical Therapy Session",
    napTime: "Nap Time (01:00 PM)",
    
    sosButton: "🔴 24/7 Emergency SOS Call",
    sosModalTitle: "🚨 Emergency SOS Alert",
    sosCall1669: "Call 1669 Medical Hotline",
    sosCallRelative: "Call Emergency Contact",
    sosBroadcastGps: "Broadcast GPS to Rescue Team",
    close: "Close",

    // Provider Mode
    providerStatus: "Working Availability",
    providerOnline: "🟢 Online & Ready",
    providerOffline: "🔴 Offline",
    earningsToday: "Today's Earnings",
    newJobRequests: "📥 Incoming Job Requests",
    acceptJob: "Accept Job",
    rejectJob: "Decline",
    logVitalsTitle: "📝 Log Vitals & Medication",
    submitLog: "Send Update to Family"
  }
};

// ==========================================================================
// 🎥 Component: Live Nanny Camera Simulation
// ==========================================================================
function LiveCameraView({ t }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  return (
    <div className="glass-card camera-card">
      <div className="camera-header">
        <span className="live-badge">
          <span className="live-dot"></span>
          {t.camStatusLive}
        </span>
        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Cam #01 - Living Room</span>
      </div>

      <div className="camera-stream-wrapper">
        {/* Animated Simulated Video Feed */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #102A38 0%, #1A4D66 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify-content: 'center',
          color: '#FFF',
          textAlign: 'center',
          padding: '20px'
        }}>
          <i className="fa-solid fa-child-reaching" style={{ fontSize: '3rem', color: '#4DD0E1', marginBottom: '10px' }}></i>
          <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>พี่ศรี (พี่เลี้ยง) กำลังเล่นบล็อกตัวต่อกับน้องแก้ว</p>
          <span style={{ fontSize: '0.7rem', color: '#B2EBF2', marginTop: '4px' }}>HD 1080p • 30 FPS • Bitrate: 4.2 Mbps</span>
        </div>

        <div className="camera-overlay-info">
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60" className="nanny-avatar" alt="Nanny" />
          <span style={{ fontSize: '0.72rem', color: '#FFF', fontWeight: '500' }}>พี่ศรี (พี่เลี้ยงเด็ก)</span>
        </div>

        <div className="camera-controls">
          <button className={`cam-btn ${isMuted ? 'active' : ''}`} onClick={() => setIsMuted(!isMuted)}>
            <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
          </button>
          <button className={`cam-btn ${isTalking ? 'active' : ''}`} onClick={() => setIsTalking(!isTalking)}>
            <i className="fa-solid fa-microphone"></i>
          </button>
          <button className="cam-btn">
            <i className="fa-solid fa-expand"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 📍 Component: Real-time GPS Tracking Map
// ==========================================================================
function GpsTrackerMap({ t, serviceType }) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Initialize Leaflet Map
    if (!leafletInstance.current) {
      const map = L.map(mapRef.current).setView([13.7563, 100.5018], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Custom Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background:#00BCD4; color:white; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.3); border:2px solid white;"><i class="fa-solid fa-location-dot"></i></div>`,
        iconSize: [36, 36]
      });

      L.marker([13.7563, 100.5018], { icon: customIcon }).addTo(map)
        .bindPopup(`<b>${t.gpsLocation}</b><br/>${t.gpsStatusOk}`)
        .openPopup();

      leafletInstance.current = map;
    }
  }, [t]);

  return (
    <div className="glass-card map-card-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-dark)' }}>
          {t.gpsTitle}
        </h3>
        <span style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
          GPS Live
        </span>
      </div>

      <div ref={mapRef} className="map-container"></div>

      <div className="map-status-info">
        <div>
          <p style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-green)', marginRight: '6px' }}></i>
            {t.gpsStatusOk}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t.gpsLocation}
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-dark)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '8px' }}>
          {serviceType === 'transit' ? t.gpsEta : 'อัปเดต 1 นาทีที่แล้ว'}
        </span>
      </div>
    </div>
  );
}

// ==========================================================================
// 📱 Main Application Component
// ==========================================================================
function App() {
  const [lang, setLang] = useState('TH');
  const [role, setRole] = useState('customer'); // 'customer' | 'provider'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('senior'); // 'senior' | 'child' | 'transit'
  const [showSosModal, setShowSosModal] = useState(false);
  const [bookingCaregiver, setBookingCaregiver] = useState(null);

  // Provider State
  const [isOnline, setIsOnline] = useState(true);

  // Daily Checklist State
  const [checklist, setChecklist] = useState([
    { id: 1, textKey: 'medication', done: true, time: '08:00' },
    { id: 2, textKey: 'bloodPressure', done: true, time: '12:00' },
    { id: 3, textKey: 'physicalTherapy', done: false, time: '14:30' },
    { id: 4, textKey: 'napTime', done: false, time: '13:00' }
  ]);

  const t = TRANSLATIONS[lang];

  const toggleChecklist = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const doneCount = checklist.filter(c => c.done).length;
  const progressPct = Math.round((doneCount / checklist.length) * 100);

  // Caregivers Sample Data
  const caregivers = [
    {
      id: 1,
      name: "พี่นี วรรณิภา",
      role: "ผู้ดูแลผู้สูงอายุ & พยาบาลพักฟื้น",
      rating: 4.9,
      reviews: 128,
      rate: 250,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      name: "พี่ยา สิริกร",
      role: "พี่เลี้ยงเด็กเล็ก & พัฒนาการเด็ก",
      rating: 4.9,
      reviews: 95,
      rate: 220,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      name: "พี่ต่อ ขับรถ Transit",
      role: "คนขับรถรับส่งผู้สูงอายุ/เด็กมืออาชีพ",
      rating: 5.0,
      reviews: 142,
      rate: 300,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <>
      {/* App Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <img src={LOGO_SRC} className="brand-logo-img" alt="Doo-Lae Logo" />
          <div className="brand-text">
            <span className="brand-title">{t.brandName}</span>
            <span className="brand-subtitle">{t.brandTagline}</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Role Switcher Pill */}
          {isLoggedIn && (
            <div className="role-badge" onClick={() => setRole(role === 'customer' ? 'provider' : 'customer')}>
              <i className={`fa-solid ${role === 'customer' ? 'fa-user' : 'fa-user-nurse'}`}></i>
              <span>{role === 'customer' ? (lang === 'TH' ? 'ลูกค้า' : 'Client') : (lang === 'TH' ? 'ผู้ดูแล' : 'Provider')}</span>
            </div>
          )}

          {/* Language Switcher Switch */}
          <div className="lang-switcher" onClick={() => setLang(lang === 'TH' ? 'EN' : 'TH')}>
            <span className={`lang-btn ${lang === 'TH' ? 'active' : ''}`}>TH</span>
            <span className={`lang-btn ${lang === 'EN' ? 'active' : ''}`}>EN</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      {!isLoggedIn ? (
        /* ================= AUTHENTICATION / LOGIN SCREEN ================= */
        <div className="auth-wrapper main-content">
          <img src={LOGO_SRC} className="auth-logo-large" alt="Doo-Lae" />
          <h1 className="auth-title">{t.brandName}</h1>
          <p className="auth-slogan">{t.welcomeSlogan}</p>

          <div style={{ width: '100%', maxWidth: '360px' }}>
            <div className="form-group">
              <label className="form-label">{t.emailPhone}</label>
              <input type="text" className="form-input" placeholder="example@email.com / 081-234-5678" />
            </div>

            <div className="form-group">
              <label className="form-label">{t.password}</label>
              <input type="password" className="form-input" placeholder="••••••••" />
            </div>

            <button className="btn-primary" onClick={() => setIsLoggedIn(true)}>
              {t.loginBtn}
            </button>

            <p style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', marginTop: '14px', cursor: 'pointer', fontWeight: '500' }}>
              {t.signupLink}
            </p>

            <div style={{ margin: '20px 0 10px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
              <span>หรือ / OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
            </div>

            <button className="social-btn" onClick={() => setIsLoggedIn(true)}>
              <i className="fa-brands fa-google" style={{ color: '#EA4335', fontSize: '1.1rem' }}></i>
              <span>{t.socialGoogle}</span>
            </button>

            <button className="social-btn" onClick={() => setIsLoggedIn(true)}>
              <i className="fa-brands fa-apple" style={{ fontSize: '1.2rem' }}></i>
              <span>{t.socialApple}</span>
            </button>
          </div>
        </div>
      ) : role === 'customer' ? (
        /* ================= CUSTOMER MODE DASHBOARD ================= */
        <main className="main-content">
          
          {/* Service Category Buttons */}
          <div className="services-grid">
            <div className={`service-card ${activeTab === 'senior' ? 'active' : ''}`} onClick={() => setActiveTab('senior')}>
              <div className="service-icon"><i className="fa-solid fa-hands-holding-child"></i></div>
              <span className="service-title">{t.seniorCare}</span>
            </div>

            <div className={`service-card ${activeTab === 'child' ? 'active' : ''}`} onClick={() => setActiveTab('child')}>
              <div className="service-icon"><i className="fa-solid fa-baby"></i></div>
              <span className="service-title">{t.childCare}</span>
            </div>

            <div className={`service-card ${activeTab === 'transit' ? 'active' : ''}`} onClick={() => setActiveTab('transit')}>
              <div className="service-icon"><i className="fa-solid fa-car-side"></i></div>
              <span className="service-title">{t.transitService}</span>
            </div>
          </div>

          {/* Child Care Live Nanny Cam View */}
          {activeTab === 'child' && (
            <LiveCameraView t={t} />
          )}

          {/* Real-time GPS Tracker Map */}
          <GpsTrackerMap t={t} serviceType={activeTab} />

          {/* Daily Checklist Section */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-dark)' }}>
                {t.dailyChecklist}
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)' }}>
                {progressPct}% สำเร็จ
              </span>
            </div>

            <div className="checklist-container">
              {checklist.map(item => (
                <div key={item.id} className={`checklist-item ${item.done ? 'checked' : ''}`} onClick={() => toggleChecklist(item.id)}>
                  <div className="checklist-left">
                    <div className="custom-checkbox">
                      {item.done && <i className="fa-solid fa-check"></i>}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{t[item.textKey]}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Caregivers List */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '10px' }}>
              {t.nearbyCaregivers}
            </h3>
            {caregivers.map(c => (
              <div key={c.id} className="caregiver-card">
                <img src={c.avatar} className="caregiver-avatar" alt={c.name} />
                <div className="caregiver-info">
                  <h4 className="caregiver-name">{c.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.role}</p>
                  <div className="caregiver-meta">
                    <span><i className="fa-solid fa-star" style={{ color: '#FFB300' }}></i> {c.rating} ({c.reviews})</span>
                    <span><strong>{c.rate}</strong> {t.rateHour}</span>
                  </div>
                </div>
                <button className="book-btn" onClick={() => setBookingCaregiver(c)}>
                  {t.bookNow}
                </button>
              </div>
            ))}
          </div>

        </main>
      ) : (
        /* ================= PROVIDER / CAREGIVER MODE DASHBOARD ================= */
        <main className="main-content">
          
          {/* Status Online/Offline Switch Card */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-dark)' }}>
                {t.providerStatus}
              </h3>
              <p style={{ fontSize: '0.78rem', color: isOnline ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '600', marginTop: '2px' }}>
                {isOnline ? t.providerOnline : t.providerOffline}
              </p>
            </div>

            <button className="btn-primary" style={{ width: 'auto', padding: '8px 18px', fontSize: '0.8rem' }} onClick={() => setIsOnline(!isOnline)}>
              {isOnline ? 'สลับเป็น Offline' : 'สลับเป็น Online'}
            </button>
          </div>

          {/* Earnings Summary Card */}
          <div className="glass-card" style={{ background: 'var(--primary-gradient)', color: '#FFF' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{t.earningsToday}</span>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '4px 0' }}>฿1,450.00</h2>
            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>เสร็จสิ้นแล้ว 3 งานในวันนี้ • สะสม 18 ชม.</span>
          </div>

          {/* Incoming Job Requests */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '12px' }}>
              {t.newJobRequests}
            </h3>

            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-dark)' }}>ดูแลผู้สูงอายุ (พักฟื้น)</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-green)' }}>฿600 (3 ชม.)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 พญาไท, กรุงเทพฯ (ห่าง 1.2 กม.)</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '4px' }}>เวลา: วันนี้ 14:00 - 17:00 น.</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}>
                  {t.acceptJob}
                </button>
                <button style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(0,0,0,0.15)', background: '#FFF', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600' }}>
                  {t.rejectJob}
                </button>
              </div>
            </div>
          </div>

          {/* Care Vitals Logger Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '10px' }}>
              {t.logVitalsTitle}
            </h3>

            <div className="form-group">
              <label className="form-label">ความดันโลหิต (mmHg)</label>
              <input type="text" className="form-input" placeholder="เช่น 120/80" />
            </div>

            <div className="form-group">
              <label className="form-label">ระดับน้ำตาล / อุณหภูมิร่างกาย</label>
              <input type="text" className="form-input" placeholder="เช่น 98 mg/dL / 36.6 °C" />
            </div>

            <button className="btn-primary" style={{ width: '100%' }}>
              {t.submitLog}
            </button>
          </div>

        </main>
      )}

      {/* Floating Red SOS Button */}
      {isLoggedIn && (
        <div className="sos-floating-container">
          <button className="sos-btn" onClick={() => setShowSosModal(true)}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{t.sosButton}</span>
          </button>
        </div>
      )}

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div className="modal-overlay" onClick={() => setShowSosModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSosModal(false)}>✕</button>
            
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <i className="fa-solid fa-truck-medical" style={{ fontSize: '2.5rem', color: 'var(--accent-red)', marginBottom: '10px' }}></i>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-red)' }}>
                {t.sosModalTitle}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                กดเพื่อโทรออกสายด่วนทันที หรือกระจายสัญญาณ GPS ไปยังศูนย์กู้ภัย
              </p>
            </div>

            <button className="btn-primary" style={{ background: 'var(--accent-red)', marginBottom: '10px' }} onClick={() => alert('กำลังโทรออก 1669 สายด่วนกู้ชีพ...')}>
              <i className="fa-solid fa-phone" style={{ marginRight: '8px' }}></i> {t.sosCall1669}
            </button>

            <button className="social-btn" style={{ borderColor: 'var(--primary)', color: 'var(--primary-dark)', marginBottom: '10px' }} onClick={() => alert('กำลังโทรหาญาติฉุกเฉิน...')}>
              <i className="fa-solid fa-user-gear" style={{ marginRight: '8px' }}></i> {t.sosCallRelative}
            </button>

            <button className="social-btn" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', border: 'none' }} onClick={() => alert('กระจายสัญญาณ GPS เรียบร้อยแล้ว!')}>
              <i className="fa-solid fa-location-arrow" style={{ marginRight: '8px' }}></i> {t.sosBroadcastGps}
            </button>
          </div>
        </div>
      )}

      {/* Caregiver Booking Modal */}
      {bookingCaregiver && (
        <div className="modal-overlay" onClick={() => setBookingCaregiver(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBookingCaregiver(null)}>✕</button>
            
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img src={bookingCaregiver.avatar} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', boxShadow: 'var(--shadow-md)' }} alt={bookingCaregiver.name} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-dark)' }}>{bookingCaregiver.name}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bookingCaregiver.role}</p>
            </div>

            <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>อัตราค่าบริการ:</span>
                <strong>{bookingCaregiver.rate} บาท / ชั่วโมง</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>คะแนนรีวิว:</span>
                <strong style={{ color: '#FFB300' }}>★ {bookingCaregiver.rating} ({bookingCaregiver.reviews} รีวิว)</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">เลือกวันที่เริ่มต้น</label>
              <input type="date" className="form-input" defaultValue="2026-08-01" />
            </div>

            <div className="form-group">
              <label className="form-label">เลือกจำนวนชั่วโมง / วัน</label>
              <select className="form-input">
                <option>4 ชั่วโมง (ครึ่งวัน)</option>
                <option>8 ชั่วโมง (เต็มวัน)</option>
                <option>เหมาจ่ายรายเดือน</option>
              </select>
            </div>

            <button className="btn-primary" onClick={() => { alert(`ทำการยืนยันการจอง ${bookingCaregiver.name} เรียบร้อยแล้ว!`); setBookingCaregiver(null); }}>
              ยืนยันการจอง & ชำระเงิน (PromptPay / QR)
            </button>
          </div>
        </div>
      )}

    </>
  );
}

// Render React App to DOM
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
