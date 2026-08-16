import { IconPicker } from "@/components/icon-picker";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useMutation } from "convex/react";
import { ImageIcon, Smile, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import TextAreaAutoSize from "react-textarea-autosize";

interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
}

const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title || "Untitled");

  const update = useMutation(api.documents.update);
  const removeIcon = useMutation(api.documents.removeIcon);

  const coverImage = useCoverImage();

  const enableInput = () => {
    if (preview) return;
    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title || "Untitled");
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
  };

  const onInput = (value: string) => {
    setValue(value);
    update({
      id: initialData._id,
      title: value || "Untitled",
    });
  };

  const keyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelected = (icon: string) => {
    update({
      id: initialData._id,
      icon,
    });
  };

  const onRemoveIcon = () => {
    removeIcon({
      id: initialData._id,
    });
  };

  return (
    <div className="group relative">
      {!!initialData.icon && !preview && (
        <div className={`flex items-center gap-x-2 group/icon pl-[54px] ${initialData.coverImage ? '-mt-14' : 'pt-6'}`}>
          <div className="relative">
            <IconPicker onChange={onIconSelected}>
              <p className="text-6xl hover:opacity-75 transition cursor-pointer">
                {initialData.icon}
              </p>
            </IconPicker>
            <Button
              onClick={onRemoveIcon}
              className="absolute -top-2 -right-2 rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground hover:text-foreground bg-white dark:bg-gray-800 shadow-sm border h-6 w-6 p-0 flex items-center justify-center"
              variant="ghost"
              size="sm"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
      {!!initialData.icon && preview && (
        <div className={`flex items-center gap-x-2 pl-[54px] ${initialData.coverImage ? '-mt-14' : 'pt-6'}`}>
          <p className="text-6xl">{initialData.icon}</p>
        </div>
      )}
      
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-x-2 py-3 pl-[54px] ${initialData.icon ? '' : (initialData.coverImage ? '-mt-6' : '')}`}>
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={onIconSelected}>
            <Button
              className="text-xs text-muted-foreground hover:bg-gray-100 dark:hover:bg-[#1E1E1E] border-0 bg-transparent hover:text-foreground transition-all rounded-md px-3 py-1.5 font-medium"
              variant="ghost"
              size="sm"
            >
              <Smile className="h-4 w-4 mr-1.5" />
              Add icon
            </Button>
          </IconPicker>
        )}
        {!initialData.coverImage && !preview && (
          <Button
            onClick={coverImage.onOpen}
            className="text-xs text-muted-foreground hover:bg-gray-100 dark:hover:bg-[#1E1E1E] border-0 bg-transparent hover:text-foreground transition-all rounded-md px-3 py-1.5 font-medium"
            variant="ghost"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-1.5" />
            Add cover
          </Button>
        )}
      </div>
      
      <div className="pl-[54px]">
        {initialData.source === "ai" && (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-400">
            <Sparkles className="h-3 w-3" />
            AI study notes
            {initialData.aiMeta?.difficulty
              ? ` · ${initialData.aiMeta.difficulty}`
              : ""}
          </div>
        )}
        {isEditing && !preview ? (
          <TextAreaAutoSize
            ref={inputRef}
            onBlur={disableInput}
            onKeyDown={keyDown}
            value={value}
            onChange={(e) => onInput(e.target.value)}
            className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
          />
        ) : (
          <div
            onClick={enableInput}
            className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
          >
            {initialData.title}
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;