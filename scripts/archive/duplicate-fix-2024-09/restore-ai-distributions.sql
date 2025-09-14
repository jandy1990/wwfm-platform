-- Restore AI solution aggregated_fields from original ai_field_distributions data
-- This script restores the corrupted distribution data to the original varied format

DO $$
DECLARE
    batch_size INT := 200;
    total_restored INT := 0;
    batch_count INT;
    start_time TIMESTAMP := clock_timestamp();
BEGIN
    RAISE NOTICE 'Starting AI distribution restoration at %', start_time;

    LOOP
        -- Process batch of AI records
        WITH target_batch AS (
            SELECT gil.id, gil.goal_id, sv.solution_id
            FROM goal_implementation_links gil
            JOIN solution_variants sv ON gil.implementation_id = sv.id
            JOIN solutions s ON sv.solution_id = s.id
            WHERE s.source_type = 'ai_foundation'
              AND gil.id != 'de781be6-fc86-457e-98a6-bb9374913ebd'  -- Skip already restored test record
            LIMIT batch_size
        ),
        restored_batch AS (
            UPDATE goal_implementation_links gil
            SET aggregated_fields = (
                SELECT jsonb_build_object(
                    '_metadata', jsonb_build_object(
                        'computed_at', '2025-09-09T08:00:00.000Z',
                        'last_aggregated', '2025-09-09T08:00:00.000Z',
                        'total_ratings', 1,
                        'data_source', 'ai',
                        'confidence', 'ai_generated'
                    )
                ) || COALESCE((
                    SELECT jsonb_object_agg(
                        afd.field_name,
                        jsonb_build_object(
                            'mode', (afd.distributions->0->>'name'),
                            'values', (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'value', dist_item->>'name',
                                        'count', 1,
                                        'percentage', ROUND((dist_item->>'percentage')::numeric)::int
                                    )
                                )
                                FROM jsonb_array_elements(afd.distributions) AS dist_item
                            ),
                            'totalReports', 1
                        )
                    )
                    FROM ai_field_distributions afd
                    WHERE afd.solution_id = tb.solution_id
                      AND afd.goal_id = tb.goal_id
                ), '{}'::jsonb)
                FROM target_batch tb WHERE tb.id = gil.id
            )
            FROM target_batch tb
            WHERE gil.id = tb.id
            RETURNING 1
        )
        SELECT COUNT(*) INTO batch_count FROM restored_batch;

        total_restored := total_restored + batch_count;

        -- Exit if no more records to process
        EXIT WHEN batch_count = 0;

        -- Progress update every 10 batches
        IF total_restored % (batch_size * 10) = 0 THEN
            RAISE NOTICE 'Progress: Restored % records (%.1f%% estimated)',
                total_restored,
                (total_restored::float / 5556 * 100);
        END IF;

    END LOOP;

    RAISE NOTICE 'COMPLETED: Restored % AI solution records in % seconds',
        total_restored,
        EXTRACT(EPOCH FROM (clock_timestamp() - start_time));
END $$;