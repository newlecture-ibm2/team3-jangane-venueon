package com.venueon.admin.community.application.port.out;

import com.venueon.community.adapter.out.persistence.entity.CommunityJpaEntity;
import java.util.List;

/**
 * 커뮤니티 데이터 영속성 처리를 위한 Port
 */
public interface AdminCommunityRepositoryPort {
    List<CommunityJpaEntity> findAllCommunities();
}
