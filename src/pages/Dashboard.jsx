import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/UseAuth";
import { Plus, Package, Users, Award, TrendingUp, Camera, User, Upload, X } from "lucide-react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [userItems, setUserItems] = useState([]);
  const [userSwaps, setUserSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [activeAvatarTab, setActiveAvatarTab] = useState('preset'); // 'preset' or 'upload'
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Default avatar options
  const avatarOptions = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=d1d4ed",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=ffdfba",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=c7ecee",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=dcedc1",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=8&backgroundColor=fad2e1"
  ];

  const defaultAvatar = currentUser?.avatar || avatarOptions[0];

  const handleAvatarImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedAvatar = () => {
    setUploadedAvatarFile(null);
    setAvatarPreview(null);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleCustomAvatarUpload = async () => {
    if (!uploadedAvatarFile) {
      toast.error("Please select an image first");
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarUrl = await uploadToCloudinary(uploadedAvatarFile);
      await handleAvatarUpdate(avatarUrl);
      
      // Reset upload state
      setUploadedAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarUpdate = async (newAvatar) => {
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        avatar: newAvatar
      });
      
      // Update the current user in context
      setCurrentUser({ ...currentUser, avatar: newAvatar });
      setSelectedAvatar(newAvatar);
      setShowAvatarModal(false);
      setActiveAvatarTab('preset'); // Reset tab
      toast.success("Avatar updated successfully!");
      
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        console.log("No current user found");
        return;
      }

      console.log("Current user object:", currentUser);

      try {
        // Fetch user's items - Get ALL items regardless of status
        console.log("Current user UID:", currentUser.uid);
        const itemsQuery = query(
          collection(db, "items"),
          where("uploaderId", "==", currentUser.uid)
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        const items = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Fetched items:", items);
        // Sort items by createdAt in JavaScript instead
        items.sort((a, b) => {
          const aTime = a.createdAt?.toDate() || new Date(0);
          const bTime = b.createdAt?.toDate() || new Date(0);
          return bTime - aTime;
        });
        setUserItems(items);

        // Debug: Try to fetch all items to see what's in the collection
        const allItemsQuery = query(collection(db, "items"));
        const allItemsSnapshot = await getDocs(allItemsQuery);
        const allItems = allItemsSnapshot.docs.map(doc => ({
          id: doc.id,
          uploaderId: doc.data().uploaderId,
          title: doc.data().title
        }));
        console.log("All items in collection:", allItems);

        // Fetch user's swaps
        const swapsQuery = query(
          collection(db, "swaps"),
          where("participants", "array-contains", currentUser.uid)
        );
        const swapsSnapshot = await getDocs(swapsQuery);
        const swaps = swapsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort swaps by createdAt in JavaScript instead
        swaps.sort((a, b) => {
          const aTime = a.createdAt?.toDate() || new Date(0);
          const bTime = b.createdAt?.toDate() || new Date(0);
          return bTime - aTime;
        });
        setUserSwaps(swaps);

      } catch (error) {
        console.error("Error fetching user data:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {currentUser?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your items, track your swaps, and grow your sustainable wardrobe.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="relative">
                <img
                  src={defaultAvatar}
                  alt="Your avatar"
                  className="w-16 h-16 rounded-full cursor-pointer hover:ring-2 hover:ring-green-500 transition-all"
                  onClick={() => setShowAvatarModal(true)}
                />
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-1 hover:bg-green-700 transition-colors"
                  title="Change avatar"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
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
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                  {userItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      <img
                        src={item.images?.[0] || "/placeholder-image.jpg"}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            item.status === "approved" ? "bg-green-100 text-green-800" :
                            item.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {item.status || "pending"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.available ? "Available" : "Not Available"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">{item.points} pts</p>
                      </div>
                    </div>
                  ))}
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

        {/* Avatar Selection Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Choose Your Avatar</h3>
                <button
                  onClick={() => {
                    setShowAvatarModal(false);
                    setActiveAvatarTab('preset');
                    setSelectedAvatar(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveAvatarTab('preset')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                    activeAvatarTab === 'preset'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Preset Avatars
                </button>
                <button
                  onClick={() => setActiveAvatarTab('upload')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                    activeAvatarTab === 'upload'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload Custom
                </button>
              </div>
              
              {/* Tab Content */}
              {activeAvatarTab === 'preset' ? (
                <>
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {avatarOptions.map((avatar, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`relative rounded-full overflow-hidden border-2 transition-all ${
                          selectedAvatar === avatar || (selectedAvatar === null && avatar === defaultAvatar)
                            ? 'border-green-500 ring-2 ring-green-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={avatar}
                          alt={`Avatar option ${index + 1}`}
                          className="w-16 h-16 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowAvatarModal(false);
                        setActiveAvatarTab('preset');
                        setSelectedAvatar(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAvatarUpdate(selectedAvatar || defaultAvatar)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                    >
                      Save Avatar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Upload your own avatar image. Recommended size: 200x200px or larger.
                    </p>
                    
                    {avatarPreview ? (
                      <div className="relative w-32 mx-auto">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeUploadedAvatar}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer w-32 h-32 mx-auto flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowAvatarModal(false);
                        setActiveAvatarTab('preset');
                        setSelectedAvatar(null);
                        removeUploadedAvatar();
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                    {avatarPreview && (
                      <button
                        onClick={handleCustomAvatarUpload}
                        disabled={uploadingAvatar}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {uploadingAvatar ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          'Save Avatar'
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
