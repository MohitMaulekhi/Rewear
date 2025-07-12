import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UseAuth";
import { Heart, Share2, ArrowLeft, MessageCircle, Star } from "lucide-react";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import toast from "react-hot-toast";

const ItemDetailPage = () => {
  const { id } = useParams();
  const { currentUser, userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [uploader, setUploader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [swapLoading, setSwapLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const itemDoc = await getDoc(doc(db, "items", id));
        if (itemDoc.exists()) {
          const itemData = { id: itemDoc.id, ...itemDoc.data() };
          setItem(itemData);

          // Fetch uploader details
          const uploaderDoc = await getDoc(doc(db, "users", itemData.uploaderId));
          if (uploaderDoc.exists()) {
            setUploader(uploaderDoc.data());
          }
        } else {
          toast.error("Item not found");
          navigate("/browse");
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        toast.error("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, navigate]);

  const handleSwapRequest = async () => {
    if (!userLoggedIn) {
      toast.error("Please login to make a swap request");
      navigate("/login");
      return;
    }

    if (currentUser.uid === item.uploaderId) {
      toast.error("You cannot swap your own item");
      return;
    }

    setSwapLoading(true);

    try {
      // Create swap request
      await addDoc(collection(db, "swaps"), {
        requesterId: currentUser.uid,
        requesterName: currentUser.name,
        requesterEmail: currentUser.email,
        itemId: item.id,
        itemTitle: item.title,
        uploaderId: item.uploaderId,
        uploaderName: item.uploaderName,
        uploaderEmail: item.uploaderEmail,
        status: "pending",
        type: "swap",
        createdAt: serverTimestamp(),
        participants: [currentUser.uid, item.uploaderId]
      });

      toast.success("Swap request sent! The item owner will be notified.");
    } catch (error) {
      console.error("Error creating swap request:", error);
      toast.error("Failed to send swap request");
    } finally {
      setSwapLoading(false);
    }
  };

  const handlePointsRedemption = async () => {
    if (!userLoggedIn) {
      toast.error("Please login to redeem with points");
      navigate("/login");
      return;
    }

    if (currentUser.uid === item.uploaderId) {
      toast.error("You cannot redeem your own item");
      return;
    }

    if (currentUser.points < item.points) {
      toast.error(`You need ${item.points - currentUser.points} more points to redeem this item`);
      return;
    }

    setRedeemLoading(true);

    try {
      // Deduct points from current user
      await updateDoc(doc(db, "users", currentUser.uid), {
        points: increment(-item.points)
      });

      // Add points to item uploader
      await updateDoc(doc(db, "users", item.uploaderId), {
        points: increment(item.points)
      });

      // Mark item as redeemed
      await updateDoc(doc(db, "items", item.id), {
        available: false,
        redeemedBy: currentUser.uid,
        redeemedAt: serverTimestamp()
      });

      // Create redemption record
      await addDoc(collection(db, "swaps"), {
        requesterId: currentUser.uid,
        requesterName: currentUser.name,
        requesterEmail: currentUser.email,
        itemId: item.id,
        itemTitle: item.title,
        uploaderId: item.uploaderId,
        uploaderName: item.uploaderName,
        uploaderEmail: item.uploaderEmail,
        status: "completed",
        type: "redemption",
        pointsUsed: item.points,
        createdAt: serverTimestamp(),
        participants: [currentUser.uid, item.uploaderId]
      });

      toast.success("Item redeemed successfully with points!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error redeeming item:", error);
      toast.error("Failed to redeem item");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: item.title,
        text: `Check out this ${item.category.toLowerCase()} on ReWear!`,
        url: window.location.href,
      });
    } catch {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <button
            onClick={() => navigate("/browse")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
              <img
                src={item.images?.[currentImageIndex] || "/placeholder-image.jpg"}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? "border-green-500" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-lg font-semibold">
                  {item.points} points
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {item.category}
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  {item.condition}
                </span>
              </div>
            </div>

            {/* Item Specs */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 font-medium">{item.size}</span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">{item.type || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Condition:</span>
                  <span className="ml-2 font-medium">{item.condition}</span>
                </div>
                <div>
                  <span className="text-gray-500">Listed:</span>
                  <span className="ml-2 font-medium">
                    {item.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Listed by</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">
                    {uploader?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{uploader?.name}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>Member since {new Date(uploader?.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {userLoggedIn && currentUser.uid !== item.uploaderId && item.available && (
              <div className="space-y-3">
                <button
                  onClick={handleSwapRequest}
                  disabled={swapLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {swapLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Request to Swap
                    </>
                  )}
                </button>

                <button
                  onClick={handlePointsRedemption}
                  disabled={redeemLoading || currentUser.points < item.points}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {redeemLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redeeming...
                    </>
                  ) : (
                    <>
                      Redeem with {item.points} Points
                      {currentUser.points < item.points && (
                        <span className="ml-2 text-sm">
                          (Need {item.points - currentUser.points} more)
                        </span>
                      )}
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  You have {currentUser.points} points available
                </p>
              </div>
            )}

            {!userLoggedIn && (
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-600 mb-3">
                  Please login to swap or redeem this item
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Login
                </button>
              </div>
            )}

            {userLoggedIn && currentUser.uid === item.uploaderId && (
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <p className="text-green-600 font-medium">This is your item</p>
              </div>
            )}

            {!item.available && (
              <div className="bg-red-100 rounded-lg p-4 text-center">
                <p className="text-red-600 font-medium">This item is no longer available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
