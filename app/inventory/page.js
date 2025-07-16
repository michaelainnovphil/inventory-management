"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import React from "react";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { getUserFromToken } from "@/utils/auth";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [productForm, setProductForm] = useState({});
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDelAction, setLoadingDelAction] = useState(false);
  const [loadingaction, setLoadingaction] = useState(false);
  const [dropdown, setDropdown] = useState([]);
  const [search, setSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [groupByIssuedTo, setGroupByIssuedTo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [productToDelete, setProductToDelete] = useState(null);
const [userRole, setUserRole] = useState(null);

  const router = useRouter();
  const productRefs = React.useRef({});

const scrollToAndHighlight = (code) => {
  const row = productRefs.current[code];
  if (row) {
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    row.classList.add("bg-orange-300");

    setTimeout(() => {
      row.classList.remove("bg-orange-300");
    }, 3000); // Highlight for 3 seconds
  }
};
useEffect(() => {
  const user = getUserFromToken();
  if (user) {
    setUserRole(user.role);
  }
}, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const exportToExcel = () => {
  if (!filteredProducts || filteredProducts.length === 0) {
    toast.warn("No products to export");
    return;
  }

  const formattedProducts = filteredProducts.map((product) => ({
  "Product ID": product.code,
  "Asset Name": product.slug,
  "Serial Number": product.serial,
  "Category": product.category,
  "Branch": product.branch,
  "Issued To": Array.isArray(product.issued)
    ? product.issued.join(", ")
    : product.issued || "",
  "Status": product.status || "—",
  "Date of Purchase": product.purchaseDate
  ? new Date(product.purchaseDate).toISOString().split("T")[0]
  : "—",
  "Quantity": product.quantity || 0,
  "Unit Price": product.price || 0,
  "Total Price": (product.price || 0) * (product.quantity || 0),
}));


  // Capitalize the first letter of each key for headers
  const headers = Object.keys(formattedProducts[0]).map((key) =>
    key.charAt(0).toUpperCase() + key.slice(1)
  );

  const worksheet = XLSX.utils.json_to_sheet([]);
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
  XLSX.utils.sheet_add_json(worksheet, formattedProducts, {
    origin: "A2",
    skipHeader: true,
  });

  // Style header row (row 1)
  headers.forEach((_, index) => {
    const cellRef = XLSX.utils.encode_cell({ c: index, r: 0 });
    if (!worksheet[cellRef]) return;

    worksheet[cellRef].s = {
      fill: {
        patternType: "solid",
        fgColor: { rgb: "0a1f8f" }, // blue background
      },
      font: {
        color: { rgb: "FFFFFF" }, // white text
        bold: true,
      },
    };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(blob, "products.xlsx");
};

  const buttonAction = async (action, slug, initialQuantity) => {
    // Immediately change the quantity of the product with given slug in Products(only frontend)
    let index = products.findIndex((item) => item.slug == slug);
    let newProducts = JSON.parse(JSON.stringify(products));
    if (action == "plus") {
      newProducts[index].quantity = parseInt(initialQuantity) + 1;
    } else {
      if (newProducts[index].quantity === 0) return;
      newProducts[index].quantity = parseInt(initialQuantity) - 1;
    }
    setProducts(newProducts);

    // Immediately change the quantity of the product with given slug in Dropdown
    let indexdrop = dropdown.findIndex((item) => item.slug == slug);
    let newDropdown = JSON.parse(JSON.stringify(dropdown));
    if (action == "plus") {
      newDropdown[indexdrop].quantity = parseInt(initialQuantity) + 1;
    } else {
      newDropdown[indexdrop].quantity = parseInt(initialQuantity) - 1;
    }
    setDropdown(newDropdown);

    setLoadingaction(true);
    const response = await fetch("/api/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({ action, slug, initialQuantity }),
    });
    let r = await response.json();

    setLoadingaction(false);
  };

  const addProduct = async (e) => {
  e.preventDefault();

  const formToSubmit = {
    ...productForm,
    issued: productForm.issued
      ? productForm.issued.split(",").map((x) => x.trim())
      : [],
  };
  try {
    const url = "/api/product";
    const method = isEditing ? "PUT" : "POST";
    const body = isEditing
      ? JSON.stringify({ ...formToSubmit, _id: editingProductId })
      : JSON.stringify(formToSubmit);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body,
    });
    const result = await response.json();

    if (result.success) {
      toast.success(isEditing ? "Product updated!" : "Product added!");

      // Reset form
      setProductForm({
        code: "",
        slug: "",
        serial: "",
        quantity: "",
        price: "",
        category: "",
        branch: "",
        issued: "",
        status: "",
        purchaseDate: "",
      });
      setIsEditing(false);
      setEditingProductId(null);
    } else {
      toast.error(result.message ?? "Something went wrong");
    }
  } catch (error) {
    toast.error(error?.message || "Something went wrong!");
  }
  const calculateAge = (purchaseDate) => {
  if (!purchaseDate) return "N/A";

  const now = new Date();
  const purchase = new Date(purchaseDate);

  let years = now.getFullYear() - purchase.getFullYear();
  let months = now.getMonth() - purchase.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const yearText = years > 0 ? `${years} year${years !== 1 ? "s" : ""}` : "";
  const monthText = months > 0 ? `${months} month${months !== 1 ? "s" : ""}` : "";
  return [yearText, monthText].filter(Boolean).join(" ") || "0 months";
};

  // Fetch all products again to sync back
  const response = await fetch("/api/product", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "auth-token": localStorage.getItem("token"),
    },
  });
  const rjson = await response.json();
  setProducts(rjson.products);
};

  //[] bracket notation to compute an expression
  const handleChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const onDropdownEdit = async (e) => {
    let value = e.target.value;
    setQuery(value);

    if (value.length > 3) {
        setSearch(true);
        setLoading(true);
        setDropdown([]);

        const response = await fetch("/api/search?query=" + value, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("token"),
            },
        });

        const rjson = await response.json();

        // ✅ Deduplicate by Product ID (code) and Asset Name (slug)
        const unique = [];
        const seenCodes = new Set();

        for (const item of rjson.products) {
            const matchesQuery = item.slug.toLowerCase().includes(value.toLowerCase()) || item.code.includes(value);
            if (matchesQuery && !seenCodes.has(item.code)) {
                seenCodes.add(item.code);
                unique.push(item);
            }
        }

        setDropdown(unique);
        setLoading(false);
    } else {
        setSearch(false);
        setDropdown([]);
    }
};





  // ---------------DELETE FUNCTION----------------
  const handleDeleteProduct = async (id) => {


  try {
    const response = await fetch("/api/product", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify(id),
    });
    const rjson = await response.json();
    if (rjson.success === true) {
      toast.success("Successfully Deleted");
      setLoadingDelAction(!loadingDelAction);
    } else {
      toast.error(rjson.message ?? "Something went wrong");
    }
  } catch (error) {
    toast.error(error?.message || "Something went wrong!");
  }
};

