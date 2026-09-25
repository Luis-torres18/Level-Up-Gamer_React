import { useState } from "react";
import Header from "../Components/Header";

function Home() {

    const [count, setCount] = useState(0)
    
    const aumentarContador = () => {
        setCount(count+1)
    }

    const disminuirContador = () => {
        setCount(count-1)
    }

    const texto = <div>
        <h1>Hola Mundo</h1>
        <p>Bajada...</p>
    </div>

    return <>
        <Header></Header>   

        <div>
            <p>{texto}</p>
        </div>
        <div>
            Carrito({count})
        </div>
        <div>
            <button onClick={()=> aumentarContador()}>Agregar al Carrito</button>
            <button onClick={()=> disminuirContador()}>Eliminar  al Carrito</button>
        </div>

        <footer></footer>
    </>
}

export default Home;