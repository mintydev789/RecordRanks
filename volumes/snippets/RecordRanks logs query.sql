-- This query won't work here. It's for getting RecordRanks logs in the Supabase Logs section. Copy this query and run it there instead.

select id, timestamp, event_message, metadata from function_edge_logs where metadata->>'rr_code' is not null order by timestamp desc limit 100;