const openProductModal = (product) => {
  setSelectedProduct(product);
  setShowModal(true);
};
const handleModalEdit = () => {
  if (!selectedProduct) return;
  setProductForm({
    code: selectedProduct.code || "",
    slug: selectedProduct.slug || "",
    serial: selectedProduct.serial || "",
    quantity: selectedProduct.quantity || "",
    price: selectedProduct.price || "",
    category: selectedProduct.category || "",
    branch: selectedProduct.branch || "",
    issued: Array.isArray(selectedProduct.issued)
      ? selectedProduct.issued.join(", ")
      : selectedProduct.issued || "",
    status: selectedProduct.status || "",
    purchaseDate: selectedProduct.purchaseDate || "",
  });

  setShowModal(false);
};

const calculateAge = (purchaseDate) => {
  if (!purchaseDate) return "N/A";

  const now = new Date();
  const purchase = new Date(purchaseDate);

  let years = now.getFullYear() - purchase.getFullYear();
  let months = now.getMonth() - purchase.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const yearText = years > 0 ? `${years} year${years !== 1 ? "s" : ""}` : "";
  const monthText = months > 0 ? `${months} month${months !== 1 ? "s" : ""}` : "";

  return [yearText, monthText].filter(Boolean).join(" ") || "0 months";
};




  useEffect(() => {
    // Fetch products on load
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/product", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        });
        let rjson = await response.json();

        if (rjson.success) {
          setProducts(rjson.products);
        } else {
          toast.error(rjson.message);
        }
      } catch (error) {
        toast.error(
          error instanceof Object && error.message
            ? error.message
            : error
            ? error
            : "Something went wrong!"
        );
      }
    };
    fetchProducts();
  }, [loadingDelAction]);



