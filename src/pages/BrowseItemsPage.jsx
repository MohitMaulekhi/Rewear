import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Grid, List } from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";

const BrowseItemsPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const categories = [
    "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", 
    "Accessories", "Bags", "Jewelry", "Athletic wear", "Formal wear"
  ];

  const conditions = [
    "Like New", "Excellent", "Good", "Fair"
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsQuery = query(
          collection(db, "items"),
          where("status", "==", "approved"),
          where("available", "==", true),
          orderBy("createdAt", "desc")
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        const itemsData = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItems(itemsData);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const filterAndSortItems = () => {
      let filtered = [...items];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Category filter
      if (selectedCategory) {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }

      // Condition filter
      if (selectedCondition) {
        filtered = filtered.filter(item => item.condition === selectedCondition);
      }

      // Sort
      switch (sortBy) {
        case "newest":
          filtered.sort((a, b) => new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate()));
          break;
        case "oldest":
          filtered.sort((a, b) => new Date(a.createdAt?.toDate()) - new Date(b.createdAt?.toDate()));
          break;
        case "pointsLow":
          filtered.sort((a, b) => a.points - b.points);
          break;
        case "pointsHigh":
          filtered.sort((a, b) => b.points - a.points);
          break;
        case "titleAZ":
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          break;
      }

      setFilteredItems(filtered);
    };

    filterAndSortItems();
  }, [items, searchTerm, selectedCategory, selectedCondition, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedCondition("");
    setSortBy("newest");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Items</h1>
          <p className="text-gray-600">
            Discover amazing pre-loved fashion from our community
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Conditions</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="pointsLow">Points: Low to High</option>
              <option value="pointsHigh">Points: High to Low</option>
              <option value="titleAZ">Title: A to Z</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>

          {/* Results and View Toggle */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredItems.length} of {items.length} items
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-green-100 text-green-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-green-100 text-green-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Items Grid/List */}
        {filteredItems.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <img
                  src={item.images?.[0] || "/placeholder-image.jpg"}
                  alt={item.title}
                  className={`object-cover ${
                    viewMode === "list" 
                      ? "w-48 h-32" 
                      : "w-full h-64"
                  }`}
                />
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {item.title}
                    </h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium ml-2">
                      {item.points} pts
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{item.category}</p>
                  <p className="text-gray-500 text-sm mb-2">Size: {item.size}</p>
                  <p className="text-gray-500 text-sm mb-3">Condition: {item.condition}</p>
                  {viewMode === "list" && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      by {item.uploaderName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseItemsPage;
