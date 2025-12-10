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
            nutrition: product.nutrition || null,
            // เก็บข้อมูลมื้อ (เช้า, กลางวัน, เย็น) - เริ่มต้นเป็น null
            meal: null
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

// ตั้งค่ามื้อสำหรับสินค้าในตะกร้า
function setMeal(productId, meal) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].meal = meal; // 'breakfast', 'lunch', 'dinner', หรือ null
        saveCart(cart);
        
        // ถ้าอยู่ในหน้า cart.html ให้รีเฟรชการแสดงผล
        if (window.location.pathname.includes('cart.html') || window.location.pathname.includes('pages/cart.html')) {
            displayCart();
            calculateTotalNutrition();
        }
        
        return true;
    }
    return false;
}

// ประกาศเป็น global function เพื่อให้เรียกจาก HTML ได้
window.setMeal = function(productId, meal) {
    return setMeal(productId, meal);
};

// ลบสินค้าออกจากตะกร้า
function removeFromCart(productId) {
    const cart = getCart();
    const filteredCart = cart.filter(item => item.id !== productId);
    saveCart(filteredCart);
    updateCartBadge();
    
    // ถ้าอยู่ในหน้า cart.html ให้รีเฟรชการแสดงผล
    if (window.location.pathname.includes('cart.html') || window.location.pathname.includes('pages/cart.html')) {
        displayCart();
        calculateTotalNutrition();
    }
}

