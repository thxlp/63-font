// เก็บค่า BMI และ calories ไว้ในตัวแปร global
let currentBMI = 0;
let currentCalories = 0;
let currentWeight = 0;
let currentHeight = 0;

const API_URL = 'https://63-back-production.up.railway.app/api/auth/signup';

// DOM Elements
const calculateBtn = document.getElementById('calculateBtn');
const nextBtn = document.getElementById('nextBtn');
const messageDiv = document.getElementById('message');
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const bmiResult = document.getElementById('bmi-result');
const calResult = document.getElementById('cal-result');

// ฟังก์ชันคำนวณ BMI
function calculateBMI() {
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);

    if (weight > 0 && height > 0) {
        // คำนวณ BMI: น้ำหนัก (kg) / ส่วนสูง (m)^2
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        
        // คำนวณ BMR (แคลอรี่ขั้นต่ำ) แบบคร่าวๆ (Mifflin-St Jeor แบบไม่ระบุเพศ/อายุ ใช้ค่ากลาง)
        // สูตรสมมติเพื่อแสดงผล: 10 * weight + 6.25 * height - 5 * 25 (อายุสมมติ)
        const calories = (10 * weight) + (6.25 * height) - 125; 

        // เก็บค่าไว้ในตัวแปร global
        currentBMI = bmi;
        currentCalories = calories;
        currentWeight = weight;
        currentHeight = height;

        // แสดงผล (ทศนิยม 2 ตำแหน่งสำหรับ BMI, จำนวนเต็มสำหรับ Cal)
        bmiResult.innerText = bmi.toFixed(2);
        calResult.innerText = Math.round(calories);
        
        // Clear any previous messages
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    } else {
        if (messageDiv) {
            showMessage('กรุณากรอกน้ำหนักและส่วนสูงให้ถูกต้อง', 'error');
        } else {
            alert("กรุณากรอกน้ำหนักและส่วนสูงให้ถูกต้อง");
        }
    }
}

