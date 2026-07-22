export const CHILD_AVATAR_CATEGORY = "child-avatar" as const;

export const DEFAULT_CHILD_AVATARS = [
  {
    id: "b071b5d0-1f48-4f1b-8b32-66537e17c001",
    url: "/assets/mascots/mascot-dog-bong-avatar.png",
    storageKey: "system/child-avatars/bong-default.png",
    fileName: "mascot-dog-bong-avatar.png",
    altText: "Chú chó Bống màu kem đang mỉm cười",
  },
  {
    id: "b071b5d0-1f48-4f1b-8b32-66537e17c002",
    url: "/assets/mascots/mascot-detective-boy-standing.png",
    storageKey: "system/child-avatars/detective-boy.png",
    fileName: "mascot-detective-boy-standing.png",
    altText: "Bạn nhỏ thám tử đang đứng chào",
  },
  {
    id: "b071b5d0-1f48-4f1b-8b32-66537e17c003",
    url: "/assets/mascots/mascot-hedgehog-thumbs-up.png",
    storageKey: "system/child-avatars/hedgehog.png",
    fileName: "mascot-hedgehog-thumbs-up.png",
    altText: "Bạn nhím giơ ngón tay cổ vũ",
  },
  {
    id: "b071b5d0-1f48-4f1b-8b32-66537e17c004",
    url: "/assets/mascots/mascot-dog-detective.png",
    storageKey: "system/child-avatars/dog-detective.png",
    fileName: "mascot-dog-detective.png",
    altText: "Chú chó thám tử đội mũ",
  },
] as const;

export const DEFAULT_CHILD_AVATAR_ASSET_ID = DEFAULT_CHILD_AVATARS[0].id;
export const DEFAULT_CHILD_AVATAR_URL = DEFAULT_CHILD_AVATARS[0].url;
