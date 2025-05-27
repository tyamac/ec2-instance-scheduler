# EC2 Instance Scheduler（EC2インスタンススケジューラー）

このプロジェクトは、指定したタグを持つ EC2 インスタンスを、**毎朝 08:00（JST）に起動**し、**毎夕 18:00（JST）に停止**するスケジューリングを AWS CDK（TypeScript）で構築するものです。

Lambda 関数は EventBridge によって定期実行され、渡されたアクション（`start` または `stop`）に応じて EC2 の起動／停止を行います。

---

## 🔧 主な機能

- **タグ付き EC2 インスタンスのみ対象**
- **EventBridge による cron スケジュール実行**
- **Lambda 関数を1つに集約**（アクションはイベント入力で制御）
- AWS SDK v3 を使用した EC2 制御
- AWS CDK（TypeScript）でデプロイ可能

---

## 🏷️ 対象インスタンス（タグ条件）

以下のタグが設定された EC2 インスタンスが対象です：

```
Key   : AutoSchedule  
Value : true
```

必要に応じて、Lambda コード内の `TAG_KEY` / `TAG_VALUE` を変更してください。

---

## ⏰ 実行スケジュール

| アクション | 日本時間 (JST) | UTC Cron 式          |
|-----------|----------------|----------------------|
| 起動      | 08:00           | `cron(0 23 ? * * *)` |
| 停止      | 18:00           | `cron(0 9 ? * * *)`  |

---

## 🧱 ディレクトリ構成

```
project-root/
├── lib/
│   ├── ec2-scheduler-stack.ts       # CDK スタック定義
│   └── lambda/
│       └── instanceScheduler.ts     # Lambda 関数（TypeScript）
├── bin/
│   └── ec2-scheduler.ts             # CDK エントリポイント
├── package.json
├── tsconfig.json
└── cdk.json
```

---

## 🚀 デプロイ手順

1. 依存関係をインストール

```bash
npm install
```

2. CDK スタックをデプロイ

```bash
cdk deploy
```

---

## 🧪 テスト方法（手動実行）

AWS マネジメントコンソールや CLI から Lambda 関数に以下のようなテストイベントを渡して動作確認できます：

```json
{ "action": "start" }
```

または

```json
{ "action": "stop" }
```

---

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。