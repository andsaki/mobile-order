import { Link } from "@remix-run/react";
import React from "react";

import { MenuProps } from "../types/menu";

const Menu: React.FC<MenuProps> = ({ menuData }) => {
  return (
    <div className="container mx-auto py-4">
      {menuData?.categories.map((category) => (
        <div key={category.id} className="mb-8">
          <h2 className="text-2xl mb-4 font-bold flex items-center">
            {category.name}
            {category.name === "フード" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 ml-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12H3m18 0c-1.48-2.74-4.239-4.95-7.439-5.74l-.811-.18A5.505 5.505 0 008 3.5c-2.793.456-4.91 2.973-4.91 5.798 0 .216.012.428.035.635l-.93.326C1.48 10.511 1 11.205 1 12s.48 1.489 1.194 1.74l.93.327c-.023.206-.035.417-.035.633 0 2.588 1.707 4.783 4.049 5.512l.257.074c.284.075.566.139.843.191 1.101.202 2.257.308 3.443.308 1.186 0 2.342-.106 3.443-.308.277-.052.559-.116.843-.191l.257-.074c2.342-.729 4.049-2.924 4.049-5.512 0-.216-.012-.427-.035-.633l.93-.327C22.52 13.489 23 12.795 23 12s-.48-1.489-1.194-1.74l-.93-.326c.023-.207.035-.419.035-.635 0-2.825-2.117-5.342-4.91-5.798a5.505 5.505 0 00-2.75 2.582l-.811.18C9.239 7.05 6.48 9.26 5 12h16z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h0"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12h0"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.5 14.5c0 1.38.559 2.632 1.464 3.536A5.506 5.506 0 0016.5 19.5c2.795-.458 4.91-2.979 4.91-5.798 0-.589-.044-1.16-.127-1.702H2.717c-.083.542-.127 1.113-.127 1.702 0 2.819 2.115 5.34 4.91 5.798a5.506 5.506 0 003.536-1.464A4.982 4.982 0 0011.5 14.5z"
                />
              </svg>
            )}
            {category.name === "ドリンク" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 ml-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
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
