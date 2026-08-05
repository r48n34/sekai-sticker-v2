import {
    Button,
    ColorInput,
    Drawer,
    Group,
    Image,
    Select,
    Stack,
    Switch,
    TextInput,
} from "@mantine/core";
import { IconCopy, IconDownload } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ExportOptions } from "../../utils/projectUtils";

interface ExportStudioProps {
    opened: boolean;
    onClose: () => void;
    previewUrl: string;
    options: ExportOptions;
    onChange: (options: ExportOptions) => void;
    onDownload: () => void;
    onCopy: () => void;
}

function ExportStudio({
    opened,
    onClose,
    previewUrl,
    options,
    onChange,
    onDownload,
    onCopy,
}: ExportStudioProps) {
    const { t } = useTranslation();

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={t("Export studio")}
            position="bottom"
            size="75%"
            radius="md"
            closeButtonProps={{ "aria-label": t("Close export studio") }}
        >
            <Group align="flex-start" grow wrap="wrap">
                <Image
                    src={previewUrl}
                    alt={t("Export preview")}
                    fit="contain"
                    h={300}
                    bg="var(--mantine-color-gray-light)"
                    miw={260}
                />
                <Stack miw={260}>
                    <TextInput
                        label={t("Filename")}
                        value={options.filename}
                        onChange={(event) =>
                            onChange({ ...options, filename: event.currentTarget.value })
                        }
                    />
                    <Select
                        label={t("Export bounds")}
                        data={[
                            { value: "canvas", label: t("Full canvas") },
                            { value: "content", label: t("Visible content") },
                        ]}
                        value={options.bounds}
                        allowDeselect={false}
                        onChange={(value) =>
                            onChange({ ...options, bounds: value as ExportOptions["bounds"] })
                        }
                    />
                    <Select
                        label={t("Resolution")}
                        data={[
                            { value: "1", label: "1×" },
                            { value: "2", label: "2×" },
                            { value: "3", label: "3×" },
                        ]}
                        value={String(options.pixelRatio)}
                        allowDeselect={false}
                        onChange={(value) =>
                            onChange({
                                ...options,
                                pixelRatio: Number(value) as ExportOptions["pixelRatio"],
                            })
                        }
                    />
                    <Switch
                        label={t("Transparent background")}
                        checked={options.background === null}
                        onChange={(event) =>
                            onChange({
                                ...options,
                                background: event.currentTarget.checked ? null : "#ffffff",
                            })
                        }
                    />
                    {options.background !== null && (
                        <ColorInput
                            label={t("Background color")}
                            value={options.background}
                            onChange={(background) => onChange({ ...options, background })}
                        />
                    )}
                    <Group grow>
                        <Button leftSection={<IconDownload size={18} />} onClick={onDownload}>
                            {t("Download PNG")}
                        </Button>
                        <Button
                            variant="light"
                            leftSection={<IconCopy size={18} />}
                            onClick={onCopy}
                        >
                            {t("Copy PNG to clipboard")}
                        </Button>
                    </Group>
                </Stack>
            </Group>
        </Drawer>
    );
}

export default ExportStudio;
