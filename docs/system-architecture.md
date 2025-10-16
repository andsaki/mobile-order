# システムアーキテクチャ - シーケンス図

このドキュメントでは、モバイルオーダーシステムの主要な機能フローをシーケンス図で説明します。

## 目次
1. [カート機能全体フロー](#1-カート機能全体フロー)
2. [メニュー閲覧から注文完了までの流れ](#2-メニュー閲覧から注文完了までの流れ)
3. [全ページの遷移とデータフロー](#3-全ページの遷移とデータフロー)

---

## 1. カート機能全体フロー

商品をカートに追加してから注文が完了するまでの流れ。

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant MenuPage as メニューページ
    participant useCart as useCartフック
    participant SessionStorage as SessionStorage
    participant Toast as react-hot-toast
    participant CartPage as カートページ
    participant API as 注文API
    participant Supabase as Supabase DB
    participant Modal as モーダル
    participant OrdersPage as 注文一覧ページ

    %% 商品をカートに追加
    User->>MenuPage: 商品を選択
    MenuPage->>useCart: addToCart(item)
    useCart->>useCart: setCart((prevCart) => {...})
    Note over useCart: カート状態を更新
    useCart->>SessionStorage: setItem("cart", updatedCart)
    useCart->>Toast: toast.success("商品を追加しました")
    Toast-->>User: トースト通知表示

    %% カートページで確認
    User->>CartPage: カートページに移動
    CartPage->>useCart: cart を取得
    useCart->>SessionStorage: getItem("cart")
    SessionStorage-->>useCart: カートデータ
    useCart-->>CartPage: cart
    CartPage-->>User: カート内容を表示

    %% 数量変更
    User->>CartPage: 数量を変更
    CartPage->>useCart: updateQuantity(itemId, newQuantity)
    useCart->>useCart: setCart((prevCart) => {...})
    useCart->>SessionStorage: setItem("cart", updatedCart)
    useCart-->>CartPage: 更新されたカート
    CartPage-->>User: 更新された表示

    %% 注文確定
    User->>CartPage: "注文する"ボタンをクリック
    CartPage->>API: POST /api/order (cart)
    API->>Supabase: INSERT INTO orders
    Supabase-->>API: orderId
    API-->>CartPage: { orderId }

    CartPage->>useCart: setCart([])
    useCart->>SessionStorage: setItem("cart", [])
    CartPage->>Modal: モーダル表示
    Modal-->>User: "注文完了: {orderId}"

    User->>Modal: モーダルを閉じる
    Modal->>OrdersPage: 注文一覧ページへ遷移
    OrdersPage-->>User: 注文履歴を表示
```

---

## 2. メニュー閲覧から注文完了までの流れ

ユーザーがアプリを開いてから注文を完了するまでの全体的な流れ。

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant QRPage as QRスキャンページ
    participant Session as セッション
    participant MenuPage as メニューページ
    participant Supabase as Supabase DB
    participant useCart as useCartフック
    participant CartPage as カートページ
    participant OrderAPI as 注文API
    participant OrdersPage as 注文一覧ページ
    participant PaymentPage as QR決済ページ

    %% QRコードスキャン
    User->>Browser: アプリを開く
    Browser->>QRPage: QRスキャンページ表示
    User->>QRPage: QRコードをスキャン
    QRPage->>Session: tableIdを保存
    Session-->>QRPage: セッション確立
    QRPage->>MenuPage: メニューページへ遷移

    %% メニュー閲覧
    MenuPage->>Supabase: メニューデータを取得
    Supabase-->>MenuPage: メニュー一覧
    MenuPage-->>User: メニューを表示

    %% 商品選択とカート追加
    User->>MenuPage: 商品を選択
    MenuPage->>useCart: addToCart(item)
    useCart->>SessionStorage: カートに保存
    useCart-->>User: トースト通知

    User->>MenuPage: 別の商品を選択
    MenuPage->>useCart: addToCart(item)
    useCart->>SessionStorage: カートに保存
    useCart-->>User: トースト通知

    %% カート確認
    User->>CartPage: カートアイコンをクリック
    CartPage->>useCart: カート内容を取得
    useCart->>SessionStorage: getItem("cart")
    SessionStorage-->>CartPage: カートデータ
    CartPage-->>User: カート内容と合計金額を表示

    %% 注文確定
    User->>CartPage: "注文する"をクリック
    CartPage->>Session: tableIdを取得
    CartPage->>OrderAPI: POST /api/order { cart, tableId }
    OrderAPI->>Supabase: INSERT INTO orders
    Supabase-->>OrderAPI: { orderId, created_at }
    OrderAPI-->>CartPage: 注文成功

    CartPage->>useCart: カートをクリア
    useCart->>SessionStorage: setItem("cart", [])
    CartPage-->>User: "注文完了"モーダル表示

    %% 注文履歴確認
    User->>OrdersPage: 注文一覧ページへ
    OrdersPage->>Session: tableIdを取得
    OrdersPage->>Supabase: SELECT * FROM orders WHERE table_id
    Supabase-->>OrdersPage: 注文履歴
    OrdersPage-->>User: 注文一覧を表示

    %% 支払い
    User->>PaymentPage: "QRで支払い"をクリック
    PaymentPage-->>User: 決済用QRコードを表示
    User->>User: QRコードで支払い
```

---

## 3. 全ページの遷移とデータフロー

アプリケーション全体のページ遷移とデータの流れ。

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Root as root.tsx<br/>(Layout)
    participant Session as セッション管理
    participant QRPage as /qr
    participant MenuPage as /menu
    participant CartPage as /cart
    participant OrdersPage as /orders
    participant PaymentPage as /qr (支払い)
    participant Supabase as Supabase DB
    participant SessionStorage as SessionStorage

    %% アプリ起動
    User->>Root: アプリアクセス
    Root->>Session: loader: tableIdLoader()
    Session->>Session: Cookie からtableIdを取得

    alt tableIdが存在しない
        Session-->>Root: tableId = null
        Root->>Root: ErrorBoundary表示
        Root-->>User: "テーブルIDが見つかりません"
    else tableIdが存在
        Session-->>Root: tableId
        Root->>Root: AppContent表示
        Root-->>User: アプリ起動成功
    end

    %% QRスキャン (初回 or テーブルID再設定)
    User->>QRPage: QRスキャンページ
    User->>QRPage: QRコードをスキャン
    QRPage->>Session: tableIdをCookieに保存
    Session-->>QRPage: セッション確立
    QRPage->>MenuPage: redirect to /menu

    %% メニューページ
    MenuPage->>Supabase: loader: メニューデータ取得
    Supabase-->>MenuPage: メニュー一覧
    MenuPage-->>User: メニュー表示

    User->>MenuPage: 商品をカートに追加
    MenuPage->>SessionStorage: カートに保存
    MenuPage-->>User: トースト通知

    %% ボトムナビゲーション
    Note over User,SessionStorage: BottomNavから各ページへ遷移可能

    %% カートページ
    User->>CartPage: /cart へ遷移
    CartPage->>SessionStorage: カートデータ取得
    SessionStorage-->>CartPage: cart
    CartPage-->>User: カート内容表示

    User->>CartPage: "注文する"
    CartPage->>Supabase: POST /api/order
    Supabase-->>CartPage: orderId
    CartPage->>SessionStorage: カートをクリア
    CartPage->>OrdersPage: redirect to /orders

    %% 注文一覧ページ
    OrdersPage->>Session: tableIdを取得
    OrdersPage->>Supabase: loader: 注文履歴取得
    Supabase-->>OrdersPage: orders[]
    OrdersPage-->>User: 注文一覧表示

    %% 支払いページ
    User->>PaymentPage: "QRで支払い"
    PaymentPage-->>User: 決済用QRコード表示

    %% ページ間の自由な遷移
    Note over MenuPage,OrdersPage: BottomNavでメニュー/カート/注文一覧を自由に移動可能
```

---

## データフローの詳細

### セッション管理
- **Cookie**: `tableId`を保持（サーバーサイドで検証）
- **用途**: テーブルを識別し、注文をテーブルごとに管理

### クライアントサイドストレージ
- **SessionStorage**: カートデータ（`cart`）を保持
- **永続性**: ブラウザセッション中のみ有効
- **形式**: JSON配列 `[{ id, name, price, quantity }, ...]`

### データベース (Supabase)
- **orders テーブル**: 注文情報を保存
  - `order_id`: UUID（主キー）
  - `table_id`: テーブルID
  - `cart_items`: JSONB（注文内容）
  - `created_at`: タイムスタンプ

### 状態管理
- **useCart フック**: カート状態を管理
  - `cart`: 現在のカート内容
  - `addToCart()`: 商品追加
  - `updateQuantity()`: 数量変更
  - `removeItem()`: 商品削除
  - `setCart()`: カート全体を設定

---

## 主要コンポーネントとその役割

| コンポーネント | 役割 | 状態管理 |
|--------------|------|---------|
| `root.tsx` | レイアウト、セッション検証 | Cookieからのローダー |
| `QRPage` | テーブルID設定 | セッションへの書き込み |
| `MenuPage` | メニュー表示、商品追加 | useCart フック |
| `CartPage` | カート管理、注文送信 | useCart フック、useFetcher |
| `OrdersPage` | 注文履歴表示 | ローダーからのデータ |
| `BottomNav` | ページ遷移 | useNavigate |
| `useCart` | カート状態管理 | useState + SessionStorage |

---

## エラーハンドリング

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Root as root.tsx
    participant Session as セッション
    participant ErrorBoundary as ErrorBoundary

    User->>Root: ページアクセス
    Root->>Session: tableIdを確認

    alt tableIdが存在しない
        Session-->>Root: tableId = null
        Root->>ErrorBoundary: エラー表示
        ErrorBoundary-->>User: "テーブルIDが見つかりません"<br/>"QRコードをスキャンしてください"
        User->>ErrorBoundary: "QRコードをスキャン"ボタン
        ErrorBoundary->>QRPage: /qr へ遷移
    else 注文API エラー
        CartPage->>API: POST /api/order
        API-->>CartPage: { error: "..." }
        CartPage->>Toast: toast.error(error)
        Toast-->>User: エラー通知表示
    else データベースエラー
        Page->>Supabase: データ取得
        Supabase-->>Page: error
        Page->>ErrorBoundary: エラー表示
        ErrorBoundary-->>User: エラーメッセージ
    end
```

---

## 技術スタック

- **フロントエンド**: React + Remix
- **状態管理**: React Hooks (useState, useEffect)
- **ルーティング**: Remix File-based Routing
- **スタイリング**: Tailwind CSS
- **通知**: react-hot-toast
- **データベース**: Supabase (PostgreSQL)
- **認証/セッション**: Remix Sessions (Cookie-based)

---

## 関連ドキュメント

- [トースト重複修正ドキュメント](./toast-duplication-fix.md)
- [カートフックの実装](../app/features/cart/hooks/useCart.ts)
- [セッション管理](../app/utils/session.server.ts)
