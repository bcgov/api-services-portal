
import { Keystone } from "@keystonejs/keystone"
import { container } from "tsyringe"
import { KeystoneService } from './keystoneInjector'

export function Register (keystone: Keystone, keycloak: any) : void {
    container.register<KeystoneService>('KeystoneService', {useValue: new KeystoneService(keystone)})
    container.register<any>('KeycloakClient', {useValue: keycloak})
}