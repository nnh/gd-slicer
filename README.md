# Google Document Splicer

Google Document で書かれた文章を日本語と英語に分割するスクリプトです
日本語の部分はそのまま記述し、英語の部分を `|` と `|` で囲う事で多国語のドキュメント生成を可能にします


## 開発

### 準備

``` shell
yarn install --frozen-lockfile
```

### .clasp.json の作成

push 先のGAS を特定するために.clasp.json を生成する必要があります。
またpush フォルダーを src 配下に固定する必要があります

- `clasp login` Google Apps にログインする
- `clasp create` 新規に作成する
- `clasp clone` 既存のプロジェクトをターゲットにする


### 監視&push

開発中は基本的にこちらを利用します.
ファイルに変更があればTypeScript からGoogle Apps Script にトランスパイルし、Google Driver にpush します.

``` shell
yarn start
```

### テスト

``` shell
yarn test
```
