SELECT 'bucket' AS item_type, id AS item_name, public::text AS details
FROM storage.buckets
WHERE id = 'task-deliverables'
UNION ALL
SELECT 'policy' AS item_type, policyname AS item_name,
       cmd || ' | ' || COALESCE(qual, '') || ' | ' || COALESCE(with_check, '') AS details
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname IN (
    'SkillBridge task files owner insert',
    'SkillBridge task files owner read',
    'SkillBridge task files owner delete'
  );
