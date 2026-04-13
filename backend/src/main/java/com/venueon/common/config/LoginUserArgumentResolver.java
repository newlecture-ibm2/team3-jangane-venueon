package com.venueon.common.config;

import com.venueon.common.annotation.LoginUser;
import com.venueon.user.adapter.in.security.UserPrincipal;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * @LoginUser 어노테이션이 붙은 파라미터에 현재 인증된 UserPrincipal 객체를 주입함
 */
@Component
public class LoginUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        boolean hasAnnotation = parameter.hasParameterAnnotation(LoginUser.class);
        boolean isUserType = UserPrincipal.class.isAssignableFrom(parameter.getParameterType());
        return hasAnnotation && isUserType;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        
        if (authentication.getPrincipal() instanceof UserPrincipal) {
            return authentication.getPrincipal();
        }
        
        return null;
    }
}
