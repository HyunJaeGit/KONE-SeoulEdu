package kr.co.kone.faq_api.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import static kr.co.kone.faq_api.api.ApiModels.CurrentUserResponse;
import static kr.co.kone.faq_api.api.ApiModels.LoginRequest;
import kr.co.kone.faq_api.api.ApiException;

/** 사용자 테이블을 이용한 로그인, 세션 발급, 현재 사용자 조회를 처리한다. */
@Service
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final SecurityContextRepository securityContextRepository;
	private final JdbcTemplate jdbcTemplate;

	public AuthService(AuthenticationManager authenticationManager,
			SecurityContextRepository securityContextRepository, JdbcTemplate jdbcTemplate) {
		this.authenticationManager = authenticationManager;
		this.securityContextRepository = securityContextRepository;
		this.jdbcTemplate = jdbcTemplate;
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
		Long id = jdbcTemplate.queryForObject(
				"SELECT id FROM users WHERE username = ?", Long.class, authentication.getName());
		String role = authentication.getAuthorities().stream()
				.map(authority -> authority.getAuthority())
				.filter(authority -> authority.startsWith("ROLE_"))
				.map(authority -> authority.substring("ROLE_".length()))
				.findFirst()
				.orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "ROLE_NOT_ASSIGNED",
						"사용자 역할이 지정되지 않았습니다."));
		return new CurrentUserResponse(id, authentication.getName(), role);
	}

	/** 서버 세션과 인증 컨텍스트를 종료한다. */
	public void logout(Authentication authentication, HttpServletRequest request,
			HttpServletResponse response) {
		new SecurityContextLogoutHandler().logout(request, response, authentication);
	}
}
