-- CARA PALING MUDAH: Confirm User yang Sudah Ada
-- Jalankan query ini untuk mengkonfirmasi email user aidp1112@gmail.com

UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'aidp1112@gmail.com';

-- Jika ingin membuat user baru yang sudah confirmed:
-- CATATAN: Ganti 'newuser@example.com' dengan email yang Anda inginkan

-- Step 1: Buat user baru (akan otomatis unconfirmed)
-- Lakukan ini lewat aplikasi (register), ATAU gunakan query di bawah:

-- Step 2: Setelah user terbuat, confirm emailnya dengan query ini:
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW(),
--     confirmed_at = NOW()
-- WHERE email = 'newuser@example.com';
