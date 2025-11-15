-- Block C: Seed evaluation templates

INSERT INTO evaluation_templates (key, label, description, dimensions) VALUES
  ('project_review', 'Project Review', 'Evaluate this collaboration project', 
   '[
     {"key": "clarity", "label": "Clarity", "description": "How clear is the project scope and goals?", "min": 1, "max": 5, "step": 1},
     {"key": "impact", "label": "Impact", "description": "How significant is the potential impact?", "min": 1, "max": 5, "step": 1},
     {"key": "craft", "label": "Craft", "description": "Quality of execution and attention to detail", "min": 1, "max": 5, "step": 1}
   ]'::jsonb),

  ('media_feedback', 'Media Feedback', 'Evaluate this media contribution', 
   '[
     {"key": "relevance", "label": "Relevance", "description": "How relevant is this to the event/project?", "min": 1, "max": 5, "step": 1},
     {"key": "quality", "label": "Quality", "description": "Technical and artistic quality", "min": 1, "max": 5, "step": 1},
     {"key": "originality", "label": "Originality", "description": "How original or creative is this?", "min": 1, "max": 5, "step": 1}
   ]'::jsonb),

  ('funding_decision', 'Funding Decision', 'Should this be funded?', 
   '[
     {"key": "urgency", "label": "Urgency", "description": "How time-sensitive is this?", "min": 1, "max": 5, "step": 1},
     {"key": "credibility", "label": "Credibility", "description": "Trust in the team to deliver", "min": 1, "max": 5, "step": 1},
     {"key": "impact", "label": "Impact", "description": "Expected impact if funded", "min": 1, "max": 5, "step": 1}
   ]'::jsonb)
ON CONFLICT (key) DO NOTHING;