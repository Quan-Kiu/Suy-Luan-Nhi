export type MissionMapData = Awaited<ReturnType<typeof import("@/modules/catalog/catalog").getMissionMap>>;

export type MissionMapWorld = MissionMapData["worlds"][number];
export type MissionMapMission = MissionMapWorld["missions"][number];
