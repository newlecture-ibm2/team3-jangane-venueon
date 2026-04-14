package com.venueon.common.config;

import com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.venueon.category.adapter.out.persistence.repository.CategoryJpaRepository;
import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.SessionJpaEntity;
import com.venueon.event.adapter.out.persistence.repository.EventJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.SessionJpaRepository;
import com.venueon.ticket.adapter.out.persistence.entity.TicketJpaEntity;
import com.venueon.ticket.adapter.out.persistence.entity.TicketSessionJpaEntity;
import com.venueon.ticket.adapter.out.persistence.repository.TicketJpaRepository;
import com.venueon.ticket.adapter.out.persistence.repository.TicketSessionJpaRepository;
import com.venueon.order.adapter.out.persistence.entity.OrderJpaEntity;
import com.venueon.order.adapter.out.persistence.repository.OrderJpaRepository;
import com.venueon.order.domain.model.OrderStatus;
import com.venueon.report.adapter.out.persistence.entity.RefundJpaEntity;
import com.venueon.report.adapter.out.persistence.entity.ReportJpaEntity;
import com.venueon.report.adapter.out.persistence.repository.RefundJpaRepository;
import com.venueon.report.adapter.out.persistence.repository.ReportJpaRepository;
import com.venueon.report.domain.model.AdminAction;
import com.venueon.report.domain.model.RefundStatus;
import com.venueon.report.domain.model.ReportStatus;
import com.venueon.report.domain.model.ReportTargetType;
import com.venueon.user.adapter.out.persistence.entity.HostProfileJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.HostProfileJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.EventStatusJpaRepository;
import com.venueon.event.adapter.out.persistence.repository.EventTypeJpaRepository;
import com.venueon.ticket.adapter.out.persistence.repository.RecruitmentStatusJpaRepository;
import com.venueon.user.adapter.out.persistence.repository.UserRoleJpaRepository;
import com.venueon.event.adapter.out.persistence.entity.EventStatusJpaEntity;
import com.venueon.event.adapter.out.persistence.entity.EventTypeJpaEntity;
import com.venueon.ticket.adapter.out.persistence.entity.RecruitmentStatusJpaEntity;
import com.venueon.user.adapter.out.persistence.entity.UserRoleJpaEntity;
import com.venueon.user.adapter.out.persistence.repository.UserJpaRepository;
import com.venueon.cart.adapter.out.persistence.entity.CartJpaEntity;
import com.venueon.cart.adapter.out.persistence.repository.CartJpaRepository;
import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import com.venueon.community.adapter.out.persistence.repository.CommunityJpaRepository;
import com.venueon.post.adapter.out.persistence.entity.PostJpaEntity;
import com.venueon.post.adapter.out.persistence.repository.PostJpaRepository;
import com.venueon.post.domain.model.PostType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

        private final UserRoleJpaRepository userRoleRepository;
    private final EventStatusJpaRepository eventStatusRepository;
    private final EventTypeJpaRepository eventTypeRepository;
    private final RecruitmentStatusJpaRepository recruitmentStatusRepository;
    private final UserJpaRepository userRepository;
    private final HostProfileJpaRepository hostProfileRepository;
    private final CategoryJpaRepository categoryRepository;
    private final EventJpaRepository eventRepository;
    private final SessionJpaRepository sessionRepository;
    private final OrderJpaRepository orderRepository;
    private final ReportJpaRepository reportRepository;
    private final RefundJpaRepository refundRepository;
    private final CartJpaRepository cartRepository;
    private final TicketJpaRepository ticketRepository;
    private final TicketSessionJpaRepository ticketSessionRepository;
    private final CommunityJpaRepository communityRepository;
    private final PostJpaRepository postRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            log.info("데이터가 이미 존재합니다. 장바구니 데이터를 ID 1번 사용자용으로 재구성하고, 누락된 신고 샘플이 있다면 생성합니다.");
            
            // 신고 데이터가 하나도 없다면 기존 데이터를 활용해 생성
            if (reportRepository.count() == 0) {
                List<UserJpaEntity> users = userRepository.findAll();
                List<EventJpaEntity> events = eventRepository.findAll();
                List<PostJpaEntity> posts = postRepository.findAll();
                if (!users.isEmpty() && !events.isEmpty()) {
                    createReports(users, events, posts);
                    log.info("누락된 신고 샘플 데이터 생성 완료");
                }
            }

            cleanupCartTable();
            jdbcTemplate.execute("TRUNCATE TABLE cart CASCADE"); // 기존 장바구니 비우기
            createInitialCartItems();
            return;
        }

        
        log.info("=== 개발용 초기 데이터 생성 시작 ===");
        cleanupCartTable();

        createDomainStatuses();


        UserJpaEntity admin = createAdmin();
        List<UserJpaEntity> users = createUsers();
        List<UserJpaEntity> hosts = createHosts();
        List<CategoryJpaEntity> categories = createCategories();
        List<EventJpaEntity> events = createEvents(hosts, categories);
        createSessions(events);
        createTickets(events);
        List<CommunityJpaEntity> communities = createCommunities(admin);
        List<PostJpaEntity> posts = createPosts(users, communities);
        List<OrderJpaEntity> orders = createOrders(users, events);
        List<ReportJpaEntity> reports = createReports(users, events, posts);
        List<RefundJpaEntity> refunds = createRefunds(users, orders);
        createInitialCartItems();

        log.info("=== 개발용 초기 데이터 생성 완료 ===");
        log.info("Admin: 1명, User: {}명, Host: {}명", users.size(), hosts.size());
        log.info("Category: {}개, Event: {}개, Session: {}개, Ticket: {}개",
                categories.size(), events.size(), sessionRepository.count(), ticketRepository.count());
        log.info("Order: {}개, Report: {}개, Refund: {}개", orders.size(), reports.size(), refunds.size());
    }

    
    private void createDomainStatuses() {
        userRoleRepository.saveAll(List.of(
                UserRoleJpaEntity.builder().id(1L).code("ADMIN").name("관리자").build(),
                UserRoleJpaEntity.builder().id(2L).code("USER").name("일반사용자").build(),
                UserRoleJpaEntity.builder().id(3L).code("HOST").name("호스트").build()
        ));
        eventStatusRepository.saveAll(List.of(
                EventStatusJpaEntity.builder().id(1L).code("DRAFT").label("임시저장").build(),
                EventStatusJpaEntity.builder().id(2L).code("PUBLISHED").label("발행됨").build(),
                EventStatusJpaEntity.builder().id(3L).code("ONGOING").label("진행중").build(),
                EventStatusJpaEntity.builder().id(4L).code("ENDED").label("종료됨").build(),
                EventStatusJpaEntity.builder().id(5L).code("CANCELLED").label("취소됨").build()
        ));
        eventTypeRepository.saveAll(List.of(
                EventTypeJpaEntity.builder().id(1L).code("CONFERENCE").name("컨퍼런스").build(),
                EventTypeJpaEntity.builder().id(2L).code("CLASS").name("클래스").build(),
                EventTypeJpaEntity.builder().id(3L).code("MEETING").name("모임").build(),
                EventTypeJpaEntity.builder().id(4L).code("SEMINAR").name("세미나").build(),
                EventTypeJpaEntity.builder().id(5L).code("FESTIVAL").name("페스티벌").build(),
                EventTypeJpaEntity.builder().id(6L).code("EXHIBITION").name("전시회").build(),
                EventTypeJpaEntity.builder().id(7L).code("ETC").name("기타").build()
        ));
        recruitmentStatusRepository.saveAll(List.of(
                RecruitmentStatusJpaEntity.builder().id(1L).code("PENDING").label("모집예정").build(),
                RecruitmentStatusJpaEntity.builder().id(2L).code("OPEN").label("모집중").build(),
                RecruitmentStatusJpaEntity.builder().id(3L).code("CLOSED").label("모집마감").build()
        ));
    }

    private UserJpaEntity createAdmin() {
        return userRepository.save(UserJpaEntity.builder()
                .email("admin@venueon.com")
                .password(passwordEncoder.encode("Admin1234!"))
                .nickname("VenueOn관리자")
                .role(userRoleRepository.findById(1L).orElseThrow())
                .build());
    }

    private List<UserJpaEntity> createUsers() {
        return userRepository.saveAll(List.of(
                UserJpaEntity.builder()
                        .email("user1@example.com")
                        .password(passwordEncoder.encode("User1234!"))
                        .nickname("김참여")
                        .role(userRoleRepository.findById(2L).orElseThrow())
                        .build(),
                UserJpaEntity.builder()
                        .email("user2@example.com")
                        .password(passwordEncoder.encode("User1234!"))
                        .nickname("이탐색")
                        .role(userRoleRepository.findById(2L).orElseThrow())
                        .build(),
                UserJpaEntity.builder()
                        .email("user3@example.com")
                        .password(passwordEncoder.encode("User1234!"))
                        .nickname("박이벤트")
                        .role(userRoleRepository.findById(2L).orElseThrow())
                        .build()
        ));
    }

    private List<UserJpaEntity> createHosts() {
        String encodedPassword = passwordEncoder.encode("Host1234!");

        // 호스트 정보 배열 (User + HostProfile 데이터)
        record HostData(String email, String nickname, String profileImg, String phone,
                        String orgName, String orgNumber, String managerName, String orgDescription) {}

        List<HostData> hostDataList = List.of(
                new HostData("contact@nextcode.kr", "NextCode", "profile/2026/04/nextcode.png", "02-1234-5678",
                        "넥스트코드", "123-45-67890", "김개발",
                        "AI와 클라우드 기술 전문 교육 기업. 현직 개발자가 이끄는 실무 중심 코딩 부트캠프와 기술 세미나를 운영합니다."),
                new HostData("hello@designbridge.co.kr", "DesignBridge", "profile/2026/04/designbridge.png", "02-2345-6789",
                        "디자인브릿지", "234-56-78901", "이디자인",
                        "UX/UI 디자인 전문 에이전시. 실무 프로젝트 기반의 디자인 워크숍과 포트폴리오 클래스를 제공합니다."),
                new HostData("info@sparkventures.io", "SparkVentures", "profile/2026/04/sparkventures.png", "02-3456-7890",
                        "스파크벤처스", "345-67-89012", "박벤처",
                        "초기 스타트업을 위한 액셀러레이터. 투자 유치 전략, 비즈니스 모델 설계, 네트워킹 이벤트를 정기적으로 개최합니다."),
                new HostData("wellness@greenlife.kr", "GreenLifeAcademy", "profile/2026/04/greenlife-academy.png", "02-4567-8901",
                        "그린라이프 아카데미", "456-78-90123", "최건강",
                        "건강한 라이프스타일을 위한 웰니스 교육 플랫폼. 요가, 명상, 영양학 클래스와 건강 세미나를 운영합니다."),
                new HostData("art@artspaceseoul.com", "ArtSpaceSeoul", "profile/2026/04/artspace-seoul.png", "02-5678-9012",
                        "아트스페이스 서울", "567-89-01234", "정예술",
                        "서울 성수동 소재 복합 문화 공간. 전시, 공연, 아트 워크숍 등 다양한 문화 이벤트를 기획하고 운영합니다."),
                new HostData("consulting@bizon.co.kr", "BizOnConsulting", "profile/2026/04/bizon-consulting.png", "02-6789-0123",
                        "비즈온 컨설팅", "678-90-12345", "강전략",
                        "기업 성장 전략 전문 컨설팅 펌. 리더십, 마케팅, 데이터 기반 의사결정 등 비즈니스 컨퍼런스와 세미나를 개최합니다."),
                new HostData("chef@foodlabseoul.kr", "FoodLabSeoul", "profile/2026/04/foodlab-seoul.png", "02-7890-1234",
                        "푸드랩 서울", "789-01-23456", "한요리",
                        "셰프와 미식가를 위한 쿠킹 스튜디오. 한식, 양식, 베이킹 클래스와 푸드 네트워킹 밋업을 정기적으로 운영합니다."),
                new HostData("invest@moneyflow.co.kr", "MoneyFlow", "profile/2026/04/moneyflow.png", "02-8901-2345",
                        "머니플로우", "890-12-34567", "윤재테크",
                        "개인 투자자와 금융 전문가를 연결하는 핀테크 교육 플랫폼. 주식, 부동산, 가상자산 세미나와 재테크 컨퍼런스를 개최합니다."),
                new HostData("hello@creatorshub.kr", "CreatorsHub", "profile/2026/04/creators-hub.png", "02-9012-3456",
                        "크리에이터즈 허브", "901-23-45678", "신미디어",
                        "유튜버, 인플루언서, 콘텐츠 크리에이터를 위한 미디어 교육 기관. 영상 편집, SNS 마케팅, 브랜딩 클래스를 운영합니다."),
                new HostData("forum@seoulscience.org", "SeoulScienceForum", "profile/2026/04/seoul-science-forum.png", "02-0123-4567",
                        "서울사이언스포럼", "012-34-56789", "조과학",
                        "과학 기술 대중화를 위한 비영리 학술 단체. 최신 연구 동향 발표, 과학 강연, 학술 컨퍼런스를 주최합니다.")
        );

        // 1) User 엔티티 저장
        List<UserJpaEntity> hostUsers = userRepository.saveAll(
                hostDataList.stream().map(d -> UserJpaEntity.builder()
                        .email(d.email())
                        .password(encodedPassword)
                        .nickname(d.nickname())
                        .role(userRoleRepository.findById(3L).orElseThrow())
                        .profileImg(d.profileImg())
                        .phone(d.phone())
                        .build()
                ).toList()
        );

        // 2) HostProfile 엔티티 저장
        for (int i = 0; i < hostUsers.size(); i++) {
            HostData d = hostDataList.get(i);
            hostProfileRepository.save(HostProfileJpaEntity.builder()
                    .user(hostUsers.get(i))
                    .orgName(d.orgName())
                    .orgNumber(d.orgNumber())
                    .managerName(d.managerName())
                    .orgDescription(d.orgDescription())
                    .build());
        }

        return hostUsers;
    }

    private List<CategoryJpaEntity> createCategories() {
        return categoryRepository.saveAll(List.of(
                CategoryJpaEntity.builder().name("테크/개발 교육").sortOrder(1).build(),
                CategoryJpaEntity.builder().name("디자인/크리에이티브").sortOrder(2).build(),
                CategoryJpaEntity.builder().name("창업/스타트업").sortOrder(3).build(),
                CategoryJpaEntity.builder().name("건강/웰니스").sortOrder(4).build(),
                CategoryJpaEntity.builder().name("문화/예술").sortOrder(5).build(),
                CategoryJpaEntity.builder().name("경영/비즈니스").sortOrder(6).build(),
                CategoryJpaEntity.builder().name("요리/F&B").sortOrder(7).build(),
                CategoryJpaEntity.builder().name("금융/투자").sortOrder(8).build(),
                CategoryJpaEntity.builder().name("미디어/콘텐츠").sortOrder(9).build(),
                CategoryJpaEntity.builder().name("과학/학술").sortOrder(10).build()
        ));
    }

    /**
     * v6: Event에서 price, maxAttendees, location, startDate, endDate, purchaseType, isOnline 제거
     * 이 정보들은 Session에서 관리
     */
    private List<EventJpaEntity> createEvents(List<UserJpaEntity> hosts, List<CategoryJpaEntity> categories) {
        return eventRepository.saveAll(List.of(
                EventJpaEntity.builder()
                        .creator(hosts.get(0)).category(categories.get(0))
                        .title("AI & Cloud Bootcamp")
                        .description("현직 개발자와 함께하는 2일 집중 부트캠프. AI 모델 배포부터 클라우드 인프라 설계까지, 실무에서 바로 쓸 수 있는 기술을 배웁니다.")
                        .type(eventTypeRepository.findById(4L).orElseThrow()).status(eventStatusRepository.findById(2L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/NC_thumbnail.jpg")
                        .hasSession(true)
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(1)).category(categories.get(1))
                        .title("UX Design Workshop")
                        .description("사용자 리서치부터 프로토타이핑까지, UX 디자인의 전 과정을 실습합니다.")
                        .type(eventTypeRepository.findById(2L).orElseThrow()).status(eventStatusRepository.findById(2L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/DB_thumbnail.jpg")
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(2)).category(categories.get(2))
                        .title("Startup Demo Day")
                        .description("스파크벤처스 5기 배치 스타트업 10팀의 데모데이. 투자자, 멘토, 예비 창업자가 한자리에 모여 혁신적인 비즈니스 모델을 발표합니다.")
                        .type(eventTypeRepository.findById(1L).orElseThrow()).status(eventStatusRepository.findById(2L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/SV_thumbnail.jpg")
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(3)).category(categories.get(3))
                        .title("마음챙김 요가 클래스")
                        .description("바쁜 일상 속 나를 돌보는 시간. 호흡법과 명상을 결합한 빈야사 요가 클래스입니다.")
                        .type(eventTypeRepository.findById(2L).orElseThrow()).status(eventStatusRepository.findById(4L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/GLA_thumbnail.jpg")
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(4)).category(categories.get(4))
                        .title("현대미술 워크숍")
                        .description("추상표현주의부터 미디어아트까지, 현대미술의 주요 흐름을 이해하고 직접 작품을 제작합니다.")
                        .type(eventTypeRepository.findById(2L).orElseThrow()).status(eventStatusRepository.findById(2L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/AS_thumbnail.jpg")
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(5)).category(categories.get(5))
                        .title("Business Growth Summit")
                        .description("기업 성장의 핵심 전략을 다루는 비즈니스 서밋.")
                        .type(eventTypeRepository.findById(1L).orElseThrow()).status(eventStatusRepository.findById(2L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/BOC_thumbnail.jpg")
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(6)).category(categories.get(6))
                        .title("한식 마스터클래스")
                        .description("전통 한식의 맛과 멋을 배우는 쿠킹 클래스.")
                        .type(eventTypeRepository.findById(2L).orElseThrow()).status(eventStatusRepository.findById(2L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/FLS_thumbnail.jpg")
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(7)).category(categories.get(7))
                        .title("Smart Investment Seminar 2026")
                        .description("개인 투자자를 위한 스마트 투자 전략 세미나.")
                        .type(eventTypeRepository.findById(4L).orElseThrow()).status(eventStatusRepository.findById(2L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/MF_thumbnail.jpg")
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(8)).category(categories.get(8))
                        .title("Creator Academy: Video Editing")
                        .description("유튜브·숏폼 콘텐츠 제작을 위한 영상 편집 아카데미.")
                        .type(eventTypeRepository.findById(2L).orElseThrow()).status(eventStatusRepository.findById(2L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/CH_thumbnail.jpg")
                        .build(),
                EventJpaEntity.builder()
                        .creator(hosts.get(9)).category(categories.get(9))
                        .title("Future Science Conference")
                        .description("미래 과학 기술의 최신 연구 성과를 공유하는 학술 컨퍼런스.")
                        .type(eventTypeRepository.findById(1L).orElseThrow()).status(eventStatusRepository.findById(2L).orElseThrow())
                        .thumbnailUrl("event-thumbnail/2026/04/SSF_thumbnail.jpg")
                        .hasSession(true)
                        .build()
        ));
    }

    /**
     * 세션 생성 — v6: SessionJpaEntity 사용, price 제거, 모집 기간 추가
     * 장소/가격/정원 등은 모두 세션에서 관리
     */
    private void createSessions(List<EventJpaEntity> events) {
        // 이벤트별 세션 데이터 (제목, 장소, 온라인여부, 정원, 시작, 종료, 모집시작, 모집마감)
        record SessionData(String title, String desc, String location, String sido, String sigungu,
                           boolean online, String onlineLink, int maxAttendees,
                           LocalDateTime start, LocalDateTime end,
                           LocalDateTime recruitStart, LocalDateTime recruitEnd) {}

        // 1) 단일 이벤트들 — 기본 세션 (is_default=true)
        SessionData[] defaultSessions = {
            // 0: AI Bootcamp (hasSession=true이므로 기본 세션 + 추가 세션)
            new SessionData("AI & Cloud Bootcamp", "2일 집중 부트캠프",
                    "서울 강남구 테헤란로 123 넥스트코드 교육센터", "서울", "강남구", false, null, 40,
                    LocalDateTime.of(2026, 4, 12, 10, 0), LocalDateTime.of(2026, 4, 13, 18, 0),
                    LocalDateTime.of(2026, 4, 1, 0, 0), LocalDateTime.of(2026, 4, 11, 23, 59)),
            // 1: UX Design
            new SessionData("UX Design Workshop", "UX 디자인 실습",
                    "서울 성동구 성수이로 45 디자인브릿지 스튜디오", "서울", "성동구", false, null, 25,
                    LocalDateTime.of(2026, 4, 26, 10, 0), LocalDateTime.of(2026, 4, 27, 17, 0),
                    LocalDateTime.of(2026, 4, 10, 0, 0), LocalDateTime.of(2026, 4, 25, 23, 59)),
            // 2: Startup Demo Day
            new SessionData("Startup Demo Day", "데모데이",
                    "서울 영등포구 여의대로 108 파크원타워 컨벤션홀", "서울", "영등포구", false, null, 200,
                    LocalDateTime.of(2026, 5, 10, 14, 0), LocalDateTime.of(2026, 5, 10, 20, 0),
                    LocalDateTime.of(2026, 4, 15, 0, 0), LocalDateTime.of(2026, 5, 9, 23, 59)),
            // 3: 요가 클래스
            new SessionData("마음챙김 요가 클래스", "빈야사 요가",
                    "서울 마포구 연남로 27 그린라이프 웰니스센터", "서울", "마포구", false, null, 20,
                    LocalDateTime.of(2026, 5, 17, 9, 0), LocalDateTime.of(2026, 5, 17, 11, 30),
                    LocalDateTime.of(2026, 5, 1, 0, 0), LocalDateTime.of(2026, 5, 16, 23, 59)),
            // 4: 현대미술 워크숍
            new SessionData("현대미술 워크숍", "현대미술 작품 제작",
                    "서울 성동구 서울숲2길 17 아트스페이스 서울", "서울", "성동구", false, null, 15,
                    LocalDateTime.of(2026, 5, 24, 10, 0), LocalDateTime.of(2026, 5, 25, 17, 0),
                    LocalDateTime.of(2026, 5, 1, 0, 0), LocalDateTime.of(2026, 5, 23, 23, 59)),
            // 5: Business Growth Summit (온라인 겸용)
            new SessionData("Business Growth Summit", "비즈니스 서밋",
                    "서울 중구 세종대로 110 프레스센터 국제회의장", "서울", "중구", true, null, 150,
                    LocalDateTime.of(2026, 5, 31, 9, 30), LocalDateTime.of(2026, 5, 31, 18, 0),
                    LocalDateTime.of(2026, 5, 1, 0, 0), LocalDateTime.of(2026, 5, 30, 23, 59)),
            // 6: 한식 마스터클래스
            new SessionData("한식 마스터클래스", "한식 쿠킹 클래스",
                    "서울 종로구 인사동길 38 푸드랩 서울 쿠킹스튜디오", "서울", "종로구", false, null, 12,
                    LocalDateTime.of(2026, 6, 7, 11, 0), LocalDateTime.of(2026, 6, 7, 15, 0),
                    LocalDateTime.of(2026, 5, 15, 0, 0), LocalDateTime.of(2026, 6, 6, 23, 59)),
            // 7: Smart Investment Seminar (온라인 겸용)
            new SessionData("Smart Investment Seminar 2026", "투자 전략 세미나",
                    "서울 영등포구 국제금융로 10 머니플로우 세미나홀", "서울", "영등포구", true, null, 100,
                    LocalDateTime.of(2026, 6, 14, 13, 0), LocalDateTime.of(2026, 6, 14, 18, 0),
                    LocalDateTime.of(2026, 5, 20, 0, 0), LocalDateTime.of(2026, 6, 13, 23, 59)),
            // 8: Creator Academy
            new SessionData("Creator Academy: Video Editing", "영상 편집 아카데미",
                    "서울 강남구 논현로 515 크리에이터즈 허브 미디어랩", "서울", "강남구", false, null, 30,
                    LocalDateTime.of(2026, 6, 21, 10, 0), LocalDateTime.of(2026, 6, 22, 17, 0),
                    LocalDateTime.of(2026, 6, 1, 0, 0), LocalDateTime.of(2026, 6, 20, 23, 59)),
            // 9: Future Science Conference (hasSession=true)
            new SessionData("Future Science Conference", "학술 컨퍼런스",
                    "서울 동대문구 회기로 85 서울과학기술대 국제회의실", "서울", "동대문구", true, null, 300,
                    LocalDateTime.of(2026, 6, 28, 9, 0), LocalDateTime.of(2026, 6, 29, 18, 0),
                    LocalDateTime.of(2026, 6, 1, 0, 0), LocalDateTime.of(2026, 6, 27, 23, 59))
        };

        // 기본 세션 생성
        for (int i = 0; i < events.size(); i++) {
            EventJpaEntity event = events.get(i);
            SessionData sd = defaultSessions[i];
            sessionRepository.save(SessionJpaEntity.builder()
                    .event(event)
                    .title(sd.title())
                    .description(sd.desc())
                    .sortOrder(0)
                    .startTime(sd.start())
                    .endTime(sd.end())
                    .location(sd.location())
                    .regionSido(sd.sido())
                    .regionSigungu(sd.sigungu())
                    .isOnline(sd.online())
                    .onlineLink(sd.onlineLink())
                    .maxAttendees(sd.maxAttendees())
                    .recruitStartDate(sd.recruitStart())
                    .recruitEndDate(sd.recruitEnd())
                    .isDefault(true)
                    .build());
        }

        // 2) AI & Cloud Bootcamp — 다중 세션 (hasSession=true)
        EventJpaEntity bootcamp = events.get(0);
        sessionRepository.save(SessionJpaEntity.builder()
                .event(bootcamp)
                .title("Day 1: AI 모델 배포")
                .description("TensorFlow/PyTorch 모델을 AWS SageMaker에 배포하는 실습")
                .sortOrder(1)
                .startTime(LocalDateTime.of(2026, 4, 12, 10, 0))
                .endTime(LocalDateTime.of(2026, 4, 12, 18, 0))
                .location("서울 강남구 테헤란로 123 넥스트코드 교육센터")
                .regionSido("서울").regionSigungu("강남구")
                .maxAttendees(40)
                .recruitStartDate(LocalDateTime.of(2026, 4, 1, 0, 0))
                .recruitEndDate(LocalDateTime.of(2026, 4, 11, 23, 59))
                .isDefault(false)
                .build());
        sessionRepository.save(SessionJpaEntity.builder()
                .event(bootcamp)
                .title("Day 2: 클라우드 인프라 설계")
                .description("AWS/GCP 기반 마이크로서비스 아키텍처 설계 및 배포 파이프라인 구축")
                .sortOrder(2)
                .startTime(LocalDateTime.of(2026, 4, 13, 10, 0))
                .endTime(LocalDateTime.of(2026, 4, 13, 18, 0))
                .location("서울 강남구 테헤란로 123 넥스트코드 교육센터")
                .regionSido("서울").regionSigungu("강남구")
                .maxAttendees(40)
                .recruitStartDate(LocalDateTime.of(2026, 4, 1, 0, 0))
                .recruitEndDate(LocalDateTime.of(2026, 4, 11, 23, 59))
                .isDefault(false)
                .build());

        // 3) Future Science Conference — 다중 세션 (온라인 포함)
        EventJpaEntity sciConf = events.get(9);
        sessionRepository.save(SessionJpaEntity.builder()
                .event(sciConf)
                .title("세션 A: 생명공학의 미래")
                .description("유전자 편집 기술과 맞춤형 의료의 최신 연구 성과 발표")
                .sortOrder(1)
                .startTime(LocalDateTime.of(2026, 6, 28, 10, 0))
                .endTime(LocalDateTime.of(2026, 6, 28, 12, 0))
                .location("서울 동대문구 회기로 85 국제회의실 A홀")
                .regionSido("서울").regionSigungu("동대문구")
                .maxAttendees(100)
                .recruitStartDate(LocalDateTime.of(2026, 6, 1, 0, 0))
                .recruitEndDate(LocalDateTime.of(2026, 6, 27, 23, 59))
                .isDefault(false)
                .build());
        sessionRepository.save(SessionJpaEntity.builder()
                .event(sciConf)
                .title("세션 B: 양자컴퓨팅")
                .description("양자 알고리즘과 오류 보정 기술의 최신 동향")
                .sortOrder(2)
                .startTime(LocalDateTime.of(2026, 6, 28, 14, 0))
                .endTime(LocalDateTime.of(2026, 6, 28, 16, 0))
                .isOnline(true)
                .onlineLink("https://zoom.us/j/1234567890")
                .maxAttendees(200)
                .recruitStartDate(LocalDateTime.of(2026, 6, 1, 0, 0))
                .recruitEndDate(LocalDateTime.of(2026, 6, 27, 23, 59))
                .isDefault(false)
                .build());
        sessionRepository.save(SessionJpaEntity.builder()
                .event(sciConf)
                .title("세션 C: 우주과학")
                .description("차세대 우주탐사 기술과 민간 우주산업의 전망")
                .sortOrder(3)
                .startTime(LocalDateTime.of(2026, 6, 29, 10, 0))
                .endTime(LocalDateTime.of(2026, 6, 29, 12, 0))
                .location("서울 동대문구 회기로 85 국제회의실 B홀")
                .regionSido("서울").regionSigungu("동대문구")
                .maxAttendees(100)
                .recruitStartDate(LocalDateTime.of(2026, 6, 1, 0, 0))
                .recruitEndDate(LocalDateTime.of(2026, 6, 27, 23, 59))
                .isDefault(false)
                .build());

        log.info("세션 생성 완료: 기본 세션 {}개, 추가 세션 5개", events.size());
    }

    /**
     * 티켓 생성 — v6: 이벤트별 기본 티켓 + 다중 세션 이벤트에는 개별 세션 티켓
     */
    private void createTickets(List<EventJpaEntity> events) {
        // 이벤트별 가격 정보 (이전 Event.price를 Ticket으로 이전)
        int[] prices = {150000, 80000, 0, 30000, 120000, 50000, 65000, 40000, 90000, 0};
        int[] originalPrices = {180000, 100000, 0, 35000, 150000, 60000, 75000, 50000, 110000, 0};
        String[] ticketNames = {
                "전체 패키지", "워크숍 참가권", "무료 입장", "요가 클래스 참가권",
                "워크숍 참가권", "서밋 참가권", "마스터클래스 참가권",
                "세미나 참가권", "아카데미 참가권", "무료 입장"
        };

        for (int i = 0; i < events.size(); i++) {
            EventJpaEntity event = events.get(i);

            // 기본 티켓 (전체 세션 포함)
            TicketJpaEntity defaultTicket = ticketRepository.save(TicketJpaEntity.builder()
                    .event(event)
                    .name(ticketNames[i])
                    .description(event.getTitle() + " 입장 티켓")
                    .price(prices[i])
                    .originalPrice(originalPrices[i])
                    .maxQuantity(null) // 무제한 (세션 정원으로 관리)
                    .soldCount(0)
                    .isAllSessions(true)
                    .sortOrder(0)
                    .isActive(true)
                    .build());

            log.debug("기본 티켓 생성: {} (이벤트: {})", defaultTicket.getName(), event.getTitle());
        }

        // 다중 세션 이벤트(AI Bootcamp, Future Science Conference)에 개별 세션 티켓 추가
        // AI Bootcamp (index 0)
        EventJpaEntity bootcamp = events.get(0);
        List<SessionJpaEntity> bootcampSessions = sessionRepository.findByEventIdOrderBySortOrder(bootcamp.getId());
        // 개별 Day 1 티켓
        if (bootcampSessions.size() > 1) {
            TicketJpaEntity day1Ticket = ticketRepository.save(TicketJpaEntity.builder()
                    .event(bootcamp)
                    .name("Day 1: AI 모델 배포 입장권")
                    .description("Day 1 세션만 참가")
                    .price(80000)
                    .originalPrice(100000)
                    .maxQuantity(40)
                    .isAllSessions(false)
                    .sortOrder(1)
                    .isActive(true)
                    .build());
            // Day 1 세션 매핑 (sortOrder=1)
            SessionJpaEntity day1Session = bootcampSessions.stream()
                    .filter(s -> s.getSortOrder() == 1).findFirst().orElse(null);
            if (day1Session != null) {
                ticketSessionRepository.save(TicketSessionJpaEntity.builder()
                        .ticket(day1Ticket).session(day1Session).build());
            }

            TicketJpaEntity day2Ticket = ticketRepository.save(TicketJpaEntity.builder()
                    .event(bootcamp)
                    .name("Day 2: 클라우드 인프라 입장권")
                    .description("Day 2 세션만 참가")
                    .price(80000)
                    .originalPrice(100000)
                    .maxQuantity(40)
                    .isAllSessions(false)
                    .sortOrder(2)
                    .isActive(true)
                    .build());
            SessionJpaEntity day2Session = bootcampSessions.stream()
                    .filter(s -> s.getSortOrder() == 2).findFirst().orElse(null);
            if (day2Session != null) {
                ticketSessionRepository.save(TicketSessionJpaEntity.builder()
                        .ticket(day2Ticket).session(day2Session).build());
            }
        }

        // Future Science Conference (index 9)
        EventJpaEntity sciConf = events.get(9);
        List<SessionJpaEntity> sciSessions = sessionRepository.findByEventIdOrderBySortOrder(sciConf.getId());
        if (sciSessions.size() > 1) {
            for (int s = 1; s < sciSessions.size(); s++) {
                SessionJpaEntity sci = sciSessions.get(s);
                TicketJpaEntity sciTicket = ticketRepository.save(TicketJpaEntity.builder()
                        .event(sciConf)
                        .name(sci.getTitle() + " 입장권")
                        .description(sci.getDescription())
                        .price(0)
                        .originalPrice(0)
                        .isAllSessions(false)
                        .sortOrder(s)
                        .isActive(true)
                        .build());
                ticketSessionRepository.save(TicketSessionJpaEntity.builder()
                        .ticket(sciTicket).session(sci).build());
            }
        }

        log.info("티켓 생성 완료: 전체 {}개", ticketRepository.count());
    }

    private List<OrderJpaEntity> createOrders(List<UserJpaEntity> users, List<EventJpaEntity> events) {
        List<OrderJpaEntity> orders = new java.util.ArrayList<>();
        String[] paymentMethods = {"CARD", "KAKAO_PAY", "NAVER_PAY", "BANK_TRANSFER"};
        // 가격 정보는 세션/티켓으로 이동했으므로 하드코딩 (Phase 3에서 Ticket 기반으로 변경)
        int[] prices = {150000, 80000, 0, 30000, 120000, 50000, 65000, 40000, 90000, 0};

        for (int i = 0; i < events.size(); i++) {
            EventJpaEntity event = events.get(i);
            UserJpaEntity buyer = users.get(i % users.size());
            int price = prices[i];

            OrderStatus status = (price > 0) ? OrderStatus.PAID : OrderStatus.REGISTERED;
            if (i == 5) {
                status = OrderStatus.CANCELLED;
            }

            orders.add(OrderJpaEntity.builder()
                    .user(buyer)
                    .event(event)
                    .status(status)
                    .quantity(1)
                    .amount(price)
                    .paymentMethod(price > 0 ? paymentMethods[i % paymentMethods.length] : null)
                    .displayOrderedAt(LocalDateTime.of(2026, 3, 25, 10, 0).minusDays(i))
                    .build());
        }

        return orderRepository.saveAll(orders);
    }


    private List<CommunityJpaEntity> createCommunities(UserJpaEntity admin) {
        return communityRepository.saveAll(List.of(
                CommunityJpaEntity.builder().name("자유게시판").description("누구나 자유롭게 이야기하는 공간").creator(admin).build(),
                CommunityJpaEntity.builder().name("질문답변").description("서로 돕고 배우는 공간").creator(admin).build()
        ));
    }

    private List<PostJpaEntity> createPosts(List<UserJpaEntity> users, List<CommunityJpaEntity> communities) {
        return postRepository.saveAll(List.of(
                PostJpaEntity.builder()
                        .community(communities.get(0))
                        .author(users.get(0))
                        .title("안녕하세요, 가입했습니다!")
                        .content("반가워요. 잘 부탁드립니다.")
                        .type(PostType.GENERAL)
                        .build(),
                PostJpaEntity.builder()
                        .community(communities.get(0))
                        .author(users.get(1))
                        .title("오늘 날씨 좋네요")
                        .content("산책하기 딱 좋은 날씨입니다.")
                        .type(PostType.GENERAL)
                        .build(),
                PostJpaEntity.builder()
                        .community(communities.get(1))
                        .author(users.get(2))
                        .title("AI 부트캠프 질문있습니다.")
                        .content("비전공자도 따라갈 수 있을까요?")
                        .type(PostType.GENERAL)
                        .build()
        ));
    }

    private List<ReportJpaEntity> createReports(List<UserJpaEntity> users, List<EventJpaEntity> events, List<PostJpaEntity> posts) {
        return reportRepository.saveAll(List.of(
                // 신고 1: user1이 이벤트(AI & Cloud Bootcamp)를 허위 정보로 신고 — 대기중
                ReportJpaEntity.builder()
                        .reporter(users.get(0))
                        .targetType(ReportTargetType.EVENT)
                        .targetId(events.get(0).getId())
                        .reason("허위 정보")
                        .detail("강의 내용과 실제 진행 내용이 전혀 다릅니다.")
                        .status(ReportStatus.PENDING)
                        .build(),
                // 신고 2: user2가 user3을 스팸/광고로 신고 — 대기중
                ReportJpaEntity.builder()
                        .reporter(users.get(1))
                        .targetType(ReportTargetType.USER)
                        .targetId(users.get(2).getId())
                        .reason("스팸/광고")
                        .detail("커뮤니티에서 반복적으로 외부 사이트 링크를 게시하고 있습니다.")
                        .status(ReportStatus.PENDING)
                        .build(),
                // 신고 3: user3이 게시글을 부적절한 언어로 신고 — 대기중
                ReportJpaEntity.builder()
                        .reporter(users.get(2))
                        .targetType(ReportTargetType.POST)
                        .targetId(posts.get(0).getId())
                        .reason("부적절한 언어")
                        .detail("게시글 내용에 욕설이 포함되어 있습니다.")
                        .status(ReportStatus.PENDING)
                        .build(),
                // 신고 4: user3이 이벤트(현대미술 워크숍)를 부적절한 콘텐츠로 신고 — 처리 완료
                ReportJpaEntity.builder()
                        .reporter(users.get(2))
                        .targetType(ReportTargetType.EVENT)
                        .targetId(events.get(4).getId())
                        .reason("부적절한 콘텐츠")
                        .detail("이벤트 설명에 부적절한 이미지가 포함되어 있습니다.")
                        .status(ReportStatus.RESOLVED)
                        .adminAction(AdminAction.WARN)
                        .resolvedAt(LocalDateTime.now().minusDays(2))
                        .build(),
                // 신고 5: user1이 이벤트(Business Growth Summit)를 저작권 침해로 신고 — 반려
                ReportJpaEntity.builder()
                        .reporter(users.get(0))
                        .targetType(ReportTargetType.EVENT)
                        .targetId(events.get(5).getId())
                        .reason("저작권 침해")
                        .detail("이벤트 썸네일 이미지가 타사의 저작물을 무단으로 사용한 것 같습니다.")
                        .status(ReportStatus.REJECTED)
                        .adminAction(AdminAction.DISMISS)
                        .resolvedAt(LocalDateTime.now().minusDays(1))
                        .build()
        ));
    }

    private List<RefundJpaEntity> createRefunds(List<UserJpaEntity> users, List<OrderJpaEntity> orders) {
        return refundRepository.saveAll(List.of(
                RefundJpaEntity.builder()
                        .order(orders.get(5))
                        .user(orders.get(5).getUser())
                        .amount(orders.get(5).getAmount())
                        .status(RefundStatus.PENDING)
                        .reason("일정이 변경되어 참석이 어렵습니다.")
                        .build(),
                RefundJpaEntity.builder()
                        .order(orders.get(3))
                        .user(orders.get(3).getUser())
                        .amount(orders.get(3).getAmount())
                        .status(RefundStatus.APPROVED)
                        .reason("개인 사정으로 참석이 어렵습니다.")
                        .processedAt(LocalDateTime.now().minusDays(3))
                        .build()
        ));
    }

    private void cleanupCartTable() {
        try {
            // 구구조(event_id) 컬럼이 남아있어 insert 에러가 발생하는 경우를 방지하기 위해 컬럼 제거
            jdbcTemplate.execute("ALTER TABLE cart DROP COLUMN IF EXISTS event_id");
            log.info("장바구니 테이블 구조 정리를 완료했습니다 (event_id 컬럼 제거).");
        } catch (Exception e) {
            log.warn("장바구니 테이블 정리 중 오류 발생: {}", e.getMessage());
        }
    }

    private void createInitialCartItems() {
        log.info("관리자 계정(admin@venueon.com)용 장바구니 임시 데이터 생성을 시작합니다.");

        UserJpaEntity admin = userRepository.findByEmail("admin@venueon.com")
                .orElse(null);

        List<TicketJpaEntity> tickets = ticketRepository.findAll().stream()
                .limit(10)
                .toList();

        if (admin == null || tickets.isEmpty()) {
            log.warn("장바구니를 생성할 관리자 계정이나 티켓이 부족합니다.");
            return;
        }

        for (int i = 0; i < 10 && i < tickets.size(); i++) {
            TicketJpaEntity ticket = tickets.get(i);

            cartRepository.save(CartJpaEntity.builder()
                    .user(admin)
                    .ticket(ticket)
                    .quantity((i % 3) + 1)
                    .build());
        }
        log.info("관리자용 장바구니 임시 데이터 생성 완료.");
    }


}
