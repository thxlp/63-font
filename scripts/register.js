const form = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const API_URL = 'http://localhost:3002/api/auth/signup';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    messageDiv.style.display = 'none';
    messageDiv.className = 'message';
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate password match
    if (password !== confirmPassword) {
        showMessage('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง', 'error');
        return;
    }
    
    // Validate password length (optional - adjust as needed)
    if (password.length < 6) {
        showMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
        return;
    }
    
    // เก็บข้อมูล register ไว้ใน localStorage
    const registerData = {
        username: username,
        email: email,
        password: password
    };
    
    localStorage.setItem('registerData', JSON.stringify(registerData));
    
    // Redirect to BMI calculator page
    showMessage('บันทึกข้อมูลแล้ว กำลังเปลี่ยนหน้า...', 'success');
    setTimeout(() => {
        window.location.href = '../pages/bmi-calculator.html';
    }, 1500);
});

function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message message-${type}`;
    messageDiv.style.display = 'block';
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

