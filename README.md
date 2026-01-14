# ระบบจัดการอาหารและโภชนาการ (Food & Nutrition Management System)

ระบบจัดการอาหารและโภชนาการบนเว็บที่ช่วยให้ผู้ใช้สามารถค้นหาข้อมูลอาหาร คำนวณค่าดัชนีมวลกาย (BMI) และจัดการตะกร้าอาหารได้

## ฟีเจอร์หลัก

- 🔐 การลงทะเบียนและเข้าสู่ระบบ
- 📊 คำนวณ BMI และแคลอรี่ที่ควรได้รับ
- 🔍 ค้นหาผลิตภัณฑ์อาหารจาก OpenFoodFacts API
- 🍳 ค้นหาวิธีทำอาหารจาก Spoonacular API
- 📷 สแกนบาร์โค้ดเพื่อค้นหาข้อมูลสินค้า
- 🛒 จัดการตะกร้าสินค้าและคำนวณแคลอรี่รวม
- 📋 ดูประวัติตะกร้าที่บันทึกไว้
- 👤 ดูและจัดการโปรไฟล์ผู้ใช้

## เทคโนโลยีที่ใช้

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage API
- OpenFoodFacts API
- Spoonacular API

## การติดตั้งและใช้งาน

1. Clone repository นี้
```bash
git clone https://github.com/thxlp/63-font.git
cd Project_63_font
```

2. เปิดไฟล์ `pages/login.html` ในเบราว์เซอร์

3. สำหรับการใช้งานเต็มรูปแบบ ต้องมี Backend API Server ทำงานที่ `http://localhost:3002`

## โครงสร้างโปรเจกต์

```
Project_63_font/
├── pages/              # หน้าเว็บทั้งหมด
│   ├── login.html
│   ├── register.html
│   ├── main.html
│   ├── search.html
│   ├── cart.html
│   └── ...
├── scripts/            # JavaScript files
│   ├── cart.js
│   ├── bmi-calculator.js
│   └── ...
├── styles/             # CSS files
│   ├── login-style.css
│   ├── cart-style.css
│   └── ...
└── README.md

```

## การ Deploy

### GitHub Pages

เว็บไซต์นี้สามารถ deploy บน GitHub Pages ได้โดย:

1. ไปที่ GitHub repository: https://github.com/thxlp/63-font
2. ไปที่ **Settings** > **Pages** (ในเมนูด้านซ้าย)
3. ในส่วน **Source**:
   - เลือก Branch: `main`
   - เลือก Folder: `/ (root)`
4. คลิก **Save**
5. รอสักครู่ GitHub จะสร้าง URL สำหรับเว็บไซต์ของคุณ (เช่น: `https://thxlp.github.io/63-font/`)

### Vercel หรือ Netlify

โปรเจกต์นี้มีไฟล์ config สำหรับ deploy บน Vercel และ Netlify อยู่แล้ว:

- **Vercel**: มีไฟล์ `vercel.json` พร้อมใช้งาน
- **Netlify**: มีไฟล์ `netlify.toml` พร้อมใช้งาน

เพียงแค่เชื่อมต่อ GitHub repository กับ Vercel/Netlify ระบบจะ deploy อัตโนมัติ

## หมายเหตุ

- ระบบนี้ใช้ Backend API ที่ `http://localhost:3002` สำหรับการทำงานบางส่วน
- สำหรับการใช้งานจริง ควรเปลี่ยน API endpoint เป็น production URL

## Supabase (optional)

To enable direct Supabase read/write from the profile page, provide your Supabase project URL and anon key.

1. Open `supabase-config.js` in the project root and set:

```js
window.__SUPABASE_URL__ = 'https://<your-project>.supabase.co';
window.__SUPABASE_KEY__ = '<your-anon-key>'; // use anon key for client use
```

2. Or set them in browser localStorage (for testing):

```js
localStorage.setItem('SUPABASE_URL','https://<your-project>.supabase.co');
localStorage.setItem('SUPABASE_KEY','<your-anon-key>');
```

3. Reload the profile page. The page will attempt to read from Supabase `users` and `bmi_records` tables and also insert/update BMI and password when you save.

Security: Never expose a `service_role` key in client-side code or committed files. Use the anon/public key and enforce RLS policies on Supabase.

## License

MIT License

