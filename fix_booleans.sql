UPDATE event_sessions SET is_default = false WHERE is_default IS NULL;
UPDATE event_sessions SET is_online = false WHERE is_online IS NULL;
UPDATE tickets SET is_all_sessions = true WHERE is_all_sessions IS NULL;
UPDATE tickets SET is_active = true WHERE is_active IS NULL;
