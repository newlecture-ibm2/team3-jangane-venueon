### 이미지 서빙 패턴: Next.js Rewrites + BFF Proxy

> 프론트엔드의 `public/` 폴더에 이미지를 두지 않고, **백엔드 서버의 업로드 폴더**에 저장된 이미지를
> BFF API Route를 통해 프록시하는 방식. 빌드 타임 환경변수 문제 해결 + 백엔드 주소 은닉 + 업로드 시 자동 최적화를 동시에 달성.

#### 전체 흐름

```
브라우저 이미지 요청
    ↓
/images/menu-photo.webp  (또는 /api/upload/menu-photo.webp)
    ↓
next.config.ts rewrites → /api/upload/menu-photo.webp 으로 재작성
    ↓
app/api/[...path]/route.ts (BFF Catch-all)
    ↓
proxyHandler.ts → /api/upload → /upload 경로 변환
    ↓
Spring Boot: http://{API_BASE_URL}/upload/menu-photo.webp
```

#### 1단계: next.config.ts — URL Rewrites 설정

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // BFF 프록시를 통해 이미지를 서빙하므로 Next.js 이미지 최적화 비활성화
  },
  async rewrites() {
    return [
      {
        // 1. /upload/ 경로 → BFF 프록시로 전달
        source: '/upload/:path*',
        destination: '/api/upload/:path*',
      },
      {
        // 2. /images/ 경로 (호환성) → BFF 프록시의 /upload로 전달
        source: '/images/:path*',
        destination: '/api/upload/:path*',
      },
      {
        // 3. 루트의 정적 이미지 파일 (favicon 등) → BFF 프록시로 전달
        source: '/:file(.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico))$',
        destination: '/api/:file',
      },
    ];
  },
};
```

**왜 rewrites를 사용하는가:**
- Next.js 빌드 시점에는 `API_BASE_URL` 같은 런타임 환경변수가 평가되지 않음
- rewrites로 요청을 BFF API Route로 보내면, **런타임에** 환경변수를 읽어 백엔드로 프록시 가능
- 브라우저에는 실제 백엔드 주소가 절대 노출되지 않음

#### 2단계: BFF Proxy Handler — 경로 변환 + 이미지 압축

```typescript
// app/api/[...path]/handlers/proxyHandler.ts (핵심 부분만 발췌)

// Sharp는 동적 import (모듈 누락 시에도 라우트가 동작하도록)
let sharpModule: typeof import('sharp') | null = null;
try {
    sharpModule = require('sharp');
} catch {
    console.warn('[BFF] Sharp not available, image compression disabled');
}

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080';

export async function handleProxy(req: NextRequest, session: IronSession<any>) {
    const { pathname } = req.nextUrl;
    let backendPath = pathname;

    // 경로 변환: 프론트 경로 → 백엔드 경로
    if (pathname.startsWith('/api/')) {
        backendPath = pathname.replace(/^\/api/, '');     // /api/upload/x → /upload/x
    } else if (pathname.startsWith('/images/')) {
        backendPath = pathname.replace(/^\/images/, '/upload'); // /images/x → /upload/x
    }

    const targetUrl = `${API_BASE}${backendPath}${req.nextUrl.search}`;

    // 이미지 업로드 시 자동 압축 (multipart/form-data 요청인 경우)
    if (contentType?.includes('multipart/form-data')) {
        const formData = await req.formData();
        const newFormData = new FormData();

        for (const [key, value] of formData.entries()) {
            if (value instanceof Blob && value.type.startsWith('image/')) {
                if (sharpModule) {
                    const buffer = Buffer.from(await value.arrayBuffer());
                    const compressed = await sharpModule(buffer)
                        .resize({ width: 1200, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toBuffer();
                    const newFile = new Blob([new Uint8Array(compressed)], { type: 'image/webp' });
                    newFormData.append(key, newFile, 'image.webp');
                } else {
                    newFormData.append(key, value); // Sharp 없으면 원본 전달
                }
            } else {
                newFormData.append(key, value);
            }
        }
    }

    // 백엔드로 프록시
    const proxyRes = await fetch(targetUrl, { method: req.method, headers, body });
    return new NextResponse(proxyRes.body, { status: proxyRes.status });
}
```

#### 3단계: 컴포넌트에서의 이미지 사용

```tsx
// ✅ 권장 패턴: /images/ 경로 사용 (rewrite가 BFF로 자동 전달)
<Image src={`/images/${menu.imageSrc}`} alt={menu.korName} fill />

// ✅ 직접 BFF 경로 사용 (rewrite 없이 직접 BFF 호출)
<img src={`/api/upload/${popup.imageUrl}`} alt={popup.title} />

// ✅ 외부 URL 분기 처리가 필요한 경우 (헬퍼 함수 사용)
const getImageUrl = (srcUrl: string) => {
    if (!srcUrl) return '';
    if (srcUrl.startsWith('http')) return srcUrl;  // 외부 URL은 그대로
    return `/api/upload/${srcUrl}`;                // 내부 이미지는 BFF 경로
};
<Image src={getImageUrl(image.srcUrl)} alt="이미지" fill />
```

#### 개선 포인트 (NCafe에서 배운 교훈)

| 문제 | 설명 | 해결 방향 |
|------|------|-----------|
| **경로 혼재** | `/images/`와 `/api/upload/` 두 가지 패턴이 컴포넌트마다 다르게 사용됨 | 하나의 경로로 통일 (권장: `/images/`) |
| **헬퍼 함수 중복** | `getImageUrl()`이 여러 컴포넌트에 개별 구현됨 | `utils/imageUrl.ts`로 공통 유틸 추출 |
| **외부 URL 분기 누락** | 일부 컴포넌트에서 `http`로 시작하는 외부 URL 분기 처리 없음 | 공통 헬퍼에 분기 로직 포함 |

#### 새 프로젝트 적용 시 체크리스트

```
□ next.config.ts에 이미지 경로 rewrites 설정
□ BFF proxyHandler에 이미지 경로 변환 로직 추가 (/api/upload → /upload)
□ Sharp 동적 import로 이미지 업로드 시 자동 압축 (WebP 변환)
□ 공통 이미지 URL 헬퍼 함수 생성 (utils/getImageUrl.ts)
□ 컴포넌트에서 이미지 경로 패턴 통일 (/images/ 또는 /api/upload/ 중 택일)
□ next.config.ts의 images.unoptimized: true 설정 확인
```
