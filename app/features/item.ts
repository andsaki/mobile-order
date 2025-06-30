interface Item {
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

export default Item;
