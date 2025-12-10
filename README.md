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
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
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

## GitHub Pages

เว็บไซต์นี้สามารถ deploy บน GitHub Pages ได้โดย:

1. ไปที่ Settings > Pages ใน GitHub repository
2. เลือก branch `main` และ folder `/ (root)`
3. ระบบจะสร้าง URL สำหรับเว็บไซต์ของคุณ

## หมายเหตุ

- ระบบนี้ใช้ Backend API ที่ `http://localhost:3002` สำหรับการทำงานบางส่วน
- สำหรับการใช้งานจริง ควรเปลี่ยน API endpoint เป็น production URL

## License

MIT License

