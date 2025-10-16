import { Meta, StoryObj } from "@storybook/react";

import Menu from "./Menu";

const meta: Meta<typeof Menu> = {
  title: "Components/Menu",
  component: Menu,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Menuは、カテゴリ別に商品を表示するコンポーネントです。カテゴリごとにアイコンが表示され、各商品はカード形式で表示されます。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Menu>;

const sampleMenuData = {
  categories: [
    { id: "1", name: "ドリンク", categoryId: "2" },
    { id: "2", name: "フード", categoryId: "3" },
  ],
  items: [
    {
      id: "1",
      categoryId: "1",
      name: "コーヒー",
      price: 500,
      description: "香り豊かなブレンドコーヒー",
      image: "https://placehold.co/300x300/png?text=Coffee",
    },
    {
      id: "2",
      categoryId: "1",
      name: "紅茶",
      price: 450,
      description: "フレッシュな紅茶",
      image: "https://placehold.co/300x300/png?text=Tea",
    },
    {
      id: "3",
      categoryId: "2",
      name: "ハンバーガー",
      price: 800,
      description: "ジューシーなビーフパティ",
      image: "https://placehold.co/300x300/png?text=Burger",
    },
    {
      id: "4",
      categoryId: "2",
      name: "サンドイッチ",
      price: 600,
      description: "新鮮な野菜とハム",
      image: "https://placehold.co/300x300/png?text=Sandwich",
    },
  ],
};

export const Default: Story = {
  args: {
    menuData: sampleMenuData,
  },
  parameters: {
    docs: {
      description: {
        story:
          "デフォルトのMenu表示です。ドリンクとフードのカテゴリに分かれて商品が表示されます。",
      },
    },
  },
};

export const EmptyMenu: Story = {
  args: {
    menuData: {
      categories: [],
      items: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: "商品がない状態のMenuです。",
      },
    },
  },
};

export const SingleCategory: Story = {
  args: {
    menuData: {
      categories: [{ id: "1", name: "ドリンク", categoryId: "2" }],
      items: [
        {
          id: "1",
          categoryId: "1",
          name: "コーヒー",
          price: 500,
          description: "香り豊かなブレンドコーヒー",
          image: "https://placehold.co/300x300/png?text=Coffee",
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: "1つのカテゴリのみを表示するMenuです。",
      },
    },
  },
};
