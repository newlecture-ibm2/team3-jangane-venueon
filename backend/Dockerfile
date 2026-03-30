# === Stage 1: Build (JDK 필요 - 컴파일용) ===
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# 의존성 캐싱 (변경 빈도 낮음 -> 레이어 캐시 활용)
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
RUN ./gradlew dependencies --no-daemon || true

# 소스 빌드
COPY src ./src
RUN ./gradlew clean build -x test --no-daemon

# === Stage 2: Run (JRE만 - 실행용, 경량) ===
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
