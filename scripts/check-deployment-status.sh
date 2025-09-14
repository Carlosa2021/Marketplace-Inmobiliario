# Verificar estado del despliegue
echo "=== VERIFICACIÓN DE DESPLIEGUE ==="
echo "Fecha: $(date)"
echo ""

# Verificar variables de entorno críticas
echo "=== VARIABLES DE ENTORNO ==="
echo "NEXT_PUBLIC_THIRDWEB_CLIENT_ID: ${NEXT_PUBLIC_THIRDWEB_CLIENT_ID:0:10}..."
echo "THIRDWEB_SECRET_KEY: ${THIRDWEB_SECRET_KEY:0:10}..."
echo "THIRDWEB_PRIVATE_KEY: ${THIRDWEB_PRIVATE_KEY:0:10}..."
echo ""

# Verificar archivos de configuración
echo "=== ARCHIVOS DE CONFIGURACIÓN ==="
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json encontrado"
    cat vercel.json | head -20
else
    echo "❌ vercel.json no encontrado"
fi
echo ""

if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
    grep '"version"' package.json
else
    echo "❌ package.json no encontrado"
fi
echo ""

# Verificar build local
echo "=== VERIFICACIÓN DE BUILD LOCAL ==="
if npm run build --silent 2>/dev/null; then
    echo "✅ Build local exitoso"
else
    echo "❌ Build local falló"
fi