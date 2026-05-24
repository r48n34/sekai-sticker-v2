import { IconImageInPicture } from "@tabler/icons-react";
import { NavLink, FileButton, Menu, ThemeIcon } from "@mantine/core";

import { useRef } from "react";

type CreateLocalImagesProps = {
    title?: string;
    openComp?: "NavLink" | "Button" | "MenuItem";
    callBackImageURL: (imageURL: string) => void;
};

function CreateLocalImages({
    title = "Add Local Image",
    openComp = "NavLink",
    callBackImageURL,
}: CreateLocalImagesProps) {
    const resetRef = useRef<() => void>(null);

    function submitForm(imageFile: File) {
        const fileUrl = URL.createObjectURL(imageFile);
        callBackImageURL(fileUrl);
    }

    function handleFileChange(nextFiles: File[] | null) {
        if (!nextFiles || nextFiles.length === 0) {
            return;
        }

        for (const file of nextFiles) {
            try {
                submitForm(file);
            } catch (error) {
                console.log(error);
            }
        }

        resetRef.current?.();
    }

    return (
        <>
            {openComp === "NavLink" && (
                <FileButton
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg"
                    multiple
                    resetRef={resetRef}
                >
                    {(props) => (
                        <NavLink
                            label={title}
                            leftSection={
                                <ThemeIcon variant="light">
                                    <IconImageInPicture size="1rem" />
                                </ThemeIcon>
                            }
                            {...props}
                        />
                    )}
                </FileButton>
            )}

            {openComp === "MenuItem" && (
                <FileButton
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg"
                    multiple
                    resetRef={resetRef}
                >
                    {(props) => (
                        <Menu.Item
                            leftSection={<IconImageInPicture size={14} />}
                            closeMenuOnClick={false}
                            {...props}
                        >
                            {title}
                        </Menu.Item>
                    )}
                </FileButton>
            )}
        </>
    );
}

export default CreateLocalImages;
