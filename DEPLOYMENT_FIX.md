# 🚀 Guía de Despliegue - Solución Problemas Vercel

## ❌ Problema Actual

El commit se hace correctamente pero Vercel no está desplegando la dapp moderna automáticamente.

## 🔍 Diagnóstico Rápido

### 1. Verificar Build Local

```bash
npm run build
```

Si el build falla, hay errores que corregir antes del despliegue.

### 2. Verificar Variables de Entorno en Vercel

Ve a [Vercel Dashboard](https://vercel.com/dashboard) → Tu proyecto → Settings → Environment Variables

**Variables críticas que deben estar configuradas:**

- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` (requerida)
- `THIRDWEB_SECRET_KEY` (requerida)
- `THIRDWEB_PRIVATE_KEY` (64 caracteres hex, sin 0x)
- `ADMIN_PRIVATE_KEY` (opcional)
- `UPSTASH_REDIS_REST_URL` (para producción)

### 3. Verificar Logs de Build

En Vercel Dashboard → Tu proyecto → Deployments → Último deployment → View Logs

Busca errores como:

- `THIRDWEB_PRIVATE_KEY format is invalid`
- `Build failed`
- `Out of memory`

## 🛠️ Soluciones Paso a Paso

### Paso 1: Limpiar Cache de Vercel

1. Ve a Vercel Dashboard
2. Tu proyecto → Settings → Advanced
3. Haz clic en "Clear Build Cache"
4. Haz un nuevo commit para forzar redeploy

### Paso 2: Verificar Conexión del Repositorio

1. Ve a Vercel Dashboard → Tu proyecto → Settings → Git
2. Verifica que el repositorio esté correctamente conectado
3. Asegúrate de que la rama `main` esté seleccionada

### Paso 3: Configurar Build Settings

En Vercel Dashboard → Tu proyecto → Settings → Functions:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (vacío)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Paso 4: Si hay errores de memoria

Agrega esto a `vercel.json`:

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Paso 5: Forzar Redeploy

1. Haz un commit vacío:

```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

## 📊 Checklist de Verificación

- [ ] Build local funciona: `npm run build`
- [ ] Todas las variables de entorno configuradas en Vercel
- [ ] Repositorio correctamente conectado
- [ ] Build cache limpiado
- [ ] Logs de Vercel revisados
- [ ] Commit realizado después de cambios

## 🔧 Comandos Útiles

```bash
# Verificar build local
npm run build

# Ejecutar script de diagnóstico
bash scripts/check-deployment.sh

# Limpiar cache local
rm -rf .next node_modules/.cache

# Ver logs de Vercel
vercel logs
```

## 🚨 Errores Comunes y Soluciones

### Error: `THIRDWEB_PRIVATE_KEY format is invalid`

**Solución**: Asegúrate de que sea exactamente 64 caracteres hexadecimales sin el prefijo `0x`

### Error: `Build failed`

**Solución**: Revisa los logs detallados y corrige los errores de compilación

### Error: `Out of memory`

**Solución**: Agrega configuración de memoria en `vercel.json`

### Error: `Module not found`

**Solución**: Verifica que todas las dependencias estén en `package.json`

## 📞 Soporte

Si el problema persiste:

1. Revisa los logs completos en Vercel
2. Compara con un despliegue anterior que funcionó
3. Contacta soporte de Vercel con los logs específicos

## ✅ Verificación Final

Después de aplicar las soluciones:

1. El commit debería aparecer en Vercel Dashboard
2. El build debería iniciar automáticamente
3. La URL de preview debería cargar la dapp moderna
4. No debería haber errores en los logs

¡La dapp moderna debería desplegarse correctamente! 🎉
