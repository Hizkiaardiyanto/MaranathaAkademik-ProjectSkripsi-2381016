CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(40) NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  nis VARCHAR(30) NOT NULL UNIQUE,
  nisn VARCHAR(30) NOT NULL UNIQUE,
  class_name VARCHAR(30) NOT NULL,
  gender ENUM('L', 'P') NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(40) NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  nip VARCHAR(30) NOT NULL UNIQUE,
  subject VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_records (
  area VARCHAR(20) NOT NULL,
  resource VARCHAR(30) NOT NULL,
  id VARCHAR(36) NOT NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (area, resource, id),
  KEY app_records_resource_created (area, resource, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_accounts (
  email VARCHAR(254) NOT NULL PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Siswa', 'Guru') NOT NULL,
  name VARCHAR(120) NOT NULL,
  grade VARCHAR(40) NULL,
  subject VARCHAR(100) NULL,
  parent_name VARCHAR(120) NULL,
  phone VARCHAR(30) NULL,
  nis VARCHAR(30) NULL UNIQUE,
  nisn VARCHAR(30) NULL UNIQUE,
  gender ENUM('L', 'P') NULL,
  registration_id VARCHAR(40) NULL UNIQUE,
  approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  student_id VARCHAR(40) NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY portal_accounts_role (role),
  CONSTRAINT fk_portal_accounts_student
    FOREIGN KEY (student_id) REFERENCES students (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
