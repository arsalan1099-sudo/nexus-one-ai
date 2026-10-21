# NEXUS ONE – Citizen AI / RC7

A general-purpose assistant experience *inspired by* modern multimodal assistants. It is **not** Google's Project Astra, ChatGPT Astra, a military-certified application, or an independent foundation model.

## What actually works without any server

Open `dist/assistant.html` (or the supplied standalone HTML) and choose **Explore safe offline demo**. Offline mode supports arithmetic including parentheses; fixed seven-day planning templates; defensive digital-safety checklist; chat clearing and export; optional local save/load (subject to browser storage permissions); attachment selection; camera capture on supported secure origins; and voice dictation when supported by the browser. The offline demo does **not** run an AI model, interpret a photo, synthesize answers, or create images/projects.

The nine civilian planning modules from RC6 are still included under `dist/citizen-demo.html` and accessible via `/citizen` when the app is hosted.

## What is implemented for a configured production server

- Secure session: Firebase email/password with verified email and explicit admin UID allowlist.
- Rate-limited server-side AI chat (`POST /api/chat`).
- Vision questions from an explicitly submitted compressed JPEG/PNG (`POST /api/vision`). The server validates content, dimensions, payload size, authentication and daily quota.
- Image generation (`POST /api/image`) and editable project ZIP generation (`POST /api/project`).
- English, Hindi, Urdu, Arabic and additional supported language choices.
- Voice dictation via browser SpeechRecognition, **only with explicit consent**. Depending on the browser, its vendor may process speech remotely. Text-to-speech uses the browser's speech synthesizer.
- Photos do not stream continuously; each still frame requires capture and explicit Send. No autonomous account, computer, weapons or system actions exist.
- No provider key embedded in frontend code.

**Important:** the live AI, image and vision features have not been verified in this environment because provider/Firebase credentials and dependencies were unavailable. Provider compatibility with the configured vision model must be confirmed using the model catalog. Do not call this a production certified system without running end-to-end tests and independent security review.

## Run it

Requires Node.js **24.12+**, an HTTPS origin, Redis, a Firebase project/service account, an approved Firebase UID, and a provider secret key.

1. Review `.env.example` and fill in **private** environment variables in your host (do not commit them). Set `APP_ORIGIN` to your real origin, `TEXT_MODEL`, `IMAGE_MODEL`, `VISION_MODEL`, and Firebase identity. The default models are examples and must be verified against the provider's live catalog.
2. `npm ci` (requires registry/network access and Node 24).
3. `npm run build` and `npm test`, then `npm run verify:astra`.
4. `npm run preflight`, then `npm start` after Redis and Firebase credentials are correctly configured.
5. Open `/` or `/assistant`, sign in, verify email and request an admin allowlist entry. Open `/citizen` for fully offline local tools.
6. For Docker/Render, review `Dockerfile`, `compose.yaml`, and `render.yaml`. The Render Blueprint includes a **paid persistent Key Value** service; do not apply it without checking costs and authorizing provisioning.

## Privacy and limitations

Chat, document excerpts and images are only sent when the user explicitly sends. On a configured server the input is forwarded to an external provider. Browser speech recognition may use third-party infrastructure. Photo and image data are not stored by this app's backend but could be retained by the provider or hosting under their policies. Browser storage for saved chats is **not encrypted**; only save non-sensitive content. No client-side security measure replaces proper consent, logs, access control, threat modeling, audits and server controls.

The preview can be opened as a local HTML file. Browser permission restrictions may disable voice or live camera on `file://`; use HTTPS for full browser media functionality.

## Documentation

For image inputs the configured model must support typed `image_url` content in an OpenAI-compatible chat completion. See https://gen.pollinations.ai/ and the Pollinations multimodal guides.
