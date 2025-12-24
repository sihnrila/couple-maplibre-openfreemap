import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "../../shared/ui/BottomSheet";
import { listFolders, createFolder, updateFolder, deleteFolder } from "./folders.api";
import type { Folder } from "../../shared/types";

const COLOR_PALETTE = [
  "#FF6B6B", // Rose Punch
  "#F7B267", // Apricot Glow
  "#F8E16C", // Soft Sun
  "#6BCB77", // Mint Meadow
  "#4D96FF", // Blue Pop
  "#845EC2", // Lavender Night
  "#00C2A8", // Aqua Whisper
  "#2C2F36", // Graphite
];

const ICON_EMOJI_MAP: Record<string, string> = {
  heart: "❤️",
  coffee: "☕",
  camp: "⛺",
  sparkle: "✨",
  food: "🍽️",
  sea: "🌊",
  walk: "🚶",
  gift: "🎁",
};

const PRESET_NAMES = ["기본", "맛집", "카페", "여행", "데이트", "쇼핑"];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function FolderManagerSheet({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(COLOR_PALETTE[0]);
  const [newFolderIcon, setNewFolderIcon] = useState("heart");

  const foldersQuery = useQuery({
    queryKey: ["folders"],
    queryFn: listFolders,
  });

  const createMut = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderName("");
      setNewFolderColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
      setNewFolderIcon("heart");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateFolder>[1] }) =>
      updateFolder(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folders"] });
      setEditingId(null);
      setEditName("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folders"] });
      qc.invalidateQueries({ queryKey: ["places"] });
    },
  });

  const folders = foldersQuery.data ?? [];

  const handleCreate = () => {
    if (!newFolderName.trim()) return;
    createMut.mutate({
      name: newFolderName.trim(),
      color: newFolderColor,
      icon: newFolderIcon,
      sort: folders.length,
    });
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    updateMut.mutate({ id, data: { name: editName.trim() } });
  };

  const handleDelete = (id: string) => {
    if (!confirm("폴더를 삭제하면 폴더의 장소들은 폴더 없음으로 이동합니다. 삭제하시겠어요?")) {
      return;
    }
    deleteMut.mutate(id);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="📁 폴더 관리">
      <div className="space-y-4">
        {/* 폴더 목록 */}
        <div className="space-y-2">
          {folders.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-black/5 hover:bg-black/10"
            >
              {editingId === f.id ? (
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: f.color }}
                  >
                    {f.icon ? ICON_EMOJI_MAP[f.icon] || "📁" : "📁"}
                  </div>
                  <input
                    id={`folder-edit-${f.id}`}
                    name={`folder-edit-${f.id}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-white outline-none focus:ring-2 focus:ring-black/15 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(f.id);
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditName("");
                      }
                    }}
                    autoFocus
                  />
                  <button
                    className="px-3 py-2 rounded-xl bg-black text-white text-xs"
                    onClick={() => handleUpdate(f.id)}
                    type="button"
                  >
                    저장
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl bg-black/5 text-xs"
                    onClick={() => {
                      setEditingId(null);
                      setEditName("");
                    }}
                    type="button"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: f.color }}
                  >
                    {f.icon ? ICON_EMOJI_MAP[f.icon] || "📁" : "📁"}
                  </div>
                  <div className="flex-1 text-sm font-medium">{f.name}</div>
                  <button
                    className="px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-xs"
                    onClick={() => {
                      setEditingId(f.id);
                      setEditName(f.name);
                    }}
                    type="button"
                  >
                    수정
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs"
                    onClick={() => handleDelete(f.id)}
                    type="button"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* 새 폴더 추가 */}
        <div className="pt-4 border-t border-black/10 space-y-3">
          <div className="text-xs font-semibold text-black/70">새 폴더 추가</div>

          <div className="flex gap-2">
            {PRESET_NAMES.map((name) => (
              <button
                key={name}
                className="px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-xs"
                onClick={() => setNewFolderName(name)}
                type="button"
              >
                {name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <input
              id="new-folder-name"
              name="new-folder-name"
              className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none focus:ring-2 focus:ring-black/15 text-sm"
              placeholder="폴더 이름"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />

            <div className="flex gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full ${
                    newFolderColor === color ? "ring-2 ring-black/30" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewFolderColor(color)}
                  type="button"
                />
              ))}
            </div>

            <div className="flex gap-2">
              {Object.keys(ICON_EMOJI_MAP).map((icon) => (
                <button
                  key={icon}
                  className={`px-3 py-2 rounded-xl text-sm ${
                    newFolderIcon === icon
                      ? "bg-black text-white"
                      : "bg-black/5 hover:bg-black/10"
                  }`}
                  onClick={() => setNewFolderIcon(icon)}
                  type="button"
                >
                  {ICON_EMOJI_MAP[icon]}
                </button>
              ))}
            </div>

            <button
              className="w-full px-4 py-3 rounded-2xl bg-black text-white text-sm font-semibold disabled:opacity-40"
              onClick={handleCreate}
              disabled={!newFolderName.trim() || createMut.isPending}
              type="button"
            >
              {createMut.isPending ? "추가 중…" : "추가하기"}
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

