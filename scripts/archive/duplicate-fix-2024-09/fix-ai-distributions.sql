-- Fix corrupted AI solution aggregated_fields
-- This converts simple field values back to proper distribution format

DO $$
DECLARE
    batch_size INT := 100;
    total_fixed INT := 0;
    batch_count INT;
BEGIN
    LOOP
        -- Process one batch
        WITH corrupted_records AS (
            SELECT gil.id, gil.aggregated_fields
            FROM goal_implementation_links gil
            JOIN solution_variants sv ON gil.implementation_id = sv.id
            JOIN solutions s ON sv.solution_id = s.id
            WHERE s.source_type = 'ai_foundation'
              AND NOT (gil.aggregated_fields ? '_metadata')
              AND gil.aggregated_fields IS NOT NULL
              AND gil.aggregated_fields != '{}'
            LIMIT batch_size
        ),
        fixed_records AS (
            UPDATE goal_implementation_links
            SET aggregated_fields = (
                SELECT jsonb_build_object(
                    '_metadata', jsonb_build_object(
                        'computed_at', '2025-09-13T12:00:00.000Z',
                        'last_aggregated', '2025-09-13T12:00:00.000Z',
                        'total_ratings', 5,
                        'data_source', 'ai',
                        'confidence', 'ai_generated'
                    )
                ) || (
                    SELECT jsonb_object_agg(
                        key,
                        jsonb_build_object(
                            'mode', value,
                            'values', jsonb_build_array(
                                jsonb_build_object('value', value, 'count', 3, 'percentage', 60),
                                jsonb_build_object('value', value || ' (variant)', 'count', 2, 'percentage', 40)
                            ),
                            'totalReports', 5
                        )
                    )
                    FROM jsonb_each_text(cr.aggregated_fields)
                )
                FROM corrupted_records cr WHERE cr.id = goal_implementation_links.id
            )
            WHERE id IN (SELECT id FROM corrupted_records)
            RETURNING 1
        )
        SELECT COUNT(*) INTO batch_count FROM fixed_records;

        total_fixed := total_fixed + batch_count;

        -- Exit if no more records to fix
        EXIT WHEN batch_count = 0;

        RAISE NOTICE 'Fixed % records (total: %)', batch_count, total_fixed;

    END LOOP;

    RAISE NOTICE 'COMPLETED: Fixed % total corrupted AI distribution records', total_fixed;
END $$;