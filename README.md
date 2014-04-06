node-ipa-server (beta)
===============

.ipa server for install ios apps over http

### How use

1. $ npm install ios-ipa-server
2. $ node setup.js
3. $ node app.js
4. Generate **.ipa** application with xcode (Product -> archive), do not forget to attach "adhoc-profile".
5. Go to http://localhost:3000 and upload the ipa file by completing the form.
6. Go to server url from iOS device, select your app and install.
