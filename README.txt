# MCC V0.5 – Herrmann AI

Enthält:
- index.html
- netlify/functions/herrmann.mts
- netlify.toml

Benötigte Netlify Environment Variable:
OPENAI_API_KEY

Die Funktion läuft unter:
POST /api/herrmann

Hinweis:
Für Functions muss Netlify die Source-Struktur bauen/deployen. Bei reinem Static Drag & Drop
werden Functions je nach Deploy-Methode nicht verarbeitet. Am zuverlässigsten ist ein Git-basiertes
Netlify-Deploy oder Netlify CLI.
