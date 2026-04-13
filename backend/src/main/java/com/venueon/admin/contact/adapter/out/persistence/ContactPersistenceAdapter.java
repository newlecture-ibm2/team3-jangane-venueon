package com.venueon.admin.contact.adapter.out.persistence;

import com.venueon.admin.contact.adapter.out.persistence.entity.ContactJpaEntity;
import com.venueon.admin.contact.adapter.out.persistence.repository.ContactJpaRepository;
import com.venueon.admin.contact.application.port.out.ContactRepositoryPort;
import com.venueon.admin.contact.domain.model.Contact;
import com.venueon.admin.contact.domain.model.ContactCategory;
import com.venueon.admin.contact.domain.model.ContactStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 어드민 요청 Persistence Adapter
 * - JPA Repository를 감싸서 Port(Out) 인터페이스를 구현
 */
@Component
@RequiredArgsConstructor
public class ContactPersistenceAdapter implements ContactRepositoryPort {

    private final ContactJpaRepository jpaRepository;
    private final ContactMapper mapper;

    @Override
    public Contact save(Contact contact) {
        ContactJpaEntity entity = mapper.toEntity(contact);
        ContactJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Contact> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Page<Contact> findAllWithFilters(ContactCategory category, ContactStatus status, Pageable pageable) {
        return jpaRepository.findAllWithFilters(category, status, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Contact> findByRequesterIdWithFilters(Long requesterId, ContactCategory category, ContactStatus status, Pageable pageable) {
        return jpaRepository.findByRequesterIdWithFilters(requesterId, category, status, pageable)
                .map(mapper::toDomain);
    }
}
