import {
    ActionIcon,
    Badge,
    Box,
    Group,
    Image,
    Paper,
    ScrollArea,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
    UnstyledButton,
} from "@mantine/core";
import {
    IconEye,
    IconEyeOff,
    IconGripVertical,
    IconLayersDifference,
    IconLock,
    IconLockOpen,
    IconPhoto,
    IconTypography,
} from "@tabler/icons-react";
import { DragEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { StickerObject } from "../../utils/createSticker";

type SelectLayerProps = {
    data: StickerObject[];
    selectedId: string | null;
    selectCb: (id: string) => void;
    reorderCb: (from: number, to: number) => void;
    visibilityCb: (index: number, visible: boolean) => void;
    lockCb: (index: number, locked: boolean) => void;
};

function getLayerName(layer: StickerObject) {
    if (layer.name?.trim()) return layer.name;

    if (layer.format === "text") {
        return layer.content.trim().slice(0, 28) || "Untitled text";
    }

    const pathParts = layer.content.split("/");
    const rawFilename = pathParts[pathParts.length - 1] ?? "";
    let filename = rawFilename;

    try {
        filename = decodeURIComponent(rawFilename);
    } catch {
        // Keep malformed external URLs readable without breaking the layer panel.
    }
    const character = filename.split("_")[0].replace(/\.[^.]+$/, "");
    return character || "Imported image";
}

function SelectLayer({
    data,
    selectedId,
    selectCb,
    reorderCb,
    visibilityCb,
    lockCb,
}: SelectLayerProps) {
    const { t } = useTranslation();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const orderedLayers = data.map((layer, index) => ({ layer, index })).reverse();

    function handleDrop(event: DragEvent, targetIndex: number) {
        event.preventDefault();
        if (draggedIndex !== null) reorderCb(draggedIndex, targetIndex);
        setDraggedIndex(null);
    }

    return (
        <Box>
            <Group justify="space-between" mb="xs">
                <Text c="dimmed" fz="sm" fw={600}>
                    <IconLayersDifference size={16} /> {t("Layers")}
                </Text>
                <Text c="dimmed" fz="xs">
                    {data.length}
                </Text>
            </Group>

            <ScrollArea.Autosize mah={260} type="auto" scrollbars="y">
                <Stack gap={6}>
                    {orderedLayers.map(({ layer, index }) => {
                        const isSelected = layer.id === selectedId;
                        const isVisible = layer.visible !== false;
                        const isLocked = layer.locked === true;

                        return (
                            <Paper
                                key={layer.id}
                                withBorder
                                draggable={!isLocked}
                                onDragStart={() => setDraggedIndex(index)}
                                onDragEnd={() => setDraggedIndex(null)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => handleDrop(event, index)}
                                p={6}
                                radius="md"
                                bg={
                                    isLocked
                                        ? "var(--mantine-color-orange-light)"
                                        : isSelected
                                          ? "var(--mantine-color-blue-light)"
                                          : undefined
                                }
                                data-locked={isLocked || undefined}
                                style={{
                                    opacity: isVisible ? 1 : 0.58,
                                    borderColor: isLocked
                                        ? "var(--mantine-color-orange-6)"
                                        : undefined,
                                    boxShadow: isLocked
                                        ? "inset 3px 0 0 var(--mantine-color-orange-6)"
                                        : undefined,
                                }}
                            >
                                <Group gap={6} wrap="nowrap">
                                    <IconGripVertical
                                        size={16}
                                        aria-hidden="true"
                                        color={
                                            isLocked ? "var(--mantine-color-orange-7)" : undefined
                                        }
                                        style={{
                                            cursor: isLocked ? "not-allowed" : "grab",
                                            flexShrink: 0,
                                        }}
                                    />

                                    <UnstyledButton
                                        onClick={() => selectCb(layer.id)}
                                        aria-current={isSelected ? "true" : undefined}
                                        aria-label={`${t("Select layer")}: ${getLayerName(layer)}`}
                                        style={{ flex: 1, minWidth: 0 }}
                                    >
                                        <Group gap="xs" wrap="nowrap">
                                            {layer.format === "text" ? (
                                                <ThemeIcon variant="light" size={38}>
                                                    <IconTypography size={20} />
                                                </ThemeIcon>
                                            ) : layer.content ? (
                                                <Image
                                                    src={layer.content}
                                                    alt=""
                                                    w={38}
                                                    h={38}
                                                    fit="contain"
                                                    fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='38' height='38'%3E%3C/svg%3E"
                                                />
                                            ) : (
                                                <ThemeIcon variant="light" size={38}>
                                                    <IconPhoto size={20} />
                                                </ThemeIcon>
                                            )}
                                            <Box style={{ minWidth: 0 }}>
                                                <Text
                                                    size="sm"
                                                    fw={isSelected ? 600 : 400}
                                                    truncate
                                                >
                                                    {getLayerName(layer)}
                                                </Text>
                                                <Group gap={5} wrap="nowrap">
                                                    <Text size="xs" c="dimmed">
                                                        {layer.format === "text"
                                                            ? t("Text")
                                                            : t("Image")}
                                                    </Text>
                                                    {isLocked && (
                                                        <Badge
                                                            size="xs"
                                                            color="orange"
                                                            variant="filled"
                                                            leftSection={<IconLock size={10} />}
                                                        >
                                                            {t("Locked")}
                                                        </Badge>
                                                    )}
                                                </Group>
                                            </Box>
                                        </Group>
                                    </UnstyledButton>

                                    <Tooltip label={isVisible ? t("Hide layer") : t("Show layer")}>
                                        <ActionIcon
                                            variant="subtle"
                                            size={36}
                                            aria-label={
                                                isVisible ? t("Hide layer") : t("Show layer")
                                            }
                                            onClick={() => visibilityCb(index, !isVisible)}
                                        >
                                            {isVisible ? (
                                                <IconEye size={18} />
                                            ) : (
                                                <IconEyeOff size={18} />
                                            )}
                                        </ActionIcon>
                                    </Tooltip>

                                    <Tooltip label={isLocked ? t("Unlock layer") : t("Lock layer")}>
                                        <ActionIcon
                                            variant={isLocked ? "filled" : "subtle"}
                                            color={isLocked ? "orange" : undefined}
                                            size={36}
                                            aria-pressed={isLocked}
                                            aria-label={
                                                isLocked ? t("Unlock layer") : t("Lock layer")
                                            }
                                            onClick={() => lockCb(index, !isLocked)}
                                        >
                                            {isLocked ? (
                                                <IconLock size={18} />
                                            ) : (
                                                <IconLockOpen size={18} />
                                            )}
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Paper>
                        );
                    })}
                </Stack>
            </ScrollArea.Autosize>
        </Box>
    );
}

export default SelectLayer;
