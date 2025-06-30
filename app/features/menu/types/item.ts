export interface MenuItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  categoryId: number;
  name: string;
  price: number;
  description: string;
  image: {
    url: string;
    height: number;
    width: number;
  };
}

export interface Category {
  id: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
}
