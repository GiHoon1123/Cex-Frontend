export interface PasswordPolicyResult {
  valid: boolean;
  message: string | null;
}

/**
 * 플랫폼과 같은 단위로 고객 비밀번호를 검사한다.
 * `Array.from`은 자바스크립트의 UTF-16 길이가 아니라 유니코드 코드 포인트 수를 세므로
 * 이모지처럼 두 코드 유닛을 쓰는 문자도 플랫폼의 Java 검사와 같은 한 글자로 처리한다.
 */
export function validateCustomerPassword(password: string): PasswordPolicyResult {
  if (password.trim().length === 0) {
    return { valid: false, message: '비밀번호를 입력해 주세요.' };
  }
  if (Array.from(password).length < 15) {
    return { valid: false, message: '비밀번호는 15자 이상이어야 합니다.' };
  }
  if (password.length > 256) {
    return { valid: false, message: '비밀번호는 256 코드 단위를 넘을 수 없습니다.' };
  }

  for (let index = 0; index < password.length; index += 1) {
    const unit = password.charCodeAt(index);
    if (unit <= 0x1f || (unit >= 0x7f && unit <= 0x9f)) {
      return { valid: false, message: '비밀번호에 제어 문자를 사용할 수 없습니다.' };
    }
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = password.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        return { valid: false, message: '비밀번호에 올바르지 않은 유니코드 문자가 있습니다.' };
      }
      index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      return { valid: false, message: '비밀번호에 올바르지 않은 유니코드 문자가 있습니다.' };
    }
  }

  return { valid: true, message: null };
}
