SELECT o.id, o.user_id, o.event_id, o.status, e.title, e.status FROM orders o JOIN events e ON o.event_id = e.id WHERE o.user_id = 2;
