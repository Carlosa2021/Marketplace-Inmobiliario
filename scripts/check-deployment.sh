#!/bin/bash

echo "🔍 Verificando configuración para despliegue en Vercel..."
echo "=================================================="

# Verificar archivos críticos
echo "📁 Verificando archivos críticos:"
if [ -f "package.json" ]; then echo "✅ package.json encontrado"; else echo "❌ package.json faltante"; fi
if [ -f "next.config.ts" ]; then echo "✅ next.config.ts encontrado"; else echo "❌ next.config.ts faltante"; fi
if [ -f "vercel.json" ]; then echo "✅ vercel.json encontrado"; else echo "❌ vercel.json faltante"; fi
if [ -f "tsconfig.json" ]; then echo "✅ tsconfig.json encontrado"; else echo "❌ tsconfig.json faltante"; fi

echo ""
echo "🔧 Verificando scripts de build:"
if grep -q '"build"' package.json; then echo "✅ Script build encontrado"; else echo "❌ Script build faltante"; fi
if grep -q '"start"' package.json; then echo "✅ Script start encontrado"; else echo "❌ Script start faltante"; fi

echo ""
echo "🌍 Verificando variables de entorno críticas:"
if [ -n "$NEXT_PUBLIC_THIRDWEB_CLIENT_ID" ]; then echo "✅ NEXT_PUBLIC_THIRDWEB_CLIENT_ID configurada"; else echo "❌ NEXT_PUBLIC_THIRDWEB_CLIENT_ID faltante"; fi
if [ -n "$THIRDWEB_SECRET_KEY" ]; then echo "✅ THIRDWEB_SECRET_KEY configurada"; else echo "❌ THIRDWEB_SECRET_KEY faltante"; fi

echo ""
echo "📦 Verificando dependencias críticas:"
if grep -q '"next"' package.json; then echo "✅ Next.js encontrado"; else echo "❌ Next.js faltante"; fi
if grep -q '"thirdweb"' package.json; then echo "✅ Thirdweb encontrado"; else echo "❌ Thirdweb faltante"; fi
if grep -q '"react"' package.json; then echo "✅ React encontrado"; else echo "❌ React faltante"; fi

echo ""
echo "🚀 Recomendaciones para Vercel:"
echo "1. Asegúrate de que todas las variables de entorno estén configuradas en Vercel Dashboard"
echo "2. Verifica que el build hook esté funcionando"
echo "3. Revisa los logs de build en Vercel para errores específicos"
echo "4. Si hay errores de memoria, considera aumentar el límite en vercel.json"
echo "5. Verifica que el repositorio esté correctamente conectado a Vercel"

echo ""
echo "🔗 Enlaces útiles:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Thirdweb Dashboard: https://thirdweb.com/dashboard"
echo "- Documentación Vercel + Next.js: https://vercel.com/docs/frameworks/nextjs"