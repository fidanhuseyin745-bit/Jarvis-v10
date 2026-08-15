import { useState } from 'react';

export default function App(){

const[count,setCount]=useState(0);

return(
<div style={{padding:30}}>
<h1>Jarvis React</h1>

<button onClick={()=>setCount(count+1)}>
Count {count}
</button>

</div>
);

}

app.use('/auth', authRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
