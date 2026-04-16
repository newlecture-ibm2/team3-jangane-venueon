package com.venueon.community.adapter.out.persistence.repository;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityJpaRepository extends JpaRepository<CommunityJpaEntity, Long> {

    Optional<CommunityJpaEntity> findByEventId(Long eventId);

    Page<CommunityJpaEntity> findByIsPublicTrue(Pageable pageable);

    List<CommunityJpaEntity> findByCreatorId(Long creatorId);
    Page<CommunityJpaEntity> findByIdIn(List<Long> ids, Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM CommunityJpaEntity c " +
        "LEFT JOIN c.event e " +
        "WHERE c.id IN :ids OR e.id IN :eventIds")
    Page<CommunityJpaEntity> findJoinedCommunities(
        @org.springframework.data.repository.query.Param("ids") List<Long> ids, 
        @org.springframework.data.repository.query.Param("eventIds") List<Long> eventIds, 
        Pageable pageable);
}
