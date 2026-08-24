# Sesión 4 — Bitácora de smoke test (Batch F)

> Change: `revisar-monetizacion`  
> Branch: `feat/revisar-monetizacion-session-4`  
> Fecha: 2026-08-08  
> Orchestrator: Ale  

## Resumen de ejecución

| Task | Estado | Notas |
|------|--------|-------|
| T-F.1 | PASS | Secrets `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` sandbox seteados en Firebase project `caldero-envio`. |
| T-F.2 | BLOCKED | Deploy de Cloud Functions falló con 403 en `locations/southamerica-west1`. Ver detalle abajo. |
| T-F.3 | PENDING | Bloqueado por T-F.2. |
| T-F.4 | PENDING | Bloqueado por T-F.2. |
| T-F.5 | PENDING | Bloqueado por T-F.2. |
| T-F.6 | PENDING | Bloqueado por T-F.2. Requiere deploy + interacción de Ale en el browser. |
| T-F.7 | PASS (docs) | Creado `docs/MP_PROD_SETUP.md` con diffs sandbox/prod y checklist de swap a producción. |
| T-F.8 | PENDING | Bloqueado por T-F.6. |
| T-F.9 | PENDING | Bloqueado por T-F.8. |
| T-F.10 | PENDING | Bloqueado por T-F.8. |

## T-F.1 — Setear secrets en Firebase

**Comando ejecutado:**

```powershell
npx firebase-tools@13 firebase functions:secrets:set MP_ACCESS_TOKEN --data-file mp_access_token.txt --project caldero-envio
npx firebase-tools@13 firebase functions:secrets:set MP_WEBHOOK_SECRET --data-file mp_webhook_secret.txt --project caldero-envio
```

**Resultado:**

- `+ Created a new secret version projects/433601708017/secrets/MP_ACCESS_TOKEN/versions/1`
- `+ Created a new secret version projects/433601708017/secrets/MP_WEBHOOK_SECRET/versions/1`

**Veredicto:** PASS.

## T-F.2 — Deploy Cloud Functions a staging/prod

**Comando ejecutado:**

```powershell
npx firebase-tools@13 firebase deploy --only functions --project caldero-envio
```

**Resultado:** Error 403.

```text
There was an issue deploying your functions. Verify that your project has a Google App Engine instance setup at https://console.cloud.google.com/appengine and try again.
Upload Error: Request to https://cloudfunctions.googleapis.com/v1/projects/caldero-envio/locations/southamerica-west1/functions:generateUploadUrl had HTTP Error: 403,
Permission denied on 'locations/southamerica-west1' (or it may not exist)
```

**Diagnóstico:**

1. El proyecto `caldero-envio` tiene **Resource Location = `[Not specified]`** en `firebase projects:list`.
2. Las funciones existentes (`mapboxGeocode`, `mapboxReverseGeocode`, `mapboxDirections`, `mapboxSuggestions`) están deployadas en `us-central1`, no en `southamerica-west1`.
3. Las funciones de calderos fueron escritas con `.region('southamerica-west1')` (decisión técnica locked T-1 del playbook #366).
4. Cloud Functions 1st gen requieren una aplicación de App Engine configurada en la región objetivo. Como no existe App Engine en `southamerica-west1` para este proyecto, el deploy falla.

**Posibles soluciones:**

1. **Opción recomendada (operacional):** En Firebase Console, ir a **Project Settings > General > Default GCP resource location** y setear `southamerica-west1` (Santiago). Esto crea la App Engine application necesaria para deployar funciones 1st gen en esa región.
2. **Opción alternativa (técnica):** Migrar las Cloud Functions de calderos a 2nd gen (`firebase-functions/v2`), que no requieren App Engine. Esto implica cambios de código y no estaba planeado en el playbook.
3. **Opción alternativa (técnica):** Cambiar la región de las funciones de calderos a `us-central1`. Esto viola la decisión locked T-1.

**Veredicto:** BLOCKED hasta que se configure la ubicación del proyecto o se defina otra solución.

## T-F.3 a T-F.6 — Pendientes

- T-F.3 (deploy rules + indexes), T-F.4 (deploy frontend preview), T-F.5 (configurar webhook MP sandbox) y T-F.6 (smoke test sandbox) quedan bloqueados hasta resolver T-F.2.

## T-F.7 — Documentación swap a producción

**Archivo creado:** `docs/MP_PROD_SETUP.md`

Contenido:

- Diferencias clave sandbox vs producción.
- Comandos para rotar secrets a producción.
- Deploy final a producción.
- Configuración de webhook en panel MP producción.
- Smoke test de compra real.
- Instrucciones de rollback.
- Checklist antes de declarar LIVE.

**Veredicto:** PASS (docs).

## Próximos pasos

1. Resolver el blocker de T-F.2 (configurar `southamerica-west1` como default GCP resource location en Firebase Console, o definir otra solución con Ale).
2. Reintentar deploy de functions.
3. Continuar con T-F.3 a T-F.6.
4. Si T-F.6 pasa, proceder con T-F.8 a T-F.10.

## Referencias

- Playbook #366: `sdd/revisar-monetizacion/playbook`
- Apply progress Sesión 3: `sdd/revisar-monetizacion/apply-progress-batch-de` (#451)
- Guía sandbox: `docs/MP_SANDBOX_TESTING.md`
- Guía producción: `docs/MP_PROD_SETUP.md`
