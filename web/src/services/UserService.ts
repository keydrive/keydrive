import { ApiService } from './ApiService';
import { Injector } from './Injector';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface CreateUser {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export class UserService {
  public static readonly NAME = 'UserService';

  private readonly api: ApiService;

  public constructor(injector: Injector) {
    this.api = injector.resolve(ApiService);
  }

  public listUsers(): Promise<User[]> {
    return this.api.getAllPages('/users');
  }

  public createUser(user: CreateUser): Promise<void> {
    return this.api.jsonPost('/users', user);
  }

  public getCurrentUser(): Promise<User> {
    return this.api.jsonGet('/user');
  }
}
