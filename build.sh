#!/bin/bash

# TODO convert to JS
cat parser.js packer.js > all.tmp.js
sed -i '' '/use strict/d' all.tmp.js
sed -i '' '/require/d' all.tmp.js
sed -i '' '/exports/d' all.tmp.js

echo ';(function () {' > dist/asn1.js
echo "'use strict';" >> dist/asn1.js
echo "var ASN1 = window.ASN1 = {};" >> dist/asn1.js
echo "var Enc = window.Encoding;" >> dist/asn1.js
cat all.tmp.js >> dist/asn1.js
rm all.tmp.js
echo '}());' >> dist/asn1.js

rm dist/*.gz

cat node_modules/@root/encoding/dist/encoding.all.js > all.js
cat dist/asn1.js >> all.js
uglifyjs dist/asn1.js > dist/asn1.min.js
gzip dist/asn1.min.js
uglifyjs dist/asn1.js > dist/asn1.min.js

mv all.js dist/asn1.all.js
uglifyjs dist/asn1.all.js > dist/asn1.all.min.js
gzip dist/asn1.all.min.js
uglifyjs dist/asn1.all.js > dist/asn1.all.min.js
