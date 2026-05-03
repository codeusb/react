import {createElement, useEffect, useState} from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const createElementProbe = createElement('span', {
    hidden: true,
    'data-react-source': 'createElement',
  });

  useEffect(() => {
    console.log('render', count);
  }, [count]);

  return (
    <>
      {createElementProbe}
      <div onClick={() => setCount(count + 1)}>{count}</div>
    </>
  );
}

export default App;
