// ฟังก์ชันสำหรับจัดการตะกร้าสินค้าและคำนวณแคลอรี่

// ดึงข้อมูลตะกร้าจาก localStorage
function getCart() {
    const cartJson = localStorage.getItem('foodCart');
    return cartJson ? JSON.parse(cartJson) : [];
}

// บันทึกตะกร้าลง localStorage
function saveCart(cart) {
    localStorage.setItem('foodCart', JSON.stringify(cart));
}

// เพิ่มสินค้าลงตะกร้า
function addToCart(product) {
    const cart = getCart();
    
    // ตรวจสอบว่าสินค้านี้มีในตะกร้าแล้วหรือยัง
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex === -1) {
        // เพิ่มสินค้าใหม่ พร้อมข้อมูลโภชนาการ
        const cartItem = {
            id: product.id,
            name: product.name || 'ไม่ระบุชื่อ',
            brand: product.brand || '',
            image_url: product.image_url || product.image_front_url || '',
            nutriscore_grade: product.nutriscore_grade || '',
            addedAt: new Date().toISOString(),
            // เก็บข้อมูลโภชนาการ
            nutrition: product.nutrition || null
        };
        
        cart.push(cartItem);
        saveCart(cart);
        updateCartBadge();
        return true;
    } else {
        // สินค้ามีอยู่แล้ว
        return false;
    }
}

// ลบสินค้าออกจากตะกร้า
function removeFromCart(productId) {
    const cart = getCart();
    const filteredCart = cart.filter(item => item.id !== productId);
    saveCart(filteredCart);
    updateCartBadge();
    
    // ถ้าอยู่ในหน้า cart.html ให้รีเฟรชการแสดงผล
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
        calculateTotalNutrition();
    }
}

// เก็บประวัติตะกร้า
function saveCartHistory() {
    const cart = getCart();
    if (cart.length === 0) {
        return false; // ไม่มีสินค้าในตะกร้า
    }
    
    // คำนวณแคลอรี่รวม
    let totalEnergy = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    
    cart.forEach(item => {
        if (item.nutrition) {
            const nut = item.nutrition;
            if (nut.energy) {
                let energy = parsePositiveNumber(nut.energy);
                const unit = (nut.energy_unit || 'kcal').toLowerCase();
                if (unit === 'kj' || unit === 'kj/100g' || unit.includes('kj')) {
                    energy = energy / 4.184;
                }
                totalEnergy += energy;
            }
            if (nut.fat) totalFat += parsePositiveNumber(nut.fat);
            if (nut.carbohydrates) totalCarbs += parsePositiveNumber(nut.carbohydrates);
            if (nut.proteins) totalProtein += parsePositiveNumber(nut.proteins);
        }
    });
    
    // สร้างประวัติ
    const historyItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items: [...cart], // คัดลอกสินค้า
        summary: {
            totalEnergy: Math.max(0, totalEnergy).toFixed(1),
            totalFat: Math.max(0, totalFat).toFixed(1),
            totalCarbs: Math.max(0, totalCarbs).toFixed(1),
            totalProtein: Math.max(0, totalProtein).toFixed(1),
            itemCount: cart.length
        }
    };
    
    // ดึงประวัติเก่า
    const historyJson = localStorage.getItem('cartHistory');
    let history = historyJson ? JSON.parse(historyJson) : [];
    
    // เพิ่มประวัติใหม่ไว้ด้านหน้า
    history.unshift(historyItem);
    
    // เก็บแค่ 50 รายการล่าสุด
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    // บันทึกประวัติ
    localStorage.setItem('cartHistory', JSON.stringify(history));
    
    return true;
}

// ดึงประวัติตะกร้า
function getCartHistory() {
    const historyJson = localStorage.getItem('cartHistory');
    return historyJson ? JSON.parse(historyJson) : [];
}

// ลบประวัติตะกร้า
function deleteCartHistory(historyId) {
    const history = getCartHistory();
    const filtered = history.filter(item => item.id !== historyId);
    localStorage.setItem('cartHistory', JSON.stringify(filtered));
}

// เสร็จสิ้นตะกร้า - เก็บประวัติและย้อนกลับ
function finishCart() {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert('ตะกร้าว่างเปล่า ไม่สามารถบันทึกประวัติได้');
        return;
    }
    
    // เก็บประวัติ
    const saved = saveCartHistory();
    
    if (saved) {
        // ล้างตะกร้าปัจจุบัน
        localStorage.removeItem('foodCart');
        updateCartBadge();
        
        // แสดงข้อความแจ้งเตือน
        alert('บันทึกประวัติตะกร้าเรียบร้อยแล้ว');
        
        // ย้อนกลับไปหน้าค้นหา
        window.location.href = 'search.html';
    }
}

// ล้างตะกร้าทั้งหมด
function clearCart() {
    if (confirm('คุณต้องการล้างตะกร้าทั้งหมดหรือไม่?')) {
        localStorage.removeItem('foodCart');
        updateCartBadge();
        
        // ถ้าอยู่ในหน้า cart.html ให้รีเฟรชการแสดงผล
        if (window.location.pathname.includes('cart.html')) {
            displayCart();
            calculateTotalNutrition();
        }
    }
}

// ตรวจสอบว่าสินค้าอยู่ในตะกร้าหรือไม่
function isInCart(productId) {
    const cart = getCart();
    return cart.some(item => item.id === productId);
}

