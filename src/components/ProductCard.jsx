import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../lib/api.js";
import { addToCart } from "../lib/cartApi.js";
import { useToast } from "../context/useToast.js";
import { useCart } from "../context/CartContext.jsx";
import { Price, Stars } from "./ProductBits.jsx";
import { discountPercent, formatMoney } from "../lib/format.js";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const showToast = useToast();
  const { addToGuestCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
        ? [product.thumbnail]
        : [];

  const [index, setIndex] = useState(0);
  const goTo = (i) => setIndex((i + images.length) % images.length);

  const handleAddToCart = async () => {
    if (adding || added) return;

    // Guest user: save pending action and redirect to login
    const redirectToLogin = () => {
      sessionStorage.setItem(
        "pending_action",
        JSON.stringify({ type: "add_to_cart", productId: product.id }),
      );
      navigate("/login", { state: { returnTo: "/cart" } });
    };
    if (!getAccessToken()) {
      redirectToLogin();
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      showToast("Product added to cart successfully.", "success");
      window.dispatchEvent(new Event("cart-updated"));
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      // Session expired and the refresh token was rejected: log in again,
      // then the product is added to the cart.
      if (err.status === 401) {
        showToast("Your session expired. Please log in again.", "error");
        redirectToLogin();
        return;
      }
      showToast(err.message || "Failed to add to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  const discount = discountPercent(product);
  const stock = Number(product.stock_quantity) || 0;
  const specs = [product.brand_name, product.color, product.size]
    .filter((v) => v && v !== "—")
    .join(" · ");

  return (
    <div className="group/card bg-white flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-gray-50">
        {images.length > 0 ? (
          <img
            src={images[index]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover mix-blend-multiply"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-pf-text-light">
            No image
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-pf-deal-red text-white text-xs font-bold px-2 py-1 rounded-sm">
            -{discount}%
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-pf-text opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
              aria-label="Previous image"
              onClick={() => goTo(index - 1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-pf-text opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
              aria-label="Next image"
              onClick={() => goTo(index + 1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${i === index ? "w-4 bg-pf-text" : "w-1.5 bg-pf-text/30"}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col flex-1 gap-1.5 p-4">
        {product.category_name && (
          <p className="text-xs text-pf-text-light uppercase tracking-wide">
            {product.category_name}
          </p>
        )}

        <h2 className="text-base font-medium leading-snug text-pf-text line-clamp-2" title={product.name}>
          {product.name}
        </h2>

        {product.short_description && (
          <p className="text-sm text-pf-text-light leading-snug line-clamp-2">
            {product.short_description}
          </p>
        )}

        {product.rating != null && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-pf-text">{Number(product.rating).toFixed(1)}</span>
            <Stars rating={product.rating} />
            <span className="text-pf-link">({product.reviews_count ?? 0})</span>
          </div>
        )}

        <div className="flex items-baseline flex-wrap gap-x-2 mt-1">
          <Price value={product.discount_price || product.price} className="text-base" />
          {discount > 0 && (
            <span className="text-xs text-pf-text-light">
              List: <span className="line-through">{formatMoney(product.price)}</span>
            </span>
          )}
        </div>

        {specs && <p className="text-xs text-pf-text-light">{specs}</p>}

        <p className="text-sm mt-auto pt-1">
          {stock <= 0 ? (
            <span className="text-pf-deal-red font-medium">Currently unavailable</span>
          ) : stock <= 5 ? (
            <span className="text-pf-deal-red">Only {stock} left in stock — order soon.</span>
          ) : (
            <span className="text-pf-badge-green">In Stock</span>
          )}
        </p>

        <button
          type="button"
          className={`mt-2 w-full rounded-full py-2 text-sm font-medium shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed ${
            added
              ? "bg-pf-badge-green text-white"
              : "bg-pf-cta hover:bg-pf-cta-hover text-pf-text disabled:bg-gray-200 disabled:text-gray-500"
          }`}
          disabled={adding || added || stock <= 0}
          onClick={handleAddToCart}
        >
          {adding ? "Adding..." : added ? "✓ Added to Cart" : stock <= 0 ? "Out of stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
