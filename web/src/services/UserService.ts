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

export type UpdateUser = Partial<CreateUser>;

export class UserService {
  public static readonly NAME = 'UserService';

  private readonly api: ApiService;

  public constructor(injector: Injector) {
    this.api = injector.resolve(ApiService);
  }

  public listUsers(): Promise<User[]> {
    return this.api.getAllPages('/users');
  }

  public createUser(user: CreateUser): Promise<User> {
    return this.api.jsonPost('/users', user);
  }

  public getCurrentUser(): Promise<User> {
    return this.api.jsonGet('/user');
  }

  public updateCurrentUser(updates: UpdateUser): Promise<User> {
    return this.api.jsonPatch('/user', updates);
  }

  public updateUser(id: number, updates: UpdateUser): Promise<User> {
    return this.api.jsonPatch(`/users/${id}`, updates);
  }

  public deleteUser(id: number): Promise<void> {
    return this.api.delete(`/users/${id}`);
  }
}
