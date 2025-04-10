
import React from "react";
import UserProfile from "@/components/profile/UserProfile";

const ProfileSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Profile</h2>
      <UserProfile />
    </div>
  );
};

export default ProfileSection;
