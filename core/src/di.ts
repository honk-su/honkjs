// Service lifetime types
export enum ServiceLifetime {
    Singleton,
    Scoped,
    Transient
}

// Service descriptor interface
interface ServiceDescriptor {
    token: symbol;
    implementation: any;
    lifetime: ServiceLifetime;
}

// Main container class
export class ServiceContainer {
    private static instance: ServiceContainer;
    private services = new Map<symbol, ServiceDescriptor>();
    private singletonInstances = new Map<symbol, any>();
    private tokenRegistry = new Map<string, symbol>();  // New token registry

    static getInstance(): ServiceContainer {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }

    // Register a service
    addService(token: symbol, implementation: any, lifetime: ServiceLifetime) {
        this.services.set(token, { token, implementation, lifetime });
    }

    // Retrieve an existing token or create a new one
    getOrCreateToken(service: any): symbol {
        const serviceName = service.name;
        if (!this.tokenRegistry.has(serviceName)) {
            this.tokenRegistry.set(serviceName, Symbol(serviceName));
        }
        return this.tokenRegistry.get(serviceName)!;
    }

    // Get service instance
    getService(token: symbol): any {
        const descriptor = this.services.get(token);

        if (!descriptor) {
            throw new Error(`Service not registered for token: ${token.toString()}`);
        }

        switch (descriptor.lifetime) {
            case ServiceLifetime.Singleton:
                return this.getSingletonInstance(descriptor);
            case ServiceLifetime.Transient:
                return new descriptor.implementation();
            default:
                throw new Error(`Unsupported lifetime: ${descriptor.lifetime}`);
        }
    }

    private getSingletonInstance(descriptor: ServiceDescriptor): any {
        if (!this.singletonInstances.has(descriptor.token)) {
            this.singletonInstances.set(descriptor.token, new descriptor.implementation());
        }
        return this.singletonInstances.get(descriptor.token);
    }
}

// Service decorator (similar to @Injectable in Blazor)
export function Injectable(lifetime: ServiceLifetime = ServiceLifetime.Singleton) {
    return function (target: any) {
        const container = ServiceContainer.getInstance();
        const token = container.getOrCreateToken(target);
        container.addService(token, target, lifetime);
        return target;
    };
}

// Inject decorator (similar to [Inject] in Blazor)
export function Inject(serviceType: any) {
    return function (target: any, propertyKey: string) {
        const container = ServiceContainer.getInstance();
        const token = container.getOrCreateToken(serviceType);
        const descriptor = {
            get: function (this: any) {
                return container.getService(token);
            },
            enumerable: true,
            configurable: true
        };
        Object.defineProperty(target, propertyKey, descriptor);
    };
}