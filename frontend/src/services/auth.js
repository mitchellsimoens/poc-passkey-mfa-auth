import { BackendService } from './backend';

export class AuthService {
  #backendService = new BackendService();

  getLoginOptions(username) {
    return this.#backendService.post('/login', { username });
  }

  doMfaLogin(username, password, otp) {
    return this.#backendService.post('/login/verify', { otp, password, username });
  }

  doPasskeyLogin(username, passkey) {
    return this.#backendService.post('/login/verify', { passkey, username });
  }

  doPasswordLogin(username, password) {
    return this.#backendService.post('/login/verify', { password, username });
  }
}

export default new AuthService();
