interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h1>이벤트 상세</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        이벤트 ID: {id}
      </p>
      {/* TODO: EventDetail + TicketSection 컴포넌트 */}
    </div>
  );
}
