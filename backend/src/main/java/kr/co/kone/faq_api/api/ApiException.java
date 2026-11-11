package kr.co.kone.faq_api.api;

import org.springframework.http.HttpStatus;

/** API에서 상태 코드와 오류 응답을 함께 전달하는 예외. */
public class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final String code;

	public ApiException(HttpStatus status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public HttpStatus getStatus() {
		return status;
	}

	public String getCode() {
		return code;
	}
}
