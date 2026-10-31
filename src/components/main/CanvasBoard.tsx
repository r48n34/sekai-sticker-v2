import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
    AppShell,
    Button,
    Box,
    Card,
    Container,
    Group,
    Menu,
    ActionIcon,
    Tooltip,
    Divider,
    Drawer,
    Grid,
} from "@mantine/core";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { useDisclosure, useHotkeys } from "@mantine/hooks";

import AdjustableText from "./helper/AdjustableText";
import CanvasTransImage from "./helper/CanvasTransImage";
import {
    IconArrowDown,
    IconArrowBackUp,
    IconArrowForwardUp,
    IconArrowUp,
    IconAdjustments,
    IconBox,
    IconCopy,
    IconCopyPlus,
    IconDownload,
    IconDotsVertical,
    IconFileSmile,
    IconFolder,
    IconLink,
    IconNotebook,
    IconPackage,
    IconPlus,
    IconSticker,
    IconTemplate,
    IconTrash,
} from "@tabler/icons-react";
import {
    CONFIGS,
    createExternalImages,
    createImages,
    createText,
    duplicateNewObject,
    normalizeStickerList,
    StickerObject,
} from "../../utils/createSticker";
import SelectCharactor from "./SelectCharactor";

import { dataURLToBlob, downloadFile, timer } from "../../utils/downloadUtils";

import { KonvaEventObject } from "konva/lib/Node";
import { chatactorList } from "../../data/characters";
import ColorToggleBtn from "../common/ColorToggleBtn";
import { copyImages } from "../../utils/copyUtils";
import { notifications } from "@mantine/notifications";
import CreateLocalImages from "./helper/CreateLocalImages";
import SelectLayer from "./SelectLayer";
import DeselectLayer from "./utils/DeselectLayer";
import { type EmojiClickData } from "emoji-picker-react";
import { getImagesWidthAndHeight } from "../../utils/imagesUtils";
import useCurrentStickerStore from "../../store/currenStickerStore";
import DropZoneFullScreen from "./helper/DropZoneFullScreen";
import SaveToHistory from "./helper/SaveToHistory";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ChangeLanguage from "../common/ChangeLanguage";
import ElementInspector from "./ElementInspector";
import ResponsiveStage from "./ResponsiveStage";
import { useEditorHistory } from "../../hooks/useEditorHistory";
import { restoreAssetUrls, saveAsset } from "../../utils/assetStorage";
import ProjectManager from "./ProjectManager";
import ExportStudio from "./ExportStudio";
import { ExportOptions } from "../../utils/projectUtils";
import { renderStickerExport } from "../../utils/exportUtils";
import TemplateGallery from "./TemplateGallery";
import EditorOnboarding from "./EditorOnboarding";

const CreateExternalImages = lazy(() => import("./helper/CreateExternalImages"));
const LearnMore = lazy(() => import("../about/LearnMore"));
const SelectEmoji = lazy(() => import("./SelectEmoji"));
const SelectHistorySticker = lazy(() => import("./SelectHistorySticker"));

