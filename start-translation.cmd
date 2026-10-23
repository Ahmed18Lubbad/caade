@echo off
setlocal
cd /d "%~dp0"
set "XDG_DATA_HOME=%LOCALAPPDATA%\LibreTranslate\data"
set "XDG_CONFIG_HOME=%LOCALAPPDATA%\LibreTranslate\config"
set "XDG_CACHE_HOME=%LOCALAPPDATA%\LibreTranslate\cache"
set "PYTHONUTF8=1"
set "PYTHONIOENCODING=utf-8"
set "LIBRETRANSLATE_EXE=%LOCALAPPDATA%\Python\pythoncore-3.12-64\Scripts\libretranslate.exe"

if not exist "%LIBRETRANSLATE_EXE%" (
  echo LibreTranslate was not found at:
  echo %LIBRETRANSLATE_EXE%
  echo Install it with: py -3.12 -m pip install libretranslate
  pause
  exit /b 1
)

echo Starting LibreTranslate on http://127.0.0.1:5000
echo Keep this window open while using the website.
"%LIBRETRANSLATE_EXE%" --host 127.0.0.1 --port 5000 --load-only ar,en --debug
echo LibreTranslate stopped with exit code %ERRORLEVEL%.
pause
