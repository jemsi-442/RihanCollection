import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiFilter,
  FiSearch,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";
import api from "../utils/axios";
import { extractList } from "../utils/apiShape";
import { useCart } from "../hooks/useCart";
import { PLACEHOLDER_IMAGE, resolveImageUrl } from "../utils/image";
import { ProductGridSkeleton } from "../components/Skeleton";
import { useToast } from "../hooks/useToast";

/**
 * API BASE
 * badilisha kama unatumia proxy au env
 */
/**
 * PRICE RANGES (realistic retail buckets)
 */
const PRICE_RANGES = [
  { label: "All", value: "all" },
  { label: "Under 50k", value: "0-50000" },
  { label: "50k - 100k", value: "50000-100000" },
  { label: "100k+", value: "100000-1000000" },
];

export default function Shop() {
  const { addToCart } = useCart();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);

  /**
   * Fetch products
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/products");
        const rawProducts = extractList(data, ["products", "items"]);

        const normalizedProducts = rawProducts.map((p) => ({
          ...p,
          image: resolveImageUrl([p.image, ...(p.images || [])], PLACEHOLDER_IMAGE),
          countInStock:
            typeof p.countInStock === "number"
              ? p.countInStock
              : typeof p.stock === "number"
                ? p.stock
                : 0,
        }));

        setProducts(normalizedProducts);
      } catch (err) {
        setError("Imeshindikana kupakia bidhaa 😔");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /**
   * FILTER LOGIC (memoized – performance matters)
   */
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => (p.name || "").toLowerCase().includes(search.toLowerCase()))
      .filter((p) => {
        if (price === "all") return true;
        const [min, max] = price.split("-").map(Number);
        return p.price >= min && p.price <= max;
      })
      .filter((p) => (inStockOnly ? p.countInStock > 0 : true));
  }, [products, search, price, inStockOnly]);

  const handleAddToCart = (product) => {
    if (product.countInStock <= 0) return;

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
      stock: product.countInStock,
      variant: null,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-14">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Shop • Pochi za Wanawake 🌸
          </h1>
          <p className="text-gray-500 mt-1">
            Chagua pochi inayokufaa – elegance & quality.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tafuta pochi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border focus:ring-2 focus:ring-pink-400 outline-none"
          />
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 md:gap-4 mb-8 md:mb-10 bg-gray-50 p-4 rounded-2xl">
        <div className="flex items-center gap-2 font-medium">
          <FiFilter /> Filters
        </div>

        {/* Price */}
        <select
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 rounded-full border bg-white"
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Stock */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => setInStockOnly((v) => !v)}
            className="accent-pink-500"
          />
          In stock only
        </label>
      </div>

      {/* ================= CONTENT ================= */}
      {loading && <ProductGridSkeleton count={6} />}

      {error && (
        <div className="text-center py-20 text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          Hakuna bidhaa zinazolingana na vigezo ulivyochagua.
        </div>
      )}

      {/* ================= GRID ================= */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
        {filteredProducts.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
              <img
                src={p.image}
                alt={p.name}
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
              <button
                aria-label="Add to favorites"
                className="absolute top-3 right-3 bg-white/80 p-2 rounded-full hover:text-pink-500"
              >
                <FiHeart />
              </button>
            </div>

            {/* Info */}
            <div className="p-4 md:p-5">
              <h3 className="font-semibold text-lg line-clamp-1">
                {p.name}
              </h3>

              <p className="text-pink-600 font-bold mt-1">
                TZS {p.price.toLocaleString()}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {p.countInStock > 0
                  ? `${p.countInStock} available`
                  : "Out of stock"}
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link
                  to={`/product/${p._id}`}
                  className="flex-1 text-center border border-pink-500 text-pink-500 py-2 rounded-full hover:bg-pink-50 transition"
                >
                  View
                </Link>

                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={p.countInStock === 0}
                  className="flex items-center justify-center gap-2 flex-1 bg-pink-500 text-white py-2 rounded-full hover:bg-pink-600 transition disabled:opacity-50"
                >
                  <FiShoppingBag />
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
