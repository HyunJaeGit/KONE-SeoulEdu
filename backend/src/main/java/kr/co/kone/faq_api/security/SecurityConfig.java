package kr.co.kone.faq_api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import kr.co.kone.faq_api.service.AuthService.AccountPrincipal;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.json.JsonMapper;

import static kr.co.kone.faq_api.api.ApiModels.ApiError;
import static org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED;

/** DB 계정, 서버 세션, CSRF와 API별 인증·역할 접근을 설정한다. */
@Configuration
public class SecurityConfig {

	private static final PathPatternRequestMatcher API = PathPatternRequestMatcher.pathPattern("/api/**");
	private static final PathPatternRequestMatcher LOGIN = PathPatternRequestMatcher.pathPattern("/api/auth/login");
	private static final PathPatternRequestMatcher CSRF = PathPatternRequestMatcher.pathPattern("/api/auth/csrf");

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http,
			SecurityContextRepository securityContextRepository,
			CsrfTokenRepository csrfTokenRepository,
			UserDetailsService userDetailsService,
			JsonMapper jsonMapper) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.securityContext(context -> context.securityContextRepository(securityContextRepository))
				.sessionManagement(session -> session.sessionCreationPolicy(IF_REQUIRED))
				.addFilterBefore(accountSessionFilter(userDetailsService, jsonMapper), CsrfFilter.class)
				.csrf(csrf -> csrf
						.csrfTokenRepository(csrfTokenRepository)
						.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(CSRF, LOGIN).permitAll()
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.requestMatchers(API).authenticated()
						.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/openapi.yaml").permitAll()
						.anyRequest().permitAll())
				.exceptionHandling(errors -> errors
						.authenticationEntryPoint((request, response, exception) -> writeError(
								jsonMapper, response, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "로그인이 필요합니다."))
						.accessDeniedHandler((request, response, exception) -> writeError(
								jsonMapper, response, HttpStatus.FORBIDDEN, "FORBIDDEN", "요청을 수행할 권한이 없습니다.")))
				.formLogin(form -> form.disable())
				.httpBasic(basic -> basic.disable())
				.logout(logout -> logout.disable());

		return http.build();
	}

	/** 보호된 API 요청마다 계정 상태를 확인하고 변경된 계정의 세션을 종료한다. */
	private OncePerRequestFilter accountSessionFilter(UserDetailsService userDetailsService, JsonMapper jsonMapper) {
		SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
		return new OncePerRequestFilter() {
			@Override
			protected boolean shouldNotFilter(HttpServletRequest request) {
				return !API.matches(request) || CSRF.matches(request) || LOGIN.matches(request);
			}

			@Override
			protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
					FilterChain chain) throws ServletException, IOException {
				Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
				if (authentication != null && authentication.isAuthenticated()
						&& !hasCurrentAccount(authentication, userDetailsService)) {
					try {
						logoutHandler.logout(request, response, authentication);
					} catch (IllegalStateException exception) {
						// 다른 요청에서 같은 세션을 먼저 종료했어도 현재 요청은 거부한다.
						SecurityContextHolder.clearContext();
					}
					writeError(jsonMapper, response, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "다시 로그인해 주세요.");
					return;
				}
				chain.doFilter(request, response);
			}
		};
	}

	private boolean hasCurrentAccount(Authentication authentication, UserDetailsService userDetailsService) {
		if (!(authentication.getPrincipal() instanceof AccountPrincipal principal)) {
			return false;
		}
		try {
			return principal.matchesAccount(userDetailsService.loadUserByUsername(principal.getUsername()));
		} catch (UsernameNotFoundException exception) {
			return false;
		}
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of(
				"http://localhost:5173", "http://127.0.0.1:5173",
				"http://localhost:5500", "http://127.0.0.1:5500"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("Accept", "Content-Type", "X-CSRF-TOKEN"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", configuration);
		return source;
	}

	@Bean
	UserDetailsService userDetailsService(JdbcTemplate jdbcTemplate) {
		return username -> {
			try {
				return jdbcTemplate.queryForObject(
						"""
						SELECT id, username, `password`, `role`, SHA2(`password`, 256) AS password_fingerprint
						FROM users WHERE username = ?
						""",
						(resultSet, rowNumber) -> new AccountPrincipal(resultSet.getLong("id"),
								resultSet.getString("username"), resultSet.getString("password"),
								resultSet.getString("role"), resultSet.getString("password_fingerprint")),
						username);
			} catch (org.springframework.dao.EmptyResultDataAccessException exception) {
				throw new UsernameNotFoundException("계정을 찾을 수 없습니다.");
			}
		};
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	AuthenticationManager authenticationManager(UserDetailsService userDetailsService,
			PasswordEncoder passwordEncoder) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
		provider.setPasswordEncoder(passwordEncoder);
		return new ProviderManager(provider);
	}

	@Bean
	SecurityContextRepository securityContextRepository() {
		HttpSessionSecurityContextRepository repository = new HttpSessionSecurityContextRepository();
		repository.setDisableUrlRewriting(true);
		return repository;
	}

	@Bean
	CsrfTokenRepository csrfTokenRepository() {
		return new HttpSessionCsrfTokenRepository();
	}

	private static void writeError(JsonMapper jsonMapper, HttpServletResponse response,
			HttpStatus status, String code, String message) throws IOException {
		response.setStatus(status.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		jsonMapper.writeValue(response.getOutputStream(), new ApiError(code, message));
	}
}
