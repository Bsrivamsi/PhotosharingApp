@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-22"
cd /d "C:\Users\VAMSI\photo-sharing-app\backend"
"C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd" -DskipTests spring-boot:run
