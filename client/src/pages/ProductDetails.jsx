import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiShoppingBag,
  FiMinus,
  FiPlus,
  FiCheckCircle,
} from "react-icons/fi";
import api from "../utils/axios";
import { extractOne } from "../utils/apiShape";
import { useCart } from "../hooks/useCart";
import { PLACEHOLDER_IMAGE, resolveImageUrl } from "../utils/image";
import { useToast } from "../hooks/useToast";

export default function ProductDetails() {
  const { addToCart } = useCart();
  const toast = useToast();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI states
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);

  /**
   * Fetch product
   */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        const productData = extractOne(data);

        const normalized = {
          ...productData,
          images: (productData.images || [])
            .map((img) => resolveImageUrl(img, ""))
            .filter(Boolean),
          image: resolveImageUrl(
            [productData.image, ...(productData.images || [])],
            PLACEHOLDER_IMAGE
          ),
          countInStock:
            typeof productData.countInStock === "number"
              ? productData.countInStock
              : typeof productData.stock === "number"
                ? productData.stock
                : 0,
        };

        setProduct(normalized);
        setSelectedVariant(normalized.variants?.[0] || null);
      } catch (err) {
        setError("Imeshindikana kupakia bidhaa 😔");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /**
   * Derived stock
   */
  const availableStock = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant) return selectedVariant.stock;
    return product.countInStock || 0;
  }, [product, selectedVariant]);

  /**
   * Add to cart (hook placeholder)
   * una-connect na global cart store / context
   */
  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: selectedVariant?.price || product.price,
      image: product.images?.[0] || product.image,
      qty,
      stock: availableStock,
      variant: selectedVariant,
    });
    toast.success("Product added to cart");
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-gray-500">
        Inapakia bidhaa...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-32 text-center text-red-500">
        {error || "Bidhaa haijapatikana"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-14">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-14">
        {/* ================= GALLERY ================= */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden bg-gray-100 shadow"
          >
            <img
              src={product.images?.[activeImage] || product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
              className="w-full aspect-square object-cover"
            />
          </motion.div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button
                  aria-label="View image thumbnail"
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                    activeImage === i
                      ? "border-pink-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= INFO ================= */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

          <p className="text-pink-600 font-extrabold text-xl md:text-2xl mt-3">
            TZS{" "}
            {(selectedVariant?.price || product.price).toLocaleString()}
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* ================= VARIANTS ================= */}
          {product.variants?.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold mb-3">Chagua Aina</h3>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 md:px-4 py-2 rounded-full border transition text-sm md:text-base ${
                      selectedVariant?._id === v._id
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white hover:border-pink-300"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= STOCK ================= */}
          <div className="mt-6 flex items-center gap-2 text-sm">
            {availableStock > 0 ? (
              <>
                <FiCheckCircle className="text-green-500" />
                <span>{availableStock} available</span>
              </>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </div>

          {/* ================= QUANTITY ================= */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border rounded-full">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-3"
              >
                <FiMinus />
              </button>
              <span className="px-4 font-medium">{qty}</span>
              <button
                aria-label="Increase quantity"
                onClick={() =>
                  setQty((q) => Math.min(availableStock, q + 1))
                }
                className="p-3"
              >
                <FiPlus />
              </button>
            </div>
          </div>

          {/* ================= CTA ================= */}
          <div className="mt-8">
            <button
              onClick={handleAddToCart}
              disabled={availableStock === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-pink-600 transition disabled:opacity-50"
            >
              <FiShoppingBag />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
