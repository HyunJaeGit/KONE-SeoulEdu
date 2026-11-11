package kr.co.kone.faq_api.service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import kr.co.kone.faq_api.api.ApiException;
import kr.co.kone.faq_api.repository.MemberRepository;
import kr.co.kone.faq_api.repository.MemberRepository.MemberRow;

import static kr.co.kone.faq_api.api.ApiModels.CreateMemberRequest;
import static kr.co.kone.faq_api.api.ApiModels.MemberResponse;
import static kr.co.kone.faq_api.api.ApiModels.UpdateMemberRequest;

/** 관리자 전용 상담원 계정 목록·생성·비밀번호 변경·삭제를 처리한다. */
@Service
public class MemberService {

	private static final int MAX_USERNAME_LENGTH = 100;
	private static final int MIN_PASSWORD_LENGTH = 8;
	private static final int MAX_PASSWORD_BYTES = 72;

	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;

	public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
		this.memberRepository = memberRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public List<MemberResponse> list(String query) {
		if (query != null && query.length() > MAX_USERNAME_LENGTH) {
			throw badRequest("검색어는 100자 이내로 입력해야 합니다.");
		}
		return memberRepository.findMembers(query).stream().map(this::toResponse).toList();
	}

	@Transactional
	public MemberResponse create(CreateMemberRequest request) {
		if (request == null || !StringUtils.hasText(request.username())) {
			throw badRequest("username을 입력해야 합니다.");
		}
		String username = request.username().trim();
		if (username.length() > MAX_USERNAME_LENGTH) {
			throw badRequest("username은 100자 이내로 입력해야 합니다.");
		}
		validatePassword(request.password());

		try {
			return toResponse(memberRepository.createCounselor(username,
					passwordEncoder.encode(request.password())));
		} catch (DuplicateKeyException exception) {
			throw new ApiException(HttpStatus.CONFLICT, "USERNAME_ALREADY_EXISTS",
					"이미 사용 중인 username입니다.");
		}
	}

	@Transactional
	public MemberResponse updatePassword(long memberId, UpdateMemberRequest request) {
		if (memberId < 1) {
			throw notFound();
		}
		if (request == null) {
			throw badRequest("변경할 password를 입력해야 합니다.");
		}
		validatePassword(request.password());
		if (memberRepository.findMember(memberId).isEmpty()) {
			throw notFound();
		}
		memberRepository.updatePassword(memberId, passwordEncoder.encode(request.password()));
		return memberRepository.findMember(memberId).map(this::toResponse).orElseThrow(this::notFound);
	}

	@Transactional
	public void delete(long memberId, Authentication currentUser) {
		if (memberId < 1) {
			throw notFound();
		}
		MemberRow member = memberRepository.findMember(memberId).orElseThrow(this::notFound);
		if (currentUser != null && currentUser.getName().equals(member.username())) {
			throw new ApiException(HttpStatus.CONFLICT, "CANNOT_DELETE_CURRENT_USER",
					"현재 로그인한 관리자 계정은 삭제할 수 없습니다.");
		}
		if ("ADMIN".equals(member.role()) && memberRepository.countAdministrators() <= 1) {
			throw new ApiException(HttpStatus.CONFLICT, "CANNOT_DELETE_LAST_ADMIN",
					"마지막 관리자 계정은 삭제할 수 없습니다.");
		}
		if (!memberRepository.deleteMember(memberId)) {
			throw notFound();
		}
	}

	private void validatePassword(String password) {
		if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
			throw badRequest("password는 8자 이상이어야 합니다.");
		}
		if (password.getBytes(StandardCharsets.UTF_8).length > MAX_PASSWORD_BYTES) {
			throw badRequest("password는 UTF-8 기준 72바이트 이내여야 합니다.");
		}
	}

	private MemberResponse toResponse(MemberRow member) {
		return new MemberResponse(member.id(), member.username(), member.role());
	}

	private ApiException badRequest(String message) {
		return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_MEMBER_REQUEST", message);
	}

	private ApiException notFound() {
		return new ApiException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "회원을 찾을 수 없습니다.");
	}
}
