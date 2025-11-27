# SRS Diagrams - ระบบจัดการอาหารและโภชนาการ
## แผนภาพและไดอะแกรมสำหรับ Software Requirements Specification

---

## 1. Use Case Diagram

```mermaid
graph TB
    User[ผู้ใช้]
    
    User -->|สมัครสมาชิก| UC1[Register]
    User -->|เข้าสู่ระบบ| UC2[Login]
    User -->|ออกจากระบบ| UC3[Logout]
    User -->|คำนวณ BMI| UC4[Calculate BMI]
    User -->|ค้นหาสินค้า| UC5[Search Products]
    User -->|ค้นหาสูตรอาหาร| UC6[Search Recipes]
    User -->|สแกนบาร์โค้ด| UC7[Scan Barcode]
    User -->|เพิ่มลงตะกร้า| UC8[Add to Cart]
    User -->|ดูตะกร้า| UC9[View Cart]
    User -->|เสร็จสิ้นตะกร้า| UC10[Finish Cart]
    User -->|ดูประวัติ| UC11[View History]
    User -->|ดูโปรไฟล์| UC12[View Profile]
    
    UC5 --> BackendAPI[Backend API]
    UC7 --> BackendAPI
    UC2 --> BackendAPI
    UC1 --> BackendAPI
    UC4 --> BackendAPI
    UC12 --> BackendAPI
    
    BackendAPI --> OpenFoodFacts[OpenFoodFacts API]
    UC6 --> Spoonacular[Spoonacular API]
```

---

## 2. DFD Level 0 (Context Diagram)

```mermaid
graph LR
    User[ผู้ใช้]
    System[ระบบจัดการอาหารและโภชนาการ]
    Backend[Backend API Server<br/>localhost:3002]
    OpenFood[OpenFoodFacts API]
    Spoonacular[Spoonacular API]
    
    User -->|ข้อมูลเข้าสู่ระบบ| System
    User -->|คำค้นหา| System
    User -->|รูปภาพบาร์โค้ด| System
    
    System -->|Token & User Data| User
    System -->|ข้อมูลสินค้า| User
    System -->|ข้อมูลสูตรอาหาร| User
    
    System -->|Request| Backend
    Backend -->|Response| System
    
    System -->|Request| OpenFood
    OpenFood -->|Response| System
    
    System -->|Request| Spoonacular
    Spoonacular -->|Response| System
```

---

## 3. DFD Level 1

```mermaid
graph TB
    User[ผู้ใช้]
    
    subgraph System[ระบบจัดการอาหารและโภชนาการ]
        P1[1.0 การลงทะเบียน<br/>และเข้าสู่ระบบ]
        P2[2.0 คำนวณ BMI]
        P3[3.0 ค้นหาสินค้า]
        P4[4.0 ค้นหาสูตรอาหาร]
        P5[5.0 สแกนบาร์โค้ด]
        P6[6.0 จัดการตะกร้า]
        P7[7.0 ดูประวัติตะกร้า]
    end
    
    subgraph Storage[Data Store]
        D1[localStorage]
    end
    
    subgraph External[External Systems]
        Backend[Backend API]
        OpenFood[OpenFoodFacts API]
        Spoonacular[Spoonacular API]
    end
    
    User -->|ข้อมูลลงทะเบียน| P1
    P1 -->|Token & User Data| D1
    P1 <-->|Request/Response| Backend
    
    User -->|น้ำหนัก/ส่วนสูง| P2
    P2 -->|BMI & Calories| D1
    P2 <-->|Request/Response| Backend
    
    User -->|คำค้นหาสินค้า| P3
    P3 -->|ข้อมูลสินค้า| D1
    P3 <-->|Request/Response| Backend
    Backend <-->|Request/Response| OpenFood
    
    User -->|คำค้นหาสูตร| P4
    P4 -->|ข้อมูลสูตร| D1
    P4 <-->|Request/Response| Spoonacular
    
    User -->|รูปภาพบาร์โค้ด| P5
    P5 -->|ข้อมูลสินค้า| D1
    P5 <-->|Request/Response| Backend
    Backend <-->|Request/Response| OpenFood
    
    User -->|สินค้า/สูตร| P6
    P6 -->|ข้อมูลตะกร้า| D1
    P6 -->|ประวัติตะกร้า| D1
    
    User -->|คำขอดูประวัติ| P7
    P7 -->|ประวัติตะกร้า| D1
    D1 -->|ประวัติ| P7
```

