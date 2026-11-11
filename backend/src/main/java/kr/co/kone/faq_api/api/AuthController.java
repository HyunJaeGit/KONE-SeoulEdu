package kr.co.kone.faq_api.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import kr.co.kone.faq_api.service.AuthService;

import static kr.co.kone.faq_api.api.ApiModels.CurrentUserResponse;
import static kr.co.kone.faq_api.api.ApiModels.CsrfResponse;
import static kr.co.kone.faq_api.api.ApiModels.LoginRequest;

/** 로그인·로그아웃·현재 사용자·CSRF 토큰 API. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@GetMapping("/csrf")
	public CsrfResponse csrf(CsrfToken csrfToken) {
		return new CsrfResponse(csrfToken.getHeaderName(), csrfToken.getToken());
	}

	@PostMapping("/login")
	public CurrentUserResponse login(@RequestBody(required = false) LoginRequest loginRequest,
			HttpServletRequest request, HttpServletResponse response) {
		return authService.login(loginRequest, request, response);
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(Authentication authentication,
			HttpServletRequest request, HttpServletResponse response) {
		authService.logout(authentication, request, response);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/me")
	public CurrentUserResponse currentUser(Authentication authentication) {
		return authService.getCurrentUser(authentication);
	}
}
