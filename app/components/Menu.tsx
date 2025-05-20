import React from "react";

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
}

interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

interface MenuProps {
  menuData: MenuData;
}

const Menu: React.FC<MenuProps> = ({ menuData }) => {
  return (
    <div>
      {menuData.categories.map((category) => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          <ul>
            {menuData.items
              .filter((item) => item.categoryId === category.id)
              .map((item) => (
                <li key={item.id}>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <p>{item.price}円</p>
                  <img src={item.image} alt={item.name} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Menu;
