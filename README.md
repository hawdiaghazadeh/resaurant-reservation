# سیستم رزرو میز و سفارش غذا

یک سیستم کامل رزرو میز رستوران با قابلیت مشاهده منو، ایجاد شده با React، TypeScript، Node.js و MongoDB.

## ویژگی‌ها

### Frontend (React + TypeScript + Tailwind CSS)
- 🏠 صفحه اصلی با دسترسی آسان
- 📅 فرم رزرو میز با انتخاب زمان و میز
- 🍽️ صفحه منوی غذا با دسته‌بندی
- 📋 مشاهده رزروهای ثبت شده
- 🎨 دو تم ایرانی و شرکتی
- 📱 طراحی ریسپانسیو

### Backend (Node.js + Express + MongoDB)
- 🗄️ مدل‌های کامل برای میز، منو، رزرو و سفارش
- 🔌 API های RESTful با مدیریت خطا
- ✅ اعتبارسنجی و بررسی تداخل رزرو
- 📊 پنل مدیریت برای تأیید رزروها
- 🌱 اسکریپت seed برای داده‌های اولیه

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js (نسخه 18 یا بالاتر)
- MongoDB (محلی یا Atlas)
- npm یا yarn

### 🚀 راه‌اندازی سریع

#### 1. کلون کردن پروژه
```bash
git clone https://github.com/hawdiaghazadeh/resaurant-reservation.git
cd resaurant-reservation
```

#### 2. نصب وابستگی‌ها
```bash
# نصب وابستگی‌های اصلی
npm install

# نصب وابستگی‌های backend
cd backend
npm install

# نصب وابستگی‌های frontend
cd ../frontend
npm install
```

#### 3. راه‌اندازی پایگاه داده

1. MongoDB را اجرا کنید:
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
# یا
brew services start mongodb-community
```

2. داده‌های اولیه را بارگذاری کنید:
```bash
cd backend
npm run seed
```
پس از اجرا ای دستور بعد از بالا آمد سیتم با دو کاربر زیر میتوا در دوبخش کاربر عادی و ادمی لاگی کرد
کاربر عادی : 
-username = user@example.com
-passsword = user123

برای پل ادمین:
-username = admin@example.com
-passsword = admin123

#### 4. اجرای پروژه

**Backend (ترمینال اول):**
```bash
cd backend
npm run dev
```

**Frontend (ترمینال دوم):**
```bash
cd frontend
npm run dev
```

## دسترسی به اپلیکیشن

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

## عیب‌یابی

### مشکلات رایج

1. **خطای اتصال به MongoDB**: مطمئن شوید MongoDB در حال اجرا است
2. **خطای CORS**: بررسی کنید که backend روی پورت 4000 اجرا می‌شود
3. **مشکل در بارگذاری فونت**: مطمئن شوید پکیج @fontsource/vazirmatn نصب شده

### پاک کردن و نصب مجدد
```bash
# پاک کردن node_modules
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# نصب مجدد
npm install
cd backend && npm install
cd ../frontend && npm install
```


## ساختار پروژه

```
reservation/
├── backend/
│   ├── src/
│   │   ├── models/          # مدل‌های MongoDB
│   │   ├── routes/          # API endpoints
│   │   ├── index.ts         # سرور Express
│   │   └── seed.ts          # داده‌های اولیه
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── modules/         # کامپوننت‌های React
│   │   ├── lib/             # توابع API
│   │   ├── main.tsx         # نقطه ورود
│   │   └── styles.css       # استایل‌ها
│   └── package.json
└── package.json             # Workspace configuration
```

## API Endpoints

### میزها
- `GET /api/tables` - لیست میزها
- `POST /api/tables` - ایجاد میز جدید
- `PUT /api/tables/:id` - بروزرسانی میز
- `DELETE /api/tables/:id` - حذف میز

### منو
- `GET /api/menu` - لیست آیتم‌های منو
- `GET /api/menu?category=کباب` - فیلتر بر اساس دسته‌بندی
- `POST /api/menu` - اضافه کردن آیتم جدید
- `PUT /api/menu/:id` - بروزرسانی آیتم
- `DELETE /api/menu/:id` - حذف آیتم

### رزروها
- `GET /api/reservations` - لیست رزروها
- `GET /api/reservations?date=2024-01-01` - فیلتر بر اساس تاریخ
- `POST /api/reservations` - ایجاد رزرو جدید
- `PUT /api/reservations/:id` - بروزرسانی وضعیت رزرو
- `DELETE /api/reservations/:id` - حذف رزرو

### سفارشات
- `GET /api/orders` - لیست سفارشات
- `POST /api/orders` - ایجاد سفارش جدید
- `PUT /api/orders/:id` - بروزرسانی سفارش
- `DELETE /api/orders/:id` - حذف سفارش

## تکنولوژی‌های استفاده شده

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- DaisyUI
- React Router DOM
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- TypeScript
- CORS, Helmet, Morgan

## نکات مهم

1. **محیط توسعه**: پروژه برای محیط development تنظیم شده است
2. **پایگاه داده**: از MongoDB استفاده می‌کند 
3. **CORS**: برای توسعه، CORS برای همه origins باز است
4. **فونت**: از فونت Vazirmatn برای نمایش بهتر متن فارسی استفاده شده

### مشکلات رایج

1. **خطای اتصال به MongoDB**: مطمئن شوید MongoDB در حال اجرا است
2. **خطای CORS**: بررسی کنید که backend روی پورت 4000 اجرا می‌شود
3. **مشکل در بارگذاری فونت**: مطمئن شوید پکیج @fontsource/vazirmatn نصب شده
