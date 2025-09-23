# سیستم احراز هویت (Authentication System)

## ویژگی‌های پیاده‌سازی شده

### Backend
- **مدل کاربر (User Model)**: شامل ایمیل، رمز عبور، نام، نام خانوادگی، تلفن و نقش
- **JWT Authentication**: استفاده از JWT برای مدیریت توکن‌ها
- **Cookie-based Storage**: ذخیره توکن در کوکی HTTP-only برای امنیت
- **Password Hashing**: استفاده از bcrypt برای هش کردن رمزهای عبور
- **Role-based Access**: پشتیبانی از نقش‌های کاربر و مدیر

### Frontend
- **Authentication Context**: مدیریت وضعیت احراز هویت
- **Protected Routes**: محافظت از مسیرهای حساس
- **Login/Register Pages**: صفحات ورود و ثبت‌نام
- **User Menu**: منوی کاربر در نوار ناوبری

## API Endpoints

### Authentication
- `POST /api/auth/register` - ثبت‌نام کاربر جدید
- `POST /api/auth/login` - ورود کاربر
- `POST /api/auth/logout` - خروج کاربر
- `GET /api/auth/me` - دریافت اطلاعات کاربر فعلی

## کاربران پیش‌فرض

پس از اجرای seed، دو کاربر پیش‌فرض ایجاد می‌شود:

### مدیر سیستم
- **ایمیل**: admin@example.com
- **رمز عبور**: admin123
- **نقش**: admin

### کاربر تست
- **ایمیل**: user@example.com
- **رمز عبور**: user123
- **نقش**: user

## نحوه استفاده

### 1. تنظیم متغیرهای محیطی
فایل `.env` در پوشه backend ایجاد کنید:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/reservation
```

### 2. اجرای دیتابیس
```bash
npm run seed
```

### 3. راه‌اندازی سرور
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### 4. دسترسی به سیستم
- بازدید از http://localhost:5173
- کلیک روی "ثبت‌نام" یا "ورود"
- استفاده از کاربران پیش‌فرض یا ایجاد حساب جدید

## ویژگی‌های امنیتی

- **HTTP-Only Cookies**: توکن‌ها در کوکی‌های HTTP-only ذخیره می‌شوند
- **CORS Configuration**: تنظیم صحیح CORS برای انتقال کوکی‌ها
- **Password Hashing**: رمزهای عبور با bcrypt هش می‌شوند
- **JWT Expiration**: توکن‌ها پس از ۷ روز منقضی می‌شوند
- **Protected Routes**: مسیرهای حساس نیاز به احراز هویت دارند

## مسیرهای محافظت شده

- `/reservations` - فقط کاربران وارد شده
- `/admin` - فقط مدیران سیستم

## مدیریت وضعیت

سیستم احراز هویت از Context API استفاده می‌کند و وضعیت کاربر در تمام برنامه در دسترس است:

```tsx
const { user, isAuthenticated, login, logout } = useAuth()
```
