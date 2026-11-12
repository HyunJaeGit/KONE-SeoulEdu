package kr.co.kone.faq_api.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.kone.faq_api.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import static kr.co.kone.faq_api.api.ApiModels.CurrentUserResponse;
import static kr.co.kone.faq_api.api.ApiModels.LoginRequest;

/** 사용자 테이블을 이용한 로그인, 세션 발급, 현재 사용자 조회를 처리한다. */
@Service
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final SecurityContextRepository securityContextRepository;

	public AuthService(AuthenticationManager authenticationManager,
			SecurityContextRepository securityContextRepository) {
		this.authenticationManager = authenticationManager;
		this.securityContextRepository = securityContextRepository;
	}

	/** 자격 증명을 확인하고 세션에 인증 정보를 저장한다. */
	public CurrentUserResponse login(LoginRequest request, HttpServletRequest httpRequest,
			HttpServletResponse httpResponse) {
		if (request == null || !StringUtils.hasText(request.username())
				|| !StringUtils.hasText(request.password())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_LOGIN_REQUEST",
					"username과 password를 입력해야 합니다.");
		}

		Authentication authentication;
		try {
			authentication = authenticationManager.authenticate(
					UsernamePasswordAuthenticationToken.unauthenticated(request.username(), request.password()));
		} catch (AuthenticationException exception) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
					"로그인 정보가 올바르지 않습니다.");
		}

		// 세션 ID를 변경해 로그인 전 세션 고정 공격을 막는다.
		httpRequest.getSession(true);
		httpRequest.changeSessionId();
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(authentication);
		SecurityContextHolder.setContext(context);
		securityContextRepository.saveContext(context, httpRequest, httpResponse);

		return getCurrentUser(authentication);
	}

	/** 현재 인증된 사용자의 공개 정보만 반환한다. */
	public CurrentUserResponse getCurrentUser(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof AccountPrincipal account)) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "로그인이 필요합니다.");
		}
		return new CurrentUserResponse(account.id, account.getUsername(), account.role);
	}

	/** 서버 세션과 인증 컨텍스트를 종료한다. */
	public void logout(Authentication authentication, HttpServletRequest request,
			HttpServletResponse response) {
		new SecurityContextLogoutHandler().logout(request, response, authentication);
	}

	/** 인증 때의 계정 상태를 보관한다. BCrypt 해시는 인증 성공 시 Spring Security가 지운다. */
	public static final class AccountPrincipal extends User {
		private static final long serialVersionUID = 1L;

		private final long id;
		private final String role;
		private final String passwordFingerprint;

		public AccountPrincipal(long id, String username, String passwordHash, String role,
				String passwordFingerprint) {
			super(username, passwordHash, AuthorityUtils.createAuthorityList("ROLE_" + role));
			this.id = id;
			this.role = role;
			this.passwordFingerprint = passwordFingerprint;
		}

		public boolean matchesAccount(UserDetails current) {
			return current instanceof AccountPrincipal account && id == account.id
					&& role.equals(account.role) && passwordFingerprint.equals(account.passwordFingerprint);
		}
	}
}
