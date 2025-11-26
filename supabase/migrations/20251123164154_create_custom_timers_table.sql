/*
  # Créer la table des minuteries personnalisées

  1. Nouvelle Table
    - `custom_timers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key vers users)
      - `name` (text) - Nom de la minuterie (ex: "Faire mes devoirs")
      - `work_duration` (int) - Durée de travail en minutes
      - `break_duration` (int) - Durée de pause en minutes
      - `icon` (text) - Nom de l'icône à afficher
      - `color` (text) - Couleur de la carte
      - `created_at` (timestamptz)
  
  2. Sécurité
    - Enable RLS
    - Policies pour que les utilisateurs ne voient que leurs propres minuteries
*/

CREATE TABLE IF NOT EXISTS custom_timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  work_duration int NOT NULL,
  break_duration int NOT NULL DEFAULT 5,
  icon text DEFAULT 'Clock',
  color text DEFAULT '#58A6FF',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_timers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timers"
  ON custom_timers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timers"
  ON custom_timers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timers"
  ON custom_timers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own timers"
  ON custom_timers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);