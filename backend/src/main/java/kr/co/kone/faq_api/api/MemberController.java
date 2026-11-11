package kr.co.kone.faq_api.api;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import kr.co.kone.faq_api.service.MemberService;

import static kr.co.kone.faq_api.api.ApiModels.CreateMemberRequest;
import static kr.co.kone.faq_api.api.ApiModels.MemberResponse;
import static kr.co.kone.faq_api.api.ApiModels.UpdateMemberRequest;

/** 관리자 전용 상담원 계정 관리 API. */
@RestController
@RequestMapping("/api/admin/members")
public class MemberController {

	private final MemberService memberService;

	public MemberController(MemberService memberService) {
		this.memberService = memberService;
	}

	@GetMapping
	public List<MemberResponse> list(@RequestParam(required = false) String q) {
		return memberService.list(q);
	}

	@PostMapping
	public ResponseEntity<MemberResponse> create(@RequestBody(required = false) CreateMemberRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(memberService.create(request));
	}

	@PutMapping("/{memberId}")
	public MemberResponse updatePassword(@PathVariable long memberId,
			@RequestBody(required = false) UpdateMemberRequest request) {
		return memberService.updatePassword(memberId, request);
	}

	@DeleteMapping("/{memberId}")
	public ResponseEntity<Void> delete(@PathVariable long memberId, Authentication authentication) {
		memberService.delete(memberId, authentication);
		return ResponseEntity.noContent().build();
	}
}
