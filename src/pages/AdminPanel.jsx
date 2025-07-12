import { useState, useEffect } from "react";
import { useAuth } from "../context/UseAuth";
import { Check, X, Eye, Trash2, Users, Package, TrendingUp } from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc, 
  orderBy 
} from "firebase/firestore";
import { db } from "../services/firebase";
import toast from "react-hot-toast";

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const [pendingItems, setPendingItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingItems: 0,
    approvedItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    try {
      // Fetch pending items
      const pendingQuery = query(
        collection(db, "items"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingData = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingItems(pendingData);

      // Fetch all items
      const allItemsQuery = query(
        collection(db, "items"),
        orderBy("createdAt", "desc")
      );
      const allItemsSnapshot = await getDocs(allItemsQuery);
      const allItemsData = allItemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllItems(allItemsData);

      // Fetch all users
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);

      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        totalItems: allItemsData.length,
        pendingItems: pendingData.length,
        approvedItems: allItemsData.filter(item => item.status === "approved").length
      });

    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveItem = async (itemId) => {
    try {
      await updateDoc(doc(db, "items", itemId), {
        status: "approved",
        available: true,
        approvedAt: new Date(),
        approvedBy: currentUser.uid
      });

      toast.success("Item approved successfully");
      fetchAdminData();
    } catch (error) {
      console.error("Error approving item:", error);
      toast.error("Failed to approve item");
    }
  };

  const handleRejectItem = async (itemId) => {
    try {
      await updateDoc(doc(db, "items", itemId), {
        status: "rejected",
        available: false,
        rejectedAt: new Date(),
        rejectedBy: currentUser.uid
      });

      toast.success("Item rejected");
      fetchAdminData();
    } catch (error) {
      console.error("Error rejecting item:", error);
      toast.error("Failed to reject item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "items", itemId));
      toast.success("Item deleted successfully");
      fetchAdminData();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleToggleUserAdmin = async (userId, isCurrentlyAdmin) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isAdmin: !isCurrentlyAdmin
      });

      toast.success(`User ${isCurrentlyAdmin ? "removed from" : "granted"} admin privileges`);
      fetchAdminData();
    } catch (error) {
      console.error("Error updating user admin status:", error);
      toast.error("Failed to update user admin status");
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage items, users, and platform content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-md p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-md p-3">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-md p-3">
                <Check className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Items ({stats.pendingItems})
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "items"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Items ({stats.totalItems})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Users ({stats.totalUsers})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Items Pending Review</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingItems.length > 0 ? (
                pendingItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.images?.[0] || "/placeholder-image.jpg"}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.category} • {item.size} • {item.condition}</p>
                        <p className="text-sm text-gray-500">by {item.uploaderName}</p>
                        <p className="text-sm text-gray-400">
                          Submitted: {item.createdAt?.toDate().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{item.points} pts</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/item/${item.id}`, "_blank")}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Item"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleApproveItem(item.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No pending items for review
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "items" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {allItems.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.images?.[0] || "/placeholder-image.jpg"}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.category} • {item.size}</p>
                      <p className="text-sm text-gray-500">by {item.uploaderName}</p>
                    </div>
                    <div className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "approved" ? "bg-green-100 text-green-800" :
                        item.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{item.points} pts</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`/item/${item.id}`, "_blank")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Item"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600">{user.points || 0} pts</p>
                    </div>
                    <div className="text-center">
                      {user.isAdmin ? (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          User
                        </span>
                      )}
                    </div>
                    <div>
                      {user.id !== currentUser.uid && (
                        <button
                          onClick={() => handleToggleUserAdmin(user.id, user.isAdmin)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            user.isAdmin
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          }`}
                        >
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
