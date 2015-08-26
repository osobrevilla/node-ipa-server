# Getting Started

IPA server for install ios apps over https (SSL Cert Required!!!)

#### 1. Install

```sh
$ npm install
```

This create database file and tables

#### 2. Run

```sh
$ npm start
```
 
#### 3. Uploading .IPA files

- Generate **.ipa** application with Xcode (Product -> Archive), do not forget to attach the **"adhoc-profile"**.
- Go to **https://yourdomain.com** and upload the ipa file by completing the form.

#### 4. Install in Device

- Go to server URL from iOS device browser, select your app from the list and install.
