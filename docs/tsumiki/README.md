# つみきの紹介サイト

GitHub Pagesの `docs/tsumiki/` のみを対象にした、ビルド不要の静的サイトです。
他アプリのフォルダやサイト全体のrobots設定は変更しません。

## ページ
- `index.html`: 紹介・機能・料金区分・FAQ
- `reading.html`: 読書習慣の設定例
- `morning.html`: 朝のルーティンの設定例
- `support.html`: 問い合わせ・購入復元とデータの注意点
- `privacy.html` / `terms.html`: 既存のURLを維持。問い合わせ先と紹介ページへのリンクのみ更新
- `sitemap.xml`: このアプリ内だけのURL一覧

## 説明の根拠
2026-09-22確認時点の日本App Store公開版は **1.8 / iOS 18.0以降**。
App Store: https://apps.apple.com/jp/app/id6765710742
Apple lookup: https://itunes.apple.com/lookup?id=6765710742&country=jp
開発ブランチのバージョンと公開版は区別します。メモ・JSON復元・年間共有画像・Watchなどの未公開機能は案内に含めていません。
価格は新規ページに固定値を持たず、実際の購入画面に案内します。既存規約の価格条項は変更していません。
サポートメールはアプリ側の `AppConstants.swift` に設定されている窓口です。

画像は同アプリのApp Store掲載素材です。画面は掲載時のバージョンです。
`assets/app-icon.jpg`: App Storeアイコン
`assets/habit-list.jpg`: App Store掲載の習慣一覧紹介画像

## ローカル確認
リポジトリ直下で:
```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```
http://127.0.0.1:8765/tsumiki/ を開きます。
320px・390px・デスクトップで横スクロール、リンク、FAQ、キーボード操作を確認してください。
GitHub Pages特有の拡張子なしURL `/tsumiki/privacy` と `/tsumiki/terms` は公開後に確認します（標準のローカルサーバーでは同じ解決をしません）。

## 公開と計測
- PRを確認し、公開の承認後に既存のGitHub Pages公開手順で反映します。
- 公開後、各ページ・画像・既存規約URLのHTTP応答を確認します。
- 検索流入用のサイトマップは https://ryam244.github.io/tsumiki/sitemap.xml 。所有権確認済みSearch Consoleがあれば送信します。送信と検索掲載は別です。
- このサイトに解析SDK、Cookie、クリック送信処理は追加していません。`data-cta` は場所の識別ラベルのみで、計測は行いません。
- App Store Connectで正規のキャンペーンリンクを作成できたら、用途別CTAへの適用を検討します。未確認のprovider token等は使いません。現状は通常のApp Storeリンクです。
- 広告出稿やSNS投稿は別途承認のうえ実施します。ページ追加だけで流入・購入が増えたとは判断しません。

## アップデート時
1. 日本App Storeの公開バージョン、最低iOS、料金、無料/有料の区分を確認。
2. トップ・サポート・ガイドの説明と確認日を更新。
3. 公開版のスクリーンショットへ差し替え。開発画面を現行版として掲載しない。
4. 全リンク・モバイル表示・公開URLを再確認。
5. 新版で変わるデータの扱いと規約は別途レビュー。現状の規約を全面的に監査したものではありません。
