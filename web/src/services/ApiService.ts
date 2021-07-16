import { Injector } from './Injector';
import { initializeStore, Store } from '../store';

export interface Page<T> {
  totalElements: number;
  elements: T[];
}

const MAX_LIMIT = 100;

export interface ApiError {
  status: number;
  error: string;
  description?: string;
  details?: ApiErrorDetails[];
}

export interface ApiErrorDetails {
  field: string;
  constraint: string;
  param?: string;
  codes: string[];
}

export class ApiService {
  public static readonly NAME = 'ApiService';

  private store?: Store;

  public constructor(private readonly injector: Injector) {}

  private static async handleResponse<T>(resPromise: Promise<Response>): Promise<T> {
    const response = await resPromise;
    const responseBody = response.status === 204 ? undefined : await response.json();

    if (response.status >= 400) {
      throw responseBody;
    }

    return responseBody;
  }

  public jsonGet<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.jsonRequest('GET', path, undefined, params);
  }

  public jsonPost<B, T>(path: string, body: B): Promise<T> {
    return this.jsonRequest('POST', path, body);
  }

  public jsonPatch<B, T>(path: string, body: B): Promise<T> {
    return this.jsonRequest('PATCH', path, body);
  }

  public delete(path: string): Promise<void> {
    return this.jsonRequest('DELETE', path);
  }

  public async getAllPages<T>(path: string): Promise<T[]> {
    const firstPage = await this.jsonGet<Page<T>>(path, {
      limit: MAX_LIMIT.toString(),
    });
    const totalElements = firstPage.totalElements;
    const totalPages = Math.ceil(totalElements / MAX_LIMIT);

    const result = firstPage.elements;
    for (let page = 2; page <= totalPages; page++) {
      const nextPage = await this.jsonGet<Page<T>>(path, {
        page: page.toString(),
        limit: MAX_LIMIT.toString(),
      });
      result.push(...nextPage.elements);
    }

    return result;
  }

  public formPost<T>(path: string, body: Record<string, string | Blob>): Promise<T> {
    const formBody = new FormData();
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        formBody.set(key, body[key]);
      }
    }

    return ApiService.handleResponse(
      fetch(`/api${path}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formBody,
      })
    );
  }

  private jsonRequest<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    const headers = this.getHeaders();
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const paramString = params ? `?${new URLSearchParams(params)}` : '';

    return ApiService.handleResponse(
      fetch(`/api${path}${paramString}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
    );
  }

  private getToken(): string {
    const token = this.getStore().getState().user.token;
    if (!token) {
      throw new Error('User is not logged in.');
    }
    return token;
  }

  private getStore(): Store {
    if (!this.store) {
      this.store = this.injector.resolve(initializeStore);
    }
    return this.store;
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.getToken()}`,
      Accept: 'application/json',
    };
  }
}