---

## 4. State Diagram

### 4.1 State Diagram - ระบบตะกร้าสินค้า

```mermaid
stateDiagram-v2
    [*] --> ตะกร้าว่าง
    
    ตะกร้าว่าง --> มีสินค้า: เพิ่มสินค้า
    
    มีสินค้า --> มีสินค้า: เพิ่มสินค้า
    มีสินค้า --> มีสินค้า: ลบสินค้า
    มีสินค้า --> บันทึกประวัติ: เสร็จสิ้น
    มีสินค้า --> ตะกร้าว่าง: ล้างตะกร้า
    
    บันทึกประวัติ --> ตะกร้าว่าง: ล้างตะกร้า
    
    ตะกร้าว่าง --> [*]
```

### 4.2 State Diagram - กระบวนการลงทะเบียน

```mermaid
stateDiagram-v2
    [*] --> เริ่มต้น
    
    เริ่มต้น --> กรอกข้อมูล: กรอกข้อมูลลงทะเบียน
    
    กรอกข้อมูล --> บันทึกข้อมูล: บันทึกข้อมูล
    บันทึกข้อมูล --> คำนวณBMI: ไปหน้า BMI
    
    คำนวณBMI --> ส่งข้อมูล: ส่งข้อมูล
    ส่งข้อมูล --> ลงทะเบียนสำเร็จ: สำเร็จ
    ส่งข้อมูล --> กรอกข้อมูล: ล้มเหลว
    
    ลงทะเบียนสำเร็จ --> [*]
```

### 4.3 State Diagram - กระบวนการค้นหา

```mermaid
stateDiagram-v2
    [*] --> เริ่มต้น
    
    เริ่มต้น --> รอคำค้นหา: กรอกคำค้นหา
    
    รอคำค้นหา --> กำลังค้นหา: กดค้นหา
    
    กำลังค้นหา --> แสดงผลลัพธ์: พบผลลัพธ์
    กำลังค้นหา --> ไม่พบผลลัพธ์: ไม่พบผลลัพธ์
    กำลังค้นหา --> เกิดข้อผิดพลาด: เกิดข้อผิดพลาด
    
    แสดงผลลัพธ์ --> รอคำค้นหา: ค้นหาใหม่
    ไม่พบผลลัพธ์ --> รอคำค้นหา: ค้นหาใหม่
    เกิดข้อผิดพลาด --> รอคำค้นหา: ค้นหาใหม่
    
    รอคำค้นหา --> [*]
```

### 4.4 State Diagram - สถานะการเข้าสู่ระบบ

```mermaid
stateDiagram-v2
    [*] --> ไม่ได้เข้าสู่ระบบ
    
    ไม่ได้เข้าสู่ระบบ --> กำลังเข้าสู่ระบบ: กรอกข้อมูลและกด Login
    กำลังเข้าสู่ระบบ --> เข้าสู่ระบบสำเร็จ: Login สำเร็จ
    กำลังเข้าสู่ระบบ --> ไม่ได้เข้าสู่ระบบ: Login ล้มเหลว
    
    เข้าสู่ระบบสำเร็จ --> ไม่ได้เข้าสู่ระบบ: Logout
    
    ไม่ได้เข้าสู่ระบบ --> [*]
```

---

## 5. Sequence Diagram

