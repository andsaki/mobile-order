import { Link } from "@remix-run/react";
import React from "react";
import { IoFastFood } from "react-icons/io5";
import { MdLocalDrink } from "react-icons/md";

import { MenuProps } from "../types/menu";

const Menu: React.FC<MenuProps> = ({ menuData }) => {
  return (
    <div className="container mx-auto py-4">
      {menuData?.categories.map((category) => (
        <div key={category.id} className="mb-8">
          <h2 className="text-2xl mb-4 font-bold flex items-center">
            {category.name}
            {category.name === "フード" && (
              <IoFastFood className="ml-4 text-gray-600" size={24} />
            )}
            {category.name === "ドリンク" && (
              <MdLocalDrink className="ml-4 text-gray-600" size={24} />
            )}
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
                      <p className="text-gray-500">{item.description}</p>
                      <p className="text-black font-bold text-lg">
                        {item.price}円
                      </p>
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

export default Menu;
