# anond_filter
はてな匿名ダイアリーで登録した正規表現にマッチする記事を非表示にするfirefox拡張

## 使い方

事前にfirefox nightlyのabout:configからxpinstall.signatures.requiredをfalseにしておく。

```bash
cd anond_filter
zip -r anond_filter.zip *
```

このzipをfirefoxからインストールする。
インストール後、設定ページから正規表現を登録して保存ボタンを押す。