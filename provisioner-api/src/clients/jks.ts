import { readFile } from 'node:fs/promises';
import { createHash, createPrivateKey } from 'node:crypto';
import { importPKCS8 } from 'jose';
import type { CryptoKey, JWSAlgorithm } from 'oauth4webapi';

const JKS_MAGIC = 0xfeedfeed;
const TAG_KEY = 1;
const TAG_CERT = 2;
const SUN_JKS_KEY_PROTECTOR_OID = '1.3.6.1.4.1.42.2.17.1.1';

export interface JksLoadResult {
  alias: string;
  key: CryptoKey;
}

export async function loadJwsKeyFromJks(
  keystorePath: string,
  password: string,
  alg: JWSAlgorithm,
  alias?: string
): Promise<JksLoadResult> {
  const buf = await readFile(keystorePath);
  const entry = parseAndDecrypt(buf, password, alias);
  const pem = createPrivateKey({
    key: entry.privateKeyDer,
    format: 'der',
    type: 'pkcs8',
  })
    .export({ format: 'pem', type: 'pkcs8' })
    .toString();
  const key = await importPKCS8(pem, alg);
  return { alias: entry.alias, key };
}

interface ExtractedKeyEntry {
  alias: string;
  privateKeyDer: Buffer;
}

function parseAndDecrypt(
  buf: Buffer,
  password: string,
  wantAlias?: string
): ExtractedKeyEntry {
  const r = new ByteReader(buf);
  const magic = r.uint32();
  if (magic !== JKS_MAGIC) {
    throw new Error(
      `Not a JKS keystore (magic 0x${magic.toString(16)}; JCEKS and PKCS#12 are not supported)`
    );
  }
  r.uint32(); // version
  const count = r.uint32();

  let found: ExtractedKeyEntry | null = null;
  for (let i = 0; i < count; i++) {
    const tag = r.uint32();
    const entryAlias = r.utf();
    r.uint64(); // creation timestamp

    if (tag === TAG_KEY) {
      const keyLen = r.uint32();
      const encryptedKey = r.bytes(keyLen);
      const chainLen = r.uint32();
      for (let j = 0; j < chainLen; j++) {
        r.utf(); // cert type
        const certLen = r.uint32();
        r.bytes(certLen); // skip cert
      }
      if (!wantAlias || entryAlias === wantAlias) {
        if (found && !wantAlias) {
          throw new Error(
            'JKS contains multiple key entries; set *_KEY_ALIAS to choose one'
          );
        }
        const privateKeyDer = decryptKeyBlob(encryptedKey, password);
        found = { alias: entryAlias, privateKeyDer };
        if (wantAlias) break;
      }
    } else if (tag === TAG_CERT) {
      r.utf();
      const certLen = r.uint32();
      r.bytes(certLen);
    } else {
      throw new Error(`Unknown JKS entry tag: ${tag}`);
    }
  }

  if (!found) {
    throw new Error(
      wantAlias
        ? `Alias "${wantAlias}" not found in JKS keystore`
        : 'No private-key entry found in JKS keystore'
    );
  }
  return found;
}

function decryptKeyBlob(
  encryptedPrivateKeyInfoDer: Buffer,
  password: string
): Buffer {
  const der = new DerReader(encryptedPrivateKeyInfoDer);
  der.expectTag(0x30); // SEQUENCE EncryptedPrivateKeyInfo
  der.readLength();

  der.expectTag(0x30); // SEQUENCE AlgorithmIdentifier
  const algLen = der.readLength();
  const algEnd = der.offset + algLen;
  der.expectTag(0x06); // OID
  const oidLen = der.readLength();
  const oid = decodeOid(der.bytes(oidLen));
  if (oid !== SUN_JKS_KEY_PROTECTOR_OID) {
    throw new Error(
      `Unexpected JKS key protector OID ${oid}; expected ${SUN_JKS_KEY_PROTECTOR_OID}`
    );
  }
  der.seek(algEnd);

  der.expectTag(0x04); // OCTET STRING
  const dataLen = der.readLength();
  const data = der.bytes(dataLen);

  if (data.length < 40) {
    throw new Error('JKS encrypted key payload is too short');
  }
  const salt = data.subarray(0, 20);
  const ciphertext = data.subarray(20, data.length - 20);
  const digest = data.subarray(data.length - 20);

  const passBytes = Buffer.alloc(password.length * 2);
  for (let i = 0; i < password.length; i++) {
    const code = password.charCodeAt(i);
    passBytes[i * 2] = (code >> 8) & 0xff;
    passBytes[i * 2 + 1] = code & 0xff;
  }

  const plaintext = Buffer.alloc(ciphertext.length);
  let prev: Buffer = salt;
  for (let i = 0; i < ciphertext.length; i += 20) {
    prev = createHash('sha1').update(passBytes).update(prev).digest();
    const blockLen = Math.min(20, ciphertext.length - i);
    for (let j = 0; j < blockLen; j++) {
      plaintext[i + j] = ciphertext[i + j] ^ prev[j];
    }
  }

  const computedDigest = createHash('sha1')
    .update(passBytes)
    .update(plaintext)
    .digest();
  if (!computedDigest.equals(digest)) {
    throw new Error(
      'JKS key decryption failed: digest mismatch (wrong password?)'
    );
  }
  return plaintext;
}

class ByteReader {
  offset = 0;
  constructor(private readonly buf: Buffer) {}
  uint32(): number {
    const v = this.buf.readUInt32BE(this.offset);
    this.offset += 4;
    return v;
  }
  uint64(): bigint {
    const v = this.buf.readBigInt64BE(this.offset);
    this.offset += 8;
    return v;
  }
  bytes(n: number): Buffer {
    const v = this.buf.subarray(this.offset, this.offset + n);
    this.offset += n;
    return v;
  }
  utf(): string {
    const len = this.buf.readUInt16BE(this.offset);
    this.offset += 2;
    const v = this.buf
      .subarray(this.offset, this.offset + len)
      .toString('utf8');
    this.offset += len;
    return v;
  }
}

class DerReader {
  offset = 0;
  constructor(private readonly buf: Buffer) {}
  expectTag(tag: number): void {
    const got = this.buf[this.offset++];
    if (got !== tag) {
      throw new Error(
        `DER parse error: expected tag 0x${tag.toString(16)}, got 0x${got.toString(16)}`
      );
    }
  }
  readLength(): number {
    const first = this.buf[this.offset++];
    if (first < 0x80) return first;
    const lenBytes = first & 0x7f;
    let len = 0;
    for (let i = 0; i < lenBytes; i++) {
      len = (len << 8) | this.buf[this.offset++];
    }
    return len;
  }
  bytes(n: number): Buffer {
    const v = this.buf.subarray(this.offset, this.offset + n);
    this.offset += n;
    return v;
  }
  seek(to: number): void {
    this.offset = to;
  }
}

function decodeOid(buf: Buffer): string {
  if (buf.length === 0) throw new Error('Empty OID');
  const arcs = [Math.floor(buf[0] / 40), buf[0] % 40];
  let acc = 0;
  for (let i = 1; i < buf.length; i++) {
    acc = (acc << 7) | (buf[i] & 0x7f);
    if ((buf[i] & 0x80) === 0) {
      arcs.push(acc);
      acc = 0;
    }
  }
  return arcs.join('.');
}
