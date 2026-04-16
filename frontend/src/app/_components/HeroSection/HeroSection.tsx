import React from 'react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            새로운 만남, 새로운 경험,<br />
            새로운 가능성을 만나세요
          </h1>
          <p className={styles.heroSubtitle}>
            좋은 이벤트 하나가 커리어의 방향을 바꾸기도 합니다. VenueOn에서 분야별 최고의 컨퍼런스와 세미나를 만나보세요. 세션 단위로 유연하게 참여하고, 얼리버드 할인 티켓으로 합리적으로 시작하세요. 이벤트가 끝난 뒤에도 커뮤니티를 통해 이어지는 네트워킹이 기다리고 있습니다.
          </p>
        </div>
        <div className={styles.heroImageBox}>
          <div className={styles.rollingList}>
            {[...Array(2)].map((_, loopIndex) => (
              <React.Fragment key={loopIndex}>
                {/* 1. 이벤트 */}
                <div className={`${styles.rollingItem} ${styles.bgEvent}`}>
                  <div className={styles.cardHeader}>• 진행중</div>
                  <div className={styles.cardTitle}>2026 넥스트 제너레이션 리더십 컨퍼런스</div>
                  <div className={styles.cardTags}>
                    <span className={styles.tag}>#테크</span>
                    <span className={styles.tag}>#리더십</span>
                    <span className={styles.tag}>#B2B</span>
                  </div>
                  <div className={styles.cardFooter}>@스파크플러스</div>
                </div>

                {/* 2. 세션 */}
                <div className={`${styles.rollingItem} ${styles.bgSession}`}>
                  <div className={styles.cardHeader}>• 모집중</div>
                  <div className={styles.cardTitle}>스타트업을 위한 B2B 세일즈 전략</div>
                  <div className={styles.cardDesc}>현업에서 바로 적용 가능한 실전 세일즈 노하우 공유 및 네트워킹</div>
                  <div className={styles.cardFooter}>🗓️ 2026. 05. 20 (수) 14:00</div>
                </div>

                {/* 3. 티켓 */}
                <div className={`${styles.rollingItem} ${styles.bgTicket}`}>
                  <div className={styles.cardHeader}>• 20% 할인</div>
                  <div className={styles.cardTitle}>얼리버드 VIP 티켓</div>
                  <div className={styles.cardDesc}>이용가능세션: 메인 키노트, 네트워킹 파티</div>
                  <div className={styles.cardFooter}>
                    <span>💰 ₩50,000</span>
                    <span style={{ marginLeft: '12px' }}>🎫 잔여: 15매</span>
                  </div>
                </div>

                {/* 4. 커뮤니티 */}
                <div className={`${styles.rollingItem} ${styles.bgCommunity}`}>
                  <div className={styles.cardHeader}>• 커뮤니티</div>
                  <div className={styles.cardTitle}>개발자 네트워킹 및 정보 공유 방</div>
                  <div className={styles.cardDesc}>[이벤트] 2026 넥스트 제너레이션 리더십 컨퍼런스 참여자</div>
                  <div className={styles.cardFooter}>👥 @김코딩</div>
                </div>

                {/* 5. 포스트 */}
                <div className={`${styles.rollingItem} ${styles.bgPost}`}>
                  <div className={styles.cardHeader}>• 포스트</div>
                  <div className={styles.cardTitle}>행사 후기 및 프레젠테이션 자료 공유합니다!</div>
                  <div className={styles.cardDesc}>유익한 시간이었습니다. 발표 자료 첨부파일 확인해주세요.</div>
                  <div className={styles.cardFooter}>💬 댓글 24개</div>
                </div>

                {/* 6. 댓글 */}
                <div className={`${styles.rollingItem} ${styles.bgReply}`}>
                  <div className={styles.cardHeader}>• 댓글</div>
                  <div className={styles.cardTitle}>정말 좋은 세션이었어요! 다음에도 꼭 참여하고 싶습니다.</div>
                  <div className={styles.cardDesc}>↳ 저도 너무 공감합니다. 자료를 너무 잘 만들어주셨네요 (대댓글)</div>
                  <div className={styles.cardFooter}>👤 @최성실</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