const filteredProducts = products.filter((product) => {
  const hasValidSlugOrCode = product.slug?.trim() || product.code?.trim();
  const matchesCategory = selectedCategory
    ? product.category === selectedCategory
    : true;
  return hasValidSlugOrCode && matchesCategory;
});

  // Compute total quantity per branch for horizontal bar chart
const branchQuantities = products.reduce((acc, product) => {
  const branch = product.branch || "Unknown";
  acc[branch] = (acc[branch] || 0) + (product.quantity || 0);
  return acc;
}, {});

const branchLabels = Object.keys(branchQuantities);
const branchData = Object.entries(branchQuantities).map(([branch, quantity], i) => ({
  label: branch,
  data: [quantity],
  backgroundColor: [
    ["#001a70", "#ff6510", "#f22f50", "#1aa6b7"][i % 4] // cycle through 4 colors
  ],
}));

const barChartData = {
  labels: ["Total Inventory per Branch"], // one grouped bar
  datasets: branchData,
};


const barChartOptions = {
  indexAxis: "y", // horizontal
  responsive: true,
  plugins: {
    legend: {
      display: true,  // 👈 force show legend
      position: "top",
      labels: {
        color: "#333",
        font: {
          size: 14,
          weight: "bold"
        }
      }
    },
    title: {
      display: true,
      text: "",
      font: {
        size: 18,
        weight: "bold"
      }
    }
  }
};


const totalInventory = products.reduce(
  (sum, product) => sum + (product.quantity || 0),
  0
);


// Compute total quantity per category for pie chart
const categoryQuantities = products.reduce((acc, product) => {
  const category = product.category || "Uncategorized";
  acc[category] = (acc[category] || 0) + (product.quantity || 0);
  return acc;
}, {});

