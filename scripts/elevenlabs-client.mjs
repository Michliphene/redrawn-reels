// Client ElevenLabs partagé. La clé est lue dans ELEVENLABS_API_KEY (jamais dans le code).
// Lancer un script avec la clé : node --env-file=.env scripts/<script>.mjs
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const elevenlabs = new ElevenLabsClient();
