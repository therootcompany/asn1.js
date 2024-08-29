#!/bin/sh
set -e
set -u

# TODO have GPT rewrite this script in JS for running on Windows

fn_sed_i() { (
    b_pattern="${1}"
    b_path="${2}"
    if sed --version 2>&1 | grep -q -F GNU; then
        sed -i "${b_pattern}" "${b_path}"
    else
        sed -i '' "${b_pattern}" "${b_path}"
    fi
); }

cat parser.js packer.js > ./all.tmp.js
fn_sed_i '/use strict/d' ./all.tmp.js
fn_sed_i '/require/d' ./all.tmp.js
fn_sed_i '/exports/d' ./all.tmp.js

{
    echo ';(function () {'
    echo "'use strict';"
    echo "var ASN1 = window.ASN1 = {};"
    echo "var Enc = window.Encoding;"
    cat ./all.tmp.js
} > ./dist/asn1.js
rm ./all.tmp.js
echo '}());' >> ./dist/asn1.js

rm -f ./dist/*.gz

npm clean-install
cat ./node_modules/@root/encoding/dist/encoding.all.js > ./all.js
cat ./dist/asn1.js >> ./all.js
npx -p uglify-js@3.19.2 uglifyjs ./dist/asn1.js -o ./dist/asn1.min.js
gzip -k ./dist/asn1.min.js

mv ./all.js ./dist/asn1.all.js
npx -p uglify-js@3.19.2 uglifyjs ./dist/asn1.all.js -o ./dist/asn1.all.min.js
gzip -k ./dist/asn1.all.min.js
