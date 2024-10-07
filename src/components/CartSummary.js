import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

const CartSummary = () => {
  const { state, dispatch } = useCart();

  const removeFromCart = (item) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: item });
  };

  const updateQuantity = (item, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { ...item, quantity } });
  };

  const totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Shopping Cart</h3>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {state.items.map((item) => (
            <div key={item._id} className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{item.name}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item, parseInt(e.target.value))}
                      className="w-16 rounded border-gray-300"
                    />
                    x ${item.price.toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <div className="text-lg font-medium text-gray-900">Total: ${totalAmount.toFixed(2)}</div>
        <Link
          to="/checkout"
          className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;