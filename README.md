# Getting Started

IPA server for install ios apps over https (SSL Cert Required!, see [letsencrypt.org](https://letsencrypt.org/))

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
- Go to server running and upload the .ipa file filling the form.

#### 4. Install in Device

- Go to server URL from iOS device browser, select your app from the list and install.
