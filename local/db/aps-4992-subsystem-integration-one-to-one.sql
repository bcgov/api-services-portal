\set ON_ERROR_STOP on

BEGIN;

-- Report rows that must be cleaned up before the constraint can be applied.
SELECT id, "integrationClientId"
FROM public."SubsystemIntegration"
WHERE subsystem IS NULL
ORDER BY id;

SELECT subsystem, array_agg(id ORDER BY id) AS record_ids
FROM public."SubsystemIntegration"
WHERE subsystem IS NOT NULL
GROUP BY subsystem
HAVING count(*) > 1
ORDER BY subsystem;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public."SubsystemIntegration"
    WHERE subsystem IS NULL
  ) THEN
    RAISE EXCEPTION
      'SubsystemIntegration contains orphaned rows; clean them up before applying APS-4992';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public."SubsystemIntegration"
    WHERE subsystem IS NOT NULL
    GROUP BY subsystem
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'SubsystemIntegration contains duplicate subsystem mappings; clean them up before applying APS-4992';
  END IF;
END
$$;

DROP INDEX IF EXISTS public.subsystemintegration_subsystem_index;

ALTER TABLE public."SubsystemIntegration"
  ALTER COLUMN subsystem SET NOT NULL;

ALTER TABLE public."SubsystemIntegration"
  ADD CONSTRAINT subsystemintegration_subsystem_unique UNIQUE (subsystem);

COMMIT;
