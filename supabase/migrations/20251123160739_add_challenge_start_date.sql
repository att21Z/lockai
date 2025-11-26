/*
  # Ajouter la date de début du défi

  1. Modifications
    - Ajoute la colonne `challenge_start_date` à la table `users`
      - Type: date
      - Default: date actuelle lors de la création
      - Permet de tracker depuis combien de jours l'utilisateur a commencé le défi
  
  2. Notes
    - La date est automatiquement définie lors de la création de l'utilisateur
    - Permet de calculer "Jour 1", "Jour 2", etc. dans l'interface
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'challenge_start_date'
  ) THEN
    ALTER TABLE users ADD COLUMN challenge_start_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;