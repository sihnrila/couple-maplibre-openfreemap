import { BottomSheet } from "../../shared/ui/BottomSheet";
import type { Folder, Place } from "../../shared/types";
import { ICON_EMOJI_MAP } from "../map/MapPage";

type Props = {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
  places: Place[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onMoveToFolder: (folderId: string | null) => void;
};

export function FoldersListSheet({
  open,
  onClose,
  folders,
  places,
  selectedFolderId,
  onSelectFolder,
  onMoveToFolder,
}: Props) {
  // 폴더별 장소 개수 계산
  const folderCounts = new Map<string, number>();
  places.forEach((p) => {
    if (p.folder_id) {
      folderCounts.set(p.folder_id, (folderCounts.get(p.folder_id) || 0) + 1);
    }
  });
  const noFolderCount = places.filter((p) => !p.folder_id).length;

  return (
    <BottomSheet open={open} onClose={onClose} title="📁 폴더 목록">
      <div className="space-y-2">
        {/* 전체 */}
        <button
          className={`w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center justify-between ${
            selectedFolderId === null
              ? "bg-black text-white"
              : "bg-black/5 hover:bg-black/10"
          }`}
          onClick={() => {
            onSelectFolder(null);
            onMoveToFolder(null);
          }}
          type="button"
        >
          <div className="flex items-center gap-2">
            <span>📋</span>
            <span>전체</span>
          </div>
          <span className="text-xs opacity-70">{places.length}개</span>
        </button>

        {/* 폴더 없음 */}
        {noFolderCount > 0 && (
          <button
            className={`w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center justify-between ${
              selectedFolderId === "none"
                ? "bg-black text-white"
                : "bg-black/5 hover:bg-black/10"
            }`}
            onClick={() => {
              onSelectFolder("none");
              onMoveToFolder("none");
            }}
            type="button"
          >
            <div className="flex items-center gap-2">
              <span>📌</span>
              <span>폴더 없음</span>
            </div>
            <span className="text-xs opacity-70">{noFolderCount}개</span>
          </button>
        )}

        {/* 폴더 목록 */}
        {folders.map((folder) => {
          const count = folderCounts.get(folder.id) || 0;
          const isSelected = selectedFolderId === folder.id;
          return (
            <button
              key={folder.id}
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center justify-between ${
                isSelected ? "ring-2 ring-black/30" : ""
              }`}
              style={isSelected ? { backgroundColor: folder.color } : { backgroundColor: `${folder.color}20` }}
              onClick={() => {
                onSelectFolder(folder.id);
                onMoveToFolder(folder.id);
              }}
              type="button"
            >
              <div className="flex items-center gap-2">
                <span>{folder.icon ? ICON_EMOJI_MAP[folder.icon] || "" : "📁"}</span>
                <span className={isSelected ? "text-white" : ""}>{folder.name}</span>
              </div>
              <span className={`text-xs ${isSelected ? "text-white opacity-90" : "opacity-70"}`}>
                {count}개
              </span>
            </button>
          );
        })}

        {folders.length === 0 && (
          <div className="text-sm text-black/50 text-center py-4">폴더가 없습니다</div>
        )}
      </div>
    </BottomSheet>
  );
}

