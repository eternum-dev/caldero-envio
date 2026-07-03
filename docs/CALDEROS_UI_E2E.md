# Calderos UI — Manual E2E Test Plan

> Batch C: UI sin MercadoPago. Verifica que el saldo, las cards de paquetes, el
> historial y la landing pública se renderizan correctamente. Los botones de
> compra deben decir "Próximamente" y estar deshabilitados.

## Entorno

- Firebase emulators corriendo (`firebase emulators:start`)
- App en `npm run dev` o deploy preview
- Navegador con viewport desktop y otro con viewport mobile (< 768px)

## Setup

1. Arrancar emulators.
2. Abrir la app en `http://localhost:5173`.
3. Asegurarse de no haber sesión iniciada.

## Escenarios

### S-1: Registro nuevo y badge en header

1. Ir a `/register` y crear una cuenta de prueba.
2. Completar onboarding (o saltar si ya existe store de prueba).
3. **Esperado**: en el header autenticado aparece el badge `🪙 10 calderos`.
4. Reducir el viewport a < 768px.
5. **Esperado**: el badge muestra solo `10` (sin emoji).
6. Hacer click en el badge.
7. **Esperado**: navega a `/settings/calderos`.

### S-2: Tab "Mis Calderos"

1. Ir a `/settings`.
2. **Esperado**: se ve el tab `Mis Calderos` al final del tablist.
3. Hacer click en `Mis Calderos`.
4. **Esperado**:
   - Saldo grande: `10` con label `calderos disponibles`.
   - 3 cards: Mini `$4.990` / 150, Standard `$9.990` / 400, Pro `$15.990` / 1.000.
   - Badges: Standard `25% más barato`, Pro `52% más barato`.
   - Todos los botones dicen `Próximamente` y están deshabilitados.
   - Historial con al menos 1 transacción: `+10 calderos · hace un momento`.
   - Texto legal visible: "Por el momento no emitimos boleta...".

### S-3: Landing pública anónima

1. Cerrar sesión.
2. Ir a `/`.
3. **Esperado**:
   - Sección de precios entre features y footer.
   - Headline: "Modelo de prepago. Cargas calderos según tu demanda, sin compromiso de permanencia."
   - Subhead: "Empieza a usar Caldero Envío sin costo. Te regalamos 10 calderos al registrarte."
   - 3 cards con precios LOCKED.
   - CTA principal dice `Crear cuenta gratis`.
4. Hacer click en `Crear cuenta gratis`.
5. **Esperado**: navega a `/register`.

### S-4: Landing autenticada

1. Iniciar sesión con la cuenta de S-1.
2. Ir a `/`.
3. **Esperado**:
   - Sección de precios visible.
   - CTA principal dice `Ir a la app`.
4. Hacer click en `Ir a la app`.
5. **Esperado**: navega a `/app`.

### S-5: Responsive mobile

1. En landing, reducir viewport a < 768px.
2. **Esperado**: las 3 cards de precios se apilan en 1 columna.
3. En `/settings/calderos`, reducir viewport a < 768px.
4. **Esperado**: las 3 cards de recarga se apilan en 1 columna y el badge del
   header muestra solo el número.

## Checklist QA

- [ ] Nuevo usuario recibe 10 calderos gratis.
- [ ] Badge en header autenticado navega a `/settings/calderos`.
- [ ] Tab `Mis Calderos` visible y funcional.
- [ ] Precios mostrados: Mini `$4.990`, Standard `$9.990`, Pro `$15.990`.
- [ ] Calderos mostrados: Mini `150`, Standard `400`, Pro `1.000`.
- [ ] Badges de ahorro: Standard `25% más barato`, Pro `52% más barato`.
- [ ] Botones de compra deshabilitados con texto `Próximamente`.
- [ ] Historial muestra la transacción free de 10 calderos.
- [ ] Texto legal visible.
- [ ] Landing CTA cambia según auth.
- [ ] Layout responsive 1 col mobile / 3 cols desktop.

## Notas

- Los valores de paquetes deben coincidir con `src/utils/constants.js`
  (`PACKAGES` v2). Si se ven valores distintos, hay un drift de pricing.
- Los botones estarán habilitados en la Sesión 3 cuando se integre
  MercadoPago.
