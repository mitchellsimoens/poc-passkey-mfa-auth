const BASE_URL = 'http://localhost:3000'; // Adjust this to your backend URL

export class BackendError {
  constructor(message, status) {
    this.message = message;
    this.status = status;
  }
}

export class BackendService {
  async get(endpoint, params) {
    return this.#doFetch('GET', endpoint, params);
  }

  async post(endpoint, data) {
    return this.#doFetch('POST', endpoint, data);
  }

  async #doFetch(method, endpoint, body) {
    try {
      const url = new URL(endpoint, BASE_URL);
      const headers = {};
      const options = {
        headers,
        method,
        credentials: 'include', // Include cookies if needed
      };

      if (body) {
        headers['Content-Type'] = 'application/json';

        switch (method) {
          case 'POST':
            options.body = JSON.stringify(body);

            break;

          case 'GET':
            for (const [key, value] of Object.entries(body)) {
              url.searchParams.set(key, value);
            }

            break;
        }
      }

      const response = await fetch(url, options);
      const ret = await response.json();

      if (!response.ok) {
        // TODO: does ret have an error message?
        throw new BackendError('HTTP error', response.status);
      }

      return ret;
    } catch (error) {
      console.error(`${method} request failed:`, error);

      throw error;
    }
  }
}

export default new BackendService();
