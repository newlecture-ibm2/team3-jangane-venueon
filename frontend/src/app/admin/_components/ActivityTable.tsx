'use client';

import React, { useState } from 'react';
import styles from './ActivityTable.module.css';
import { InputField, Pagination } from '@/components/ui';
import { MoreIcon } from '@/components/icons';

// 1. 환불 대기 건 데이터
const REFUND_DATA = [
  { id: 1, name: '사용자 이름', title: '강의 제목 강의 제목 강의 제목 강의 제...', amount: '₩80,000', status: '대기 중' },
  { id: 2, name: '사용자 이름', title: '강의 제목 강의 제목 강의 제목 강의 제...', amount: '₩80,000', status: '대기 중' },
  { id: 3, name: '사용자 이름', title: '강의 제목 강의 제목 강의 제목 강의 제...', amount: '₩80,000', status: '대기 중' },
  { id: 4, name: '사용자 이름', title: '강의 제목 강의 제목 강의 제목 강의 제...', amount: '₩80,000', status: '대기 중' },
  { id: 5, name: '사용자 이름', title: '강의 제목 강의 제목 강의 제목 강의 제...', amount: '₩80,000', status: '대기 중' },
];

// 2. 긴급 처리 신고 데이터
const REPORT_DATA = [
  { id: 1, title: '게시물 제목 게시물 제목 게시물 제목 게시물 제목 게시물 제목', author: '사용자', reportCount: '15건' },
  { id: 2, title: '게시물 제목 게시물 제목 게시물 제목 게시물 제목 게시물 제목', author: '사용자', reportCount: '15건' },
  { id: 3, title: '게시물 제목 게시물 제목 게시물 제목 게시물 제목 게시물 제목', author: '사용자', reportCount: '15건' },
  { id: 4, title: '게시물 제목 게시물 제목 게시물 제목 게시물 제목 게시물 제목', author: '사용자', reportCount: '15건' },
  { id: 5, title: '게시물 제목 게시물 제목 게시물 제목 게시물 제목 게시물 제목', author: '사용자', reportCount: '15건' },
];

export default function ActivityTable() {
  const [activeTab, setActiveTab] = useState<'refund' | 'report'>('refund');
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className={styles.container}>
      {/* 탭 영역 (첫 번째 줄) */}
      <div className={styles.tabArea}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'refund' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('refund');
              setCurrentPage(1);
            }}
          >
            환불 대기 건
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'report' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('report');
              setCurrentPage(1);
            }}
          >
            긴급 처리 신고
          </button>
        </div>
      </div>

      {/* 검색어 영역 (두 번째 줄) - 사용자 관리와 동일한 위치(좌측) 구성 */}
      <div className={styles.searchFilterArea}>
        <div className={styles.searchWrapper}>
          <InputField
            variant="search"
            placeholder="검색어를 입력하세요"
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          {activeTab === 'refund' ? (
            /* 환불 대기 건 헤더 */
            <thead>
              <tr>
                <th className={styles.colStudent}>수강생</th>
                <th className={styles.colLecture}>강의 제목</th>
                <th className={styles.colAmount}>환불 금액</th>
                <th className={styles.colStatus}>상태</th>
                <th className={styles.colMore}></th>
              </tr>
            </thead>
          ) : (
            /* 긴급 처리 신고 헤더 */
            <thead>
              <tr>
                <th className={styles.reportTitleCol}>게시물 제목</th>
                <th className={styles.reportAuthorCol}>게시자</th>
                <th className={styles.reportCountCol}>신고 수</th>
                <th className={styles.colMore}></th>
              </tr>
            </thead>
          )}

          <tbody>
            {activeTab === 'refund' ? (
              /* 환불 대기 건 렌더링 */
              REFUND_DATA.map((item) => (
                <tr key={item.id}>
                  <td className={styles.colStudent}>
                    <div className={styles.userProfile}>
                      <div className={styles.avatar}></div>
                      <span className={styles.userName}>{item.name}</span>
                    </div>
                  </td>
                  <td className={styles.colLecture}>
                    <span className={styles.lectureTitle}>{item.title}</span>
                  </td>
                  <td className={styles.colAmount}>
                    <span className={styles.amount}>{item.amount}</span>
                  </td>
                  <td className={styles.colStatus}>
                    <span className={styles.statusBadge}>{item.status}</span>
                  </td>
                  <td className={styles.colMore}>
                    <button className={styles.iconButton}>
                      <MoreIcon />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              /* 긴급 처리 신고 렌더링 */
              REPORT_DATA.map((item) => (
                <tr key={item.id}>
                  <td className={styles.reportTitleCol}>{item.title}</td>
                  <td className={styles.reportAuthorCol}>{item.author}</td>
                  <td className={styles.reportCountCol}>{item.reportCount}</td>
                  <td className={styles.colMore}>
                    <button className={styles.iconButton}>
                      <MoreIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.paginationArea}>
        <Pagination
          currentPage={currentPage}
          totalPages={23}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
