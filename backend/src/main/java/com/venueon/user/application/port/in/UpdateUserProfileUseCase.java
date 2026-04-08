package com.venueon.user.application.port.in;

import com.venueon.user.domain.model.User;

public interface UpdateUserProfileUseCase {
    User updateProfile(String email, String nickname, String profileImg);
}
