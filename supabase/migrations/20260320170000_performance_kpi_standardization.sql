-- Add standardized KPI columns to performance_metrics
ALTER TABLE performance_metrics 
ADD COLUMN IF NOT EXISTS sprint_40m_s numeric(4,2),
ADD COLUMN IF NOT EXISTS vo2_max numeric(4,1),
ADD COLUMN IF NOT EXISTS bench_press_1rm_kg numeric(5,1),
ADD COLUMN IF NOT EXISTS squat_1rm_kg numeric(5,1),
ADD COLUMN IF NOT EXISTS illinois_agility_s numeric(4,2),
ADD COLUMN IF NOT EXISTS vertical_jump_cm numeric(4,1);

-- Add comments for documentation
COMMENT ON COLUMN performance_metrics.sprint_40m_s IS '40 meter sprint time in seconds';
COMMENT ON COLUMN performance_metrics.vo2_max IS 'Maximal oxygen consumption in ml/kg/min';
COMMENT ON COLUMN performance_metrics.bench_press_1rm_kg IS 'Bench press one-rep max in kilograms';
COMMENT ON COLUMN performance_metrics.squat_1rm_kg IS 'Squat one-rep max in kilograms';
COMMENT ON COLUMN performance_metrics.illinois_agility_s IS 'Illinois Agility Test time in seconds';
COMMENT ON COLUMN performance_metrics.vertical_jump_cm IS 'Vertical jump height in centimeters';
