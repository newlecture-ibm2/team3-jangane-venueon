/**
 * 공통 유틸리티 함수
 */

/**
 * 가격을 한국 원화 형식으로 포맷
 */
export function formatPrice(price: number): string {
  return `₩${price.toLocaleString("ko-KR")}`;
}

/**
 * 날짜를 한국어 형식으로 포맷
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 날짜+시간을 한국어 형식으로 포맷
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 클래스명 조합 (falsy 값 필터링)
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
