-- 5 Premium Communities for VAYO Community Matching
INSERT INTO communities (community_id, community_name, category, city, timezone, member_count, description, is_active)
VALUES 
('comm_ai_innovators', 'AI Innovators Hub', 'programming', 'Bengaluru', 'Asia/Kolkata', 1420, 'A premier community for AI researchers, prompt engineers, and LLM developers building the future of intelligence.', true),
('comm_ux_creative', 'UI/UX Creative Guild', 'design', 'San Francisco', 'America/Los_Angeles', 870, 'A dynamic space for designers, visual thinkers, and product researchers focused on creating stunning human-centered designs.', true),
('comm_fintech_builders', 'FinTech Builders', 'finance', 'Mumbai', 'Asia/Kolkata', 1050, 'Connecting innovators in banking technology, quantitative finance, decentralized ledgers, and neo-banking systems.', true),
('comm_indie_hackers', 'Indie Hackers Club', 'business', 'New York', 'America/New_York', 2130, 'A support network for solopreneurs, bootstrappers, and digital creators building profitable side projects and micro-SaaS platforms.', true),
('comm_pm_circle', 'PM Circle Bangalore', 'product management', 'Bengaluru', 'Asia/Kolkata', 620, 'Bridging the gap between engineering and business. Sharing roadmap templates, design sprints, and product growth frameworks.', true)
ON CONFLICT (community_id) DO UPDATE
SET community_name = EXCLUDED.community_name,
    category = EXCLUDED.category,
    city = EXCLUDED.city,
    timezone = EXCLUDED.timezone,
    member_count = EXCLUDED.member_count,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;
