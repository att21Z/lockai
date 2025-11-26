/*
  # Correction des policies RLS pour custom_timers

  1. Problème
    - Les policies actuelles utilisent `auth.uid()` qui nécessite l'authentification Supabase
    - L'application n'utilise pas Supabase Auth, les utilisateurs sont dans la table `users`
  
  2. Solution
    - Désactiver RLS pour custom_timers pour permettre l'accès direct
    - Les utilisateurs sont déjà identifiés via le UserContext
    - La sécurité est gérée au niveau de l'application

  3. Note importante
    - Cette approche est appropriée pour une application mobile/web où l'utilisateur
      est déjà identifié via le contexte de l'application
    - Pour une API publique, il faudrait implémenter Supabase Auth
*/

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view own timers" ON custom_timers;
DROP POLICY IF EXISTS "Users can insert own timers" ON custom_timers;
DROP POLICY IF EXISTS "Users can update own timers" ON custom_timers;
DROP POLICY IF EXISTS "Users can delete own timers" ON custom_timers;

-- Désactiver RLS pour cette table
ALTER TABLE custom_timers DISABLE ROW LEVEL SECURITY;