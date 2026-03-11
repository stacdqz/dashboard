-- 在 Supabase SQL Editor 中执行此 SQL 即可创建记录表
CREATE TABLE bdpan_action_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    action_type VARCHAR(255) NOT NULL,
    action_item TEXT NOT NULL,
    ip VARCHAR(45) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    log_text TEXT NOT NULL
);

-- 添加索引以加快查询速度
CREATE INDEX idx_bdpan_action_logs_created_at ON bdpan_action_logs(created_at);
CREATE INDEX idx_bdpan_action_logs_username ON bdpan_action_logs(username);
CREATE INDEX idx_bdpan_action_logs_action_type ON bdpan_action_logs(action_type);
