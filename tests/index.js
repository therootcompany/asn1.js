'use strict';

var ASN1 = require('../');
var Enc = require('@root/encoding');
var PEM = require('@root/pem');

// 1.2.840.10045.3.1.7
// prime256v1 (ANSI X9.62 named elliptic curve)
var OBJ_ID_EC_256 = '06 08 2A8648CE3D030107';

var jwk = {
	crv: 'P-256',
	d: 'LImWxqqTHbP3LHQfqscDSUzf_uNePGqf9U6ETEcO5Ho',
	kty: 'EC',
	x: 'vdjQ3T6VBX82LIKDzepYgRsz3HgRwp83yPuonu6vqos',
	y: 'IUkEXtAMnppnV1A19sE2bJhUo4WPbq6EYgWxma4oGyg',
	kid: 'MnfJYyS9W5gUjrJLdn8ePMzik8ZJz2qc-VZmKOs_oCw'
};
var d = Enc.base64ToHex(jwk.d);
var x = Enc.base64ToHex(jwk.x);
var y = Enc.base64ToHex(jwk.y);

var der = Enc.hexToBuf(
	ASN1.Any(
		'30', // Sequence
		ASN1.UInt('01'), // Integer (Version 1)
		ASN1.Any('04', d), // Octet String
		ASN1.Any('A0', OBJ_ID_EC_256), // [0] Object ID
		ASN1.Any(
			'A1', // [1] Embedded EC/ASN1 public key
			ASN1.BitStr('04' + x + y)
		)
	)
);

var pem1 = PEM.packBlock({
	type: 'EC PRIVATE KEY',
	bytes: der
});

var expected = [
	'-----BEGIN EC PRIVATE KEY-----',
	'MHcCAQEEICyJlsaqkx2z9yx0H6rHA0lM3/7jXjxqn/VOhExHDuR6oAoGCCqGSM49',
	'AwEHoUQDQgAEvdjQ3T6VBX82LIKDzepYgRsz3HgRwp83yPuonu6vqoshSQRe0Aye',
	'mmdXUDX2wTZsmFSjhY9uroRiBbGZrigbKA==',
	'-----END EC PRIVATE KEY-----'
].join('\n');

if (pem1 !== expected) {
	throw new Error('Did not correctly Cascade pack EC P-256 JWK to DER');
} else {
	console.info('PASS: packed cascaded ASN1');
}

// Mix and match hex ints, hex strings, and byte arrays
var asn1Arr = [
	'30', // Sequence
	[
		[0x02, '01'], // Integer (Version 1)
		[0x04, Buffer.from(d, 'hex')], // Octet String
		['a0', OBJ_ID_EC_256], // [0] Object ID
		[
			0xa1, // [1] Embedded EC/ASN1 public key
			ASN1.BitStr('04' + x + y)
		]
	]
];

var der2 = ASN1.pack(asn1Arr);
var pem2 = PEM.packBlock({
	type: 'EC PRIVATE KEY',
	bytes: der2
});

if (pem2 !== expected) {
	console.log(pem2);
	console.log(expected);
	throw new Error('Did not correctly Array pack EC P-256 JWK to DER');
} else {
	console.info('PASS: packed array-style ASN1');
}

var block = PEM.parseBlock(expected);
var arr1 = ASN1.parse({ der: block.bytes });
//console.log(JSON.stringify(arr1));
var arr2 = ASN1.parse({ der: block.bytes, verbose: false, json: false });
var obj3 = ASN1.parse({ der: block.bytes, verbose: true, json: true });
//console.log(obj3);

function eq(b1, b2) {
	if (b1.byteLength !== b2.byteLength) {
		return false;
	}
	return b1.every(function(b, i) {
		return b === b2[i];
	});
}

if (!eq(block.bytes, ASN1.pack(arr1))) {
	throw new Error('packing hex array resulted in different bytes');
} else {
	console.log('PASS: packs parsed (hex) array');
}

if (!eq(block.bytes, ASN1.pack(arr2))) {
	throw new Error('packing array with bytes resulted in different bytes');
} else {
	console.log('PASS: packs parsed array (with bytes)');
}

if (!eq(block.bytes, ASN1.pack(obj3))) {
	console.log(block.bytes.toString('hex'));
	console.log(ASN1.pack(obj3));
	throw new Error('packing verbose object resulted in different bytes');
} else {
	console.log('PASS: packs parsed verbose object');
}

if (block.bytes.toString('hex') !== ASN1.pack(obj3, { json: true })) {
	throw new Error('packing to hex resulted in different bytes');
} else {
	console.log('PASS: packs as hex when json: true');
}
