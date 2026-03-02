-- Fix retours: 30j → 14j dans trust_bar CMS
UPDATE site_content SET value = 'Retours gratuits 14j' WHERE section = 'trust_bar' AND key = 'message2';

-- Sync hero CMS values to match current site fallbacks
UPDATE site_content SET value = 'Porter &' WHERE section = 'hero' AND key = 'title_line1';
UPDATE site_content SET value = 'vibrer le Sud' WHERE section = 'hero' AND key = 'title_line2';
UPDATE site_content SET value = 'Vestiaire Femme' WHERE section = 'hero' AND key = 'cta1_text';
UPDATE site_content SET value = 'Vestiaire Homme' WHERE section = 'hero' AND key = 'cta2_text';
