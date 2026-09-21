export const DEFAULT_CATEGORIES = [
  "Controller",
  "Keyboard",
  "Mouse",
  "Headset",
  "Accessory",
];

export const initialProductForm = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  date: "",
  category: "",
  tags: "",
};

// Tags are now kept as subcategory_ids.
// subcategoryIds must be resolved by the caller from the tag names
// that match the subcategories of the selected category.
export function toPayload(form, categoryId, subcategoryIds = []) {
  return {
    product_name: form.name,
    description: form.description,
    price: Number(form.price),
    stock: Number(form.quantity),
    category_id: categoryId,
    subcategory_ids: subcategoryIds,
  };
}

export function fromDoc(doc) {
  return {
    id: doc._id,
    name: doc.product_name,
    description: doc.description,
    price: doc.price,
    quantity: doc.stock,
    category: doc.category_id?.category_name ?? doc.category ?? "",
    categoryId: doc.category_id?._id ?? doc.categoryId ?? "",
    // Tags map to subcategory names. Requires subcategory_ids to be populated.
    tags: Array.isArray(doc.subcategory_ids)
      ? doc.subcategory_ids
          .map((sub) =>
            sub && typeof sub === "object" && sub.subcategory_name
              ? sub.subcategory_name
              : null,
          )
          .filter(Boolean)
      : doc.tags ?? [],
    date: doc.date ? new Date(doc.date).toISOString().slice(0, 10) : "",
    image_url: doc.image_url ?? "",
    images: Array.isArray(doc.images) ? doc.images : [],
    createdAt: doc.createdAt || doc._id || "",
  };
}

export function validateProduct(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Name is required";
  if (!values.description.trim()) errors.description = "Description is required";

  if (values.price === "") {
    errors.price = "Price is required";
  } else if (Number(values.price) <= 0) {
    errors.price = "Price must be greater than 0";
  }

  if (values.quantity === "") {
    errors.quantity = "Quantity is required";
  } else if (Number(values.quantity) <= 0) {
    errors.quantity = "Quantity must be greater than 0";
  } else if (!Number.isInteger(Number(values.quantity))) {
    errors.quantity = "Quantity must be a whole number";
  }

  if (!values.date) errors.date = "Date is required";
  if (!values.category) errors.category = "Category is required";

  return errors;
}