package kr.co.kone.faq_api.repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

/** 관리자 회원 API에서 users 테이블을 조회하고 변경한다. */
@Repository
public class MemberRepository {

	private final JdbcTemplate jdbcTemplate;

	public MemberRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public List<MemberRow> findMembers(String query) {
		String sql = "SELECT id, username, `role` FROM users";
		if (StringUtils.hasText(query)) {
			return jdbcTemplate.query(sql + " WHERE LOCATE(LOWER(?), LOWER(username)) > 0 ORDER BY id",
					(resultSet, rowNumber) -> new MemberRow(resultSet.getLong("id"),
							resultSet.getString("username"), resultSet.getString("role")),
					query.trim());
		}
		return jdbcTemplate.query(sql + " ORDER BY id",
				(resultSet, rowNumber) -> new MemberRow(resultSet.getLong("id"),
						resultSet.getString("username"), resultSet.getString("role")));
	}

	public Optional<MemberRow> findMember(long memberId) {
		List<MemberRow> rows = jdbcTemplate.query(
				"SELECT id, username, `role` FROM users WHERE id = ?",
				(resultSet, rowNumber) -> new MemberRow(resultSet.getLong("id"),
						resultSet.getString("username"), resultSet.getString("role")),
				memberId);
		return rows.stream().findFirst();
	}

	public MemberRow createCounselor(String username, String passwordHash) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		jdbcTemplate.update(connection -> {
			PreparedStatement statement = connection.prepareStatement(
					"INSERT INTO users (username, `password`, `role`) VALUES (?, ?, 'COUNSELOR')",
					PreparedStatement.RETURN_GENERATED_KEYS);
			statement.setString(1, username);
			statement.setString(2, passwordHash);
			return statement;
		}, keyHolder);

		Number key = keyHolder.getKey();
		if (key == null) {
			throw new IllegalStateException("회원 생성 후 생성된 ID를 가져오지 못했습니다.");
		}
		return findMember(key.longValue()).orElseThrow(
				() -> new IllegalStateException("생성된 회원을 다시 조회하지 못했습니다."));
	}

	public boolean updatePassword(long memberId, String passwordHash) {
		return jdbcTemplate.update("UPDATE users SET `password` = ? WHERE id = ?", passwordHash, memberId) == 1;
	}

	public boolean deleteMember(long memberId) {
		return jdbcTemplate.update("DELETE FROM users WHERE id = ?", memberId) == 1;
	}

	public int countAdministrators() {
		Integer count = jdbcTemplate.queryForObject(
				"SELECT COUNT(*) FROM users WHERE `role` = 'ADMIN'", Integer.class);
		return count == null ? 0 : count;
	}

	public record MemberRow(long id, String username, String role) {
	}
}
