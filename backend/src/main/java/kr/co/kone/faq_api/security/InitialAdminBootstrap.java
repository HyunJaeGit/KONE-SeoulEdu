package kr.co.kone.faq_api.security;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** 명시적으로 켰을 때만 환경변수로 첫 관리자 계정을 생성하는 일회성 초기화 도구. */
@Component
@ConditionalOnProperty(prefix = "app.bootstrap-admin", name = "enabled", havingValue = "true")
public class InitialAdminBootstrap implements ApplicationRunner {

	private static final Logger logger = LoggerFactory.getLogger(InitialAdminBootstrap.class);

	private final JdbcTemplate jdbcTemplate;
	private final PasswordEncoder passwordEncoder;
	private final Environment environment;

	public InitialAdminBootstrap(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder,
			Environment environment) {
		this.jdbcTemplate = jdbcTemplate;
		this.passwordEncoder = passwordEncoder;
		this.environment = environment;
	}

	@Override
	public void run(ApplicationArguments arguments) {
		String username = environment.getProperty("KONE_ADMIN_USERNAME");
		String password = environment.getProperty("KONE_ADMIN_PASSWORD");
		if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
			throw new IllegalStateException("KONE_ADMIN_USERNAME과 KONE_ADMIN_PASSWORD 환경변수가 필요합니다.");
		}

		Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
		if (userCount == null || userCount != 0) {
			throw new IllegalStateException("첫 관리자 생성은 users 테이블이 비어 있을 때만 가능합니다.");
		}

		jdbcTemplate.update(
				"INSERT INTO users (username, `password`, `role`) VALUES (?, ?, 'ADMIN')",
				username.trim(), passwordEncoder.encode(password));
		logger.info("Initial ADMIN account created for username {}", username.trim());
	}
}
