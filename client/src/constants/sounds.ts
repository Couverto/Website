export const NOTIFICATION_SOUNDS = [
  { id: "none", name: "Aucun", url: "" },
  { id: "default", name: "Chime (Défaut)", url: "/sounds/dragon-studio-notification-ping-335500.mp3" },
  { id: "mail", name: "Mail", url: "/sounds/freesound_community-message-notification-103496.mp3" },
  { id: "success", name: "Succès", url: "/sounds/notification_message-notification-18-270129.mp3" },
  { id: "pop", name: "Pop", url: "/sounds/universfield-new-notification-022-370046.mp3" },
  { id: "dreamy", name: "Onirique", url: "/sounds/universfield-new-notification-063-494543.mp3" },
  { id: "smart", name: "Smart", url: "/sounds/universfield-simple-notification-152054.mp3" },
];

export type NotificationSoundId = (typeof NOTIFICATION_SOUNDS)[number]["id"];
