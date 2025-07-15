"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Bar, Pie } from "react-chartjs-2";
import React from "react";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { Plus } from "lucide-react";
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
  ArcElement,
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
const [showForm, setShowForm] = useState(false);
const [userRole, setUserRole] = useState(null); 




  const router = useRouter();
  const productRefs = React.useRef({});

const scrollToAndHighlight = (slug) => {
  const row = productRefs.current[slug];
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
  console.log("Decoded user:", user);
  if (user?.user?.role) {
    setUserRole(user.user.role);
  } else {
    setUserRole(null);
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
  if (!products || products.length === 0) {
    toast.warn("No products to export");
    return;
  }

  const formattedProducts = products.map((product) => ({
    ...product,
    issued: Array.isArray(product.issued) ? product.issued.join(", ") : product.issued || "",
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
        fgColor: { rgb: "0070C0" }, // blue background
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

const statusQuantities = products.reduce((acc, product) => {
  const status = product.status || "Unknown";
  acc[status] = (acc[status] || 0) + (product.quantity || 0);
  return acc;
}, {});

const statusColorMap = {
  "Deployed/In Use": "#1aa6b7",
  "Spare": "#ff6510",
  "Defective": "#f22f50",
  "Unknown": "#a3a3a3",
};

const statusLabels = Object.keys(statusQuantities);
const statusData = statusLabels.map(label => statusQuantities[label]);
const statusColors = statusLabels.map(label => statusColorMap[label] || "#a3a3a3");

const statusBarChartData = {
  labels: [""], // single x-axis category
  datasets: statusLabels.map((status, i) => ({
    label: status,
    data: [statusQuantities[status]],
    backgroundColor: statusColorMap[status] || "#a3a3a3",
  })),
};


const statusBarChartOptions = {
  indexAxis: "y", // optional: horizontal layout
  responsive: true,
  plugins: {
    legend: {
      display: true,
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
      text: "Equipment Status",
      font: {
        size: 18,
        weight: "bold",
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
    },
  },
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

  // ✅ Close the form modal
  setShowForm(false);
} else {
  toast.error(result.message ?? "Something went wrong");
}

  } catch (error) {
    toast.error(error?.message || "Something went wrong!");
  }

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
  setQuery(value); // you can keep this for display/debug

  if (value.length > 3) {
    setSearch(true);
    setLoading(true);
    setDropdown([]);
    const response = await fetch("/api/search?query=" + value, { // <-- use value here
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
    });
    let rjson = await response.json();
    setDropdown(rjson.products);
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
  });

  setShowModal(false);
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



  const filteredProducts = products.filter(
  (item) => item.slug?.trim() || item.code?.trim()
);

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
  labels: [""], // one grouped bar
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
      <div className="w-full">
  <div className="bg-white container mx-auto shadow-lg rounded-xl p-6 my-8 w-full">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
      📊 Inventory Overview
    </h2>

    {/* Flex layout with equal height columns */}
    <div className="flex flex-col md:flex-row gap-6 items-stretch">
      
      {/* Column 1: Stacked bar charts */}
      <div className="flex flex-col flex-1 gap-6">
        <div className="bg-white border rounded-xl shadow-md p-6 h-full">
          <h3 className="font-semibold text-lg mb-4 text-primary">
            📍 Inventory by Branch
          </h3>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <div className="bg-white border rounded-xl shadow-md p-6 h-full">
          <h3 className="font-semibold text-lg mb-4 text-primary">
            🛠️ Equipment Status
          </h3>
          <Bar data={statusBarChartData} options={statusBarChartOptions} />
        </div>
      </div>

      {/* Column 2: Pie Chart, fills height of stacked left column */}
      <div className="bg-white border rounded-xl shadow-md p-6 flex-1 h-full self-stretch">
        <h3 className="font-semibold text-lg mb-4 text-primary">
          🗂️ Assets by Category
        </h3>
        <div className="h-full flex items-center justify-center">
          <Pie data={pieChartData} />
        </div>
        
      </div>
    </div>

    {/* Centered total */}
    <div className="mt-8 text-center font-bold text-xl text-gray-800">
      📦 Overall Total Inventory: <span className="text-primary">{totalInventory}</span>
    </div>
  </div>
</div>

      

{/* Floating Button */}
{userRole === "admin" && (
<button
  onClick={() => setShowForm(true)}
  className="fixed bottom-6 right-6 bg-primary text-white w-14 h-14 flex items-center justify-center rounded-full shadow-2xl hover:bg-secondary transition duration-300 ease-in-out"
  aria-label="Add Product"
>
  <Plus className="w-6 h-6" />
</button>
)}


       {showForm && (
  <div
    className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    onClick={() => setShowForm(false)}
  >
    <div
      className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-modal-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
        onClick={() => setShowForm(false)}
        aria-label="Close form"
      >
        &times;
      </button>

      {/* Form content remains unchanged */}
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Add a Product</h1>
      <form onSubmit={addProduct} className="space-y-4">
        {/* Input fields */}
        {[
          { id: "code", label: "Product ID", type: "text" },
          { id: "slug", label: "Asset Name", type: "text" },
          { id: "serial", label: "Serial Number", type: "text" },
          { id: "quantity", label: "Quantity", type: "number" },
          { id: "price", label: "Price", type: "number" },
          { id: "issued", label: "Issued to", type: "text" },
        ].map(({ id, label, type }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              value={productForm?.[id] || ""}
              name={id}
              onChange={handleChange}
              type={type}
              id={id}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
        ))}

        {/* Select: Category */}
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

        {/* Select: Branch */}
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

        {/* Select: Status */}
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


        {/* Submit Button */}
        <button
          type="submit"
          className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg shadow-md font-semibold transition"
        >
          {isEditing ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  </div>
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
