import React from "react";
import { Link } from "@remix-run/react";

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
    <div className="container mx-auto py-4">
      {menuData.categories.map((category) => (
        <div key={category.id} className="mb-8">
          <h2 className="text-2xl font-bold mb-">{category.name}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {menuData.items
              .filter((item) => item.categoryId === category.id)
              .map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition duration-300 bg-white"
                >
                  <Link to={`/menu/${item.id}`}>
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-gray-800">{item.price}円</p>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-md mt-2"
                    />
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

console.log("test");
export default Menu;
