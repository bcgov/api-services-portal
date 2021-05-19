
import { Keystone } from "@keystonejs/keystone"
import { container } from "tsyringe"
import { KeystoneService } from './keystoneInjector'

export function Register (keystone: Keystone) : void {
    container.register<KeystoneService>('KeystoneService', {useValue: new KeystoneService(keystone)})
}