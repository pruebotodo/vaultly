# Vaultly – MVP Funcional (Extracción de audio → Transcripción → Resumen → Búsqueda)

Vaultly te permite **pegar un enlace** (YouTube, TikTok, X/Twitter, Instagram, etc.), **extraer el audio** con `yt-dlp`, **transcribirlo**, **resumirlo** y **guardarlo en una base local** con **búsqueda de texto completo**. Incluye **backend Node.js + Express + SQLite** y **frontend React (Vite)**.

> ⚠️ Para transcribir y resumir con IA se usa **OpenAI** (opcional). Si no configuras `OPENAI_API_KEY`, Vaultly seguirá funcionando y generará un **resumen básico** de manera local (heurística extractiva).

---

## Requisitos

- Node.js 18+
- `ffmpeg` instalado (obligatorio para que `yt-dlp` convierta a audio)
- `yt-dlp` instalado (`pip install yt-dlp` o según tu sistema)
- (Opcional) **OpenAI API Key** para transcripción y resumen
  - Crea un archivo `.env` en `/server` con:
    ```
    OPENAI_API_KEY=sk-...
    OPENAI_MODEL_SUMMARY=gpt-4o-mini    # opcional, por defecto gpt-4o-mini
    OPENAI_MODEL_TRANSCRIBE=whisper-1   # opcional, por defecto whisper-1
    ```

---

## Estructura

```
vaultly/
  server/              # API (Express + SQLite + OpenAI opcional)
    src/
      index.js
      db.js
      routes/ingest.js
      services/downloader.js
      services/transcriber.js
      services/summarizer.js
      types.js
    .env.example
    package.json
  web/                 # UI (Vite + React)
    index.html
    src/
      main.jsx
      App.jsx
      api.js
    package.json
    vite.config.js
```

---

## Instalación y ejecución (modo desarrollo)

### 1) Backend

```bash
cd server
cp .env.example .env   # edita valores si usarás OpenAI
npm install
npm run dev
```
Esto levanta la API en **http://localhost:7070** y crea el archivo `vaultly.db` automáticamente.

### 2) Frontend

En otra terminal:

```bash
cd web
npm install
npm run dev
```
Abre el enlace que te muestre Vite (normalmente http://localhost:5173).

---

## Uso

1. Pega un enlace (YouTube, TikTok, etc.) en la caja de texto y presiona **Ingerir**.
2. Espera a que termine el proceso (descarga → transcripción → resumen).
3. Revisa el resultado en la tabla y usa la **barra de búsqueda** para encontrar contenido por palabras clave (texto completo sobre transcripción y resumen).

---

## Notas

- Si el contenido tiene restricciones de descarga, `yt-dlp` podría fallar. Prueba con otros enlaces o revisa tus cookies (yt-dlp permite usar cookies del navegador).
- La transcripción **local** (sin OpenAI) no está incluida para evitar dependencias pesadas (Whisper local). A cambio, dejamos una **ruta funcional por defecto** con OpenAI y una **ruta de resumen local** si no hay API Key. Puedes agregar un transcriptor local más adelante si lo deseas.
- La base de datos usa **SQLite + FTS5** para búsquedas rápidas.
- Para producción, se incluye un `Dockerfile` simple de backend (ver comentarios en `server/package.json`) y puedes servir el frontend como estático.

¡Listo! Disfruta Vaultly 🚀

---

## Deploy rápido en Render

1. Sube este proyecto a un repositorio de GitHub.
2. En Render, usa **New + Blueprint** y selecciona el repo (usa `render.yaml`).
3. Se crearán 2 servicios: **vaultly-api** (Node) y **vaultly-web** (Static).
4. En **vaultly-api**, agrega `OPENAI_API_KEY` si usarás IA.
5. Espera a que el backend quede con URL pública, por ejemplo: `https://vaultly-api.onrender.com`.
6. En **vaultly-web** → **Environment** agrega `VITE_API_BASE` con la URL pública del backend.
7. Redeploy del sitio estático. ¡Listo! Abre la URL del sitio y prueba.

> En desarrollo local `VITE_API_BASE` no es necesario (Vite proxya `/api`). En producción es **obligatorio**.

**Nota Render:** se usa `ffmpeg-static` para post-procesar audio en el servidor sin depender de paquetes del sistema.
