import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/UseAuth";
import { Plus, Package, Users, Award, TrendingUp } from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [userItems, setUserItems] = useState([]);
  const [userSwaps, setUserSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        // Fetch user's items
        const itemsQuery = query(
          collection(db, "items"),
          where("uploaderId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        const items = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserItems(items);

        // Fetch user's swaps
        const swapsQuery = query(
          collection(db, "swaps"),
          where("participants", "array-contains", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const swapsSnapshot = await getDocs(swapsQuery);
        const swaps = swapsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserSwaps(swaps);

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const stats = [
    {
      name: "Total Points",
      value: currentUser?.points || 0,
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      name: "Items Listed",
      value: userItems.length,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Active Swaps",
      value: userSwaps.filter(swap => swap.status === "pending").length,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Completed Swaps",
      value: userSwaps.filter(swap => swap.status === "completed").length,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your items, track your swaps, and grow your sustainable wardrobe.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} rounded-md p-3`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/add-item"
                className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Plus className="h-8 w-8 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Add New Item</p>
                  <p className="text-sm text-gray-500">List an item for swap</p>
                </div>
              </Link>
              
              <Link
                to="/browse"
                className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Package className="h-8 w-8 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Browse Items</p>
                  <p className="text-sm text-gray-500">Find items to swap</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">My Items</h2>
              <Link to="/add-item" className="text-green-600 hover:text-green-700 text-sm font-medium">
                Add Item
              </Link>
            </div>
            <div className="p-6">
              {userItems.length > 0 ? (
                <div className="space-y-4">
                  {userItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      <img
                        src={item.images?.[0] || "/placeholder-image.jpg"}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <p className="text-sm text-gray-500">Status: {item.status || "Available"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">{item.points} pts</p>
                      </div>
                    </div>
                  ))}
                  {userItems.length > 3 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      And {userItems.length - 3} more items...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No items listed yet</p>
                  <Link
                    to="/add-item"
                    className="mt-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    List your first item
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Swaps */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Swaps</h2>
            </div>
            <div className="p-6">
              {userSwaps.length > 0 ? (
                <div className="space-y-4">
                  {userSwaps.slice(0, 3).map((swap) => (
                    <div key={swap.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Swap Request</p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`capitalize ${
                            swap.status === "completed" ? "text-green-600" :
                            swap.status === "pending" ? "text-yellow-600" :
                            "text-red-600"
                          }`}>
                            {swap.status}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(swap.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {userSwaps.length > 3 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      And {userSwaps.length - 3} more swaps...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No swaps yet</p>
                  <Link
                    to="/browse"
                    className="mt-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    Browse items to swap
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
