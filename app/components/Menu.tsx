import React from "react";
import { Link } from "@remix-run/react";
import { FaWineBottle, FaHamburger } from "react-icons/fa";

interface MenuItem {
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

interface Category {
  id: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
}

interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

interface MenuProps {
  menuData?: MenuData;
}

const Menu: React.FC<MenuProps> = ({ menuData }) => {
  return (
    <div className="container mx-auto py-4">
      {menuData?.categories.map((category) => (
        <div key={category.id} className="mb-8">
          <h2 className="text-2xl mb-4 font-bold flex items-center">
            {category.name}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {menuData.items
              .filter((item) => item.categoryId === category.categoryId)
              .map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition duration-300 bg-white"
                >
                  <Link to={`/menu/${item.id}`} className="flex">
                    <img
                      src={item.image.url}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-md mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <p className="text-gray-600">{item.description}</p>
                      <p className="text-gray-800">{item.price}円</p>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export type { MenuItem, Category };
export default Menu;
