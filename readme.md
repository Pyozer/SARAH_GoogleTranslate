﻿Plugin Traduction pour S.A.R.A.H
================================================================================

Le plugin nécessite tout d'abord SpeechReco (similaire à Scribe).

Que vous pouvez trouver ici: https://github.com/tilleul/Sarah.dictation.v2

Vous pouvez toujours modifier le plugin pour l'adapter au système habitutel pour le Garbage ;)

Prérequis
---------
- Sarah v4
- Le plugin SpeechReco
- Et ce plugin ;)

Installation
------------
- Copier le dossier GoogleTranslate dans votre dossier "plugins" de Sarah
- Remplacez Jarvis dans GoogleTranslate.xml par celui que vous utilisez (ex: Sarah, ...)

Comment ça marche ?
--------------------------
- Démarrez S.A.R.A.H (ainsi que le serveur https du plugin SpeechReco)
- Allez sur la page https://127.0.0.1:4300 pour avoir la reconnaissance du Garbage via Google Chrome
- Vous n'avez plus qu'a demander par exemple: "Jarvis traduit bonjour en anglais"
- Vous pouvez demander n'importe quel mot ou phrase dans n'importe quel langue (sous réserve quelle soit indiqué dans le xml et ajouter dans le .js).
- En faite, le plugin récupère seulement la phrase demandé, ainsi que la langue cible, et récupère le résultat de Google Translate.