### 5.1 Sequence Diagram - กระบวนการลงทะเบียนและคำนวณ BMI

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant R as หน้า Register
    participant L as localStorage
    participant B as หน้า BMI
    participant API as Backend API
    
    U->>R: กรอกข้อมูลลงทะเบียน
    U->>R: กด Register
    R->>L: บันทึกข้อมูล
    R->>B: ไปหน้า BMI
    
    U->>B: กรอกน้ำหนัก/ส่วนสูง
    U->>B: กดคำนวณ
    B->>B: คำนวณ BMI
    B->>U: แสดงผลลัพธ์
    
    U->>B: กดต่อไป
    B->>API: ส่งข้อมูล (username, email, password, weight, height, bmi, calories)
    API-->>B: Token & User Data
    B->>L: บันทึก Token & User Data
    B->>U: ไปหน้าหลัก
```

### 5.2 Sequence Diagram - กระบวนการค้นหาสินค้าและเพิ่มลงตะกร้า

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant S as หน้า Search
    participant API as Backend API
    participant OF as OpenFoodFacts API
    participant L as localStorage
    
    U->>S: กรอกคำค้นหา
    U->>S: กดค้นหา
    S->>API: ส่งคำค้นหา
    API->>OF: เรียก OpenFoodFacts API
    OF-->>API: ข้อมูลสินค้า
    API-->>S: ผลลัพธ์
    S->>U: แสดงผลลัพธ์
    
    U->>S: เลือกสินค้า
    U->>S: ดูโภชนาการ
    S->>U: แสดงโภชนาการ
    
    U->>S: เพิ่มลงตะกร้า
    S->>L: บันทึกตะกร้า
    S->>U: แจ้งเตือน
```

### 5.3 Sequence Diagram - กระบวนการค้นหาสูตรอาหาร

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant R as หน้า Recipe Results
    participant SP as Spoonacular API
    participant L as localStorage
    
    U->>R: กรอกคำค้นหา
    U->>R: กดค้นหา
    R->>SP: เรียก complexSearch API
    SP-->>R: ข้อมูลสูตรอาหาร
    R->>U: แสดงผลลัพธ์
    
    U->>R: ดูรายละเอียด
    R->>SP: เรียก nutritionWidget API
    R->>SP: เรียก information API
    SP-->>R: ข้อมูลโภชนาการ
    SP-->>R: ข้อมูลสูตร
    R->>U: แสดงรายละเอียด
    
    U->>R: เพิ่มลงตะกร้า
    R->>L: บันทึกตะกร้า
    R->>U: แจ้งเตือน
```

### 5.4 Sequence Diagram - กระบวนการสแกนบาร์โค้ด

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant M as หน้า Main
    participant API as Backend API
    participant OF as OpenFoodFacts API
    participant RES as หน้า Result
    participant L as localStorage
    
    U->>M: เลือกรูปภาพบาร์โค้ด
    U->>M: ยืนยัน
    M->>API: ส่งรูปภาพ
    API->>API: สแกนบาร์โค้ด
    API->>OF: ค้นหาข้อมูลสินค้า
    OF-->>API: ข้อมูลสินค้า
    API-->>M: ผลลัพธ์
    M->>L: บันทึกผลลัพธ์
    M->>RES: ไปหน้า Result
    
    RES->>L: โหลดข้อมูล
    L-->>RES: ข้อมูลสินค้า
    RES->>U: แสดงผลลัพธ์
```

### 5.5 Sequence Diagram - กระบวนการเสร็จสิ้นตะกร้า

```mermaid
sequenceDiagram
    participant U as ผู้ใช้
    participant C as หน้า Cart
    participant L as localStorage
    participant H as หน้า History
    
    U->>C: เปิดตะกร้า
    C->>L: ดึงข้อมูลตะกร้า
    L-->>C: ข้อมูลตะกร้า
    C->>U: แสดงตะกร้า
    
    U->>C: กดเสร็จสิ้น
    C->>C: คำนวณแคลอรี่รวม
    C->>C: สร้างประวัติ
    C->>L: บันทึกประวัติ
    C->>L: ล้างตะกร้า
    C->>U: แจ้งเตือน
    
    U->>H: เปิดประวัติ
    H->>L: ดึงประวัติ
    L-->>H: ประวัติตะกร้า
    H->>U: แสดงประวัติ
```

