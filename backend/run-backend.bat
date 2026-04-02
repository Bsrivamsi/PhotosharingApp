@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-22"
cd /d "C:\Users\VAMSI\photo-sharing-app\backend"

set "PROFILE=%~1"
if "%PROFILE%"=="" set "PROFILE=dev"

set "MVN_CMD=C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd"
if not exist "%MVN_CMD%" set "MVN_CMD=mvn"

echo Starting backend with Spring profile: %PROFILE%
"%MVN_CMD%" -DskipTests spring-boot:run -Dspring-boot.run.profiles=%PROFILE%
