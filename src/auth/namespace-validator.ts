import { Logger } from '../logger';

const logger = Logger('auth-ns-validate')

export function NamespaceValidator() {
    logger.debug("first(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      logger.debug("Called... %s %s", target, propertyKey)
    };
  }