---

## 6. Collaboration Diagram

### 6.1 Collaboration Diagram - กระบวนการค้นหาสินค้า

```mermaid
graph LR
    U[ผู้ใช้]
    S[หน้า Search]
    B[Backend API]
    O[OpenFoodFacts API]
    
    U -->|1: กรอกคำค้นหา| S
    S -->|2: ส่งคำค้นหา| B
    B -->|3: เรียก OpenFoodFacts| O
    O -->|4: ส่งข้อมูลสินค้า| B
    B -->|5: ส่งผลลัพธ์| S
    S -->|6: แสดงผลลัพธ์| U
```

### 6.2 Collaboration Diagram - กระบวนการเพิ่มสินค้าลงตะกร้า

```mermaid
graph LR
    U[ผู้ใช้]
    S[หน้า Search]
    C[cart.js]
    L[localStorage]
    
    U -->|1: กดเพิ่มลงตะกร้า| S
    S -->|2: เรียก addToCart| C
    C -->|3: ดึงตะกร้า| L
    L -->|4: ส่งข้อมูลตะกร้า| C
    C -->|5: เพิ่มสินค้า| C
    C -->|6: บันทึกตะกร้า| L
    C -->|7: อัปเดต badge| S
    S -->|8: แสดงแจ้งเตือน| U
```

### 6.3 Collaboration Diagram - กระบวนการเสร็จสิ้นตะกร้า

```mermaid
graph LR
    U[ผู้ใช้]
    C[หน้า Cart]
    JS[cart.js]
    L[localStorage]
    H[หน้า History]
    
    U -->|1: กดเสร็จสิ้น| C
    C -->|2: เรียก finishCart| JS
    JS -->|3: ดึงตะกร้า| L
    L -->|4: ส่งข้อมูลตะกร้า| JS
    JS -->|5: คำนวณแคลอรี่| JS
    JS -->|6: สร้างประวัติ| JS
    JS -->|7: บันทึกประวัติ| L
    JS -->|8: ล้างตะกร้า| L
    JS -->|9: แจ้งเตือน| C
    C -->|10: แสดงแจ้งเตือน| U
    
    U -->|11: เปิดประวัติ| H
    H -->|12: ดึงประวัติ| L
    L -->|13: ส่งประวัติ| H
    H -->|14: แสดงประวัติ| U
```

---