const pieChartData = {
  labels: Object.keys(categoryQuantities),
  datasets: [
    {
      label: "Total Quantity",
      data: Object.values(categoryQuantities),
      backgroundColor: [
        "#001a70", // Blue
        "#ff6510", // Orange
        "#f22f50", // Red
        "#1aa6b7", // Green
        "#a78bfa", // Purple
        "#f472b6", // Pink
      ],
      borderWidth: 1,
    },
  ],
};


  return (
    <div className="md:p-6 w-full">
      <Header />
      {/* Display Current Stock  */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] grid-rows-[auto_1fr] gap-4 w-full">

        <div className="w-full col-span-1 md:col-span-2">
          <div className="container mx-auto w-full md:w-1/2  my-8  px-3 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Search a Product</h1>
        <div className="flex rounded-lg shadow-sm overflow-hidden ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-primary mb-4">

          <input
            onChange={onDropdownEdit}
            type="text"
            placeholder="Enter item"
               className="flex-1 px-4 py-2 text-sm md:text-base bg-white text-gray-700 focus:outline-none"

          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
    className="bg-gray-100 border-l border-gray-300 px-3 md:px-4 py-2 text-sm md:text-base text-gray-700 focus:outline-none"
          >
            <option value="">All</option>
            <option value="IT Equipment">IT Equipment</option>
            <option value="Furniture and Fixtures">Furniture and Fixtures</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="AHA Training">AHA Training Equipment</option>
                <option value="Appliances">Appliances</option>
                <option value="Reviewer Handbook">Reviewer Handbook</option>
                <option value="Freebies/Souvenirs">Freebies/Souvenirs</option>
                <option value="Others">Others</option>
          </select>
        </div>
        {loading && (
          <div className="flex justify-center items-center">
            {" "}
            <p>loading...</p>
          </div>
        )}
    <div className="dropcontainer absolute z-40 w-11/12 md:w-1/2 bg-white border border-gray-200 shadow-lg rounded-lg mt-2 overflow-y-auto max-h-60">
    {search && (dropdown.length > 0 ? (
        dropdown.map((item) => (
            <div
                key={item.code} // Use Product ID as the key
                onClick={() => {
                    scrollToAndHighlight(item.code); // Highlight based on Product ID
                    setSearch(false); // Close dropdown
                }}
                className="cursor-pointer px-4 py-2 border-b hover:bg-primary/10 transition-colors"
            >
                <div className="font-semibold text-gray-800 text-sm md:text-base">
                    {item.slug} ({item.quantity} pcs) – ₱{item.price * item.quantity}
                </div>
                <div className="text-xs text-gray-500">
                    ID: {item.code} | Issued To: {Array.isArray(item.issued) ? item.issued.join(", ") : item.issued || "N/A"}
                </div>
            </div>
        ))
    ) : (
        <div>Not found.</div>
    ))}
</div>


      </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 mb-4">
    <div className="flex items-center gap-2">
    <label htmlFor="groupToggle" className="font-medium text-gray-800">Group by Issuance</label>
    <input
      type="checkbox"
      id="groupToggle"
      checked={groupByIssuedTo}
      onChange={(e) => setGroupByIssuedTo(e.target.checked)}
      className="w-5 h-5 accent-blue-600"
    />
    </div>
    <button
    onClick={exportToExcel}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm transition"
    >
    Export to Excel
    </button>
    </div>


        <div className="<overflow-x-auto bg-white rounded-lg shadow-md p-4">

          
           <table className="min-w-full table-auto border border-gray-200 rounded-xl text-sm md:text-base shadow">

    <thead className="bg-primary text-white text-sm md:text-base">
    <tr>
      <th className="px-4 py-3 font-semibold">Product ID</th>
      <th className="px-4 py-3 font-semibold">Asset Name</th>
      <th className="px-4 py-3 font-semibold">Serial Number</th>
      <th className="px-4 py-3 font-semibold">Category</th>
      <th className="px-4 py-3 font-semibold">Branch</th>
      <th className="px-4 py-3 font-semibold">Issued to</th>
      <th className="px-4 py-3 font-semibold">Status</th>
      <th className="px-4 py-3 font-semibold">Age</th>
      <th className="px-4 py-3 font-semibold text-center">Qty</th>
      <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
      <th className="px-4 py-3 font-semibold text-right">Total Price</th>
      <th className="px-4 py-3 font-semibold text-center">Action</th>
    </tr>
    </thead>

    <tbody className="divide-y divide-gray-100">
    {groupByIssuedTo ? (
      Object.entries(
        products
          .filter((product) =>
            selectedCategory ? product.category === selectedCategory : true
          )
          .reduce((acc, product) => {
            const issuedList = Array.isArray(product.issued)
              ? product.issued
              : [product.issued || "Unassigned"];
            issuedList.forEach((person) => {
              if (!acc[person]) acc[person] = [];
              acc[person].push(product);
            });
            return acc;
          }, {})
      ).map(([issuedTo, group]) => (
        <React.Fragment key={issuedTo}>
          <tr className="bg-orange-500 text-white">
            <td colSpan="12" className="px-5 py-3 font-semibold">
              {issuedTo}
            </td>
          </tr>
          {group.map((product) => (
            <tr
              ref={(el) => (productRefs.current[product.code] = el)}
              key={product._id || product.code}
              onClick={() => openProductModal(product)}
              className="even:bg-gray-50 hover:bg-blue-50 transition cursor-pointer"
            >
              <td className="px-5 py-3 text-center">{product.code || "—"}</td>
              <td className="px-5 py-3 text-center">{product.slug || "—"}</td>
              <td className="px-5 py-3 text-center">{product.serial || "—"}</td>
              <td className="px-5 py-3 text-center">{product.category || "—"}</td>
              <td className="px-5 py-3 text-center">{product.branch || "—"}</td>
              <td className="px-5 py-3 text-center">
                {Array.isArray(product.issued)
                  ? product.issued.join(", ")
                  : product.issued || "—"}
              </td>
              <td className="px-5 py-3 text-center">{product.status || "—"}</td>
              <td className="px-5 py-3 text-center">{calculateAge(product.purchaseDate)}</td>
              <td className="px-5 py-3 text-center">{product.quantity || 0}</td>
              <td className="px-5 py-3 text-right">₱{product.price || 0}</td>
              <td className="px-5 py-3 text-right">
                ₱{(product.price || 0) * (product.quantity || 0)}
              </td>
              <td className="px-5 py-3 text-center text-red-600 text-2xl">
                <MdDelete
                  onClick={(e) => {
                    e.stopPropagation();
                    setProductToDelete(product);
                    setShowDeleteModal(true);
                  }}
                  className="cursor-pointer"
                />
              </td>
            </tr>
          ))}
        </React.Fragment>
      ))
    ) : (
      products
        .filter((product) =>
          selectedCategory ? product.category === selectedCategory : true
        )
        .sort((a, b) => {
          const catA = a.category?.toLowerCase() || "";
          const catB = b.category?.toLowerCase() || "";
          const codeA = a.code?.toLowerCase() || "";
          const codeB = b.code?.toLowerCase() || "";

          if (catA < catB) return -1;
          if (catA > catB) return 1;
          return codeA.localeCompare(codeB);
        })
        .map((product) => (
          <tr
            ref={(el) => (productRefs.current[product.code] = el)}
            key={product._id || product.code}
            onClick={() => openProductModal(product)}
            className="hover:bg-blue-50 transition cursor-pointer"
          >
            <td className="px-4 py-2 text-center">{product.code || "—"}</td>
            <td className="px-4 py-2 text-center">{product.slug || "—"}</td>
            <td className="px-4 py-2 text-center">{product.serial || "—"}</td>
            <td className="px-4 py-2 text-center">{product.category || "—"}</td>
            <td className="px-4 py-2 text-center">{product.branch || "—"}</td>
            <td className="px-4 py-2 text-center">
              {Array.isArray(product.issued)
                ? product.issued.join(", ")
                : product.issued || "—"}
            </td>
            <td className="px-4 py-2 text-center">{product.status || "—"}</td>
            <td className="px-4 py-2 text-center">{calculateAge(product.purchaseDate)}</td>
            <td className="px-4 py-2 text-center">{product.quantity || 0}</td>
            <td className="px-4 py-2 text-right">₱{product.price || 0}</td>
            <td className="px-4 py-2 text-right">
              ₱{(product.price || 0) * (product.quantity || 0)}
            </td>
            <td className="px-4 py-2 text-center text-red-600 text-2xl">
              <MdDelete
                onClick={(e) => {
                  e.stopPropagation();
                  setProductToDelete(product);
                  setShowDeleteModal(true);
                }}
                className="cursor-pointer"
              />
            </td>
          </tr>
        ))
    )}
    </tbody>
    </table>

          </div>
        </div>
      </div>
      {isEditing && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-modal-in">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Product</h2>
      <form onSubmit={addProduct} className="space-y-4">
        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
          <input
            value={productForm.code || ""}
            name="code"
            onChange={handleChange}
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>
        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
          <input
            value={productForm.slug || ""}
            name="slug"
            onChange={handleChange}
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>
        {/* Add all remaining fields the same way */}
        <div>
        <label htmlFor="productSerial" className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
        <input
          value={productForm?.serial || ""}
          name="serial"
          onChange={handleChange}
          type="text"
          id="productSerial"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
          value={productForm?.quantity || ""}
          name="quantity"
          onChange={handleChange}
          type="number"
          id="quantity"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
        <input
          value={productForm?.price || ""}
          name="price"
          onChange={handleChange}
          type="number"
          id="price"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          id="category"
          name="category"
          value={productForm?.category || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-primary focus:border-primary"
        >
          <option value="">Select Category</option>
          <option value="IT Equipment">IT Equipment</option>
          <option value="Furniture and Fixtures">Furniture and Fixtures</option>
          <option value="Office Supplies">Office Supplies</option>
          <option value="AHA Training">AHA Training Equipment</option>
          <option value="Appliances">Appliances</option>
          <option value="Reviewer Handbook">Reviewer Handbook</option>
          <option value="Freebies/Souvenirs">Freebies/Souvenirs</option>
          <option value="Others">Others</option>

        </select>
      </div>

      <div>
        <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
        <select
          id="branch"
          name="branch"
          value={productForm?.branch || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-primary focus:border-primary"
        >
          <option value="">Select Branch</option>
          <option value="Makati">Makati</option>
          <option value="Naga">Naga</option>
          <option value="Both">Both</option>
        </select>
      </div>

      <div>
        <label htmlFor="issued" className="block text-sm font-medium text-gray-700 mb-1">Issued to</label>
        <input
          value={productForm?.issued || ""}
          name="issued"
          onChange={handleChange}
          type="text"
          id="issued"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          id="status"
          name="status"
          value={productForm?.status || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-primary focus:border-primary"
        >
          <option value="">Select Status</option>
          <option value="Deployed/In Use">Deployed/In Use</option>
          <option value="Spare">Spare</option>
          <option value="Defective">Defective</option>
        </select>
      </div>

      <div>
        <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
        <input
          type="date"
          id="purchaseDate"
          name="purchaseDate"
          value={productForm.purchaseDate || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
        />
      </div>
      
        {/* Submit + Cancel */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setProductForm({});
              setEditingProductId(null);
            }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}




      {showModal && selectedProduct && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
        🧾 Product Details
      </h2>

      <p className="mb-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Date:</span>{" "}
        {selectedProduct.purchaseDate
          ? new Date(selectedProduct.purchaseDate).toISOString().split("T")[0]
          : "—"}
      </p>

      <p className="mb-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Asset Name:</span> {selectedProduct.slug}
      </p>

      <p className="mb-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Serial:</span> {selectedProduct.serial}
      </p>

      <p className="mb-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Category:</span> {selectedProduct.category}
      </p>

      <p className="mb-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Branch:</span> {selectedProduct.branch}
      </p>

      <p className="mb-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Issued To:</span>{" "}
        {Array.isArray(selectedProduct.issued)
          ? selectedProduct.issued.join(", ")
          : selectedProduct.issued || "—"}
      </p>

      <p className="mb-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Status:</span> {selectedProduct.status}
      </p>

      <p className="mb-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Quantity:</span> {selectedProduct.quantity}
      </p>

      <p className="mb-2 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Price:</span> ₱
        {parseFloat(selectedProduct.price || 0).toLocaleString()}
      </p>

      <div className="flex justify-end mt-6 gap-3">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-lg transition"
          onClick={() => setShowModal(false)}
        >
          Close
        </button>

        {/* {userRole === "admin" && ( */}
        <button
          style={{ backgroundColor: '#0a1f8f' }}
          className="hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
          onClick={() => {
            setProductForm({
              code: selectedProduct.code,
              slug: selectedProduct.slug,
              serial: selectedProduct.serial,
              quantity: selectedProduct.quantity,
              price: selectedProduct.price,
              category: selectedProduct.category,
              branch: selectedProduct.branch,
              issued: Array.isArray(selectedProduct.issued)
                ? selectedProduct.issued.join(", ")
                : selectedProduct.issued,
              status: selectedProduct.status,
              purchaseDate: selectedProduct.purchaseDate,
            });
            setIsEditing(true);
            setEditingProductId(selectedProduct._id);
            setShowModal(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Edit
        </button>
        {/* )} */}
      </div>
    </div>
  </div>
)}

    
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-secondary text-white px-6 py-4 rounded-full shadow-lg"
        >
          ↑ Top
        </button>
      )}

      

      {showDeleteModal && productToDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Delete</h2>
      <p className="text-gray-700 mb-6">
        Are you sure you want to delete <span className="font-semibold">{productToDelete.slug}</span>?
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            handleDeleteProduct(productToDelete._id);
            setShowDeleteModal(false);
          }}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
