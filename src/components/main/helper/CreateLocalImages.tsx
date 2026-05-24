import { IconImageInPicture } from "@tabler/icons-react";
import { NavLink, FileButton, ThemeIcon } from "@mantine/core";

import { useEffect, useRef, useState } from "react";

type CreateLocalImagesProps = {
    title?: string;
    openComp?: "NavLink" | "Button";
    callBackImageURL: (imageURL: string) => void;
};

function CreateLocalImages({
    title = "Add Local Image",
    openComp = "NavLink",
    callBackImageURL,
}: CreateLocalImagesProps) {
    const [files, setFiles] = useState<File[]>([]);
    const resetRef = useRef<() => void>(null);

    useEffect(() => {
        (async () => {
            if (files.length >= 1) {
                for (const f of files) {
                    try {
                        await submitForm(f);
                    } catch (error) {
                        console.log(error);
                    }
                }

                setFiles([]);
                resetRef.current?.();
            }
        })();
    }, [files]);

    async function submitForm(imageFile: File) {
        const arrayBuffer = await imageFile!.arrayBuffer();
        const fileUrl = URL.createObjectURL(new Blob([arrayBuffer]));
        callBackImageURL(fileUrl);
    }

    return (
        <>
            {openComp === "NavLink" && (
                <FileButton
                    onChange={setFiles}
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
                            // rightSection={
                            //     <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
                            // }
                            {...props}
                        />
                    )}
                </FileButton>
            )}
        </>
    );
}

export default CreateLocalImages;
