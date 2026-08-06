import {
    Alert,
    Badge,
    Box,
    Button,
    Card,
    ColorInput,
    Container,
    Divider,
    Grid,
    Group,
    Image,
    NumberInput,
    Paper,
    Progress,
    Select,
    SimpleGrid,
    Slider,
    Stack,
    Switch,
    Text,
    Textarea,
    Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
    IconArrowLeft,
    IconDownload,
    IconEdit,
    IconFileZip,
    IconSticker,
} from "@tabler/icons-react";
import Konva from "konva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import BatchStickerPreview, { BatchPreviewStatus } from "../components/batch/BatchStickerPreview";
import SelectCharactor from "../components/main/SelectCharactor";
import { chatactorList, StickerChatactor } from "../data/characters";
import useCurrentStickerStore from "../store/currenStickerStore";
import { downloadBatchZip } from "../utils/batchExportUtils";
import {
    BatchStyleOptions,
    createBatchDrafts,
    DEFAULT_BATCH_TEXT_X,
    DEFAULT_BATCH_TEXT_Y,
    MAX_BATCH_PHRASES,
    parseBatchPhrases,
} from "../utils/batchUtils";
import { downloadFile } from "../utils/downloadUtils";
import { renderStickerExport } from "../utils/exportUtils";
import { loadCanvasFont } from "../utils/fontUtils";
import { getImagesWidthAndHeight } from "../utils/imagesUtils";
import { ExportOptions } from "../utils/projectUtils";

const defaultCharacter =
    chatactorList.find((character) => character.img === "img/Ichika/Ichika_09.png") ??
    chatactorList[0];

function BatchMakerPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const modifyCurrentSticker = useCurrentStickerStore((state) => state.modifySticker);
    const [character, setCharacter] = useState<StickerChatactor>(defaultCharacter);
    const [phraseInput, setPhraseInput] = useState(defaultCharacter.defaultText.text);
    const [fontFamily, setFontFamily] = useState<BatchStyleOptions["fontFamily"]>("YurukaStd");
    const [maxFontSize, setMaxFontSize] = useState(42);
    const [fill, setFill] = useState(defaultCharacter.color);
    const [stroke, setStroke] = useState("#ffffff");
    const [strokeWidth, setStrokeWidth] = useState(12);
    const [rotation, setRotation] = useState(20);
    const [textX, setTextX] = useState(DEFAULT_BATCH_TEXT_X);
    const [textY, setTextY] = useState(DEFAULT_BATCH_TEXT_Y);
    const [pixelRatio, setPixelRatio] = useState<1 | 2 | 3>(2);
    const [background, setBackground] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const [fontReady, setFontReady] = useState(false);
    const [previewStatuses, setPreviewStatuses] = useState<Record<string, BatchPreviewStatus>>({});
    const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(
        null,
    );
    const stageRefs = useRef(new Map<string, Konva.Stage>());

    const phrases = useMemo(() => parseBatchPhrases(phraseInput), [phraseInput]);
    const hasTooManyPhrases = phrases.length > MAX_BATCH_PHRASES;
    const style = useMemo<BatchStyleOptions>(
        () => ({ fontFamily, maxFontSize, fill, stroke, strokeWidth, rotation, textX, textY }),
        [fill, fontFamily, maxFontSize, rotation, stroke, strokeWidth, textX, textY],
    );

    useEffect(() => {
        let active = true;
        setImageSize(null);
        void getImagesWidthAndHeight(character.img)
            .then(({ w, h }) => {
                if (active) setImageSize({ width: w, height: h });
            })
            .catch(() => {
                if (active) {
                    notifications.show({
                        color: "red",
                        title: t("Error"),
                        message: t("Character image failed to load"),
                    });
                }
            });

        return () => {
            active = false;
        };
    }, [character.img, t]);

    useEffect(() => {
        let active = true;
        setFontReady(false);
        void loadCanvasFont(fontFamily, phrases.join(" ") || "Sekai")
            .then(() => {
                if (active) setFontReady(true);
            })
            .catch(() => {
                if (active) setFontReady(false);
            });

        return () => {
            active = false;
        };
    }, [fontFamily, phrases]);

    const drafts = useMemo(
        () =>
            !hasTooManyPhrases && imageSize
                ? createBatchDrafts(character, phrases, imageSize, style)
                : [],
        [character, fontReady, hasTooManyPhrases, imageSize, phrases, style],
    );

    useEffect(() => {
        const activeIds = new Set(drafts.map((draft) => draft.id));
        for (const draftId of stageRefs.current.keys()) {
            if (!activeIds.has(draftId)) stageRefs.current.delete(draftId);
        }
        setPreviewStatuses((current) =>
            Object.fromEntries(
                Object.entries(current).filter(([draftId]) => activeIds.has(draftId)),
            ),
        );
    }, [drafts]);

    const updatePreviewStatus = useCallback((draftId: string, status: BatchPreviewStatus) => {
        setPreviewStatuses((current) =>
            current[draftId] === status ? current : { ...current, [draftId]: status },
        );
    }, []);

    const exportOptions = useMemo<ExportOptions>(
        () => ({
            bounds: "content",
            background,
            pixelRatio,
            filename: "sekai-sticker",
        }),
        [background, pixelRatio],
    );
    const allDraftsReady =
        drafts.length > 0 &&
        drafts.every(
            (draft) =>
                draft.valid &&
                previewStatuses[draft.id] === "ready" &&
                stageRefs.current.has(draft.id),
        );
    const invalidDraftCount = drafts.filter((draft) => !draft.valid).length;

    function changeCharacter(nextCharacter: StickerChatactor) {
        setCharacter(nextCharacter);
        setFill(nextCharacter.color);
    }

    function downloadDraft(draftId: string) {
        const draft = drafts.find((item) => item.id === draftId);
        const stage = stageRefs.current.get(draftId);
        if (!draft || !stage || !draft.valid || previewStatuses[draftId] !== "ready") return;

        downloadFile(renderStickerExport(stage, draft.layers, exportOptions), draft.filename);
    }

    function editDraft(draftId: string) {
        const draft = drafts.find((item) => item.id === draftId);
        if (!draft?.valid) return;

        modals.openConfirmModal({
            title: t("Replace current canvas?"),
            children: (
                <Text size="sm">{t("Opening this sticker replaces the current canvas")}</Text>
            ),
            labels: { confirm: t("Replace and edit"), cancel: t("Cancel") },
            onConfirm: () => {
                modifyCurrentSticker(draft.layers);
                navigate("/");
            },
        });
    }

    async function exportAll() {
        if (!allDraftsReady || exportProgress) return;

        try {
            const items = drafts.map((draft) => ({
                draft,
                stage: stageRefs.current.get(draft.id)!,
            }));
            setExportProgress({ current: 0, total: items.length });
            await downloadBatchZip(items, exportOptions, (current, total) =>
                setExportProgress({ current, total }),
            );
            notifications.show({
                color: "green",
                title: t("Success"),
                message: t("Batch ZIP downloaded"),
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
                        <IconSticker size={28} />
                        <Title order={1}>{t("Batch Maker")}</Title>
                    </Group>
                    <Text c="dimmed" mt={4}>
                        {t("Create up to 20 stickers from one character and multiple phrases")}
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
                            <Text fw={600} mb="sm">
                                {t("Choose character")}
                            </Text>
                            <Group wrap="nowrap">
                                <Image
                                    src={character.img}
                                    alt={character.name}
                                    w={84}
                                    h={84}
                                    fit="contain"
                                />
                                <Box style={{ flex: 1 }}>
                                    <Text fw={600}>{character.name}</Text>
                                    <Text size="sm" c="dimmed" mb="sm">
                                        {character.character}
                                    </Text>
                                    <SelectCharactor
                                        openComp="Button"
                                        title={t("Choose character")}
                                        addStickerCb={changeCharacter}
                                    />
                                </Box>
                            </Group>
                        </Paper>

                        <Paper withBorder radius="md" p="md">
                            <Group justify="space-between" mb="xs">
                                <Text fw={600}>{t("Phrases")}</Text>
                                <Badge color={hasTooManyPhrases ? "red" : "blue"}>
                                    {phrases.length} / {MAX_BATCH_PHRASES}
                                </Badge>
                            </Group>
                            <Textarea
                                autosize
                                minRows={6}
                                maxRows={12}
                                label={t("One phrase per line")}
                                value={phraseInput}
                                error={
                                    hasTooManyPhrases
                                        ? t("Remove extra phrases before exporting")
                                        : undefined
                                }
                                onChange={(event) => setPhraseInput(event.currentTarget.value)}
                            />
                        </Paper>

                        <Paper withBorder radius="md" p="md">
                            <Text fw={600} mb="sm">
                                {t("Shared style")}
                            </Text>
                            <Stack gap="sm">
                                <Select
                                    label={t("Font Family")}
                                    allowDeselect={false}
                                    data={[
                                        { value: "YurukaStd", label: "YurukaStd" },
                                        { value: "SSFangTangTi", label: "SSFangTangTi" },
                                        {
                                            value: "ChillRoundGothic_Bold",
                                            label: "ChillRoundGothic Bold",
                                        },
                                    ]}
                                    value={fontFamily}
                                    onChange={(value) =>
                                        setFontFamily(value as BatchStyleOptions["fontFamily"])
                                    }
                                />
                                <NumberInput
                                    label={t("Maximum font size")}
                                    min={12}
                                    max={100}
                                    value={maxFontSize}
                                    onChange={(value) => setMaxFontSize(Number(value))}
                                />
                                <Group grow align="flex-start">
                                    <NumberInput
                                        label={`${t("Position")} X`}
                                        min={-260}
                                        max={300}
                                        value={textX}
                                        onChange={(value) => setTextX(Number(value))}
                                    />
                                    <NumberInput
                                        label={`${t("Position")} Y`}
                                        min={-100}
                                        max={300}
                                        value={textY}
                                        onChange={(value) => setTextY(Number(value))}
                                    />
                                </Group>
                                <Box>
                                    <Text size="sm" fw={500} mb={4}>
                                        {t("Position")} X: {textX}
                                    </Text>
                                    <Slider
                                        aria-label={`${t("Position")} X`}
                                        min={-260}
                                        max={300}
                                        value={textX}
                                        onChange={setTextX}
                                    />
                                </Box>
                                <Box>
                                    <Text size="sm" fw={500} mb={4}>
                                        {t("Position")} Y: {textY}
                                    </Text>
                                    <Slider
                                        aria-label={`${t("Position")} Y`}
                                        min={-100}
                                        max={300}
                                        value={textY}
                                        onChange={setTextY}
                                    />
                                </Box>
                                <Group grow align="flex-start">
                                    <ColorInput
                                        label={t("Text color")}
                                        value={fill}
                                        onChange={setFill}
                                    />
                                    <ColorInput
                                        label={t("Stroke color")}
                                        value={stroke}
                                        onChange={setStroke}
                                    />
                                </Group>
                                <Text size="sm" fw={500}>
                                    {t("Stroke Width")}: {strokeWidth}
                                </Text>
                                <Slider
                                    min={0}
                                    max={30}
                                    value={strokeWidth}
                                    onChange={setStrokeWidth}
                                />
                                <Text size="sm" fw={500}>
                                    {t("Rotation")}: {rotation}°
                                </Text>
                                <Slider
                                    min={-45}
                                    max={45}
                                    value={rotation}
                                    onChange={setRotation}
                                />
                            </Stack>
                        </Paper>

                        <Paper withBorder radius="md" p="md">
                            <Text fw={600} mb="sm">
                                {t("Export settings")}
                            </Text>
                            <Stack gap="sm">
                                <Select
                                    label={t("Resolution")}
                                    allowDeselect={false}
                                    data={[
                                        { value: "1", label: "1×" },
                                        { value: "2", label: "2×" },
                                        { value: "3", label: "3×" },
                                    ]}
                                    value={String(pixelRatio)}
                                    onChange={(value) => setPixelRatio(Number(value) as 1 | 2 | 3)}
                                />
                                <Switch
                                    label={t("Transparent background")}
                                    checked={background === null}
                                    onChange={(event) =>
                                        setBackground(
                                            event.currentTarget.checked ? null : "#ffffff",
                                        )
                                    }
                                />
                                {background !== null && (
                                    <ColorInput
                                        label={t("Background color")}
                                        value={background}
                                        onChange={setBackground}
                                    />
                                )}
                                <Button
                                    leftSection={<IconFileZip size={18} />}
                                    disabled={!allDraftsReady || Boolean(exportProgress)}
                                    loading={Boolean(exportProgress)}
                                    onClick={() => void exportAll()}
                                >
                                    {t("Download all as ZIP")}
                                </Button>
                                {exportProgress && (
                                    <Box aria-live="polite">
                                        <Text size="xs" c="dimmed" mb={4}>
                                            {t(
                                                "Exporting sticker {{current}} of {{total}}",
                                                exportProgress,
                                            )}
                                        </Text>
                                        <Progress
                                            value={
                                                (exportProgress.current / exportProgress.total) *
                                                100
                                            }
                                        />
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Group justify="space-between" mb="md">
                        <Title order={2}>{t("Previews")}</Title>
                        {drafts.length > 0 && (
                            <Text size="sm" c="dimmed">
                                {t("{{count}} stickers", { count: drafts.length })}
                            </Text>
                        )}
                    </Group>

                    {hasTooManyPhrases && (
                        <Alert color="red" mb="md">
                            {t("Maximum 20 phrases per batch")}
                        </Alert>
                    )}
                    {!hasTooManyPhrases && phrases.length === 0 && (
                        <Paper withBorder radius="md" p="xl">
                            <Text ta="center" c="dimmed">
                                {t("Add a phrase to create your first batch preview")}
                            </Text>
                        </Paper>
                    )}
                    {invalidDraftCount > 0 && (
                        <Alert color="orange" mb="md">
                            {t("Some phrases are too long to fit even at the minimum font size")}
                        </Alert>
                    )}

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        {drafts.map((draft) => {
                            const status = previewStatuses[draft.id] ?? "loading";
                            const ready = status === "ready" && draft.valid;

                            return (
                                <Card key={draft.id} withBorder radius="md" padding="md">
                                    <BatchStickerPreview
                                        ref={(stage) => {
                                            if (stage) stageRefs.current.set(draft.id, stage);
                                            else stageRefs.current.delete(draft.id);
                                        }}
                                        draft={draft}
                                        fontReady={fontReady}
                                        onStatusChange={updatePreviewStatus}
                                    />
                                    <Divider my="md" />
                                    <Text fw={600} lineClamp={2} title={draft.phrase}>
                                        {draft.phrase}
                                    </Text>
                                    <Group justify="space-between" mt={4} mb="sm">
                                        <Text size="xs" c="dimmed">
                                            {t("Font size")}: {draft.fontSize}px
                                        </Text>
                                        {status === "loading" && (
                                            <Badge variant="light">{t("Preparing preview")}</Badge>
                                        )}
                                        {status === "error" && (
                                            <Badge color="red" variant="light">
                                                {t("Preview failed")}
                                            </Badge>
                                        )}
                                        {!draft.valid && (
                                            <Badge color="orange" variant="light">
                                                {t("Text too long")}
                                            </Badge>
                                        )}
                                    </Group>
                                    <Group grow>
                                        <Button
                                            variant="light"
                                            leftSection={<IconDownload size={16} />}
                                            disabled={!ready || Boolean(exportProgress)}
                                            onClick={() => downloadDraft(draft.id)}
                                        >
                                            {t("Download")}
                                        </Button>
                                        <Button
                                            variant="default"
                                            leftSection={<IconEdit size={16} />}
                                            disabled={!draft.valid || Boolean(exportProgress)}
                                            onClick={() => editDraft(draft.id)}
                                        >
                                            {t("Edit")}
                                        </Button>
                                    </Group>
                                </Card>
                            );
                        })}
                    </SimpleGrid>
                </Grid.Col>
            </Grid>
        </Container>
    );
}

export default BatchMakerPage;
