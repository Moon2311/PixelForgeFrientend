import { useState } from "react";
import { getAccessToken } from "../lib/api.js";
import { addToCart } from "../lib/cartApi.js";
import { useToast } from "../context/useToast.js";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const showToast = useToast();
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
    if (!getAccessToken()) {
      showToast("Please log in to add items to your cart", "error");
      return;
    }
    if (adding || added) return;

    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      showToast("Product added to cart successfully.", "success");
      // Dispatch custom event so Navbar can refresh cart count
      window.dispatchEvent(new Event("cart-updated"));
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      showToast(err.message || "Failed to add to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {images.length > 0 ? (
          <img src={images[index]} alt={product.name} />
        ) : (
          <div className="no-image">No image</div>
        )}

        {product.discount_price && (
          <span className="discount-badge">
            Sale
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="img-nav img-prev"
              aria-label="Previous image"
              onClick={() => goTo(index - 1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              type="button"
              className="img-nav img-next"
              aria-label="Next image"
              onClick={() => goTo(index + 1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <div className="img-dots">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`dot${i === index ? " active" : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="product-content">
        <p className="category">{product.category_name}</p>

        <h2>{product.name}</h2>

        <p className="description">
          {product.short_description}
        </p>

        <div className="rating">
          ⭐ {product.rating}
          <span>({product.reviews_count} Reviews)</span>
        </div>

        <div className="price-section">
          {product.discount_price ? (
            <>
              <span className="discount-price">
                ${product.discount_price}
              </span>

              <span className="original-price">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="price">
              ${product.price}
            </span>
          )}
        </div>

        <div className="details">
          <span>
            <strong>Brand:</strong> {product.brand_name}
          </span>

          <span>
            <strong>Color:</strong> {product.color}
          </span>

          <span>
            <strong>Storage:</strong> {product.size}
          </span>
        </div>

        <div className="stock">
          {product.stock_quantity > 0 ? (
            <span className="in-stock">
              ✔ In Stock ({product.stock_quantity})
            </span>
          ) : (
            <span className="out-stock">
              Out of Stock
            </span>
          )}
        </div>

        <button
          className={`buy-btn${added ? " buy-btn-added" : ""}`}
          disabled={adding || added || product.stock_quantity <= 0}
          onClick={handleAddToCart}
        >
          {adding ? "Adding..." : added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
