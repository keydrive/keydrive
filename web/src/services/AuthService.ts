export interface TokenResponse {
  accessToken: string;
  tokenType: string;
}

export class AuthService {
  public async login(
    username: string,
    password: string
  ): Promise<TokenResponse> {
    const response = await fetch('/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: 'web',
        grant_type: 'password',
        username,
        password,
      }),
    });

    const body = await response.json();
    if (response.status !== 200) {
      throw body;
    }

    return {
      accessToken: body.access_token,
      tokenType: body.token_type,
    };
  }
}
