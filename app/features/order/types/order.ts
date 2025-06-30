/* ローダーデータの型を定義する */
export interface LoaderData {
  orders: Array<{
    order_id: string;
    table_id: string;
    created_at: string;
    cart_items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }> | null;
}
