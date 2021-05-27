import { ApiService } from './ApiService';
import { Injector } from './Injector';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export class UserService {
  public static readonly NAME = 'UserService';

  private readonly api: ApiService;

  public constructor(injector: Injector) {
    this.api = injector.resolve(ApiService);
  }

  public async listUsers(): Promise<User[]> {
    return this.api.getAllPages('/users');
  }
}