## 7. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ BMI_RECORD : has
    USER ||--o{ CART : has
    USER ||--o{ CART_HISTORY : has
    
    USER {
        int id PK
        string username
        string email
        string password
        datetime created_at
    }
    
    BMI_RECORD {
        int id PK
        int user_id FK
        float weight
        float height
        float bmi
        float calories
        datetime created_at
    }
    
    CART {
        int id PK
        int user_id FK
        string product_id
        string product_name
        json nutrition
        datetime added_at
    }
    
    CART_HISTORY {
        int id PK
        int user_id FK
        json items
        json summary
        datetime date
    }
```

---

## 8. Activity Diagram

### 8.1 Activity Diagram - กระบวนการลงทะเบียน

```mermaid
flowchart TD
    Start([เริ่มต้น]) --> Input[กรอกข้อมูลลงทะเบียน]
    Input --> Validate{ตรวจสอบข้อมูล}
    Validate -->|ไม่ถูกต้อง| Error[แสดงข้อผิดพลาด]
    Error --> Input
    Validate -->|ถูกต้อง| Save[บันทึกข้อมูลใน localStorage]
    Save --> Redirect[ไปหน้า BMI Calculator]
    Redirect --> BMI[กรอกน้ำหนักและส่วนสูง]
    BMI --> Calculate[คำนวณ BMI]
    Calculate --> Show[แสดงผลลัพธ์]
    Show --> Submit{กดต่อไป?}
    Submit -->|ใช่| Send[ส่งข้อมูลไป Backend API]
    Submit -->|ไม่| Show
    Send --> Success{สำเร็จ?}
    Success -->|ใช่| Login[เข้าสู่ระบบสำเร็จ]
    Success -->|ไม่| Error2[แสดงข้อผิดพลาด]
    Error2 --> BMI
    Login --> Main[ไปหน้าหลัก]
    Main --> End([สิ้นสุด])
```

### 8.2 Activity Diagram - กระบวนการค้นหาและเพิ่มลงตะกร้า

```mermaid
flowchart TD
    Start([เริ่มต้น]) --> Search[กรอกคำค้นหา]
    Search --> Click[กดค้นหา]
    Click --> Loading[กำลังค้นหา...]
    Loading --> API{เรียก API}
    API -->|สำเร็จ| Results[แสดงผลลัพธ์]
    API -->|ล้มเหลว| Error[แสดงข้อผิดพลาด]
    Error --> Search
    Results --> Select[เลือกสินค้า]
    Select --> Detail{ดูรายละเอียด?}
    Detail -->|ใช่| ShowDetail[แสดงรายละเอียดโภชนาการ]
    Detail -->|ไม่| AddCart
    ShowDetail --> AddCart{เพิ่มลงตะกร้า?}
    AddCart -->|ใช่| Check{อยู่ในตะกร้าแล้ว?}
    AddCart -->|ไม่| Select
    Check -->|ใช่| Notify1[แจ้งเตือน: อยู่ในตะกร้าแล้ว]
    Check -->|ไม่| Add[เพิ่มลงตะกร้า]
    Add --> Save[บันทึกใน localStorage]
    Save --> Update[อัปเดต badge]
    Update --> Notify2[แจ้งเตือน: เพิ่มสำเร็จ]
    Notify1 --> Select
    Notify2 --> Select
    Select --> End([สิ้นสุด])
```

---

## 9. Component Diagram

```mermaid
graph TB
    subgraph Frontend[Frontend Application]
        Pages[Pages<br/>HTML Files]
        Scripts[Scripts<br/>JavaScript Files]
        Styles[Styles<br/>CSS Files]
    end
    
    subgraph APIs[External APIs]
        Backend[Backend API<br/>localhost:3002]
        OpenFood[OpenFoodFacts API]
        Spoonacular[Spoonacular API]
    end
    
    subgraph Storage[Storage]
        LocalStorage[localStorage<br/>Browser Storage]
    end
    
    Pages --> Scripts
    Pages --> Styles
    Scripts --> Backend
    Scripts --> OpenFood
    Scripts --> Spoonacular
    Scripts --> LocalStorage
```

---

## 10. Deployment Diagram

```mermaid
graph TB
    subgraph Client[Client Side]
        Browser[Web Browser<br/>Chrome/Firefox/Safari]
    end
    
    subgraph Server[Server Side]
        BackendServer[Backend Server<br/>localhost:3002]
    end
    
    subgraph External[External Services]
        OpenFoodAPI[OpenFoodFacts API<br/>api.openfoodfacts.org]
        SpoonacularAPI[Spoonacular API<br/>api.spoonacular.com]
    end
    
    Browser -->|HTTP/HTTPS| BackendServer
    Browser -->|HTTP/HTTPS| OpenFoodAPI
    Browser -->|HTTP/HTTPS| SpoonacularAPI
    BackendServer -->|HTTP/HTTPS| OpenFoodAPI
```

---

## หมายเหตุ

- แผนภาพทั้งหมดใช้ Mermaid syntax ซึ่งสามารถแสดงผลได้ใน Markdown viewers ที่รองรับ
- สำหรับการแสดงผลในเอกสาร สามารถใช้เครื่องมือเช่น:
  - GitHub (รองรับ Mermaid)
  - VS Code with Mermaid extension
  - Online Mermaid Editor: https://mermaid.live/
  - Markdown viewers ที่รองรับ Mermaid

