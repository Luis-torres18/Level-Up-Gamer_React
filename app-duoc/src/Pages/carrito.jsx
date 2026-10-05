import Header from "../Components/Header";
import '/src/index.css'

function carrito() {
    
    return <>

        <header></header>

        <main class="cart-main">
            <h1 style="font-family: var(--font-title); margin-bottom: 2rem; font-size: 2rem;">MI CARRITO DE COMPRAS</h1>

            <div class="cart-layout">
            
            <section class="cart-items-container" id="cart-items-wrapper">
            
            </section>

            <aside class="cart-summary">
                <h2>RESUMEN DEL PEDIDO</h2>
                
                <div class="summary-row">
                <span>Subtotal</span>
                <span id="cart-subtotal">$0</span>
                </div>

                <div class="summary-row">
                <span>Descuento</span>
                <span id="cart-discount">$0</span>
                </div>

                <div class="summary-total">
                <span>TOTAL:</span>
                <span id="cart-total">$0</span>
                </div>

                <button type="button" id="btn-pagar" class="btn-checkout" style="margin-top: 1.5rem;">Pagar Pedido</button>
            </aside>
            </div>
        </main>
    </>
}

export default carrito;