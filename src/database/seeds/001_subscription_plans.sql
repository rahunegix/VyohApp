-- Seed subscription plans
INSERT INTO subscription_plans (name, price, billing_cycle, features, active) VALUES
('Free', 0, 'monthly', '["Limited likes", "Basic discovery", "Chat requests", "Profile creation"]', true),
('Premium', 499, 'monthly', '["Unlimited likes", "Advanced filters", "See who liked you", "Profile boost", "Compatibility insights", "More contact unlocks"]', true),
('Premium Plus', 999, 'monthly', '["Everything in Premium", "Family-managed support", "Extra visibility", "Enhanced trust badge", "Priority placement"]', true);
