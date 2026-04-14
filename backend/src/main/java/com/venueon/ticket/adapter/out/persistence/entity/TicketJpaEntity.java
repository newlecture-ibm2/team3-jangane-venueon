package com.venueon.ticket.adapter.out.persistence.entity;

import com.venueon.event.adapter.out.persistence.entity.EventJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Ticket JPA Entity — tickets 테이블
 * 호스트가 생성하는 판매 단위
 */
@Entity
@Table(name = "tickets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TicketJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private EventJpaEntity event;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private int price = 0;

    @Column(nullable = false)
    @Builder.Default
    private int originalPrice = 0;

    private Integer maxQuantity; // nullable = 무제한

    @Column(nullable = false)
    @Builder.Default
    private int soldCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean isAllSessions = false;

    @Column(nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    private LocalDateTime salesStart;
    private LocalDateTime salesEnd;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketSessionJpaEntity> ticketSessions = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void update(String name, String description, int price, int originalPrice, Integer maxQuantity, int soldCount, boolean isAllSessions, int sortOrder, boolean isActive, LocalDateTime salesStart, LocalDateTime salesEnd) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice;
        this.maxQuantity = maxQuantity;
        this.soldCount = soldCount;
        this.isAllSessions = isAllSessions;
        this.sortOrder = sortOrder;
        this.isActive = isActive;
        this.salesStart = salesStart;
        this.salesEnd = salesEnd;
    }
}
