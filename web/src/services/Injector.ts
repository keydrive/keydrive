function isService<T>(func: Provider<T>): func is ServiceProvider<T> {
  return 'NAME' in func;
}

export interface ServiceProvider<T> {
  new (injector: Injector): T;
  NAME: string;
}

export interface FunctionProvider<T> {
  (injector: Injector): T;
}

export type Provider<T> = ServiceProvider<T> | FunctionProvider<T>;

export class Injector {
  public static readonly NAME = 'Injector';

  private readonly cache: Record<string, unknown> = {};

  public constructor() {
    this.bindTo(Injector, this);
  }

  public bindTo<T>(target: Provider<T>, instance: T): void {
    this.cache[Injector.getKey(target)] = instance;
  }

  private static getKey(provider: Provider<unknown>): string {
    if (isService(provider)) {
      return provider.NAME;
    }

    return provider.toString();
  }

  public resolve<T>(target: Provider<T>): T {
    const key = Injector.getKey(target);
    if (this.cache[key]) {
      return this.cache[key] as T;
    }

    const instance = isService(target) ? this.resolveService(target) : this.resolveFunction(target);
    if (!instance) {
      throw new Error(`Failed to provide [${target.name}]`);
    }
    this.cache[key] = instance;
    return instance;
  }

  private resolveService<T>(target: ServiceProvider<T>): T {
    const instance = new target(this.resolve(Injector));
    console.debug(`Initialized class ${target.name}`);
    return instance;
  }

  private resolveFunction<T>(target: FunctionProvider<T>): T {
    const instance = target(this.resolve(Injector));
    console.debug(`Initialized function ${target.name}`);
    return instance;
  }
}
