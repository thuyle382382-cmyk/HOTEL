import React, { useEffect, useState } from 'react';
import itemService from '../services/itemService';
import ItemForm from '../components/ItemForm';

function ItemList() {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    const data = await itemService.getItems();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (item) => {
    await itemService.createItem(item);
    fetchItems();
  };

  return (
    <div>
      <ItemForm onAddItem={handleAddItem} />
      <ul>
        {items.map(item => (
          <li key={item._id}>
            <strong>{item.name}</strong>
            {item.description && <>: {item.description}</>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
