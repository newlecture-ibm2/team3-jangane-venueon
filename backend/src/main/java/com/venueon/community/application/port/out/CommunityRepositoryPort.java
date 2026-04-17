package com.venueon.community.application.port.out;

import com.venueon.community.domain.model.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface CommunityRepositoryPort {
    Community save(Community community);
    Page<Community> findPublicCommunities(Pageable pageable);
    Page<Community> findByIdIn(java.util.List<Long> ids, Pageable pageable);
    Page<Community> findJoinedCommunities(java.util.List<Long> memberCommunityIds, java.util.List<Long> orderEventIds, java.util.List<Long> badgeEventIds, Pageable pageable);
    Optional<Community> findById(Long id);
    Optional<Community> findByEventId(Long eventId);
}
