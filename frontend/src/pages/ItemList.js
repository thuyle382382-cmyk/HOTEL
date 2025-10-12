import React, { useEffect, useState } from 'react';
import ItemForm from '../components/ItemForm';
import mockItems from '../mock/mockItems';

function ItemList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    
    setItems(mockItems);
  }, []);

  const handleAddItem = (item) => {
    
    setItems(prev => [
      ...prev,
      {
        _id: (prev.length + 1).toString(),
        name: item.name,
        description: item.description,
        createdAt: new Date().toISOString()
      }
    ]);
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
