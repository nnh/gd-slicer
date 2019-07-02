# Google Document Splicer

Google Document で書かれた文章を日本語と英語に分割するスクリプトです
日本語の部分はそのまま記述し、英語の部分を `|` と `|` で囲う事で多国語のドキュメント生成を可能にします


## 開発

準備

``` shell
yarn install --frozen-lockfile

```

監視

``` shell
node_modules/.bin/clasp push -w
```

## 言語

TypeScript からGoogle Apps Script にトランスパイルされます.
