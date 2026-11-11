package kr.co.kone.faq_api.security;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tools.jackson.databind.json.JsonMapper;

import static kr.co.kone.faq_api.api.ApiModels.ApiError;
import static org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED;

/** DB 계정, 서버 세션, CSRF와 API별 인증·역할 접근을 설정한다. */
@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http,
			SecurityContextRepository securityContextRepository,
			CsrfTokenRepository csrfTokenRepository,
			JsonMapper jsonMapper) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.securityContext(context -> context.securityContextRepository(securityContextRepository))
				.sessionManagement(session -> session.sessionCreationPolicy(IF_REQUIRED))
				.csrf(csrf -> csrf
						.csrfTokenRepository(csrfTokenRepository)
						.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers("/api/auth/csrf", "/api/auth/login").permitAll()
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/**").authenticated()
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
						"SELECT username, `password`, `role` FROM users WHERE username = ?",
						(resultSet, rowNumber) -> User.withUsername(resultSet.getString("username"))
								.password(resultSet.getString("password"))
								.roles(resultSet.getString("role"))
								.build(),
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