// ฟังก์ชันส่งข้อมูลไปยัง API
async function submitBMI() {
    // ตรวจสอบว่ามีการคำนวณ BMI แล้วหรือยัง
    if (currentBMI === 0 || currentWeight === 0 || currentHeight === 0) {
        showMessage('กรุณาคำนวณ BMI ก่อนกดปุ่มต่อไป', 'error');
        return;
    }

    // ดึงข้อมูล register จาก localStorage
    const registerDataStr = localStorage.getItem('registerData');
    if (!registerDataStr) {
        showMessage('ไม่พบข้อมูลการสมัครสมาชิก กรุณาสมัครสมาชิกใหม่', 'error');
        setTimeout(() => {
            window.location.href = '../pages/register.html';
        }, 2000);
        return;
    }

    const registerData = JSON.parse(registerDataStr);

    // Clear previous messages
    if (messageDiv) {
        messageDiv.style.display = 'none';
        messageDiv.className = 'message';
    }

    // Disable button and show loading
    nextBtn.disabled = true;
    nextBtn.textContent = 'กำลังบันทึกข้อมูล...';

    try {
        // รวมข้อมูล register และ BMI แล้วส่งไปที่ API รอบเดียว
        const allData = {
            // ข้อมูล register
            username: registerData.username,
            email: registerData.email,
            password: registerData.password,
            // ข้อมูล BMI
            weight: currentWeight,
            height: currentHeight,
            bmi: parseFloat(currentBMI.toFixed(2)),
            calories: Math.round(currentCalories)
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(allData)
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            // ถ้า response ไม่ใช่ JSON
            data = { message: response.statusText || 'เกิดข้อผิดพลาด' };
        }

        if (response.ok) {
            console.log('=== Signup สำเร็จ ===');
            console.log('Response data:', data);
            console.log('Response keys:', Object.keys(data));
            
            // ✅ บันทึก token ถ้ามี (อาจอยู่ใน data.session.access_token หรือ data.token)
            let tokenToSave = null;
            if (data.session && data.session.access_token) {
                tokenToSave = data.session.access_token;
                console.log('✓ พบ token ใน data.session.access_token');
            } else if (data.token) {
                tokenToSave = data.token;
                console.log('✓ พบ token ใน data.token');
            } else if (data.accessToken) {
                tokenToSave = data.accessToken;
                console.log('✓ พบ token ใน data.accessToken');
            } else if (data.access_token) {
                tokenToSave = data.access_token;
                console.log('✓ พบ token ใน data.access_token');
            }
            
            if (tokenToSave) {
                localStorage.setItem('token', tokenToSave);
                console.log('✓ บันทึก token ลง localStorage');
            }
            
            // ✅ บันทึกข้อมูลผู้ใช้และ user_id
            let userDataToSave = null;
            
            // ตรวจสอบโครงสร้าง response (อาจอยู่ใน data.user, data.data, หรือ data โดยตรง)
            if (data.user) {
                userDataToSave = data.user;
                console.log('✓ พบข้อมูลใน data.user');
            } else if (data.data) {
                userDataToSave = data.data;
                console.log('✓ พบข้อมูลใน data.data');
            } else if (data.username || data.email || data.weight || data.height) {
                // ถ้ามี field ที่เป็นข้อมูลผู้ใช้ แสดงว่า data คือ userData
                userDataToSave = data;
                console.log('✓ พบข้อมูลใน data โดยตรง');
            }
            
            if (userDataToSave) {
                localStorage.setItem('userData', JSON.stringify(userDataToSave));
                localStorage.setItem('isLoggedIn', 'true');
                console.log('✓ บันทึกข้อมูลผู้ใช้ลง localStorage:', userDataToSave);
                
                // ✅ บันทึก user_id จาก root level หรือ userData
                let userIdToSave = null;
                if (data.id) {
                    userIdToSave = data.id;
                    console.log('✓ พบ user_id ใน data.id');
                } else if (data.user_id) {
                    userIdToSave = data.user_id;
                    console.log('✓ พบ user_id ใน data.user_id');
                } else if (userDataToSave.id) {
                    userIdToSave = userDataToSave.id;
                    console.log('✓ พบ user_id ใน userDataToSave.id');
                } else if (userDataToSave.user_id) {
                    userIdToSave = userDataToSave.user_id;
                    console.log('✓ พบ user_id ใน userDataToSave.user_id');
                }
                
                if (userIdToSave) {
                    localStorage.setItem('userId', userIdToSave);
                    localStorage.setItem('user_id', userIdToSave);
                    console.log('✅ บันทึก user_id ลง localStorage:', userIdToSave);
                } else {
                    console.warn('⚠ ไม่พบ user_id ใน response');
                }
            }
            
            // Success - ลบข้อมูล register จาก localStorage
            localStorage.removeItem('registerData');
            showMessage('บันทึกข้อมูลสำเร็จ! กำลังเปลี่ยนหน้า...', 'success');
            // Redirect to main page after 2 seconds
            setTimeout(() => {
                window.location.href = '../pages/main.html';
            }, 2000);
        } else {
            // Error from server
            let errorMsg = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
            
            if (response.status === 404) {
                errorMsg = 'ไม่พบ API endpoint กรุณาตรวจสอบ URL';
            } else if (data) {
                errorMsg = data.message || data.error || `เกิดข้อผิดพลาด (Status: ${response.status})`;
            } else {
                errorMsg = `เกิดข้อผิดพลาด (Status: ${response.status})`;
            }
            
            showMessage(errorMsg, 'error');
            nextBtn.disabled = false;
            nextBtn.textContent = 'ต่อไป';
        }
    } catch (error) {
        // Network or other errors
        console.error('Error:', error);
        showMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง', 'error');
        nextBtn.disabled = false;
        nextBtn.textContent = 'ต่อไป';
    }
}

// ฟังก์ชันแสดงข้อความ
function showMessage(message, type) {
    if (!messageDiv) {
        alert(message);
        return;
    }
    
    messageDiv.textContent = message;
    messageDiv.className = `message message-${type}`;
    messageDiv.style.display = 'block';
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Event Listeners
calculateBtn.addEventListener('click', calculateBMI);
nextBtn.addEventListener('click', submitBMI);