// เก็บประวัติตะกร้า (บันทึกผ่าน API)
async function saveCartHistory() {
    const cart = getCart();
    if (cart.length === 0) {
        return { success: false, message: 'ตะกร้าว่างเปล่า' };
    }
    
    const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    if (!userId) {
        console.warn('⚠ ไม่พบ User ID - บันทึกเฉพาะใน localStorage');
        return saveCartHistoryToLocalStorage();
    }
    
    // ตรวจสอบว่า user_id เป็น UUID (string) หรือ integer
    // ถ้าเป็น UUID (มี - หรือความยาวมากกว่า 10) ให้ส่งเป็น string
    // ถ้าเป็น integer ให้ส่งเป็น number
    const isUUID = userId.includes('-') || userId.length > 10;
    const userIdForAPI = isUUID ? userId : parseInt(userId);
    
    console.log('🔍 User ID Info:');
    console.log('   Raw userId:', userId);
    console.log('   Is UUID:', isUUID);
    console.log('   userIdForAPI:', userIdForAPI, typeof userIdForAPI);
    
    // คำนวณแคลอรี่รวม
    let totalEnergy = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    
    // เตรียมข้อมูล items สำหรับ API
    const items = cart.map(item => {
        let itemCalories = 0;
        if (item.nutrition && item.nutrition.energy) {
            let energy = parsePositiveNumber(item.nutrition.energy);
            const unit = (item.nutrition.energy_unit || 'kcal').toLowerCase();
            if (unit === 'kj' || unit === 'kj/100g' || unit.includes('kj')) {
                energy = energy / 4.184;
            }
            itemCalories = energy;
            totalEnergy += energy;
        }
        if (item.nutrition) {
            const nut = item.nutrition;
            if (nut.fat) totalFat += parsePositiveNumber(nut.fat);
            if (nut.carbohydrates) totalCarbs += parsePositiveNumber(nut.carbohydrates);
            if (nut.proteins) totalProtein += parsePositiveNumber(nut.proteins);
        }
        
        return {
            id: item.id,
            name: item.name,
            brand: item.brand || '',
            image_url: item.image_url || item.image_front_url || '',
            calories: itemCalories.toFixed(1),
            quantity: 1
        };
    });
    
    // ลองบันทึกผ่าน API
    try {
        console.log('📤 กำลังส่งข้อมูลไปยัง API /api/cart/save...');
        console.log('   user_id:', userIdForAPI, `(${typeof userIdForAPI})`);
        console.log('   items:', items.length, 'รายการ');
        console.log('   total_calories:', totalEnergy.toFixed(1));
        
        const response = await fetch('https://63-back-production.up.railway.app/api/cart/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userIdForAPI, // ส่งเป็น string ถ้าเป็น UUID, number ถ้าเป็น integer
                items: items,
                total_calories: totalEnergy.toFixed(1)
            })
        });
        
        console.log('📥 Response status:', response.status, response.statusText);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
        
        let data;
        const responseText = await response.text();
        console.log('📥 Response text (raw):', responseText);
        
        try {
            data = JSON.parse(responseText);
            console.log('📥 Response data (parsed):', data);
        } catch (parseError) {
            console.error('❌ ไม่สามารถ parse response เป็น JSON ได้:', parseError);
            console.error('   Response text:', responseText);
            // ถ้า response ไม่ใช่ JSON แต่ status เป็น 200-299 อาจจะสำเร็จ
            if (response.ok) {
                console.log('⚠ Response ไม่ใช่ JSON แต่ status OK - ถือว่าสำเร็จ');
                saveCartHistoryToLocalStorage();
                return { success: true, savedToDatabase: true, id: null };
            }
            throw new Error('Response ไม่ใช่ JSON');
        }
        
        // ตรวจสอบว่า API สำเร็จหรือไม่
        // รองรับหลายรูปแบบ response: { success: true }, { id: ... }, { data: { id: ... } }
        const isSuccess = response.ok && data && (
            data.success === true || 
            data.success === 'true' ||
            data.id !== undefined || 
            data.data?.id !== undefined ||
            (response.status >= 200 && response.status < 300 && !data.error)
        );
        
        if (isSuccess) {
            const cartId = data.id || data.data?.id || data.cart_id;
            console.log('✅ บันทึกประวัติตะกร้าผ่าน API สำเร็จ:', data);
            console.log('   Cart ID:', cartId);
            // บันทึกใน localStorage เป็น backup ด้วย
            saveCartHistoryToLocalStorage();
            return { success: true, savedToDatabase: true, id: cartId };
        } else {
            // แปลง status code เป็นข้อความที่เข้าใจง่าย
            let statusMessage = '';
            switch (response.status) {
                case 400:
                    statusMessage = 'Bad Request - ข้อมูลไม่ถูกต้อง';
                    break;
                case 401:
                    statusMessage = 'Unauthorized - ไม่มีสิทธิ์เข้าถึง';
                    break;
                case 402:
                    statusMessage = 'Payment Required - ต้องชำระเงิน (อาจเป็น error จาก backend)';
                    break;
                case 403:
                    statusMessage = 'Forbidden - ไม่อนุญาต';
                    break;
                case 404:
                    statusMessage = 'Not Found - ไม่พบ endpoint';
                    break;
                case 422:
                    statusMessage = 'Unprocessable Entity - ข้อมูลไม่ถูกต้อง';
                    break;
                case 500:
                    statusMessage = 'Internal Server Error - เกิดข้อผิดพลาดในเซิร์ฟเวอร์';
                    break;
                default:
                    statusMessage = `HTTP ${response.status}`;
            }
            
            const errorMsg = data?.error || data?.message || data?.error_message || statusMessage;
            console.error('❌ API ตอบกลับแต่ไม่สำเร็จ:');
            console.error('   Status:', response.status, response.statusText);
            console.error('   Error:', errorMsg);
            console.error('   Response data:', data);
            
            // ถ้าเป็น 402 อาจเป็น error จาก backend - แสดงข้อความเตือน
            if (response.status === 402) {
                console.error('   ⚠️ HTTP 402 (Payment Required) - อาจเป็น error จาก backend หรือ middleware');
            }
            
            // Fallback: บันทึกใน localStorage
            return saveCartHistoryToLocalStorage();
        }
    } catch (error) {
        console.error('❌ Error เรียก API:', error);
        console.error('   Error message:', error.message);
        // Fallback: บันทึกใน localStorage
        return saveCartHistoryToLocalStorage();
    }
}

