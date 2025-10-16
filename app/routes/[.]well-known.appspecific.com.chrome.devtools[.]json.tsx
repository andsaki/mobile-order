// Chrome DevToolsが自動的にリクエストする特殊なURLに対するハンドラー
// このファイルはエラーログを防ぐために存在します
export const loader = () => {
  return new Response(null, { status: 404 });
};
