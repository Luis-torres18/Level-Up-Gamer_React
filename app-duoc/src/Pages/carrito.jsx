import '/src/index.css'

function Carrito() {
    
    return <>

        <main className="cart-main">
            <h1>MI CARRITO DE COMPRAS</h1>

            <div className="cart-layout">
            
            <section className="cart-items-container" id="cart-items-wrapper">
            
            </section>

            <aside className="cart-summary">
                <h2>RESUMEN DEL PEDIDO</h2>
                
                <div className="summary-row">
                <span>Subtotal</span>
                <span id="cart-subtotal">$0</span>
                </div>

                <div className="summary-row">
                <span>Descuento</span>
                <span id="cart-discount">$0</span>
                </div>

                <div className="summary-total">
                <span>TOTAL:</span>
                <span id="cart-total">$0</span>
                </div>

                <button type="button" id="btn-pagar" className="btn-checkout">Pagar Pedido</button>
            </aside>
            </div>
        </main>

    </>
}

export default Carrito;