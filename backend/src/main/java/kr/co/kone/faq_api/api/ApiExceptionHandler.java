package kr.co.kone.faq_api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import static kr.co.kone.faq_api.api.ApiModels.ApiError;

/** 컨트롤러 예외를 OpenAPI 공통 오류 형식으로 변환한다. */
@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ApiError> handleApiException(ApiException exception) {
		return ResponseEntity.status(exception.getStatus())
				.body(new ApiError(exception.getCode(), exception.getMessage()));
	}

	@ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
	public ResponseEntity<ApiError> handleInvalidRequest(Exception exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiError("INVALID_REQUEST", "요청 형식이나 파라미터가 올바르지 않습니다."));
	}
}
