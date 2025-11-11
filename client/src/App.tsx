import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>CRM CGM - Proyecto Limpio</h1>
      <p>Contador de prueba: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Incrementar
      </button>
      <p style={{ marginTop: '2rem', color: '#666' }}>
        ✅ Proyecto frontend básico funcionando
      </p>
    </div>
  );
}

export default App;
