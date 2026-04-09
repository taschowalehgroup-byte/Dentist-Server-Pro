-- ============================================================
--  DentCare Pro — Full Database Schema
--  Engine: SQLite / MySQL / PostgreSQL compatible
-- ============================================================

-- USERS / AUTH
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- hashed
    role TEXT NOT NULL CHECK (
        role IN (
            'admin',
            'manager',
            'doctor',
            'hygienist',
            'assistant',
            'receptionist',
            'accountant'
        )
    ),
    doctor_id INTEGER REFERENCES doctors (id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- DOCTORS
CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    license_no TEXT,
    room TEXT,
    schedule TEXT,
    status TEXT DEFAULT 'present' CHECK (
        status IN ('present', 'absent', 'leave')
    ),
    avatar_url TEXT,
    commission_filling REAL DEFAULT 20,
    commission_crown REAL DEFAULT 20,
    commission_root_canal REAL DEFAULT 20,
    commission_extraction REAL DEFAULT 20,
    commission_implant REAL DEFAULT 25,
    commission_orthodontics REAL DEFAULT 20,
    commission_other REAL DEFAULT 15,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- PATIENTS
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_no TEXT UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth DATE,
    age INTEGER,
    gender TEXT CHECK (
        gender IN ('male', 'female', 'other')
    ),
    marital_status TEXT CHECK (
        marital_status IN (
            'single',
            'married',
            'divorced',
            'widowed'
        )
    ),
    email TEXT,
    occupation TEXT,
    referral_source TEXT,
    address TEXT,
    blood_type TEXT,
    insurance TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    dental_concerns TEXT,
    price REAL DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    xray_image TEXT,           -- base64 data-url of X-ray
    xray_date DATE,
    xray_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors (id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration_min INTEGER DEFAULT 30,
    priority TEXT DEFAULT 'normal' CHECK (
        priority IN (
            'normal',
            'urgent',
            'emergency'
        )
    ),
    treatment_type TEXT,
    chief_complaint TEXT,
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (
        status IN (
            'scheduled',
            'confirmed',
            'completed',
            'cancelled',
            'no-show'
        )
    ),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TREATMENTS / DENTAL CHART
CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors (id),
    appointment_id INTEGER REFERENCES appointments (id),
    tooth_number INTEGER,
    treatment_type TEXT NOT NULL,
    cost REAL DEFAULT 0,
    date DATE NOT NULL,
    diagnosis TEXT,
    procedure_notes TEXT,
    prescription TEXT,
    follow_up INTEGER DEFAULT 0,
    follow_up_date DATE,
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FINANCES / TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT,
    amount REAL NOT NULL,
    date DATE NOT NULL,
    patient_id INTEGER REFERENCES patients (id),
    doctor_id INTEGER REFERENCES doctors (id),
    created_by INTEGER REFERENCES users (id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    category TEXT CHECK (
        category IN (
            'consumable',
            'equipment',
            'medication',
            'material'
        )
    ),
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    unit_price REAL DEFAULT 0,
    supplier TEXT,
    notes TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users (id),
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed data is in seeds/seed.sql
-- SETTINGS (key-value store for app config)
CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
