-- ============================================================
--  DentCare Pro — Seed Data
--  Run after schema.sql to populate initial data
-- ============================================================

-- Default Doctors
INSERT
    OR IGNORE INTO doctors (
        full_name,
        specialty,
        phone,
        email,
        license_no,
        room,
        status
    )
VALUES (
        'Dr. Ahmed Hassan',
        'General Dentistry',
        '01001000001',
        'ahmed@dentcare.com',
        'LIC-001',
        'Room 1',
        'present'
    ),
    (
        'Dr. Sarah Mohamed',
        'Orthodontics',
        '01001000002',
        'sarah@dentcare.com',
        'LIC-002',
        'Room 2',
        'present'
    ),
    (
        'Dr. Karim Ali',
        'Endodontics',
        '01001000003',
        'karim@dentcare.com',
        'LIC-003',
        'Room 3',
        'present'
    ),
    (
        'Dr. Layla Ibrahim',
        'Periodontics',
        '01001000004',
        'layla@dentcare.com',
        'LIC-004',
        'Room 4',
        'present'
    ),
    (
        'Dr. Omar Mahmoud',
        'Oral Surgery',
        '01001000005',
        'omar@dentcare.com',
        'LIC-005',
        'Room 5',
        'present'
    );

-- Default Users
INSERT
    OR IGNORE INTO users (
        username,
        password,
        role,
        doctor_id
    )
VALUES (
        'admin',
        'VS-18',
        'admin',
        NULL
    ),
    (
        'manager',
        'PV-25',
        'manager',
        NULL
    ),
    (
        'doctor1',
        'MX-31',
        'doctor',
        1
    ),
    (
        'doctor2',
        'FX-59',
        'doctor',
        2
    ),
    (
        'doctor3',
        'JJ-84',
        'doctor',
        3
    ),
    (
        'doctor4',
        'RE-38',
        'doctor',
        4
    ),
    (
        'doctor5',
        'SF-59',
        'doctor',
        5
    ),
    (
        'hygienist',
        'RR-88',
        'hygienist',
        NULL
    ),
    (
        'assistant',
        'XI-94',
        'assistant',
        NULL
    ),
    (
        'receptionist',
        'FD-64',
        'receptionist',
        NULL
    ),
    (
        'accountant',
        'VB-75',
        'accountant',
        NULL
    );

-- Sample Patients
INSERT
    OR IGNORE INTO patients (
        patient_no,
        full_name,
        phone,
        date_of_birth,
        age,
        gender,
        email,
        blood_type,
        insurance,
        medical_conditions,
        allergies,
        dental_concerns,
        price,
        payment_method
    )
VALUES (
        'P-0001',
        'Mohamed Ali Hassan',
        '01112345001',
        '1985-06-15',
        40,
        'male',
        'm.ali@email.com',
        'O+',
        'AXA',
        'Hypertension',
        'Penicillin',
        'Sensitivity',
        850,
        'insurance'
    ),
    (
        'P-0002',
        'Fatima Ibrahim Sayed',
        '01112345002',
        '1993-02-22',
        33,
        'female',
        'fatima@email.com',
        'A+',
        '',
        '',
        '',
        'Braces',
        1200,
        'installment'
    ),
    (
        'P-0003',
        'Omar Khaled Nour',
        '01112345003',
        '1978-11-08',
        47,
        'male',
        '',
        'B+',
        '',
        'Diabetes',
        '',
        'Implant',
        3500,
        'card'
    ),
    (
        'P-0004',
        'Nour Ehab Soliman',
        '01112345004',
        '2001-07-30',
        24,
        'female',
        'nour@email.com',
        'AB-',
        '',
        '',
        'Latex',
        'Whitening',
        450,
        'cash'
    ),
    (
        'P-0005',
        'Youssef Tarek Samir',
        '01112345005',
        '1969-04-12',
        57,
        'male',
        'youssef@email.com',
        'O-',
        'Allianz',
        'Heart disease',
        'Aspirin',
        'Full dentures',
        5000,
        'insurance'
    );

