-- Seed 2 additional demo evaluations for UTSTALLNING project using real user IDs
-- Project ID: 4de3e1f3-c1eb-4c90-a3ba-865a2e2c0a86

DO $$
DECLARE
  user_id_1 UUID;
  user_id_2 UUID;
  template_id_var UUID;
BEGIN
  -- Get two existing user IDs
  SELECT id INTO user_id_1 FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO user_id_2 FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 1;
  
  -- Get the template ID
  SELECT id INTO template_id_var FROM evaluation_templates WHERE key = 'project_review' LIMIT 1;

  -- Only insert if we have users and template
  IF user_id_1 IS NOT NULL AND user_id_2 IS NOT NULL AND template_id_var IS NOT NULL THEN
    INSERT INTO evaluations (
      target_type,
      target_id,
      evaluator_id,
      template_id,
      eckt_value,
      rating,
      dimensions,
      comment,
      context_scope,
      context_id
    ) VALUES 
    (
      'project',
      '4de3e1f3-c1eb-4c90-a3ba-865a2e2c0a86',
      user_id_1,
      template_id_var,
      90,
      5,
      jsonb_build_object(
        'clarity', 95,
        'impact', 88,
        'craft', 87
      ),
      'Fantastiskt initiativ som verkligen lyfter fram nordisk kreativitet! Katalogen är både visuellt tilltalande och innehållsrik. Ser fram emot fler liknande projekt.',
      'showcase',
      '4de3e1f3-c1eb-4c90-a3ba-865a2e2c0a86'
    ),
    (
      'project',
      '4de3e1f3-c1eb-4c90-a3ba-865a2e2c0a86',
      user_id_2,
      template_id_var,
      55,
      3,
      jsonb_build_object(
        'clarity', 60,
        'impact', 55,
        'craft', 50
      ),
      'Bra koncept men känns som det kunde utvecklas mer. Dokumentationen är okej men saknar lite djup i vissa delar.',
      'showcase',
      '4de3e1f3-c1eb-4c90-a3ba-865a2e2c0a86'
    );
  END IF;
END $$;