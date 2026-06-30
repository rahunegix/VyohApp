-- Saathini VIP: elite circle for influencers, business leaders & celebrities
ALTER TYPE platform_type ADD VALUE IF NOT EXISTS 'vip';

INSERT INTO subscription_plans (name, price, billing_cycle, features, active)
VALUES (
  'VIP',
  20000,
  'monthly',
  '[
    "Access Saathini VIP circle",
    "Meet verified influencers & business leaders",
    "Unlimited interests on VIP",
    "100 contact credits per month",
    "Priority concierge support",
    "Exclusive Uttarakhand elite network"
  ]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;
