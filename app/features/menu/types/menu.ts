import { MenuItem, Category } from "./item";

export interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

export interface MenuProps {
  menuData: MenuData;
}
