export default function NewEventPage() {
  return (
    <div style={{ padding: "var(--space-8)", maxWidth: 720, margin: "0 auto" }}>
      <h1>이벤트 생성</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Step-by-Step으로 이벤트를 등록하세요. (기획자 전용)
      </p>
      {/* TODO: EventForm 컴포넌트 (Step 1: 기본 정보 → Step 2: 일정&장소 → Step 3: 상세 설명) */}
    </div>
  );
}