// แสดงตะกร้าในหน้า cart.html
function displayCart() {
    const cart = getCart();
    const cartContent = document.getElementById('cartContent');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartActions = document.getElementById('cartActions');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartContent || !cartEmpty || !cartActions || !cartSummary) {
        return; // ไม่ใช่หน้า cart.html
    }
    
    if (cart.length === 0) {
        cartContent.innerHTML = '';
        cartEmpty.classList.remove('hidden');
        cartActions.style.display = 'none';
        cartSummary.style.display = 'none';
    } else {
        cartEmpty.classList.add('hidden');
        cartActions.style.display = 'flex';
        cartSummary.style.display = 'block';
        
        cartContent.innerHTML = cart.map(item => {
            const imageUrl = item.image_url || 'https://via.placeholder.com/200?text=No+Image';
            const nutriscore = item.nutriscore_grade ? 
                `<span class="cart-item-badge nutriscore-${item.nutriscore_grade.toLowerCase()}">Nutri-Score: ${item.nutriscore_grade.toUpperCase()}</span>` : '';
            
            // แสดงข้อมูลโภชนาการถ้ามี
            let nutritionText = '';
            if (item.nutrition) {
                const nut = item.nutrition;
                const parts = [];
                if (nut.energy) parts.push(`พลังงาน: ${nut.energy} ${nut.energy_unit || 'kcal'}`);
                if (nut.fat) parts.push(`ไขมัน: ${nut.fat}${nut.fat_unit || 'g'}`);
                if (nut.carbohydrates) parts.push(`คาร์บ: ${nut.carbohydrates}${nut.carbohydrates_unit || 'g'}`);
                if (nut.proteins) parts.push(`โปรตีน: ${nut.proteins}${nut.proteins_unit || 'g'}`);
                nutritionText = parts.length > 0 ? `<div class="cart-item-nutrition">${parts.join(' | ')}</div>` : '';
            }
            
            return `
                <div class="cart-item">
                    <img src="${imageUrl}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        ${item.brand ? `<div class="cart-item-brand">${item.brand}</div>` : ''}
                        ${nutriscore}
                        ${nutritionText}
                    </div>
                    <div class="cart-item-actions">
                        <button class="btn-remove" onclick="removeFromCart('${item.id}')">ลบ</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ฟังก์ชันช่วยแปลงค่าเป็นตัวเลขและป้องกันค่าลบ
function parsePositiveNumber(value) {
    if (!value) return 0;
    const num = parseFloat(value);
    // ตรวจสอบว่าเป็นตัวเลขที่ถูกต้องและไม่ใช่ NaN
    if (isNaN(num) || !isFinite(num)) return 0;
    // ป้องกันค่าลบ โดยใช้ค่าสูงสุดระหว่าง 0 กับค่าที่ได้
    return Math.max(0, num);
}

// คำนวณแคลอรี่และสารอาหารรวม
function calculateTotalNutrition() {
    const cart = getCart();
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartSummary || cart.length === 0) {
        return;
    }
    
    let totalEnergy = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let energyUnit = 'kcal';
    
    cart.forEach(item => {
        if (item.nutrition) {
            const nut = item.nutrition;
            
            // คำนวณพลังงาน (แปลงเป็น kcal ถ้าจำเป็น)
            if (nut.energy) {
                let energy = parsePositiveNumber(nut.energy);
                const unit = (nut.energy_unit || 'kcal').toLowerCase();
                
                // แปลง kJ เป็น kcal (1 kcal = 4.184 kJ)
                if (unit === 'kj' || unit === 'kj/100g' || unit.includes('kj')) {
                    energy = energy / 4.184;
                }
                totalEnergy += energy;
                energyUnit = 'kcal';
            }
            
            // คำนวณไขมัน
            if (nut.fat) {
                totalFat += parsePositiveNumber(nut.fat);
            }
            
            // คำนวณคาร์โบไฮเดรต
            if (nut.carbohydrates) {
                totalCarbs += parsePositiveNumber(nut.carbohydrates);
            }
            
            // คำนวณโปรตีน
            if (nut.proteins) {
                totalProtein += parsePositiveNumber(nut.proteins);
            }
        }
    });
    
    // แสดงผลลัพธ์ (ป้องกันค่าลบอีกครั้ง)
    document.getElementById('totalEnergy').textContent = Math.max(0, totalEnergy).toFixed(1);
    document.getElementById('energyUnit').textContent = energyUnit;
    document.getElementById('totalFat').textContent = Math.max(0, totalFat).toFixed(1);
    document.getElementById('totalCarbs').textContent = Math.max(0, totalCarbs).toFixed(1);
    document.getElementById('totalProtein').textContent = Math.max(0, totalProtein).toFixed(1);
}

// อัปเดต badge จำนวนสินค้าในตะกร้า
function updateCartBadge() {
    const cart = getCart();
    const badgeElements = document.querySelectorAll('.cart-badge-count');
    const fabBadge = document.getElementById('fabBadge');
    
    badgeElements.forEach(badge => {
        if (cart.length > 0) {
            badge.textContent = cart.length > 99 ? '99+' : cart.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
    
    // อัปเดต FAB badge
    if (fabBadge) {
        if (cart.length > 0) {
            fabBadge.textContent = cart.length > 99 ? '99+' : cart.length;
            fabBadge.style.display = 'flex';
        } else {
            fabBadge.style.display = 'none';
        }
    }
}

// อัปเดตสถานะปุ่ม "เพิ่มลงตะกร้า"
function updateAddToCartButton(productId, buttonElement) {
    if (isInCart(productId)) {
        buttonElement.classList.add('added');
        buttonElement.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>เพิ่มแล้ว</span>
        `;
        buttonElement.disabled = false;
    } else {
        buttonElement.classList.remove('added');
        buttonElement.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>เพิ่มลงตะกร้า</span>
        `;
        buttonElement.disabled = false;
    }
}

// โหลด badge เมื่อโหลดหน้า
window.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});

