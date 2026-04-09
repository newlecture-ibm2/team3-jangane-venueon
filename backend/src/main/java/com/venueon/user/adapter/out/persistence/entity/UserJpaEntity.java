package com.venueon.user.adapter.out.persistence.entity;

import com.venueon.user.domain.model.AuthProvider;
import com.venueon.user.domain.model.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "profile_img")
    private String profileImg;

    private String phone;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_badge_visible", nullable = false)
    @Builder.Default
    private boolean isBadgeVisible = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_categories",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private java.util.List<com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity> categories = new java.util.ArrayList<>();
    
    public void updateProfile(String nickname, String profileImg) {
        this.nickname = nickname;
        this.profileImg = profileImg;
    }

    public void updateBadgeVisibility(boolean isBadgeVisible) {
        this.isBadgeVisible = isBadgeVisible;
    }

    public void updateCategories(java.util.List<com.venueon.category.adapter.out.persistence.entity.CategoryJpaEntity> newCategories) {
        this.categories.clear();
        if (newCategories != null) {
            this.categories.addAll(newCategories);
        }
    }

    public void softDelete() {
        this.isActive = false;
        // Optionally clear personal info or change email to prevent re-join blocks if required
        // this.email = "deleted_" + this.id + "_" + this.email;
    }
}
