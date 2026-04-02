import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// For now, we will include the translations directly here.
// Later, we can move them to separate JSON files.
const resources = {
  en: {
    translation: {
      "Profile": "Profile",
      "Manage your account information and settings": "Manage your account information and settings",
      "Edit Profile": "Edit Profile",
      "Save": "Save",
      "Cancel": "Cancel",
      "Personal Information": "Personal Information",
      "Update your profile details and avatar": "Update your profile details and avatar",
      "Verified": "Verified",
      "Member since": "Member since",
      "Full Name": "Full Name",
      "Email Address": "Email Address",
      "Phone Number": "Phone Number",
      "Account Created": "Account Created",
      "Bio": "Bio",
      "Tell us about yourself...": "Tell us about yourself...",
      "Privacy Settings": "Privacy Settings",
      "Control what information is visible to others": "Control what information is visible to others",
      "Profile Visibility": "Profile Visibility",
      "Make your profile visible to other users": "Make your profile visible to other users",
      "Show Email Address": "Show Email Address",
      "Display your email on your public profile": "Display your email on your public profile",
      "Show Phone Number": "Show Phone Number",
      "Display your phone number on your public profile": "Display your phone number on your public profile",
      "Show Activity": "Show Activity",
      "Display your recent activity on your profile": "Display your recent activity on your profile",
      "Activity Summary": "Activity Summary",
      "Your account statistics": "Your account statistics",
      "Total Transactions": "Total Transactions",
      "Completed": "Completed",
      "Total Posts": "Total Posts",
      "Total Bookings": "Total Bookings",
      "Total Spent": "Total Spent",
      "Total Received": "Total Received",
      "Account Status": "Account Status",
      "Verified Account": "Verified Account",
      "Your identity has been verified": "Your identity has been verified",
      "Active Member": "Active Member",
      "Recent Activity": "Recent Activity",
      "Your latest actions": "Your latest actions"
    }
  },
  ha: {
    translation: {
      "Profile": "Bayanan Sirri",
      "Manage your account information and settings": "Sarrafa bayanan asusunka da saituna",
      "Edit Profile": "Gyara Bayanan Sirri",
      "Save": "Adana",
      "Cancel": "Soke",
      "Personal Information": "Bayanin Keɓaɓɓen",
      "Update your profile details and avatar": "Sabunta bayanan martaba da avatar",
      "Verified": "An Tabbatar",
      "Member since": "Memba tun",
      "Full Name": "Cikakken Suna",
      "Email Address": "Adireshin Imel",
      "Phone Number": "Lambar Waya",
      "Account Created": "An Ƙirƙiri Asusun",
      "Bio": "Tarihin Rayuwa",
      "Tell us about yourself...": "Faɗa mana game da kanka...",
      "Privacy Settings": "Saitunan Sirri",
      "Control what information is visible to others": "Sarrafa abin da wasu za su iya gani",
      "Profile Visibility": "Ganuwar Bayanan Sirri",
      "Make your profile visible to other users": "Bada damar wasu su ga bayananka",
      "Show Email Address": "Nuna Adireshin Imel",
      "Display your email on your public profile": "Nuna adireshin imel ɗinka a bayanan sirrinka na jama'a",
      "Show Phone Number": "Nuna Lambar Waya",
      "Display your phone number on your public profile": "Nuna lambar wayarka a bayanan sirrinka na jama'a",
      "Show Activity": "Nuna Ayyuka",
      "Display your recent activity on your profile": "Nuna ayyukanka na baya-bayan nan a bayanan sirrinka",
      "Activity Summary": "Takaitaccen Ayyuka",
      "Your account statistics": "Ƙididdigar asusunka",
      "Total Transactions": "Jimlar Ma'amaloli",
      "Completed": "An Kammala",
      "Total Posts": "Jimlar Saƙonni",
      "Total Bookings": "Jimlar Ajiyar Wuri",
      "Total Spent": "Jimlar Kuɗin da Aka Kashe",
      "Total Received": "Jimlar Kuɗin da Aka Karɓa",
      "Account Status": "Yanayin Asusu",
      "Verified Account": "Asusun da aka Tabbatar",
      "Your identity has been verified": "An tabbatar da shaidarka",
      "Active Member": "Memba Mai Aiki",
      "Recent Activity": "Ayyukan Baya-bayan nan",
      "Your latest actions": "Ayyukanka na ƙarshe"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
