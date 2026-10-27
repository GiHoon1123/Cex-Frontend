export interface PublicKeyCredentialRequestOptionsJSON extends Omit<PublicKeyCredentialRequestOptions,'challenge'|'allowCredentials'> {challenge:string;allowCredentials?:Array<Omit<PublicKeyCredentialDescriptor,'id'>&{id:string}>}
export interface PublicKeyCredentialCreationOptionsJSON extends Omit<PublicKeyCredentialCreationOptions,'challenge'|'user'|'excludeCredentials'> {challenge:string;user:Omit<PublicKeyCredentialUserEntity,'id'>&{id:string};excludeCredentials?:Array<Omit<PublicKeyCredentialDescriptor,'id'>&{id:string}>}

/** 서버의 base64url 값을 WebAuthn이 요구하는 바이트 배열로 바꾼다. */
function decode(value:string){return Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(value.length/4)*4,'=')),character=>character.charCodeAt(0));}

/** 서버가 보낸 인증 옵션의 챌린지와 자격 증명 식별자를 브라우저 형식으로 바꾼다. */
export function decodeRequestOptions(input:PublicKeyCredentialRequestOptionsJSON):PublicKeyCredentialRequestOptions {
  return {...input,challenge:decode(input.challenge),allowCredentials:input.allowCredentials?.map(item=>({...item,id:decode(item.id)}))};
}

/** 서버가 보낸 등록 옵션에서 챌린지, 사용자 식별자, 제외할 키 식별자를 모두 변환한다. */
export function decodeCreationOptions(input:PublicKeyCredentialCreationOptionsJSON):PublicKeyCredentialCreationOptions {
  return {...input,challenge:decode(input.challenge),user:{...input.user,id:decode(input.user.id)},excludeCredentials:input.excludeCredentials?.map(item=>({...item,id:decode(item.id)}))};
}

/** 브라우저가 검증한 자격 증명을 서버가 검증할 수 있는 표준 JSON 표현으로 바꾼다. */
export function credentialJson(credential:Credential):unknown {
  const serializable=credential as Credential&{toJSON?:()=>unknown};
  if(typeof serializable.toJSON!=='function')throw new Error('이 브라우저는 보안키 응답 직렬화를 지원하지 않습니다');
  return serializable.toJSON();
}
