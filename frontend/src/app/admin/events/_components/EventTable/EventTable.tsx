import React from 'react';
import { useRouter } from 'next/navigation';
import { DeleteIcon, MoreIcon } from '@/components/icons';
import { Tag, Toggle, PopoverMenu } from '@/components/ui';
import { AdminEventListItem } from '@/lib/admin-api';
import styles from './EventTable.module.css';

interface EventTableProps {
  events: AdminEventListItem[];
  isLoading: boolean;
  openPopoverId: number | null;
  onToggleVisibility: (id: number) => void;
  onDeleteClick: (event: AdminEventListItem) => void;
  onPopoverSelect: (value: string, event: AdminEventListItem) => void;
  onPopoverToggle: (eventId: number | null) => void;
}

/** 어드민 표준 날짜 포맷 함수 */
function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const getStatusTag = (displayStatus: string) => {
  switch (displayStatus) {
    case 'READY': return <Tag variant="gray">게시 전</Tag>;
    case 'RECRUITING': return <Tag variant="green">모집 중</Tag>;
    case 'CLOSED': return <Tag variant="red">종료</Tag>;
    default: return null;
  }
};

export default function EventTable({
                       events,
                       isLoading,
                       openPopoverId,
                       onToggleVisibility,
                       onDeleteClick,
                       onPopoverSelect,
                       onPopoverToggle,
                     }: EventTableProps) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
        <tr>
          <th className={styles.colTitle}>강의 제목</th>
          <th className={styles.colAttendees}>인원</th>
          <th className={styles.colDate}>개설일</th>
          <th className={styles.colStatus}>상태</th>
          <th className={styles.colVisibility}>노출</th>
          <th className={styles.colAction}></th>
        </tr>
        </thead>
        <tbody>
        {isLoading ? (
          <tr><td colSpan={6} className={styles.loadingTd}>로딩 중...</td></tr>
        ) : events.length === 0 ? (
          <tr><td colSpan={6} className={styles.emptyTd}>데이터가 없습니다.</td></tr>
        ) : (
          events.map((event) => (
            <tr
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className={styles.clickableRow}
            >
              <td className={styles.colTitle}>
                <span className={styles.eventTitleText}>
                  {event.title}
                </span>
              </td>
              <td className={styles.colAttendees}>{event.currentAttendees}명</td>
              <td className={styles.colDate}>
                {formatDate(event.createdAt)}
              </td>
              <td className={styles.colStatus}>
                {getStatusTag(event.displayStatus)}
              </td>
              <td className={styles.colVisibility} onClick={(e) => e.stopPropagation()}>
                <Toggle
                  checked={!event.isHidden}
                  onChange={() => onToggleVisibility(event.id)}
                />
              </td>
              <td className={styles.colAction} onClick={(e) => e.stopPropagation()}>
                <div className={styles.actionGroup}>
                  <button className={styles.deleteBtn} onClick={() => onDeleteClick(event)}>
                    <DeleteIcon />
                  </button>
                  <div className={styles.moreWrapper}>
                    <button
                      className={styles.iconButton}
                      onClick={() => onPopoverToggle(openPopoverId === event.id ? null : event.id)}
                    >
                      <MoreIcon />
                    </button>
                    {openPopoverId === event.id && (
                      <PopoverMenu
                        items={[
                          { value: 'edit', label: '편집' },
                          { value: 'hide', label: event.isHidden ? '노출' : '숨기기' },
                          { value: 'delete', label: '삭제' },
                        ]}
                        onSelect={(v) => onPopoverSelect(v, event)}
                        onClose={() => onPopoverToggle(null)}
                        width={120}
                        className={styles.popover}
                      />
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))
        )}
        </tbody>
      </table>
    </div>
  );
}
