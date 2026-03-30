interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommunityDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h1>커뮤니티 상세</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        커뮤니티 ID: {id}
      </p>
      {/* TODO: PostList + PostForm + CommentList 컴포넌트 */}
    </div>
  );
}
