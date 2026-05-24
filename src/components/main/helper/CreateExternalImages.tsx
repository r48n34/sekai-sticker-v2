import { IconLink, IconSend } from "@tabler/icons-react";
import { Menu, NavLink, TextInput, Button, Modal, Group, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const formSchema = z.object({
    url: z.string().url(),
});

type CreateExternalImagesProps = {
    title?: string;
    openComp?: "NavLink" | "Button" | "MenuItem" | "None";
    callBackImageURL: (imageURL: string) => void;
    opened?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
};

function CreateExternalImages({
    title,
    openComp = "NavLink",
    callBackImageURL,
    opened: controlledOpened,
    onOpen,
    onClose,
}: CreateExternalImagesProps) {
    const { t } = useTranslation();
    const [internalOpened, { open: openInternal, close: closeInternal }] = useDisclosure(false);
    const opened = controlledOpened ?? internalOpened;
    const open = onOpen ?? openInternal;
    const close = onClose ?? closeInternal;
    const modalTitle = title ?? t("Add External Image");

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            url: "",
        },
        validate: zodResolver(formSchema),
    });

    function submitForm(values: { url: string }) {
        callBackImageURL(values.url);
        close();
    }

    return (
        <>
            <Modal opened={opened} onClose={close} title={modalTitle}>
                <form onSubmit={form.onSubmit((values) => submitForm(values))}>
                    <TextInput
                        withAsterisk
                        label={t("URL")}
                        key={form.key("url")}
                        {...form.getInputProps("url")}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button
                            disabled={form.values.url === ""}
                            type="submit"
                            variant="light"
                            leftSection={<IconSend size={16} />}
                        >
                            {t("Upload")}
                        </Button>
                    </Group>
                </form>
            </Modal>

            {openComp === "NavLink" && (
                <NavLink
                    label={modalTitle}
                    leftSection={
                        <ThemeIcon variant="light">
                            <IconLink size="1rem" />
                        </ThemeIcon>
                    }
                    // rightSection={
                    //     <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
                    // }
                    onClick={(e) => {
                        e.preventDefault();
                        open();
                    }}
                />
            )}

            {openComp === "MenuItem" && (
                <Menu.Item leftSection={<IconLink size={14} />} onClick={() => open()}>
                    {modalTitle}
                </Menu.Item>
            )}
        </>
    );
}

export default CreateExternalImages;
