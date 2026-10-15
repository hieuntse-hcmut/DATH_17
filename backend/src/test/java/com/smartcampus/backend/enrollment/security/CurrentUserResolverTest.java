package com.smartcampus.backend.enrollment.security;

import com.smartcampus.backend.enrollment.exception.EnrollmentException;
import com.smartcampus.backend.enrollment.repository.EnrollmentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CurrentUserResolverTest {

    private static final Long STUDENT_A_ID = 9001L;
    private static final List<GrantedAuthority> STUDENT_ROLE = AuthorityUtils.createAuthorityList("ROLE_STUDENT");

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @InjectMocks
    private CurrentUserResolver currentUserResolver;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void noAuthentication_isRejectedWith401() {
        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> currentUserResolver.getCurrentUserId());

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        verify(enrollmentRepository, never()).findUserIdByLogin(any());
    }

    @Test
    void anonymousUser_isRejectedWith401() {
        loginAs(new AnonymousAuthenticationToken(
                "anonymous-key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS")));

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> currentUserResolver.getCurrentUserId());

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        verify(enrollmentRepository, never()).findUserIdByLogin(any());
    }

    @Test
    void notAuthenticatedToken_isRejectedWith401() {
        loginAs(UsernamePasswordAuthenticationToken.unauthenticated("student_a", "123456"));

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> currentUserResolver.getCurrentUserId());

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    @Test
    void principalIsUserId_returnsItWithoutQueryingTheDatabase() {
        loginAs(UsernamePasswordAuthenticationToken.authenticated(STUDENT_A_ID, null, STUDENT_ROLE));

        assertEquals(STUDENT_A_ID, currentUserResolver.getCurrentUserId());
        verify(enrollmentRepository, never()).findUserIdByLogin(any());
    }

    @Test
    void principalIsUserDetails_looksUpTheIdByUsername() {
        UserDetails user = User.withUsername("student_a").password("ignored").roles("STUDENT").build();
        loginAs(UsernamePasswordAuthenticationToken.authenticated(user, null, user.getAuthorities()));
        when(enrollmentRepository.findUserIdByLogin("student_a")).thenReturn(Optional.of(STUDENT_A_ID));

        assertEquals(STUDENT_A_ID, currentUserResolver.getCurrentUserId());
    }

    @Test
    void principalIsEmail_looksUpTheIdByEmail() {
        loginAs(UsernamePasswordAuthenticationToken.authenticated("student.a@test.local", null, STUDENT_ROLE));
        when(enrollmentRepository.findUserIdByLogin("student.a@test.local")).thenReturn(Optional.of(STUDENT_A_ID));

        assertEquals(STUDENT_A_ID, currentUserResolver.getCurrentUserId());
    }

    @Test
    void loggedInUserMissingFromDatabase_isRejectedWith401() {
        loginAs(UsernamePasswordAuthenticationToken.authenticated("deleted_user", null, STUDENT_ROLE));
        when(enrollmentRepository.findUserIdByLogin("deleted_user")).thenReturn(Optional.empty());

        EnrollmentException ex = assertThrows(EnrollmentException.class,
                () -> currentUserResolver.getCurrentUserId());

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    private static void loginAs(Authentication authentication) {
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
