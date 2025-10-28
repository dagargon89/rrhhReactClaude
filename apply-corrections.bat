@echo off
echo ========================================
echo Aplicando Correcciones de Reglas
echo ========================================
echo.

REM Intentar con Laragon MySQL
if exist "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" (
    echo Usando MySQL de Laragon...
    "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" -u root hrms_db < "prisma\migrations\fix-incidencias-rules.sql"
    goto :verificar
)

REM Intentar con MySQL en PATH
mysql -u root hrms_db < "prisma\migrations\fix-incidencias-rules.sql" 2>nul
if %errorlevel% equ 0 goto :verificar

REM Intentar con ruta común de XAMPP
if exist "C:\xampp\mysql\bin\mysql.exe" (
    echo Usando MySQL de XAMPP...
    "C:\xampp\mysql\bin\mysql.exe" -u root hrms_db < "prisma\migrations\fix-incidencias-rules.sql"
    goto :verificar
)

echo ERROR: No se encontro MySQL
echo.
echo Por favor, ejecuta manualmente:
echo 1. Abre phpMyAdmin o MySQL Workbench
echo 2. Selecciona la base de datos 'hrms_db'
echo 3. Abre el archivo: prisma\migrations\fix-incidencias-rules.sql
echo 4. Ejecuta el script
pause
exit /b 1

:verificar
echo.
echo ========================================
echo Script ejecutado exitosamente
echo ========================================
echo.
echo Verificando cambios...
pause
