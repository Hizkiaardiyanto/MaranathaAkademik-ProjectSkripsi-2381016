SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'portal_accounts'
     AND column_name = 'approval_status') = 0,
  'ALTER TABLE portal_accounts ADD COLUMN approval_status ENUM(''pending'', ''approved'', ''rejected'') NOT NULL DEFAULT ''approved'' AFTER registration_id',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'portal_accounts'
     AND column_name = 'student_id') = 0,
  'ALTER TABLE portal_accounts ADD COLUMN student_id VARCHAR(40) NULL AFTER approval_status',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE()
     AND table_name = 'portal_accounts'
     AND index_name = 'portal_accounts_student_id_unique') = 0,
  'CREATE UNIQUE INDEX portal_accounts_student_id_unique ON portal_accounts (student_id)',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints
   WHERE constraint_schema = DATABASE()
     AND table_name = 'portal_accounts'
     AND constraint_name = 'fk_portal_accounts_student') = 0,
  'ALTER TABLE portal_accounts ADD CONSTRAINT fk_portal_accounts_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;
