"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Edit2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getStripe } from "@/lib/stripe";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isPremium, uploadCount } = useSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.user_metadata?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleBack = () => {
    router.push("/upload");
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleSave = async () => {
    // Here you would typically update the user profile
    // For now, we'll just close the edit mode
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(user?.user_metadata?.name || "");
    setEditEmail(user?.email || "");
    setIsEditing(false);
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    setUpgradeLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const { sessionId, error } = await response.json();
      
      if (error) {
        console.error('Error creating checkout session:', error);
        return;
      }

      const stripe = await getStripe();
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error during upgrade:', error);
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Header */}
      <div className="absolute top-8 left-8 right-8 z-10 flex items-center justify-between">
        <Button
          onClick={handleBack}
          className="h-10 px-4 text-white flex items-center gap-2"
          style={{ backgroundColor: '#444444' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555555'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444444'}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="flex-1 flex items-center justify-center pt-20 pb-24">
        <div className="w-full max-w-4xl mx-auto px-4 mt-6">
          {/* Profile Section */}
          <div className="border-2 border-white rounded-3xl p-8 mb-6" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Profile</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="h-8 px-3 text-white flex items-center gap-2"
                  style={{ backgroundColor: '#444444' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555555'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444444'}
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
            <p className="text-gray-400 mb-6">Manage your account information and preferences</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {user?.user_metadata?.name || 'User'}
                </h3>
                <p className="text-gray-400">{user?.email || 'No email'}</p>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="h-10 px-4 text-white flex items-center gap-2"
                    style={{ backgroundColor: '#3b82f6' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="h-10 px-4 text-white flex items-center gap-2"
                    style={{ backgroundColor: '#444444' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555555'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444444'}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    {user?.user_metadata?.name || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    {user?.email || 'Not set'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subscription Section */}
          <div className="border-2 border-white rounded-3xl p-8 mb-6" style={{ backgroundColor: '#1a1a1a' }}>
            <h2 className="text-xl font-bold text-white mb-6">Subscription</h2>
            <p className="text-gray-400 mb-6">Manage your subscription and billing</p>
            
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {isPremium ? 'Premium Plan' : 'Free Plan'}
                </h3>
                <p className="text-gray-400">
                  {isPremium ? 'Unlimited uploads' : `${uploadCount}/3 uploads used this month`}
                </p>
              </div>
              {!isPremium && (
                <Button 
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="h-10 px-4 text-white flex items-center gap-2"
                  style={{ backgroundColor: upgradeLoading ? '#1e40af' : '#3b82f6' }}
                  onMouseEnter={(e) => !upgradeLoading && (e.currentTarget.style.backgroundColor = '#2563eb')}
                  onMouseLeave={(e) => !upgradeLoading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
                >
                  {upgradeLoading ? 'Loading...' : 'Upgrade to Premium'}
                </Button>
              )}
            </div>
          </div>

          {/* Data Management */}
          <div className="border-2 border-white rounded-3xl p-8 mb-6" style={{ backgroundColor: '#1a1a1a' }}>
            <h2 className="text-xl font-bold text-white mb-6">Data Management</h2>
            <p className="text-gray-400 mb-6">Manage your charts and data</p>
            
            <div className="space-y-4">
              <Button 
                className="w-full h-10 px-4 text-white flex items-center justify-start gap-2"
                style={{ backgroundColor: '#444444' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555555'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444444'}
              >
                Export All Data
              </Button>
              <Button 
                className="w-full h-10 px-4 text-white flex items-center justify-start gap-2"
                style={{ backgroundColor: '#444444' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555555'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444444'}
              >
                Delete All Charts
              </Button>
            </div>
          </div>

          {/* Logout */}
          <div className="border-2 border-white rounded-3xl p-8" style={{ backgroundColor: '#1a1a1a' }}>
            <Button
              onClick={handleLogout}
              className="w-full h-10 px-4 text-white flex items-center justify-start gap-2"
              style={{ backgroundColor: '#dc2626' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 