import menuData from "../data/menu.json";

const Menu = () => {
  return (
    <div>
      {menuData.categories.map((category) => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          <ul>
            {menuData.items
              .filter((item) => item.categoryId === category.id)
              .map(({ id, name, description, price, image }) => (
                <li key={id}>
                  <h3>{name}</h3>
                  <p> {description}</p>
                  <p>{price}円</p>
                  <img src={image} alt={name} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Menu;
