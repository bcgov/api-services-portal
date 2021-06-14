const cert = `
-----BEGIN CERTIFICATE-----
MIIIOzCCByOgAwIBAgIQRw/FczJ7LI+EjJ5o1H0uDTANBgkqhkiG9w0BAQsFADCB
ujELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUVudHJ1c3QsIEluYy4xKDAmBgNVBAsT
H1NlZSB3d3cuZW50cnVzdC5uZXQvbGVnYWwtdGVybXMxOTA3BgNVBAsTMChjKSAy
MDEyIEVudHJ1c3QsIEluYy4gLSBmb3IgYXV0aG9yaXplZCB1c2Ugb25seTEuMCwG
A1UEAxMlRW50cnVzdCBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSAtIEwxSzAeFw0y
MDEwMDYxOTEzMTZaFw0yMTEwMDgxOTEzMTZaMIGPMQswCQYDVQQGEwJDQTEZMBcG
A1UECBMQQnJpdGlzaCBDb2x1bWJpYTERMA8GA1UEBxMIVmljdG9yaWExNzA1BgNV
BAoTLkdvdmVybm1lbnQgb2YgdGhlIFByb3ZpbmNlIG9mIEJyaXRpc2ggQ29sdW1i
aWExGTAXBgNVBAMMECouYXBwcy5nb3YuYmMuY2EwggIiMA0GCSqGSIb3DQEBAQUA
A4ICDwAwggIKAoICAQC5AdfB/MXy9CD7S4HhPdUTjt/etx9bAqHdwx7u9c1Cptac
I24ImUXXbXVQ76N0tyCKRtrya//vb9yxIMM/B0UcFO/j/uluy27ok20hjU2zRlsF
cg6L9+LJkh7lTIgikb2ApYY2+Rc0Rz4W15Ia1b8SPrGHVahf6+xcvtNnEhv/0vUb
OI6S7vPj2ZYFgDJjxFybjcBupsKOxl6jkLkEzHRLpAP0Tbi4JWucHgjC+Iy31PwB
4P8Zd7TPFGOyTDQgca4Eku4zA0rmqtuGg64ivxQGzvhykA3ZHR/Yj+gOflLhw3ds
IhdKeKb1F/iGZe4yrC5LkzTD+M8Bh6FTk5M1tsLj3rOBc+lOz4iHG2ODFlSqImBy
66PwvR/6kF7uovvfWl5+F1cPK3JPhjVKET0cPiDodCRDJGcZkOo6W6cXEX1YljNz
iLN49/nzZIt4xqaeOJJIfJ8u5axxoVbDcGk3q0e9IS0vsCp2tWKclXOOCnGKJRdR
QJyPeaC/f9V2ZLMfPaKtBW2mfySMRHJuysMMuqDeKxa21ZVGzFG9yzpYY4e5F/8P
rA/tJ3AFGAf3SUj0zWQxbpEGTjcML5NdTLtkdhMFokE5N8I6PvFvTFVkeTVMWNY/
jeDCn3Lazxly9S/4IlIbvb8lYd0RaeWxhwpK/bDhi27tfn6v7mHK8qkKtT0TxQID
AQABo4IDZDCCA2AwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUaayGn/DNmWvzyZUQ
AP1LCh+gY3QwHwYDVR0jBBgwFoAUgqJwdN28Uz/Pe9T3zX+nYMYKTL8waAYIKwYB
BQUHAQEEXDBaMCMGCCsGAQUFBzABhhdodHRwOi8vb2NzcC5lbnRydXN0Lm5ldDAz
BggrBgEFBQcwAoYnaHR0cDovL2FpYS5lbnRydXN0Lm5ldC9sMWstY2hhaW4yNTYu
Y2VyMDMGA1UdHwQsMCowKKAmoCSGImh0dHA6Ly9jcmwuZW50cnVzdC5uZXQvbGV2
ZWwxay5jcmwwcgYDVR0RBGswaYIQKi5hcHBzLmdvdi5iYy5jYYIOYXBwcy5nb3Yu
YmMuY2GCEWFyY21hcHMuZ292LmJjLmNhghZ0ZXN0LmFyY21hcHMuZ292LmJjLmNh
ghpkZWxpdmVyeS5hcmNtYXBzLmdvdi5iYy5jYTAOBgNVHQ8BAf8EBAMCBaAwHQYD
VR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMEwGA1UdIARFMEMwNwYKYIZIAYb6
bAoBBTApMCcGCCsGAQUFBwIBFhtodHRwczovL3d3dy5lbnRydXN0Lm5ldC9ycGEw
CAYGZ4EMAQICMIIBfgYKKwYBBAHWeQIEAgSCAW4EggFqAWgAdgBVgdTCFpA2AUrq
C5tXPFPwwOQ4eHAlCBcvo6odBxPTDAAAAXT/VQpEAAAEAwBHMEUCIQCBNVzdoda1
gzIhgzVnrKzgNtLmZEl61vYSYqXbfBc0RQIgCRZCt9IELyNFbhB+caVmxIVHdii3
7W/es8T2B7gReDIAdQBWFAaaL9fC7NP14b1Esj7HRna5vJkRXMDvlJhV1onQ3QAA
AXT/VQp0AAAEAwBGMEQCIFvTTLMtEXNbKxrhm2Uw0SDDf4cWVqDn1/lprs7YYvxW
AiAwbIzHxSyhjodKTKQ7hDZakTB3+VayErI4dlTUGph2ngB3APZclC/RdzAiFFQY
CDCUVo7jTRMZM7/fDC8gC8xO8WTjAAABdP9VCpkAAAQDAEgwRgIhAIW0R8jtbhB5
QsZ4DWyVOWr6NLgsfSJV3c1LLk7I2zSyAiEAny7peTgjSyAaHuSCCLDGDTO3t/Ua
XezLfwliINTlAeQwDQYJKoZIhvcNAQELBQADggEBANmO1MdAhzPPYWo2Wd5LZd0C
Xu+GhlflTgoxY4JMUatW0QG8VteqYJrhArGlv9L08QjJm1hQq224FU/CCAsNo8hR
3MbX9tJejSdbNwcipm6By0huafbVB/+zWuLiLKoP51sPIkdu5WBc0L4xiodwUXym
rIZaWNIaaXn6DVn6+8p7W9esked7dqi4+yhtyYzshukpsoXxq903rbIPyoMIQLJp
UpNAm3zBv2YU4ZE6g03Jy/JNpqcV47j5RFccQKtZpnZPOsDXgZT2blT/KaxYim3X
uvJirYB22EAK9bwWkpFHI8JjKDjNrG8UxBtymejhNutBu0nPEMelFehVUixIZmM=
-----END CERTIFICATE-----
`;

module.exports = cert;
