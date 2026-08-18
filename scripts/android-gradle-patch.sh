#!/usr/bin/env bash
# Capacitor Android projesinin app/build.gradle dosyasına:
#  - kotlin-stdlib sürüm zorlaması (duplicate class hatası için)
#  - packaging exclude
# ekler. GitHub Actions APK workflow'undan çağrılır.
set -e

GRADLE_FILE="android/app/build.gradle"

if [ ! -f "$GRADLE_FILE" ]; then
  echo "UYARI: $GRADLE_FILE bulunamadı, yama atlandı."
  exit 0
fi

if grep -q "resolutionStrategy" "$GRADLE_FILE"; then
  echo "build.gradle zaten yamalı, atlandı."
  exit 0
fi

cat >> "$GRADLE_FILE" <<'GRADLE_PATCH'

// --- Jarvis: kotlin çakışması + packaging yaması ---
configurations.all {
    resolutionStrategy {
        force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22'
    }
}

android {
    packagingOptions {
        exclude 'META-INF/INDEX.LIST'
        exclude 'META-INF/io.netty.versions.properties'
    }
}
GRADLE_PATCH

echo "build.gradle yamalandı."
