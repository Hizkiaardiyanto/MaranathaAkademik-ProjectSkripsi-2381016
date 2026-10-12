SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'portal_accounts'
     AND column_name = 'nis') = 0,
  'ALTER TABLE portal_accounts ADD COLUMN nis VARCHAR(30) NULL UNIQUE AFTER phone',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'portal_accounts'
     AND column_name = 'nisn') = 0,
  'ALTER TABLE portal_accounts ADD COLUMN nisn VARCHAR(30) NULL UNIQUE AFTER nis',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'portal_accounts'
     AND column_name = 'gender') = 0,
  'ALTER TABLE portal_accounts ADD COLUMN gender ENUM(''L'', ''P'') NULL AFTER nisn',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;