-- Sample Appointments
INSERT
    OR IGNORE INTO appointments (
        patient_id,
        doctor_id,
        date,
        time,
        duration_min,
        priority,
        treatment_type,
        status,
        chief_complaint,
        notes
    )
VALUES (
        1,
        1,
        '2026-03-28',
        '09:00',
        60,
        'normal',
        'Root Canal',
        'confirmed',
        'Severe toothache lower left',
        ''
    ),
    (
        2,
        2,
        '2026-03-28',
        '10:30',
        45,
        'normal',
        'Orthodontics',
        'scheduled',
        'Monthly adjustment',
        'Bring previous X-ray'
    ),
    (
        3,
        5,
        '2026-03-28',
        '11:00',
        90,
        'urgent',
        'Implant',
        'confirmed',
        'Implant consultation',
        ''
    ),
    (
        4,
        1,
        '2026-03-29',
        '09:00',
        30,
        'normal',
        'Whitening',
        'scheduled',
        '',
        ''
    ),
    (
        5,
        3,
        '2026-03-29',
        '14:00',
        120,
        'emergency',
        'Extraction',
        'scheduled',
        'Broken molar',
        'Handle with care - heart patient'
    );

-- Sample Treatments
INSERT
    OR IGNORE INTO treatments (
        patient_id,
        doctor_id,
        tooth_number,
        treatment_type,
        cost,
        date,
        diagnosis,
        procedure_notes,
        prescription,
        follow_up,
        follow_up_date,
        status
    )
VALUES (
        1,
        1,
        36,
        'Root Canal',
        850,
        '2026-03-20',
        'Pulpitis',
        '3 canals cleaned and filled',
        'Amoxicillin 500mg x7 days',
        1,
        '2026-04-05',
        'completed'
    ),
    (
        2,
        2,
        NULL,
        'Orthodontics',
        400,
        '2026-02-15',
        'Crowding',
        'Wire adjustment upper arch',
        '',
        1,
        '2026-03-28',
        'completed'
    ),
    (
        4,
        1,
        11,
        'Filling',
        250,
        '2026-03-10',
        'Cavity class II',
        'Composite filling',
        '',
        0,
        NULL,
        'completed'
    );

-- Sample Transactions
INSERT
    OR IGNORE INTO transactions (
        description,
        type,
        category,
        amount,
        date,
        patient_id
    )
VALUES (
        'Root Canal — Mohamed Ali',
        'income',
        'Treatment',
        850,
        '2026-03-20',
        1
    ),
    (
        'Orthodontic adjustment — Fatima',
        'income',
        'Treatment',
        400,
        '2026-02-15',
        2
    ),
    (
        'Dental supplies restock',
        'expense',
        'Supplies',
        2300,
        '2026-03-01',
        NULL
    ),
    (
        'March clinic rent',
        'expense',
        'Rent',
        8000,
        '2026-03-01',
        NULL
    ),
    (
        'Composite Filling — Nour',
        'income',
        'Treatment',
        250,
        '2026-03-10',
        4
    ),
    (
        'Staff salaries — March',
        'expense',
        'Salary',
        15000,
        '2026-03-25',
        NULL
    );

-- Sample Inventory
INSERT
    OR IGNORE INTO inventory (
        item_name,
        category,
        quantity,
        min_stock,
        unit_price,
        supplier
    )
VALUES (
        'Composite Resin A2',
        'material',
        12,
        5,
        180,
        'DentSupply Co.'
    ),
    (
        'Surgical Gloves (L)',
        'consumable',
        8,
        20,
        35,
        'MediGlove Egypt'
    ),
    (
        'Amoxicillin 500mg',
        'medication',
        50,
        30,
        12,
        'Pharma Plus'
    ),
    (
        'Dental X-Ray Machine',
        'equipment',
        2,
        1,
        45000,
        'Sirona Egypt'
    ),
    (
        'Suction Tips',
        'consumable',
        3,
        10,
        25,
        'DentSupply Co.'
    );