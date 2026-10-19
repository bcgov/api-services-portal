import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('provisioner_values', Path(__file__).with_name('provisioner-values.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class DeploymentValuesTests(unittest.TestCase):
    def settings(self):
        return {
            'PARTNER_JWT_ISSUER': 'https://issuer.example/realm',
            'PARTNER_JWT_AUDIENCE': 'sdx-partner',
            'PARTNER_JWT_JWKS_URL': 'https://issuer.example/realm/certs',
            'PARTNER_JWT_REQUIRED_SCOPE': 'sdx:partner',
            'RUNNING_UID_GID': '10001', 'GITHUB_SHA': 'abc123', 'DEPLOY_ID': 'feature-aps-4927-common-sso',
        }

    def test_each_missing_setting_prevents_deployment(self):
        for name in module.PARTNER_SETTINGS:
            if name == 'PARTNER_JWT_REQUIRED_SCOPE':
                continue
            with self.subTest(name=name):
                settings = self.settings()
                settings[name] = ' '
                with self.assertRaisesRegex(ValueError, name):
                    module.render(settings)

    def test_empty_scope_is_passed_to_the_container(self):
        settings = self.settings()
        settings['PARTNER_JWT_REQUIRED_SCOPE'] = ''
        self.assertEqual(module.render(settings)['env']['PARTNER_JWT_REQUIRED_SCOPE']['value'], '')

    def test_untrusted_key_transport_or_combined_scope_is_rejected(self):
        for name, value in [('PARTNER_JWT_JWKS_URL', 'http://issuer.example/certs'),
                            ('PARTNER_JWT_JWKS_URL', 'https://user:password@issuer.example/certs'),
                            ('PARTNER_JWT_REQUIRED_SCOPE', 'first second')]:
            with self.subTest(name=name, value=value):
                settings = self.settings()
                settings[name] = value
                with self.assertRaises(ValueError):
                    module.render(settings)

    def test_trust_settings_survive_json_and_listeners_have_distinct_service_ports(self):
        settings = self.settings()
        settings['PARTNER_JWT_AUDIENCE'] = 'sdx:"partner"'
        values = json.loads(json.dumps(module.render(settings)))
        for name in module.PARTNER_SETTINGS:
            self.assertEqual(values['env'][name]['value'], settings[name])
        self.assertEqual(values['containerPort'], 3000)
        self.assertEqual(values['extraPorts'], [{'name': 'partner', 'port': 3001}])
        self.assertFalse(values['ingress']['enabled'])
        self.assertEqual(values['readinessProbe']['tcpSocket']['port'], 'partner')
        self.assertEqual(values['startupProbe']['tcpSocket']['port'], 'partner')


if __name__ == '__main__':
    unittest.main()
