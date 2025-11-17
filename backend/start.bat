@echo off
echo ========================================
echo   DEMARRAGE SENAT LEGIS RH SYSTEM
echo ========================================
echo.

echo Activation de l'environnement virtuel...
call venv\Scripts\activate

echo.
echo Demarrage du serveur Django...
echo.
echo Interface admin disponible sur :
echo http://127.0.0.1:8000/admin/
echo.
echo Username : admin
echo Password : admin123
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo ========================================
echo.

python manage.py runserver
