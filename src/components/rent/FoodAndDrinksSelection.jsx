import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCategory } from "../../features/fnbs/fnbsSlice";
import { FaPlus, FaMinus } from "react-icons/fa";

// Helper untuk format harga
const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace(/\s/g, "");

const FoodAndDrinksSelection = ({
  selections,
  onSelectionChange,
  onNextStep,
}) => {
  const dispatch = useDispatch();
  const { items, categories, selectedCategory, status } = useSelector(
    (state) => state.fnbs
  );
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

  // Memfilter item F&B berdasarkan kategori yang dipilih
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all" || !selectedCategory) {
      return items;
    }
    // Filter berdasarkan nama kategori dari relasi
    return items.filter(
      (item) => item.fnb_category?.category === selectedCategory
    );
  }, [items, selectedCategory]);

  // Handler untuk mengubah kuantitas item
  const handleQuantityChange = (item, delta) => {
    const currentQuantity =
      selections.find((s) => s.id === item.id)?.quantity || 0;
    const newQuantity = currentQuantity + delta;

    if (newQuantity < 0) return; // Kuantitas tidak boleh negatif

    onSelectionChange(item, newQuantity);
  };

  return (
    <div className="mt-8 w-full">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-minecraft text-theme-primary">Food & Drinks</h3>
        <p className="text-theme-secondary mt-2">
          Tambahkan pesanan untuk menemani sesimu.
        </p>
      </div>

      {/* Tombol Filter Kategori */}
      <div className="flex justify-center flex-wrap gap-2 mb-8">
        <button
          onClick={() => dispatch(setSelectedCategory("all"))}
          className={`btn btn-sm capitalize text-base ${selectedCategory === "all"
            ? "bg-brand-gold text-white"
            : "btn-ghost"
            }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => dispatch(setSelectedCategory(cat.category))}
            className={`btn btn-sm capitalize text-base ${selectedCategory === cat.category
              ? "bg-brand-gold text-white"
              : "btn-ghost"
              }`}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Tampilan Loading */}
      {status === "loading" && (
        <div className="text-center p-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Tampilan Sukses dengan Grid Item */}
      {status === "succeeded" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const selectedItem = selections.find((s) => s.id === item.id);
              const quantity = selectedItem?.quantity || 0;

              return (
                <div
                  key={item.id}
                  className={`card card-side bg-base-100 shadow-lg transition-all duration-300 ${quantity > 0
                    ? "border-2 border-brand-gold"
                    : "border-2 border-transparent"
                    }`}
                >
                  <figure className="w-1/3">
                    <img
                      src={
                        item.image
                          ? `${imageBaseUrl}/${item.image}`
                          : "/images/fnb-placeholder.png"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </figure>
                  <div className="card-body w-2/3 p-4">
                    <h2 className="card-title text-base">{item.name}</h2>
                    <p className="text-base font-bold text-brand-gold">
                      {formatPrice(item.price)}
                    </p>
                    <div className="card-actions justify-end items-center mt-2">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        className="btn btn-sm btn-ghost btn-circle"
                        disabled={quantity === 0}
                      >
                        <FaMinus />
                      </button>
                      <span className="font-bold text-base w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="btn btn-sm btn-ghost btn-circle"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onNextStep}
              className="btn w-full bg-brand-gold text-white font-minecraft tracking-wider"
            >
              Continue to Payment
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FoodAndDrinksSelection;
