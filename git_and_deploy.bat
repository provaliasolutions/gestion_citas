@echo off
REM Script para desplegar en Firebase y actualizar en GitHub
REM Proyecto: gestion_citas-saas

cd "C:\Users\paull\Desktop\PROVALIA SOLUTIONS\gestion_citas-saas"

echo ======= DEPLOY EN FIREBASE =======
firebase deploy --only hosting

echo ======= ACTUALIZAR GITHUB =======
git add .
git commit -m "Descripción de cambios"
git push origin main

echo ======= TODO FINALIZADO =======
pause