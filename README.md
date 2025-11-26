applicationLockAI

## Configuration de l'API OpenAI

Pour activer Lock, le coach IA, tu dois ajouter ta clé API OpenAI :

1. Ouvre le fichier `.env` à la racine du projet
2. Remplace `your_openai_api_key_here` par ta vraie clé API OpenAI
3. Redémarre l'application

```
OPENAI_API_KEY=sk-proj-votre-clé-ici
```

L'Edge Function `lock-chat` est déjà déployée et configurée avec la personnalité de Lock.
