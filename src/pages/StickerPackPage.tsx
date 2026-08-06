import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Card,
    ColorInput,
    Container,
    Grid,
    Group,
    Paper,
    Progress,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
    Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
    IconArrowDown,
    IconArrowLeft,
    IconArrowUp,
    IconFileZip,
    IconPackage,
    IconPlus,
    IconTrash,
} from "@tabler/icons-react";
import Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import StickerPackPreview, { StickerPreviewStatus } from "../components/pack/StickerPackPreview";
import useCurrentStickerStore from "../store/currenStickerStore";
import useHistoryStickerStore from "../store/historyStickerStore";
import usePackStore from "../store/packStore";
import {
    createPackItemFilename,
    createSavedStickerSourceId,
    hasSavedStickerInPack,
    MAX_PACK_ITEMS,
    sanitizeFilenamePart,
} from "../utils/packUtils";
import { ExportOptions } from "../utils/projectUtils";
import { downloadStickerZip } from "../utils/zipExportUtils";

function BatchExportSavedStickersPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentSticker = useCurrentStickerStore((state) => state.sticker);
    const savedStickers = useHistoryStickerStore((state) => state.histStickerArray);
    const packName = usePackStore((state) => state.packName);
    const items = usePackStore((state) => state.items);
    const exportOptions = usePackStore((state) => state.exportOptions);
    const setPackName = usePackStore((state) => state.setPackName);
    const setExportOptions = usePackStore((state) => state.setExportOptions);
    const addCurrentSticker = usePackStore((state) => state.addCurrentSticker);
    const addSavedSticker = usePackStore((state) => state.addSavedSticker);
    const moveItem = usePackStore((state) => state.moveItem);
    const removeItem = usePackStore((state) => state.removeItem);
    const clearItems = usePackStore((state) => state.clearItems);
    const [statuses, setStatuses] = useState<Record<string, StickerPreviewStatus>>({});
    const [savedPreviewStatuses, setSavedPreviewStatuses] = useState<
        Record<string, StickerPreviewStatus>
    >({});
    const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(
        null,
    );
    const stageRefs = useRef(new Map<string, Konva.Stage>());

    const packIsFull = items.length >= MAX_PACK_ITEMS;
    const allItemsReady =
        items.length > 0 &&
        items.every((item) => statuses[item.id] === "ready" && stageRefs.current.has(item.id));

    useEffect(() => {
        const activeIds = new Set(items.map((item) => item.id));
        for (const id of stageRefs.current.keys()) {
            if (!activeIds.has(id)) stageRefs.current.delete(id);
        }
        setStatuses((current) =>
            Object.fromEntries(Object.entries(current).filter(([id]) => activeIds.has(id))),
        );
    }, [items]);

    const updateStatus = useCallback((itemId: string, status: StickerPreviewStatus) => {
        setStatuses((current) =>
            current[itemId] === status ? current : { ...current, [itemId]: status },
        );
    }, []);

    const updateSavedPreviewStatus = useCallback((itemId: string, status: StickerPreviewStatus) => {
        setSavedPreviewStatuses((current) =>
            current[itemId] === status ? current : { ...current, [itemId]: status },
        );
    }, []);

    function notifyPackLimit() {
        notifications.show({
            color: "orange",
            title: t("Sticker pack is full"),
            message: t("A sticker pack can contain up to 40 items"),
        });
    }

    function addCurrent() {
        if (!addCurrentSticker(currentSticker)) notifyPackLimit();
    }

    function confirmClear() {
        modals.openConfirmModal({
            title: t("Clear sticker pack"),
            children: <Text size="sm">{t("Remove every item from this sticker pack?")}</Text>,
            labels: { confirm: t("Clear sticker pack"), cancel: t("Cancel") },
            confirmProps: { color: "red" },
            onConfirm: clearItems,
        });
    }

    async function exportPack() {
        if (!allItemsReady || exportProgress) return;
        try {
            setExportProgress({ current: 0, total: items.length });
            await downloadStickerZip(
                items.map((item, index) => ({
                    filename: createPackItemFilename(index, item.name),
                    stage: stageRefs.current.get(item.id)!,
                    layers: item.layers,
                })),
                exportOptions,
                sanitizeFilenamePart(packName, "sticker-pack"),
                (current, total) => setExportProgress({ current, total }),
            );
            notifications.show({
                color: "green",
                title: t("Success"),
                message: t("Sticker pack ZIP downloaded"),
            });
        } catch (error) {
            notifications.show({
                color: "red",
                title: t("ZIP export failed"),
                message: (error as Error).message,
            });
        } finally {
            setExportProgress(null);
        }
    }

    return (
        <Container size="xl" py={{ base: "md", md: "xl" }}>
            <Group justify="space-between" align="flex-start" mb="xl">
                <Box>
                    <Group gap="xs">
                        <IconPackage size={28} />
                        <Title order={1}>{t("Batch Export Saved Stickers")}</Title>
                    </Group>
                    <Text c="dimmed" mt={4}>
                        {t("Select saved stickers and export them as one ordered ZIP")}
                    </Text>
                </Box>
                <Button
                    variant="default"
                    leftSection={<IconArrowLeft size={18} />}
                    onClick={() => navigate("/")}
                >
                    {t("Back to editor")}
                </Button>
            </Group>

            <Grid align="flex-start" gap="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="md">
                        <Paper withBorder radius="md" p="md">
                            <Text fw={600}>{t("Current canvas")}</Text>
                            <Text size="sm" c="dimmed" mb="sm">
                                {t("Add a snapshot of the current editor canvas")}
                            </Text>
                            <Button
                                fullWidth
                                leftSection={<IconPlus size={16} />}
                                disabled={packIsFull || currentSticker.length === 0}
                                onClick={addCurrent}
                            >
                                {t("Add current canvas")}
                            </Button>
                        </Paper>

                        <Paper withBorder radius="md" p="md">
                            <Text fw={600} mb="sm">
                                {t("Saved stickers")}
                            </Text>
                            {savedStickers.length === 0 ? (
                                <Text c="dimmed" size="sm" ta="center" py="lg">
                                    {t("You have no saved sticker in history")}
                                </Text>
                            ) : (
                                <Stack gap="xs">
                                    {savedStickers.map((sticker, index) => {
                                        const sourceId = createSavedStickerSourceId(sticker);
                                        const previewId = `saved-preview-${sourceId || index}`;
                                        const previewStatus =
                                            savedPreviewStatuses[previewId] ?? "loading";
                                        const included = hasSavedStickerInPack(items, sourceId);
                                        const name = t("Saved sticker {{number}}", {
                                            number: index + 1,
                                        });
                                        return (
                                            <Card key={sourceId || index} withBorder padding="sm">
                                                <Box mb="sm">
                                                    <StickerPackPreview
                                                        itemId={previewId}
                                                        layers={sticker}
                                                        onStatusChange={updateSavedPreviewStatus}
                                                    />
                                                </Box>
                                                <Group justify="space-between" wrap="nowrap">
                                                    <Box style={{ minWidth: 0 }}>
                                                        <Text fw={600} truncate>
                                                            {name}
                                                        </Text>
                                                        <Group gap={6} mt={2}>
                                                            <Text size="xs" c="dimmed">
                                                                {sticker.length}{" "}
                                                                {t("Layers").toLowerCase()}
                                                            </Text>
                                                            <Badge
                                                                size="xs"
                                                                variant="light"
                                                                color={
                                                                    previewStatus === "error"
                                                                        ? "red"
                                                                        : previewStatus === "ready"
                                                                          ? "green"
                                                                          : "blue"
                                                                }
                                                            >
                                                                {previewStatus === "error"
                                                                    ? t("Preview failed")
                                                                    : previewStatus === "ready"
                                                                      ? t("Ready")
                                                                      : t("Preparing preview")}
                                                            </Badge>
                                                        </Group>
                                                    </Box>
                                                    <Button
                                                        size="compact-sm"
                                                        variant={included ? "default" : "light"}
                                                        disabled={included || packIsFull}
                                                        onClick={() =>
                                                            addSavedSticker({
                                                                id: sourceId,
                                                                name,
                                                                layers: sticker,
                                                            })
                                                        }
                                                    >
                                                        {included ? t("Added") : t("Add")}
                                                    </Button>
                                                </Group>
                                            </Card>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Paper>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="md">
                        <Paper withBorder radius="md" p="md">
                            <Text fw={600} mb="sm">
                                {t("Batch export settings")}
                            </Text>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                <TextInput
                                    label={t("ZIP name")}
                                    value={packName}
                                    onChange={(event) => setPackName(event.currentTarget.value)}
                                />
                                <Select
                                    label={t("Export bounds")}
                                    allowDeselect={false}
                                    data={[
                                        { value: "content", label: t("Visible content") },
                                        { value: "canvas", label: t("Full canvas") },
                                    ]}
                                    value={exportOptions.bounds}
                                    onChange={(value) =>
                                        setExportOptions({
                                            ...exportOptions,
                                            bounds: value as ExportOptions["bounds"],
                                        })
                                    }
                                />
                                <Select
                                    label={t("Resolution")}
                                    allowDeselect={false}
                                    data={[
                                        { value: "1", label: "1×" },
                                        { value: "2", label: "2×" },
                                        { value: "3", label: "3×" },
                                    ]}
                                    value={String(exportOptions.pixelRatio)}
                                    onChange={(value) =>
                                        setExportOptions({
                                            ...exportOptions,
                                            pixelRatio: Number(
                                                value,
                                            ) as ExportOptions["pixelRatio"],
                                        })
                                    }
                                />
                                <Stack gap={4} justify="flex-end">
                                    <Switch
                                        label={t("Transparent background")}
                                        checked={exportOptions.background === null}
                                        onChange={(event) =>
                                            setExportOptions({
                                                ...exportOptions,
                                                background: event.currentTarget.checked
                                                    ? null
                                                    : "#ffffff",
                                            })
                                        }
                                    />
                                </Stack>
                                {exportOptions.background !== null && (
                                    <ColorInput
                                        label={t("Background color")}
                                        value={exportOptions.background}
                                        onChange={(background) =>
                                            setExportOptions({ ...exportOptions, background })
                                        }
                                    />
                                )}
                            </SimpleGrid>
                        </Paper>

                        {packIsFull && (
                            <Alert color="orange" title={t("Sticker pack is full")}>
                                {t("A sticker pack can contain up to 40 items")}
                            </Alert>
                        )}

                        <Group justify="space-between">
                            <Group gap="xs">
                                <Title order={2}>{t("Stickers to export")}</Title>
                                <Badge>
                                    {items.length} / {MAX_PACK_ITEMS}
                                </Badge>
                            </Group>
                            <Group>
                                <Button
                                    variant="default"
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    disabled={items.length === 0 || Boolean(exportProgress)}
                                    onClick={confirmClear}
                                >
                                    {t("Clear")}
                                </Button>
                                <Button
                                    leftSection={<IconFileZip size={17} />}
                                    disabled={!allItemsReady || Boolean(exportProgress)}
                                    loading={Boolean(exportProgress)}
                                    onClick={() => void exportPack()}
                                >
                                    {t("Download pack ZIP")}
                                </Button>
                            </Group>
                        </Group>

                        {exportProgress && (
                            <Paper withBorder radius="md" p="md">
                                <Text size="sm" mb="xs">
                                    {t(
                                        "Exporting sticker {{current}} of {{total}}",
                                        exportProgress,
                                    )}
                                </Text>
                                <Progress
                                    value={(exportProgress.current / exportProgress.total) * 100}
                                    animated
                                />
                            </Paper>
                        )}

                        {items.length === 0 ? (
                            <Paper withBorder radius="md" p="xl">
                                <Text c="dimmed" ta="center">
                                    {t(
                                        "Add the current canvas or a saved sticker to start an export",
                                    )}
                                </Text>
                            </Paper>
                        ) : (
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                {items.map((item, index) => {
                                    const status = statuses[item.id] ?? "loading";
                                    return (
                                        <Card key={item.id} withBorder radius="md" padding="md">
                                            <StickerPackPreview
                                                ref={(stage) => {
                                                    if (stage)
                                                        stageRefs.current.set(item.id, stage);
                                                    else stageRefs.current.delete(item.id);
                                                }}
                                                itemId={item.id}
                                                layers={item.layers}
                                                onStatusChange={updateStatus}
                                            />
                                            <Group justify="space-between" mt="sm" wrap="nowrap">
                                                <Box style={{ minWidth: 0 }}>
                                                    <Text fw={600} truncate>
                                                        {String(index + 1).padStart(2, "0")}.{" "}
                                                        {item.sourceType === "current"
                                                            ? t("Current sticker")
                                                            : item.name}
                                                    </Text>
                                                    <Badge
                                                        size="sm"
                                                        variant="light"
                                                        color={
                                                            status === "error"
                                                                ? "red"
                                                                : status === "ready"
                                                                  ? "green"
                                                                  : "blue"
                                                        }
                                                    >
                                                        {status === "error"
                                                            ? t("Preview failed")
                                                            : status === "ready"
                                                              ? t("Ready")
                                                              : t("Preparing preview")}
                                                    </Badge>
                                                </Box>
                                                <Group gap={4} wrap="nowrap">
                                                    <Tooltip label={t("Move up")}>
                                                        <ActionIcon
                                                            variant="default"
                                                            aria-label={t("Move up")}
                                                            disabled={
                                                                index === 0 ||
                                                                Boolean(exportProgress)
                                                            }
                                                            onClick={() => moveItem(item.id, -1)}
                                                        >
                                                            <IconArrowUp size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label={t("Move down")}>
                                                        <ActionIcon
                                                            variant="default"
                                                            aria-label={t("Move down")}
                                                            disabled={
                                                                index === items.length - 1 ||
                                                                Boolean(exportProgress)
                                                            }
                                                            onClick={() => moveItem(item.id, 1)}
                                                        >
                                                            <IconArrowDown size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label={t("Remove from pack")}>
                                                        <ActionIcon
                                                            color="red"
                                                            variant="light"
                                                            aria-label={t("Remove from pack")}
                                                            disabled={Boolean(exportProgress)}
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Group>
                                            {status === "error" && (
                                                <Text size="xs" c="red" mt="xs">
                                                    {t(
                                                        "Remove this item or restore its missing assets before exporting",
                                                    )}
                                                </Text>
                                            )}
                                        </Card>
                                    );
                                })}
                            </SimpleGrid>
                        )}
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
}

export default BatchExportSavedStickersPage;
