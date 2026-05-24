import { IconLink, IconSend } from "@tabler/icons-react";
import { NavLink, TextInput, Button, Modal, Group, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";

const formSchema = z.object({
    url: z.string().url(),
});

type CreateExternalImagesProps = {
    title?: string;
    openComp?: "NavLink" | "Button";
    callBackImageURL: (imageURL: string) => void;
};

function CreateExternalImages({
    title = "Add External Image",
    openComp = "NavLink",
    callBackImageURL,
}: CreateExternalImagesProps) {
    const [opened, { open, close }] = useDisclosure(false);

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
            <Modal opened={opened} onClose={close} title={title}>
                <form onSubmit={form.onSubmit((values) => submitForm(values))}>
                    <TextInput
                        withAsterisk
                        label="URL"
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
                            Upload
                        </Button>
                    </Group>
                </form>
            </Modal>

            {openComp === "NavLink" && (
                <NavLink
                    label={title}
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
        </>
    );
}

export default CreateExternalImages;
