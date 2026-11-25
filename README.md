# Modo Crucero · Demos

Demos personalizados para clínicas: diagnóstico, recepcionista IA en vivo, reactivación por WhatsApp y panel de resultados.

Cada demo vive en `/<slug>`. Ejemplo incluido: `/clinica-dental-ejemplo`.

## Variables de entorno (Vercel → Settings → Environment Variables, en Production y Preview)

| Variable | Para qué |
| --- | --- |
| `ANTHROPIC_API_KEY` | Clave de la API de Claude para la recepcionista IA. Ponle límite de gasto en la consola. |
| `NEXT_PUBLIC_WHATSAPP` | Tu número en formato internacional sin `+` ni espacios, por ejemplo `593991234567`. |
| `ANTHROPIC_MODEL` | Opcional. Por defecto `claude-haiku-5-5`, el más económico. |

Los demos nuevos aparecen solos: la tarea nocturna crea un archivo JSON en Google Drive compartido por link, y el demo vive en `/<id del archivo en Drive>`. También se pueden agregar demos como `data/demos/<slug>.json` en este repo. Los demos dejan de cargar a los 60 días, para que los links viejos no sigan gastando la clave de API.