function CanvasBoard() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const stageRef = useRef<Konva.Stage>(null);

    // History Sticker content
    const storedSticker = useCurrentStickerStore((state) => state.sticker);
    const modifyStoredSticker = useCurrentStickerStore((state) => state.modifySticker);

    // Current Sticker content
    const {
        state: stickerContent,
        handlers: stickerContentHandlers,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useEditorHistory<StickerObject>(normalizeStickerList(storedSticker));

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedShape = stickerContent.find((v) => v.id === selectedId);
    const [emojiOpened, { open: openEmoji, close: closeEmoji }] = useDisclosure(false);
    const [newStickerOpened, { open: openNewSticker, close: closeNewSticker }] =
        useDisclosure(false);
    const [externalImageOpened, { open: openExternalImage, close: closeExternalImage }] =
        useDisclosure(false);
    const [savedStickerOpened, { open: openSavedSticker, close: closeSavedSticker }] =
        useDisclosure(false);
    const [learnMoreOpened, { open: openLearnMore, close: closeLearnMore }] = useDisclosure(false);
    const [inspectorOpened, { open: openInspector, close: closeInspector }] = useDisclosure(false);
    const [projectsOpened, { open: openProjects, close: closeProjects }] = useDisclosure(false);
    const [exportOpened, { open: openExport, close: closeExport }] = useDisclosure(false);
    const [templatesOpened, { open: openTemplates, close: closeTemplates }] = useDisclosure(false);
    const [exportPreview, setExportPreview] = useState("");
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        bounds: "content",
        background: null,
        pixelRatio: 2,
        filename: "sekai-sticker",
    });

    useEffect(() => {
        if (!exportOpened || !stageRef.current || selectedId !== null) return;

        const frame = requestAnimationFrame(() => {
            if (stageRef.current) {
                setExportPreview(
                    renderStickerExport(stageRef.current, stickerContent, exportOptions),
                );
            }
        });

        return () => cancelAnimationFrame(frame);
    }, [exportOpened, exportOptions, selectedId, stickerContent]);

    // Check deselect click
    function checkDeselect(
        e: Konva.KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent, any>,
    ) {
        // clicked On Empty
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
        }
    }

    // Add new attributes to specific list item
    function onChangeHelper(newAttrs: StickerObject, ind: number) {
        stickerContentHandlers.setItem(ind, newAttrs);
    }

    function changeSelectedProp<K extends keyof StickerObject>(
        property: K,
        value: StickerObject[K],
        coalesceKey?: string,
    ) {
        const index = stickerContent.findIndex((item) => item.id === selectedId);
        stickerContentHandlers.setItemProp(index, property, value, coalesceKey);
    }

    function changeSelectedProps(patch: Partial<StickerObject>) {
        const index = stickerContent.findIndex((item) => item.id === selectedId);
        if (index < 0) return;
        stickerContentHandlers.setItem(index, { ...stickerContent[index], ...patch });
    }

    function centerSelected(axis: "x" | "y") {
        if (!selectedShape) return;
        const estimatedWidth =
            selectedShape.width ??
            Math.max(5, (selectedShape.fontSize ?? 42) * selectedShape.content.length * 0.55);
        const estimatedHeight = selectedShape.height ?? (selectedShape.fontSize ?? 42) * 1.2;
        changeSelectedProps(
            axis === "x"
                ? { x: (CONFIGS.stageWidth - estimatedWidth) / 2 }
                : { y: (CONFIGS.stageHeight - estimatedHeight) / 2 },
        );
    }

    function resetSelectedTransform() {
        if (!selectedShape) return;
        changeSelectedProps({
            x: selectedShape.format === "text" ? CONFIGS.initialTextX : CONFIGS.initialStickerX,
            y: selectedShape.format === "text" ? CONFIGS.initialTextY : CONFIGS.initialStickerY,
            rotation: selectedShape.format === "text" ? 20 : 0,
            opacity: 1,
            flipX: false,
            flipY: false,
        });
    }

    async function callBackImageURL(imageURL: string, name?: string) {
        try {
            console.log("Start to load image", imageURL);
            const layer = await createExternalImages(imageURL);
            layer.name = name;
            if (imageURL.startsWith("blob:") && "indexedDB" in window) {
                try {
                    layer.assetId = await saveAsset(await (await fetch(imageURL)).blob());
                } catch {
                    // The layer remains usable for this session if durable storage is unavailable.
                }
            }
            stickerContentHandlers.append(layer);

            notifications.show({
                title: t("Success"),
                message: t("Success to import images"),
            });
        } catch (error: any) {
            console.log(error);
            notifications.show({
                title: t("Failed to Import"),
                message: error.message,
            });
        }
    }

    // Delete current selected layer
    function deleteSelectedLayer() {
        setSelectedId(null);
        stickerContentHandlers.remove(stickerContent.findIndex((v) => v.id === selectedId));
    }

    // Duplicate current selected layer
    function duplicateItems() {
        if (selectedShape === undefined) {
            return;
        }
        const newSticker = duplicateNewObject(selectedShape);
        stickerContentHandlers.append(newSticker);
        setSelectedId(newSticker.id);
    }

    function addDefaultTextLayer() {
        const currentSticker = stickerContent.filter((v) => v.format === "image");
        let [defaultText, textColor] = ["Hello", "red"];

        if (currentSticker.length >= 1) {
            const targetStickerInd = currentSticker.length - 1;
            const stickerInfo = chatactorList.find(
                (v) => v.img === currentSticker[targetStickerInd].content,
            );
            defaultText = stickerInfo ? stickerInfo.defaultText.text : "Hello";
            textColor = stickerInfo ? stickerInfo.color : "red";
        }

        stickerContentHandlers.append(createText(defaultText, textColor));
    }

    // Download current selected sticker to PNG
    async function downloadCurrentPng() {
        setSelectedId(null);
        await timer(400);
        const uri = renderStickerExport(stageRef.current!, stickerContent, exportOptions);
        const filename = exportOptions.filename.trim() || "sekai-sticker";
        downloadFile(uri, filename.endsWith(".png") ? filename : `${filename}.png`);
    }

    // Download current selected sticker to PNG
    async function copyCurrentPng() {
        try {
            setSelectedId(null);
            await timer(400);

            const blobImage = await dataURLToBlob(
                renderStickerExport(stageRef.current!, stickerContent, exportOptions),
            );

            copyImages(blobImage, "image/png");

            notifications.show({
                title: t("Success"),
                message: t("Image copied to your clipboard"),
            });
        } catch (error) {
            console.error(error);
            notifications.show({
                title: t("Error"),
                message: (error as Error).message,
            });
        }
    }

    useHotkeys([
        ["mod+z", undo],
        ["mod+shift+z", redo],
        ["mod+y", redo],
        [
            "delete",
            () => {
                if (selectedId !== null) {
                    deleteSelectedLayer();
                }
            },
        ],
        [
            "mod+d",
            () => {
                if (selectedId !== null) {
                    duplicateItems();
                }
            },
        ],
        [
            "mod+s",
            () => {
                copyCurrentPng();
            },
        ],
    ]);

    useEffect(() => {
        modifyStoredSticker(stickerContent);
    }, [modifyStoredSticker, stickerContent]);

    useEffect(() => {
        if (stickerContent.length >= 1) {
            setSelectedId(stickerContent[0].id);
        }
        void restoreAssetUrls(stickerContent).then((restored) => {
            if (restored.some((item, index) => item.content !== stickerContent[index]?.content)) {
                stickerContentHandlers.replaceState(restored);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedId && !stickerContent.some((item) => item.id === selectedId)) {
            setSelectedId(null);
        }
    }, [selectedId, stickerContent]);

    async function changeSelectedCharacter(character: (typeof chatactorList)[number]) {
        const index = stickerContent.findIndex((item) => item.id === selectedId);
        if (index < 0) return;

        const { w, h } = await getImagesWidthAndHeight(character.img);
        const next = stickerContent.map((item, itemIndex) => {
            if (itemIndex === index) {
                return { ...item, content: character.img, width: w, height: h };
            }

            return item.format === "text" ? { ...item, fill: character.color } : item;
        });
        stickerContentHandlers.setState(next);
    }

    return (
        <>
            <EditorOnboarding />
            <DropZoneFullScreen
                callBackImageURL={(imageURL: string, name?: string) => {
                    callBackImageURL(imageURL, name);
                }}
            />
            {emojiOpened && (
                <Suspense fallback={null}>
                    <SelectEmoji
                        openComp="None"
                        opened
                        onClose={closeEmoji}
                        title={t("Add Emoji (Text)")}
                        addEmojiCb={(emoji: EmojiClickData) => {
                            stickerContentHandlers.append(createText(emoji.emoji));
                        }}
                    />
                </Suspense>
            )}
            <SelectCharactor
                openComp="None"
                opened={newStickerOpened}
                onClose={closeNewSticker}
                title={t("Add New Sticker")}
                addStickerCb={async (v) => {
                    stickerContentHandlers.append(await createImages(v.img));
                }}
            />
            {externalImageOpened && (
                <Suspense fallback={null}>
                    <CreateExternalImages
                        openComp="None"
                        opened
                        onClose={closeExternalImage}
                        title={t("Upload URL Image")}
                        callBackImageURL={(imageURL: string) => {
                            callBackImageURL(imageURL);
                        }}
                    />
                </Suspense>
            )}
            {savedStickerOpened && (
                <Suspense fallback={null}>
                    <SelectHistorySticker
                        openComp="None"
                        opened
                        onClose={closeSavedSticker}
                        title={t("View Saved Stickers")}
                        setStickerCb={(sticker) => {
                            stickerContentHandlers.setState(sticker);
                        }}
                    />
                </Suspense>
            )}
            {learnMoreOpened && (
                <Suspense fallback={null}>
                    <LearnMore opened onClose={closeLearnMore} hideTrigger />
                </Suspense>
            )}
            <Drawer
                opened={inspectorOpened}
                onClose={closeInspector}
                title={t("Modify Elements")}
                position="bottom"
                size="72%"
                radius="md"
                closeButtonProps={{ "aria-label": t("Close inspector") }}
            >
                <ElementInspector
                    selectedShape={selectedShape}
                    onChangeProp={changeSelectedProp}
                    onChangeCharacter={changeSelectedCharacter}
                    onChangeMany={changeSelectedProps}
                    onCenter={centerSelected}
                    onResetTransform={resetSelectedTransform}
                />
            </Drawer>
            <ProjectManager
                opened={projectsOpened}
                onClose={closeProjects}
                layers={stickerContent}
                onLoad={(layers) => {
                    stickerContentHandlers.setState(layers);
                    setSelectedId(layers[0]?.id ?? null);
                }}
            />
            <ExportStudio
                opened={exportOpened}
                onClose={closeExport}
                previewUrl={exportPreview}
                options={exportOptions}
                onChange={setExportOptions}
                onDownload={downloadCurrentPng}
                onCopy={copyCurrentPng}
            />
            <TemplateGallery
                opened={templatesOpened}
                onClose={closeTemplates}
                onApply={(layers) => {
                    stickerContentHandlers.setState(layers);
                    setSelectedId(layers[0]?.id ?? null);
                }}
            />

            <AppShell padding="md">
                <AppShell.Header>
                    <Group
                        h="100%"
                        px="md"
                        gap="xs"
                        wrap="nowrap"
                        justify="space-between"
                        style={{
                            // background:
                            //     "linear-gradient(180deg, rgb(88, 150, 204) 0%, rgb(60, 126, 186) 100%)",
                            // color: "white",
                        }}
                    >
                        <Group gap="xs" wrap="nowrap">
                            <Menu position="bottom-start" width={200} withinPortal={false}>
                                <Menu.Target>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        size={36}
                                        aria-label={t("Open navigation menu")}
                                    >
                                        <IconSticker size={18} />
                                    </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Label>{t("Sekai Sticker V2")}</Menu.Label>
                                    <Menu.Item
                                        leftSection={<IconCopyPlus size={14} />}
                                        onClick={() => navigate("/batch")}
                                    >
                                        {t("Batch Maker")}
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconPackage size={14} />}
                                        onClick={() => navigate("/packs")}
                                    >
                                        {t("Batch Export Saved Stickers")}
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item
                                        leftSection={<IconFolder size={14} />}
                                        onClick={openProjects}
                                    >
                                        {t("My Projects")}
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                            <Menu
                                // trigger="hover"
                                openDelay={80}
                                closeDelay={100}
                                withinPortal={false}
                            >
                                <Menu.Target>
                                    <Button variant="subtle" color="gray" size="compact-sm">
                                        <Group gap={6} wrap="nowrap">
                                            <IconDownload size={14} />
                                            <span>{t("Export")}</span>
                                        </Group>
                                    </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<IconDownload size={14} />}
                                        onClick={() => downloadCurrentPng()}
                                    >
                                        {t("Download PNG")}
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconCopyPlus size={14} />}
                                        onClick={() => copyCurrentPng()}
                                    >
                                        {t("Copy PNG to clipboard")}
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item
                                        leftSection={<IconAdjustments size={14} />}
                                        onClick={() => {
                                            setSelectedId(null);
                                            openExport();
                                        }}
                                    >
                                        {t("Export Studio")}
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>

                            <Menu
                                // trigger="hover"
                                openDelay={80}
                                closeDelay={100}
                                withinPortal={false}
                            >
                                <Menu.Target>
                                    <Button variant="subtle" color="gray" size="compact-sm">
                                        <Group gap={6} wrap="nowrap">
                                            <IconPlus size={14} />
                                            <span>{t("Insert")}</span>
                                        </Group>
                                    </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<IconTemplate size={14} />}
                                        onClick={openTemplates}
                                    >
                                        {t("Starter templates")}
                                    </Menu.Item>

                                    <Menu.Divider />
                
                                    <Menu.Item
                                        leftSection={<IconPlus size={14} />}
                                        onClick={() => addDefaultTextLayer()}
                                    >
                                        {t("Add Text")}
                                    </Menu.Item>

                                    <Menu.Item
                                        leftSection={<IconFileSmile size={14} />}
                                        onClick={openEmoji}
                                    >
                                        {t("Add Emoji (Text)")}
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconSticker size={14} />}
                                        onClick={openNewSticker}
                                    >
                                        {t("Add New Sticker")}
                                    </Menu.Item>
                                    <CreateLocalImages
                                        openComp="MenuItem"
                                        title={t("Upload local Image")}
                                        callBackImageURL={(imageURL: string, name?: string) => {
                                            callBackImageURL(imageURL, name);
                                        }}
                                    />
                                    <Menu.Item
                                        leftSection={<IconLink size={14} />}
                                        onClick={openExternalImage}
                                    >
                                        {t("Upload URL Image")}
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>

                            <Menu
                                // trigger="hover"
                                openDelay={80}
                                closeDelay={100}
                                withinPortal={false}
                            >
                                <Menu.Target>
                                    <Button variant="subtle" color="gray" size="compact-sm">
                                        <Group gap={6} wrap="nowrap">
                                            <IconCopy size={14} />
                                            <span>{t("Saved")}</span>
                                        </Group>
                                    </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<IconSticker size={14} />}
                                        onClick={openSavedSticker}
                                    >
                                        {t("View Saved Stickers")}
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>

                        <Group gap="xs" wrap="nowrap" visibleFrom="md">
                            <Menu
                                // trigger="hover"
                                openDelay={80}
                                closeDelay={100}
                                withinPortal={false}
                                width={180}
                            >
                                <Menu.Target>
                                    <Button variant="subtle" color="gray" size="compact-sm">
                                        <Group gap={6} wrap="nowrap">
                                            <IconBox size={14} />
                                            <span>{t("Preferences & Help")}</span>
                                        </Group>
                                    </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Group ml={12}>
                                        <ColorToggleBtn />
                                        <ChangeLanguage />
                                    </Group>
                                    <Divider my="xs" />
                                    <Menu.Item
                                        leftSection={<IconNotebook size={14} />}
                                        onClick={openLearnMore}
                                    >
                                        {t("General information")}
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>

                        <Menu width={200} position="bottom-end">
                            <Menu.Target>
                                <ActionIcon
                                    hiddenFrom="md"
                                    variant="subtle"
                                    color="gray"
                                    size={40}
                                    aria-label={t("Preferences & Help")}
                                >
                                    <IconDotsVertical size={20} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>{t("Preferences & Help")}</Menu.Label>
                                <Group px="sm" py="xs">
                                    <ColorToggleBtn />
                                    <ChangeLanguage />
                                </Group>
                                <Divider my="xs" />
                                <Menu.Item
                                    leftSection={<IconNotebook size={14} />}
                                    onClick={openLearnMore}
                                >
                                    {t("General information")}
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    leftSection={<IconFolder size={14} />}
                                    onClick={openProjects}
                                >
                                    {t("My Projects")}
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconAdjustments size={14} />}
                                    onClick={() => {
                                        setSelectedId(null);
                                        openExport();
                                    }}
                                >
                                    {t("Export Studio")}
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </AppShell.Header>

                <AppShell.Main pb={{ base: 92, md: 16 }}>
                    <Container fluid>
                        {/* <Text fw={600} fz={26} ta="center" mt={40}>
                            <IconSticker /> {t("Sekai Sticker V2")}
                        </Text> */}

                        <Grid mt={40}>
                            <Grid.Col span={{ base: 12, md: 6, lg: 8 }}>
                                <Box>
                                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                                        <Group justify="space-between" mb={16} wrap="nowrap">
                                            <Group gap="xs" wrap="nowrap">
                                                <SaveToHistory />
                                                <Tooltip label={t("Undo")}>
                                                    <ActionIcon
                                                        variant="light"
                                                        size={36}
                                                        aria-label={t("Undo")}
                                                        disabled={!canUndo}
                                                        onClick={undo}
                                                    >
                                                        <IconArrowBackUp size={20} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label={t("Redo")}>
                                                    <ActionIcon
                                                        variant="light"
                                                        size={36}
                                                        aria-label={t("Redo")}
                                                        disabled={!canRedo}
                                                        onClick={redo}
                                                    >
                                                        <IconArrowForwardUp size={20} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>

                                            <Group>
                                                <Tooltip label={t("Download PNG")}>
                                                    <ActionIcon
                                                        variant="light"
                                                        size={36}
                                                        aria-label={t("Download PNG")}
                                                        onClick={() => downloadCurrentPng()}
                                                    >
                                                        <IconDownload
                                                            style={{ width: "70%", height: "70%" }}
                                                            stroke={1.5}
                                                        />
                                                    </ActionIcon>
                                                </Tooltip>

                                                <Tooltip label={t("Copy PNG to clipboard")}>
                                                    <ActionIcon
                                                        variant="light"
                                                        size={36}
                                                        aria-label={t("Copy PNG to clipboard")}
                                                        onClick={() => copyCurrentPng()}
                                                    >
                                                        <IconCopyPlus
                                                            style={{ width: "70%", height: "70%" }}
                                                            stroke={1.5}
                                                        />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>
                                        </Group>

                                        <Divider mb={24} />

                                        <ResponsiveStage
                                            width={CONFIGS.stageWidth}
                                            height={CONFIGS.stageHeight}
                                        >
                                            <Stage
                                                ref={stageRef}
                                                width={CONFIGS.stageWidth}
                                                height={CONFIGS.stageHeight}
                                                onMouseDown={checkDeselect}
                                                onTouchStart={checkDeselect}
                                                style={{
                                                    border: "3px solid rgb(34,138,229, .26)",
                                                    borderRadius: "8px",
                                                    boxSizing: "border-box",
                                                }}
                                            >
                                                <Layer>
                                                    {selectedShape && !selectedShape.locked && (
                                                        <>
                                                            <Line
                                                                points={[
                                                                    CONFIGS.stageWidth / 2,
                                                                    0,
                                                                    CONFIGS.stageWidth / 2,
                                                                    CONFIGS.stageHeight,
                                                                ]}
                                                                stroke="#228be6"
                                                                opacity={0.35}
                                                                dash={[5, 5]}
                                                                listening={false}
                                                            />
                                                            <Line
                                                                points={[
                                                                    0,
                                                                    CONFIGS.stageHeight / 2,
                                                                    CONFIGS.stageWidth,
                                                                    CONFIGS.stageHeight / 2,
                                                                ]}
                                                                stroke="#228be6"
                                                                opacity={0.35}
                                                                dash={[5, 5]}
                                                                listening={false}
                                                            />
                                                        </>
                                                    )}
                                                    {stickerContent.map((sticker, i) => {
                                                        if (sticker.visible === false) return null;

                                                        if (
                                                            sticker.format === "image" ||
                                                            sticker.format === "externalImage"
                                                        ) {
                                                            return (
                                                                <CanvasTransImage
                                                                    key={sticker.id}
                                                                    shapeProps={sticker}
                                                                    isSelected={
                                                                        sticker.id === selectedId &&
                                                                        !sticker.locked
                                                                    }
                                                                    onSelect={() => {
                                                                        if (!sticker.locked) {
                                                                            setSelectedId(
                                                                                sticker.id,
                                                                            );
                                                                        }
                                                                    }}
                                                                    draggable={!sticker.locked}
                                                                    onChange={(
                                                                        newAttrs: StickerObject,
                                                                    ) =>
                                                                        onChangeHelper(newAttrs, i)
                                                                    }
                                                                    url={sticker.content}
                                                                />
                                                            );
                                                        }

                                                        return (
                                                            <AdjustableText
                                                                key={sticker.id}
                                                                shapeProps={sticker}
                                                                isSelected={
                                                                    sticker.id === selectedId &&
                                                                    !sticker.locked
                                                                }
                                                                onSelect={() => {
                                                                    if (!sticker.locked) {
                                                                        setSelectedId(sticker.id);
                                                                    }
                                                                }}
                                                                draggable={!sticker.locked}
                                                                onChange={(
                                                                    newAttrs: StickerObject,
                                                                ) => onChangeHelper(newAttrs, i)}
                                                                content={sticker.content}
                                                            />
                                                        );
                                                    })}
                                                </Layer>
                                            </Stage>
                                        </ResponsiveStage>

                                        <Box mt={16}>
                                            <SelectLayer
                                                data={stickerContent}
                                                selectedId={selectedId}
                                                selectCb={(id) => {
                                                    const layer = stickerContent.find(
                                                        (item) => item.id === id,
                                                    );
                                                    if (!layer?.locked) setSelectedId(id);
                                                }}
                                                reorderCb={(from, to) =>
                                                    stickerContentHandlers.reorder({ from, to })
                                                }
                                                visibilityCb={(index, visible) => {
                                                    stickerContentHandlers.setItemProp(
                                                        index,
                                                        "visible",
                                                        visible,
                                                    );
                                                    if (
                                                        !visible &&
                                                        stickerContent[index]?.id === selectedId
                                                    ) {
                                                        setSelectedId(null);
                                                    }
                                                }}
                                                lockCb={(index, locked) => {
                                                    stickerContentHandlers.setItemProp(
                                                        index,
                                                        "locked",
                                                        locked,
                                                    );
                                                    if (
                                                        locked &&
                                                        stickerContent[index]?.id === selectedId
                                                    ) {
                                                        setSelectedId(null);
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Card>

                                    <Box mb={12} mt={16} visibleFrom="md">
                                        <Card
                                            shadow="sm"
                                            padding="lg"
                                            radius="md"
                                            withBorder
                                            mt={12}
                                        >
                                            <Group justify="space-between">
                                                <Group>
                                                    <Tooltip label={t("Up Layer Level")}>
                                                        <ActionIcon
                                                            variant="light"
                                                            color="blue"
                                                            aria-label={t("Up Layer Level")}
                                                            disabled={selectedShape === undefined}
                                                            onClick={() => {
                                                                const ind =
                                                                    stickerContent.findIndex(
                                                                        (v) => v.id === selectedId,
                                                                    );

                                                                if (ind <= -1) {
                                                                    return;
                                                                }

                                                                stickerContentHandlers.reorder({
                                                                    from: ind,
                                                                    to: Math.min(
                                                                        ind + 1,
                                                                        stickerContent.length - 1,
                                                                    ),
                                                                });
                                                            }}
                                                        >
                                                            <IconArrowUp
                                                                style={{
                                                                    width: "70%",
                                                                    height: "70%",
                                                                }}
                                                                stroke={1.5}
                                                            />
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    <Tooltip label={t("Down Layer Level")}>
                                                        <ActionIcon
                                                            variant="light"
                                                            color="blue"
                                                            aria-label={t("Down Layer Level")}
                                                            disabled={selectedShape === undefined}
                                                            onClick={() => {
                                                                const ind =
                                                                    stickerContent.findIndex(
                                                                        (v) => v.id === selectedId,
                                                                    );

                                                                if (ind <= -1) {
                                                                    return;
                                                                }

                                                                stickerContentHandlers.reorder({
                                                                    from: ind,
                                                                    to: Math.max(ind - 1, 0),
                                                                });
                                                            }}
                                                        >
                                                            <IconArrowDown
                                                                style={{
                                                                    width: "70%",
                                                                    height: "70%",
                                                                }}
                                                                stroke={1.5}
                                                            />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>

                                                <Group>
                                                    <Tooltip label={t("Delete Selected Layer")}>
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            aria-label={t("Delete Selected Layer")}
                                                            disabled={selectedShape === undefined}
                                                            onClick={() => {
                                                                deleteSelectedLayer();
                                                            }}
                                                        >
                                                            <IconTrash
                                                                style={{
                                                                    width: "70%",
                                                                    height: "70%",
                                                                }}
                                                                stroke={1.5}
                                                            />
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    <Tooltip label={t("Duplicate Selected Layer")}>
                                                        <ActionIcon
                                                            variant="light"
                                                            color="blue"
                                                            aria-label={t(
                                                                "Duplicate Selected Layer",
                                                            )}
                                                            disabled={selectedShape === undefined}
                                                            onClick={() => {
                                                                duplicateItems();
                                                            }}
                                                        >
                                                            <IconCopy
                                                                style={{
                                                                    width: "70%",
                                                                    height: "70%",
                                                                }}
                                                                stroke={1.5}
                                                            />
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    <DeselectLayer
                                                        title={t("Deselect Layer")}
                                                        disabled={selectedShape === undefined}
                                                        deselectFunc={() => setSelectedId(null)}
                                                    />
                                                </Group>
                                            </Group>
                                        </Card>
                                    </Box>
                                </Box>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6, lg: 4 }} visibleFrom="md">
                                <ElementInspector
                                    selectedShape={selectedShape}
                                    onChangeProp={changeSelectedProp}
                                    onChangeCharacter={changeSelectedCharacter}
                                    onChangeMany={changeSelectedProps}
                                    onCenter={centerSelected}
                                    onResetTransform={resetSelectedTransform}
                                />
                            </Grid.Col>
                        </Grid>

                        <Card
                            hiddenFrom="md"
                            withBorder
                            shadow="md"
                            padding="xs"
                            radius="md"
                            style={{
                                position: "fixed",
                                left: 12,
                                right: 12,
                                bottom: 12,
                                zIndex: 200,
                            }}
                        >
                            <Group justify="space-around" wrap="nowrap">
                                <ActionIcon
                                    variant="light"
                                    size={44}
                                    aria-label={t("Undo")}
                                    disabled={!canUndo}
                                    onClick={undo}
                                >
                                    <IconArrowBackUp size={22} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="light"
                                    size={44}
                                    aria-label={t("Redo")}
                                    disabled={!canRedo}
                                    onClick={redo}
                                >
                                    <IconArrowForwardUp size={22} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="filled"
                                    size={44}
                                    aria-label={t("Modify Elements")}
                                    disabled={selectedShape === undefined}
                                    onClick={openInspector}
                                >
                                    <IconAdjustments size={22} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="light"
                                    size={44}
                                    aria-label={t("Duplicate Selected Layer")}
                                    disabled={selectedShape === undefined || selectedShape.locked}
                                    onClick={duplicateItems}
                                >
                                    <IconCopy size={22} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="light"
                                    color="red"
                                    size={44}
                                    aria-label={t("Delete Selected Layer")}
                                    disabled={selectedShape === undefined || selectedShape.locked}
                                    onClick={deleteSelectedLayer}
                                >
                                    <IconTrash size={22} />
                                </ActionIcon>
                            </Group>
                        </Card>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </>
    );
}

export default CanvasBoard;
