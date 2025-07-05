"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Bar, Pie } from "react-chartjs-2";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";



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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


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





  const router = useRouter();

   const exportToExcel = () => {
    if (!products || products.length === 0) {
      toast.warn("No products to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
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
      });
      setIsEditing(false);
      setEditingProductId(null);
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
    setQuery(value);
    if (value.length > 3) {
      setSearch(true);
      setLoading(true);
      setDropdown([]);
      const response = await fetch("/api/search?query=" + query, {
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
    const ID = id;
    try {
      const response = await fetch("/api/product", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(ID),
      });
      let rjson = await response.json();

      if (rjson.success === true) {
        toast.success("Succesfully Deleted");
        setLoadingDelAction(!loadingDelAction);
        router.refresh;
      } else {
        toast.error(rjson.message ?? "Something went wrong");
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

const barChartData = {
  labels: Object.keys(branchQuantities),
  datasets: [
    {
      label: "Total Quantity",
      data: Object.values(branchQuantities),
      backgroundColor: [
        "#001a70", // blue
        "#ff6510", // orange
        "#f22f50", // red
        "#1aa6b7", // green
      ],
    },
  ],
};

const barChartOptions = {
  indexAxis: "y", // This makes it horizontal
  responsive: true,
  plugins: {
    legend: { position: "top" },
    title: {
      display: true,
      text: "Inventory Quantity by Branch",
    },
  },
};

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
        <div className="container mx-auto shadow-md rounded-md p-3 my-8 w-11/12 ">
          <h1 className="text-3xl font-semibold mb-6">Add a Product</h1>
          <form onSubmit={addProduct}>
            <div className="mb-4">
              <label htmlFor="code" className="block mb-2">
                Product ID
              </label>
              <input
                value={productForm?.code || ""}
                name="code"
                onChange={handleChange}
                type="text"
                id="code"
                className="w-full border border-gray-300 px-4 py-2"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="productName" className="block mb-2">
                Asset Name
              </label>
              <input
                value={productForm?.slug || ""}
                name="slug"
                onChange={handleChange}
                type="text"
                id="productName"
                className="w-full border border-gray-300 px-4 py-2"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="productName" className="block mb-2">
                Serial Number
              </label>
              <input
                value={productForm?.serial || ""}
                name="serial"
                onChange={handleChange}
                type="text"
                id="productSerial"
                className="w-full border border-gray-300 px-4 py-2"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="quantity" className="block mb-2">
                Quantity
              </label>
              <input
                value={productForm?.quantity || ""}
                name="quantity"
                onChange={handleChange}
                type="number"
                id="quantity"
                className="w-full border border-gray-300 px-4 py-2"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="price" className="block mb-2">
                Price
              </label>
              <input
                value={productForm?.price || ""}
                name="price"
                onChange={handleChange}
                type="number"
                id="price"
                className="w-full border border-gray-300 px-4 py-2"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="category" className="block mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={productForm?.category || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2"
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

            <div className="mb-4">
              <label htmlFor="branch" className="block mb-2">
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                value={productForm?.branch || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2"
              >
                <option value="">Select Branch</option>
                <option value="Makati">Makati</option>
                <option value="Naga">Naga</option>
                <option value="Both">Both</option>
              </select>
            </div>


            <div className="mb-4">
              <label htmlFor="issued" className="block mb-2">
                Issued to
              </label>
              <input
                value={productForm?.issued || ""}
                name="issued"
                onChange={handleChange}
                type="text"
                id="issued"
                className="w-full border border-gray-300 px-4 py-2"
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg shadow-md font-semibold"
            >
              Add Product
            </button>
          </form>
        </div>
        
        <div className="w-full">
          <div className="bg-white container mx-auto shadow-md rounded-md p-3 my-8 w-11/12">
            <h2 className="text-xl font-bold mb-4">Inventory Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bar Graph */}
              <div className="bg-gray-100 p-3 rounded">
                <h3 className="font-semibold mb-2">Inventory by Branch</h3>
                {/* Insert horizontal bar chart here */}
                <Bar data={barChartData} options={barChartOptions} />

              </div>

              {/* Pie Graph */}
              <div className="bg-gray-100 p-3 rounded">
                <h3 className="font-semibold mb-2">Assets by Category</h3>
                {/* Insert pie chart here */}
                <Pie data={pieChartData} />
              </div>
            </div>
          </div>
        </div>

        

        <div className="w-full col-span-1 md:col-span-2">
          <div className="container mx-auto w-full md:w-1/2  my-8  px-3 md:px-0">
        <h1 className=" md:text-3xl font-semibold mb-6">Search a Product</h1>
        <div className="flex mb-2">
          <input
            onChange={onDropdownEdit}
            type="text"
            placeholder="Enter a product name"
            className="flex-1 border border-gray-300 px-2 md:px-4 py-2 rounded-l-md"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 px-1 md:px-4 py-2 rounded-r-md"
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
        <div className="dropcontainer absolute w-11/12 md:w-1/2 border-1 bg-green-100 rounded-md ">
          {search &&
            (dropdown.length > 0 ? (
              dropdown.map((item) => {
                return (
                  <div
                    key={item.slug}
                    className="container flex flex-col sm:flex-row justify-between p-2 my-1 border-b-2"
                  >
                    <span className="slug text-sm md:text-base">
                      {" "}
                      {item.slug} ({item.quantity} available for ₱
                      {item.price * item.quantity})
                    </span>
                    <div className="mx-5">
                      <button
                        onClick={() => {
                          buttonAction("minus", item.slug, item.quantity);
                        }}
                        disabled={loadingaction || item.quantity === 0}
                        className={`subtract inline-block px-3 py-1 ${
                          item.quantity === 0
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        } bg-green-500 text-white font-semibold rounded-lg shadow-md disabled:bg-green-200`}
                      >
                        {" "}
                        -{" "}
                      </button>

                      <span className="quantity inline-block  min-w-3 mx-3">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          buttonAction("plus", item.slug, item.quantity);
                        }}
                        disabled={loadingaction}
                        className="add inline-block px-3 py-1 cursor-pointer bg-green-500 text-white font-semibold rounded-lg shadow-md disabled:bg-green-200"
                      >
                        {" "}
                        +{" "}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div> Not found.</div>
            ))}
        </div>
      </div>
<div className="flex justify-end pr-4">
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded mb-4"
        >
          Export to Excel
        </button>
      </div>


      <div className="flex items-center gap-2 mb-4">
  <label htmlFor="groupToggle" className="font-medium">Group by Issued To</label>
  <input
    type="checkbox"
    id="groupToggle"
    checked={groupByIssuedTo}
    onChange={(e) => setGroupByIssuedTo(e.target.checked)}
    className="w-5 h-5 accent-blue-600"
  />
</div>






          <h1 className="text-3xl font-semibold mb-6">Inventory Database</h1>
          
          <table className="table-auto w-full font-semibold text-sm md:font:bold md:text-base">
            <thead>
              <tr>
                <th className="md:px-4 py-2">Product ID</th>
                <th className="md:px-4 py-2">Asset Name</th>
                <th className="md:px-4 py-2">Serial Number</th>
                <th className="md:px-4 py-2">Category</th>
                <th className="md:px-4 py-2">Branch</th>
                <th className="md:px-4 py-2">Issued to</th>
                <th className="md:px-4 py-2">Quantity</th>
                <th className="md:px-4 py-2">Unit Price</th>
                <th className="md:px-4 py-2">Total Price</th>
                <th className="md:px-4 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
  {groupByIssuedTo ? (
  Object.entries(
    products
      .filter((product) => {
        if (selectedCategory === "") return true;
        return product.category === selectedCategory;
      })
      .reduce((acc, product) => {
        const issuedList = Array.isArray(product.issued) ? product.issued : [product.issued || "Unassigned"];
        issuedList.forEach((person) => {
          if (!acc[person]) acc[person] = [];
          acc[person].push(product);
        });
        return acc;
      }, {})
  ).map(([issuedTo, group]) => (
    <React.Fragment key={issuedTo}>
      <tr style={{ backgroundColor: "#001a70", color: "white" }}>
        <td colSpan="10" className="px-4 py-2 font-semibold">{issuedTo}</td>
      </tr>
      {group.map((product) => (
        <tr
          key={product._id || product.code}
          onClick={() => openProductModal(product)}
          className="cursor-pointer hover:bg-blue-100 transition"
        >
          <td className="border px-4 py-2">{product.code || "—"}</td>
          <td className="border px-4 py-2">{product.slug || "—"}</td>
          <td className="border px-4 py-2">{product.serial || "—"}</td>
          <td className="border px-4 py-2">{product.category || "—"}</td>
          <td className="border px-4 py-2">{product.branch || "—"}</td>
          <td className="border px-4 py-2">
            {Array.isArray(product.issued) ? product.issued.join(", ") : product.issued || "—"}
          </td>
          <td className="border px-4 py-2">{product.quantity || 0}</td>
          <td className="border px-4 py-2">₱{product.price || 0}</td>
          <td className="border px-4 py-2">
            ₱{(product.price || 0) * (product.quantity || 0)}
          </td>
          <td
            onClick={() => handleDeleteProduct(product._id)}
            className="border cursor-pointer flex justify-center items-center text-2xl py-2 text-red-600"
          >
            <MdDelete />
          </td>
        </tr>
      ))}
    </React.Fragment>
  ))
) : (
  products
    .filter((product) => {
      if (selectedCategory === "") return true;
      return product.category === selectedCategory;
    })
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
        key={product._id || product.code}
        onClick={() => openProductModal(product)}
        className="cursor-pointer hover:bg-blue-100 transition"
      >
        <td className="border px-4 py-2">{product.code || "—"}</td>
        <td className="border px-4 py-2">{product.slug || "—"}</td>
        <td className="border px-4 py-2">{product.serial || "—"}</td>
        <td className="border px-4 py-2">{product.category || "—"}</td>
        <td className="border px-4 py-2">{product.branch || "—"}</td>
        <td className="border px-4 py-2">
          {Array.isArray(product.issued) ? product.issued.join(", ") : product.issued || "—"}
        </td>
        <td className="border px-4 py-2">{product.quantity || 0}</td>
        <td className="border px-4 py-2">₱{product.price || 0}</td>
        <td className="border px-4 py-2">
          ₱{(product.price || 0) * (product.quantity || 0)}
        </td>
        <td
          onClick={() => handleDeleteProduct(product._id)}
          className="border cursor-pointer flex justify-center items-center text-2xl py-2 text-red-600"
        >
          <MdDelete />
        </td>
      </tr>
    ))
)}


</tbody>


          </table>
        </div>
      </div>
      {showModal && selectedProduct && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Product Details</h2>
      <p><strong>Product ID:</strong> {selectedProduct.code}</p>
      <p><strong>Asset Name:</strong> {selectedProduct.slug}</p>
      <p><strong>Serial:</strong> {selectedProduct.serial}</p>
      <p><strong>Category:</strong> {selectedProduct.category}</p>
      <p><strong>Branch:</strong> {selectedProduct.branch}</p>
      <p><strong>Issued To:</strong> {Array.isArray(selectedProduct.issued) ? selectedProduct.issued.join(", ") : selectedProduct.issued}</p>
      <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
      <p><strong>Price:</strong> ₱{selectedProduct.price}</p>

      <div className="flex justify-end mt-4 gap-2">
        <button
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(false)}
        >
          Close
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
            });
            setIsEditing(true); // enable edit mode
            setEditingProductId(selectedProduct._id); // store product ID
            setShowModal(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Edit
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