// บันทึกประวัติตะกร้าใน localStorage (fallback)
function saveCartHistoryToLocalStorage() {
    const cart = getCart();
    if (cart.length === 0) {
        return { success: false, message: 'ตะกร้าว่างเปล่า' };
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
    
    // เก็บแค่ 20 รายการล่าสุด เพื่อประหยัดพื้นที่การเก็บข้อมูล
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    // บันทึกประวัติ
    localStorage.setItem('cartHistory', JSON.stringify(history));
    
    return { success: true, savedToDatabase: false, fallback: true };
}

// ดึงประวัติตะกร้า (ดึงจาก API และ localStorage)
async function getCartHistory(limit = 20, offset = 0) {
    const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    
    // ลองดึงจาก API ก่อน
    if (userId) {
        try {
            // URL encode user_id เพื่อรองรับ UUID
            const encodedUserId = encodeURIComponent(userId);
            const response = await fetch(
                `https://63-back-production.up.railway.app/api/cart/history?user_id=${encodedUserId}&limit=${limit}&offset=${offset}`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    // แปลงข้อมูลจาก API เป็นรูปแบบเดียวกับ localStorage
                    const history = data.data.map(cart => ({
                        id: cart.id.toString(),
                        date: cart.created_at || cart.date || new Date().toISOString(),
                        items: (cart.items || []).map(item => ({
                            id: item.id || item.product_id || '',
                            name: item.name || 'ไม่ระบุชื่อ',
                            brand: item.brand || '',
                            image_url: item.image_url || item.imageUrl || item.image || item.image_front_url || item.image_front_small_url || '',
                            calories: item.calories || '0',
                            quantity: item.quantity || 1
                        })),
                        summary: {
                            totalEnergy: cart.total_calories || '0',
                            totalFat: '0',
                            totalCarbs: '0',
                            totalProtein: '0',
                            itemCount: cart.items ? cart.items.length : 0
                        }
                    }));
                    console.log('✅ ดึงประวัติตะกร้าจาก API สำเร็จ:', history.length, 'รายการ');
                    return history;
                }
            }
        } catch (error) {
            console.warn('⚠ ไม่สามารถดึงประวัติจาก API ได้:', error);
        }
    }
    
    // Fallback: ดึงจาก localStorage
    const historyJson = localStorage.getItem('cartHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];
    console.log('📦 ใช้ประวัติจาก localStorage:', history.length, 'รายการ');
    return history;
}

// ฟังก์ชันดึงประวัติตะกร้าแบบ sync (สำหรับใช้ในโค้ดเดิม)
function getCartHistorySync() {
    const historyJson = localStorage.getItem('cartHistory');
    return historyJson ? JSON.parse(historyJson) : [];
}

// ลบประวัติตะกร้า (ลบผ่าน API หรือ localStorage)
async function deleteCartHistory(historyId) {
    const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    
    // ตรวจสอบว่า user_id เป็น UUID หรือ integer
    const isUUID = userId && (userId.includes('-') || userId.length > 10);
    const userIdForAPI = isUUID ? userId : (userId ? parseInt(userId) : null);
    
    // ลองลบผ่าน API ก่อน (ถ้า historyId เป็นตัวเลข แสดงว่าเป็น ID จาก database)
    if (userId && !isNaN(parseInt(historyId))) {
        try {
            const response = await fetch(`https://63-back-production.up.railway.app/api/cart/${historyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userIdForAPI // ส่งเป็น string ถ้าเป็น UUID, number ถ้าเป็น integer
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('✅ ลบประวัติตะกร้าผ่าน API สำเร็จ');
                    // ลบจาก localStorage ด้วย
                    const history = getCartHistorySync();
                    const filtered = history.filter(item => item.id !== historyId);
                    localStorage.setItem('cartHistory', JSON.stringify(filtered));
                    return true;
                }
            }
        } catch (error) {
            console.warn('⚠ ไม่สามารถลบผ่าน API ได้:', error);
        }
    }
    
    // Fallback: ลบจาก localStorage
    const history = getCartHistorySync();
    const filtered = history.filter(item => item.id !== historyId);
    localStorage.setItem('cartHistory', JSON.stringify(filtered));
    return true;
}

// บันทึก log แคลอรี่รายวันลง database
async function saveDailyCalorieLog() {
    try {
        const cart = getCart();
        if (cart.length === 0) {
            return { success: false, message: 'ตะกร้าว่างเปล่า' };
        }

        const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
        if (!userId) {
            console.warn('⚠ ไม่พบ User ID - ไม่สามารถบันทึก log ได้');
            return { success: false, message: 'ไม่พบ User ID' };
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

        // ดึงข้อมูลแคลอรี่เป้าหมาย
        const targetCalories = await getUserTargetCalories();

        // ตรวจสอบว่า user_id เป็น UUID หรือ integer
        const isUUID = userId.includes('-') || userId.length > 10;
        const userIdForAPI = isUUID ? userId : parseInt(userId);
        
        // สร้างข้อมูล log
        const logData = {
            user_id: userIdForAPI, // ส่งเป็น string ถ้าเป็น UUID, number ถ้าเป็น integer
            date: new Date().toISOString().split('T')[0], // วันที่ในรูปแบบ YYYY-MM-DD
            total_calories: Math.max(0, totalEnergy).toFixed(1),
            target_calories: targetCalories ? targetCalories.toFixed(0) : null,
            total_fat: Math.max(0, totalFat).toFixed(1),
            total_carbs: Math.max(0, totalCarbs).toFixed(1),
            total_protein: Math.max(0, totalProtein).toFixed(1),
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                brand: item.brand || '',
                calories: item.nutrition?.energy ? (() => {
                    let energy = parsePositiveNumber(item.nutrition.energy);
                    const unit = (item.nutrition.energy_unit || 'kcal').toLowerCase();
                    if (unit === 'kj' || unit === 'kj/100g' || unit.includes('kj')) {
                        energy = energy / 4.184;
                    }
                    return energy.toFixed(1);
                })() : '0'
            }))
        };

        // ลองบันทึกลง database ผ่าน API
        const apiEndpoints = [
            'https://63-back-production.up.railway.app/api/data/calorie_logs',
            'https://63-back-production.up.railway.app/api/calorie_logs',
            'https://63-back-production.up.railway.app/api/data/daily_logs'
        ];

        let savedToDatabase = false;
        for (const endpoint of apiEndpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(logData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ บันทึก log แคลอรี่ลง database สำเร็จ:', result);
                    savedToDatabase = true;
                    break;
                } else {
                    const errorText = await response.text();
                    let errorMsg = errorText;
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMsg = errorData.error || errorData.message || errorText;
                    } catch (e) {
                        // ไม่ใช่ JSON
                    }
                    
                    // แปลง status code เป็นข้อความ
                    let statusMessage = '';
                    switch (response.status) {
                        case 400:
                            statusMessage = 'Bad Request';
                            break;
                        case 402:
                            statusMessage = 'Payment Required (อาจเป็น error จาก backend)';
                            break;
                        case 404:
                            statusMessage = 'Not Found';
                            break;
                        case 500:
                            statusMessage = 'Internal Server Error';
                            break;
                        default:
                            statusMessage = `HTTP ${response.status}`;
                    }
                    
                    console.warn(`⚠ API ${endpoint} ตอบกลับด้วย status ${response.status} (${statusMessage}):`, errorMsg);
                }
            } catch (err) {
                console.warn(`⚠ ไม่สามารถเชื่อมต่อกับ API ${endpoint}:`, err);
            }
        }

        if (!savedToDatabase) {
            console.warn('⚠ ไม่สามารถบันทึกลง database ได้ - บันทึกเฉพาะใน localStorage');
        }

        return { success: true, savedToDatabase };
    } catch (error) {
        console.error('❌ Error บันทึก log แคลอรี่:', error);
        return { success: false, message: error.message };
    }
}

// เสร็จสิ้นตะกร้า - เก็บประวัติและย้อนกลับ
async function finishCart() {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert('ตะกร้าว่างเปล่า ไม่สามารถบันทึกประวัติได้');
        return;
    }
    
    // แสดง loading
    const finishBtn = document.querySelector('.btn-finish');
    const originalText = finishBtn ? finishBtn.textContent : 'เสร็จสิ้น';
    if (finishBtn) {
        finishBtn.textContent = 'กำลังบันทึก...';
        finishBtn.disabled = true;
    }
    
    try {
        // บันทึก log แคลอรี่รายวันลง database
        const logResult = await saveDailyCalorieLog();
        
        // เก็บประวัติตะกร้าผ่าน API (มี fallback ไป localStorage)
        const cartResult = await saveCartHistory();
    
        if (cartResult.success) {
        // ล้างตะกร้าปัจจุบัน
        localStorage.removeItem('foodCart');
        updateCartBadge();
        
        // แสดงข้อความแจ้งเตือน
            let message = '';
            
            if (cartResult.savedToDatabase) {
                message = 'บันทึกประวัติตะกร้าเรียบร้อยแล้ว';
            } else if (cartResult.fallback) {
                message = 'บันทึกเฉพาะใน localStorage - ไม่สามารถเชื่อมต่อ database ได้';
            } else {
                message = 'บันทึกประวัติตะกร้าเรียบร้อยแล้ว';
            }
            
            if (logResult.savedToDatabase) {
                if (message) message += '\n';
                message += 'บันทึก log แคลอรี่รายวันลง database เรียบร้อยแล้ว';
            } else if (!logResult.savedToDatabase && logResult.success === false) {
                if (message) message += '\n';
                message += '(บันทึก log แคลอรี่เฉพาะใน localStorage)';
            }
            
            alert(message);
        
        // ย้อนกลับไปหน้าค้นหา
        window.location.href = '../pages/search.html';
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึกประวัติ: ' + (cartResult.message || 'ไม่ทราบสาเหตุ'));
            if (finishBtn) {
                finishBtn.textContent = originalText;
                finishBtn.disabled = false;
            }
        }
    } catch (error) {
        console.error('❌ Error ใน finishCart:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
        if (finishBtn) {
            finishBtn.textContent = originalText;
            finishBtn.disabled = false;
        }
    }
}

// ล้างตะกร้าทั้งหมด
function clearCart() {
    if (confirm('คุณต้องการล้างตะกร้าทั้งหมดหรือไม่?')) {
        localStorage.removeItem('foodCart');
        updateCartBadge();
        
        // ถ้าอยู่ในหน้า cart.html ให้รีเฟรชการแสดงผล
        if (window.location.pathname.includes('cart.html') || window.location.pathname.includes('pages/cart.html')) {
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

// แสดงตะกร้าในหน้า pages/cart.html
function displayCart() {
    const cart = getCart();
    const cartContent = document.getElementById('cartContent');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartActions = document.getElementById('cartActions');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartContent || !cartEmpty || !cartActions || !cartSummary) {
        return; // ไม่ใช่หน้า pages/cart.html
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

// ดึงข้อมูลแคลอรี่ที่ user ต้องการ
async function getUserTargetCalories() {
    try {
        const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
        if (!userId) {
            console.warn('⚠ ไม่พบ User ID');
            return null;
        }

        // ลองดึงจาก API ก่อน
        const apiEndpoints = [
            `https://63-back-production.up.railway.app/api/data/bmi_records?user_id=${userId}`,
            `https://63-back-production.up.railway.app/api/data/bmi_records`,
        ];

        for (const endpoint of apiEndpoints) {
            try {
                const response = await fetch(endpoint);
                if (response.ok) {
                    const data = await response.json();
                    // หา record ล่าสุด
                    let records = Array.isArray(data) ? data : (data.records || []);
                    if (records.length > 0) {
                        // เรียงตาม created_at ล่าสุด
                        records.sort((a, b) => {
                            const dateA = new Date(a.created_at || a.date || 0);
                            const dateB = new Date(b.created_at || b.date || 0);
                            return dateB - dateA;
                        });
                        const latestRecord = records[0];
                        if (latestRecord && latestRecord.calories !== undefined && latestRecord.calories !== null) {
                            const calories = parseFloat(latestRecord.calories);
                            if (!isNaN(calories) && calories > 0) {
                                console.log('✅ ดึงแคลอรี่จาก API:', calories);
                                return calories;
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn('⚠ ไม่สามารถดึงข้อมูลจาก API:', endpoint, err);
            }
        }

        // ถ้าไม่ได้จาก API ลองดึงจาก localStorage
        const savedUser = localStorage.getItem('userData') || localStorage.getItem('user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                const calories = userData.calories || userData.calorie;
                if (calories !== undefined && calories !== null) {
                    const cal = parseFloat(calories);
                    if (!isNaN(cal) && cal > 0) {
                        console.log('✅ ดึงแคลอรี่จาก localStorage:', cal);
                        return cal;
                    }
                }
            } catch (e) {
                console.warn('⚠ Error parsing userData:', e);
            }
        }

        return null;
    } catch (error) {
        console.error('❌ Error ดึงข้อมูลแคลอรี่:', error);
        return null;
    }
}

// คำนวณแคลอรี่และสารอาหารรวม
async function calculateTotalNutrition() {
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
    
    // เก็บแคลอรี่ต่อรายการ (สำหรับแสดง 3 มื้อ)
    const itemCalories = [];
    
    cart.forEach(item => {
        if (item.nutrition) {
            const nut = item.nutrition;
            let itemEnergy = 0;
            
            // คำนวณพลังงาน (แปลงเป็น kcal ถ้าจำเป็น)
            if (nut.energy) {
                let energy = parsePositiveNumber(nut.energy);
                const unit = (nut.energy_unit || 'kcal').toLowerCase();
                
                // แปลง kJ เป็น kcal (1 kcal = 4.184 kJ)
                if (unit === 'kj' || unit === 'kj/100g' || unit.includes('kj')) {
                    energy = energy / 4.184;
                }
                itemEnergy = energy;
                totalEnergy += energy;
                energyUnit = 'kcal';
            }
            
            // เก็บแคลอรี่ต่อรายการ
            itemCalories.push({
                name: item.name,
                calories: itemEnergy
            });
            
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

    // ดึงข้อมูลแคลอรี่ที่ user ต้องการ
    const targetCalories = await getUserTargetCalories();
    if (targetCalories) {
        document.getElementById('targetCalories').textContent = targetCalories.toFixed(0);
        
        // ตรวจสอบว่าเกินหรือไม่
        if (totalEnergy > targetCalories) {
            const excess = totalEnergy - targetCalories;
            const excessPercent = ((excess / targetCalories) * 100).toFixed(1);
            const warningDiv = document.getElementById('calorieWarning');
            const warningText = document.getElementById('warningText');
            
            if (warningDiv && warningText) {
                warningText.textContent = `⚠️ แคลอรี่เกินเป้าหมาย ${excess.toFixed(0)} kcal (${excessPercent}%)`;
                warningDiv.style.display = 'flex';
            }
        } else {
            const warningDiv = document.getElementById('calorieWarning');
            if (warningDiv) {
                warningDiv.style.display = 'none';
            }
        }
    } else {
        document.getElementById('targetCalories').textContent = '-';
    }

    // แสดงแคลอรี่ 3 มื้อ (3 รายการ = 3 มื้อ)
    await displayMealsCalories(itemCalories, totalEnergy);
}

// แสดงแคลอรี่ 3 มื้อ (จากประวัติที่บันทึกไว้ - 1 รายการ = 1 มื้อ)
async function displayMealsCalories(itemCalories, totalEnergy) {
    const mealsSection = document.getElementById('mealsSection');
    const mealsGrid = document.getElementById('mealsGrid');
    
    if (!mealsSection || !mealsGrid) {
        return;
    }

    // ดึงประวัติที่บันทึกไว้ (3 รายการล่าสุด = 3 มื้อ)
    const history = await getCartHistory(3, 0); // ดึง 3 รายการล่าสุด
    const recentHistory = history.slice(0, 3); // 3 รายการล่าสุด
    
    const mealLabels = [
        { label: 'มื้อเช้า', icon: '🌅' },
        { label: 'มื้อกลางวัน', icon: '☀️' },
        { label: 'มื้อเย็น', icon: '🌙' }
    ];
    
    // ถ้ามีประวัติ แสดงเป็น 3 มื้อ
    if (recentHistory.length > 0) {
        mealsSection.style.display = 'block';
        
        mealsGrid.innerHTML = mealLabels.map((meal, index) => {
            const historyItem = recentHistory[index];
            
            if (historyItem && historyItem.summary && historyItem.summary.totalEnergy) {
                const calories = parseFloat(historyItem.summary.totalEnergy) || 0;
                const itemNames = historyItem.items ? historyItem.items.map(item => item.name).join(', ') : '';
                const date = new Date(historyItem.date);
                const dateStr = date.toLocaleDateString('th-TH', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                if (calories > 0) {
                    return `
                        <div class="meal-item" title="${itemNames} (${dateStr})">
                            <div class="meal-icon-small">${meal.icon}</div>
                            <div class="meal-label">${meal.label}</div>
                            <div class="meal-calories">
                                ${calories.toFixed(0)}
                                <span class="meal-calories-unit">kcal</span>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="meal-item meal-item-empty">
                            <div class="meal-icon-small">${meal.icon}</div>
                            <div class="meal-label">${meal.label}</div>
                            <div class="meal-calories">-</div>
                        </div>
                    `;
                }
            } else {
                return `
                    <div class="meal-item meal-item-empty">
                        <div class="meal-icon-small">${meal.icon}</div>
                        <div class="meal-label">${meal.label}</div>
                        <div class="meal-calories">-</div>
                    </div>
                `;
            }
        }).join('');
    } else {
        // ถ้ายังไม่มีประวัติ แต่มีสินค้าในตะกร้า แสดงแคลอรี่จากตะกร้าปัจจุบัน
        const cart = getCart();
        if (cart.length > 0) {
            mealsSection.style.display = 'block';
            
            mealsGrid.innerHTML = mealLabels.map((meal, index) => {
                // แสดงแคลอรี่จากตะกร้าปัจจุบัน (ถ้ายังไม่มีประวัติ)
                if (index === 0 && totalEnergy > 0) {
                    return `
                        <div class="meal-item">
                            <div class="meal-icon-small">${meal.icon}</div>
                            <div class="meal-label">${meal.label}</div>
                            <div class="meal-calories">
                                ${totalEnergy.toFixed(0)}
                                <span class="meal-calories-unit">kcal</span>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="meal-item meal-item-empty">
                            <div class="meal-icon-small">${meal.icon}</div>
                            <div class="meal-label">${meal.label}</div>
                            <div class="meal-calories">-</div>
                        </div>
                    `;
                }
            }).join('');
        } else {
            mealsSection.style.display = 'none';
        }
    }
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

