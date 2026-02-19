import { useEffect, useRef, useState } from "react";
import { AppShell, Burger, Box, Card, Container, Group, Text, NavLink, TextInput, ColorInput, ActionIcon, Tooltip, Space, Slider, Divider, ScrollArea, Grid, Select, ThemeIcon, Badge } from "@mantine/core";
import { Stage, Layer } from 'react-konva';
import Konva from "konva";
import { useListState, useDisclosure, useHotkeys } from '@mantine/hooks';

import AdjustableText from "./helper/AdjustableText";
import CanvasTransImage from "./helper/CanvasTransImage";
import { IconArrowDown, IconArrowUp, IconArrowsHorizontal, IconArrowsVertical, IconBox, IconCopy, IconCopyPlus, IconDimensions, IconDownload, IconLetterCaseUpper, IconPlus, IconRulerMeasure, IconSticker, IconTextCaption, IconTrash } from "@tabler/icons-react";
import { CONFIGS, createExternalImages, createImages, createText, duplicateNewObject, StickerObject } from "../../utils/createSticker";
import SelectCharactor from "./SelectCharactor";

import { dataURLToBlob, downloadFile, timer } from "../../utils/downloadUtils";

import { KonvaEventObject } from "konva/lib/Node";
import { chatactorList } from "../../data/characters";
import ColorToggleBtn from "../common/ColorToggleBtn";
import { copyImages } from "../../utils/copyUtils";
import LearnMore from "../about/LearnMore";
import CreateExternalImages from "./helper/CreateExternalImages";
import { notifications } from "@mantine/notifications";
import CreateLocalImages from "./helper/CreateLocalImages";
import SelectLayer from "./SelectLayer";
import DeselectLayer from "./utils/DeselectLayer";
import SelectEmoji from "./SelectEmoji";
import { EmojiClickData } from "emoji-picker-react";
import { getImagesWidthAndHeight } from "../../utils/imagesUtils";
import useCurrentStickerStore from "../../store/currenStickerStore";
import DropZoneFullScreen from "./helper/DropZoneFullScreen";
import SaveToHistory from "./helper/SaveToHistory";
import SelectHistorySticker from "./SelectHistorySticker";

import { useTranslation } from 'react-i18next';
import ChangeLanguage from "../common/ChangeLanguage";

function CanvasBoard() {

    const { t } = useTranslation();

    const stageRef = useRef<Konva.Stage>(null);
    const [opened, { toggle, close }] = useDisclosure();

    // History Sticker content
    const stickerStore = useCurrentStickerStore(state => state);

    // Current Sticker content
    const [stickerContent, stickerContentHandlers] = useListState<StickerObject>(
        stickerStore.sticker.filter(v => !v.content.startsWith("blob:"))
    );

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedShape = stickerContent.find(v => v.id === selectedId);

    // Check deselect click
    function checkDeselect(e: Konva.KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent, any>) {
        // clicked On Empty
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
        }
    };

    // Add new attributes to specific list item
    function onChangeHelper(newAttrs: StickerObject, ind: number) {
        stickerContentHandlers.setItem(ind, newAttrs);
    }

    async function callBackImageURL(imageURL: string) {
        try {
            stickerContentHandlers.append(
                await createExternalImages(imageURL)
            );

            close();
            notifications.show({
                title: t("Success"),
                message: t("Success to import images")
            })
        }
        catch (error: any) {
            console.log(error);
            notifications.show({
                title: t("Failed to Import"),
                message: error.message
            })
        }
    }

    // Delete current selected layer
    function deleteSelectedLayer() {
        setSelectedId(null);
        stickerContentHandlers.remove(
            stickerContent.findIndex(v => v.id === selectedId)
        );
    }

    // Duplicate current selected layer
    function duplicateItems() {
        if (selectedShape === undefined) {
            return
        }
        const newSticker = duplicateNewObject(selectedShape);
        stickerContentHandlers.append(newSticker)
    }

    // Download current selected sticker to PNG
    async function downloadCurrentPng() {
        setSelectedId(null);
        await timer(400);

        const uri = stageRef.current!.toDataURL({
            width: Math.max(...stickerContent.map(v => v.x + (v.width || 0))) || CONFIGS.stageWidth,
            height: Math.max(...stickerContent.map(v => v.y + (v.height || 0))) || CONFIGS.stageHeight,
            pixelRatio: 1.1
        });
        downloadFile(uri, `${new Date().getTime()}_stage.png`);
    }

    // Download current selected sticker to PNG
    async function copyCurrentPng() {
        try {
            setSelectedId(null);
            await timer(400);

            const blobImage = await dataURLToBlob(
                stageRef.current!.toDataURL({
                    width: Math.max(...stickerContent.map(v => v.x + (v.width || 0))) || CONFIGS.stageWidth,
                    height: Math.max(...stickerContent.map(v => v.y + (v.height || 0))) || CONFIGS.stageHeight,
                    pixelRatio: 1.1
                })
            )

            copyImages(blobImage, "image/png")

            notifications.show({
                title: t("Success"),
                message: "Image copied to your clipboard.",
            });
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Error",
                message: (error as Error).message
            });
        }
    }

    useHotkeys([
        ['delete', () => {
            if (selectedId !== null) {
                deleteSelectedLayer()
            }
        }],
        ['ctrl+d', () => {
            if (selectedId !== null) {
                duplicateItems()
            }
        }],
        ['mod+s', () => {
            copyCurrentPng()
        }],
    ]);

    useEffect(() => {
        stickerStore.modifySticker(stickerContent)
    }, [stickerContent])

    useEffect(() => {
        if (stickerContent.length >= 1) {
            setSelectedId(stickerContent[0].id)
        }
    }, [])

    return (
        <>
            <DropZoneFullScreen
                callBackImageURL={(imageURL: string) => {
                    callBackImageURL(imageURL)
                }}
            />

            <AppShell
                // withBorder={false}
                layout="alt"
                navbar={{
                    width: 230,
                    breakpoint: 'sm',
                    collapsed: { mobile: !opened }
                }}
                // aside={{ width: 150, breakpoint: '1', collapsed: { desktop: false, mobile: true } }}
                padding="md"
            >
                <AppShell.Header>
                    <Group h="100%" px="md">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" mt={12} mb={12} />
                    </Group>
                </AppShell.Header>

                <AppShell.Navbar p="md" style={{ borderRadius: "0px 26px 26px 0" }}>

                    <AppShell.Section grow my="md" component={ScrollArea}>

                        <Group justify="space-between" >
                            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" mb={14} />
                        </Group>

                        <Group justify="center" mb={12} mt={16}>
                            <Badge tt="none" variant="light" radius="md">
                                🔧 {t('Functions')}
                            </Badge>
                        </Group>

                        <Box>
                            <Text c="dimmed" fz={14} fw={400} mb={6}>
                                {t('Export')}
                            </Text>

                            <Divider my="md" />

                            <NavLink
                                label={t('Download PNG')}
                                leftSection={
                                    <ThemeIcon variant="light">
                                        <IconDownload size="1rem" />
                                    </ThemeIcon>
                                }
                                // rightSection={
                                //     <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
                                // }
                                onClick={() => downloadCurrentPng()}
                            />

                            <NavLink
                                label={t("Copy PNG to clipboard")}
                                leftSection={
                                    <ThemeIcon variant="light">
                                        <IconCopyPlus size="1rem" />
                                    </ThemeIcon>
                                }
                                // rightSection={
                                //     <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
                                // }
                                onClick={() => copyCurrentPng()}
                            />

                            <Text c="dimmed" fz={14} fw={400} mb={6} mt={12}>
                                {t('Text')}
                            </Text>

                            <Divider my="md" />

                            <NavLink
                                label={t('Add Text')}
                                leftSection={
                                    <ThemeIcon variant="light">
                                        <IconPlus size="1rem" />
                                    </ThemeIcon>
                                }
                                // rightSection={
                                //     <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
                                // }
                                onClick={(e) => {
                                    e.preventDefault();

                                    const currentSticker = stickerContent.filter(v => v.format === "image");
                                    let [defaultText, textColor] = ["Hello", "red"];

                                    if (currentSticker.length >= 1) {
                                        const targetStickerInd = currentSticker.length - 1;

                                        const stickerInfo = chatactorList.find(v => v.img === currentSticker[targetStickerInd].content);
                                        defaultText = stickerInfo ? stickerInfo?.defaultText.text : "Hello"
                                        textColor = stickerInfo ? stickerInfo?.color : "red"
                                    }

                                    stickerContentHandlers.append(createText(defaultText, textColor))
                                    close();
                                }}
                            />


                            <SelectEmoji
                                title={t('Add Emoji (Text)')}
                                addEmojiCb={(emoji: EmojiClickData) => {
                                    stickerContentHandlers.append(createText(emoji.emoji))
                                }}
                            />

                            <Text c="dimmed" fz={14} fw={400} mb={6} mt={12}>
                                {t('Images')}
                            </Text>

                            <Divider my="md" />

                            <SelectCharactor
                                openComp="NavLink"
                                title={t('Add New Sticker')}
                                addStickerCb={async (v) => {
                                    stickerContentHandlers.append(await createImages(v.img))
                                    close();
                                }}
                            />

                            {/* <SelectEmoji
                                title="Add Emoji (Image)"
                                addEmojiCb={(emoji: EmojiClickData) => {
                                    callBackImageURL(emoji.imageUrl)
                                }}
                            /> */}

                            <CreateLocalImages
                                title={t('Upload local Image')}
                                callBackImageURL={(imageURL: string) => {
                                    callBackImageURL(imageURL)
                                }}
                            />

                            <CreateExternalImages
                                title={t('Upload URL Image')}
                                callBackImageURL={(imageURL: string) => {
                                    callBackImageURL(imageURL)
                                }}
                            />

                            <Text c="dimmed" fz={14} fw={400} mb={6} mt={12}>
                                {t('Utils')}
                            </Text>

                            <Divider my="md" />

                            <SelectHistorySticker
                                title={t('View Saved Stickers')}
                                setStickerCb={(sticker) => {
                                    stickerContentHandlers.setState(sticker)
                                }}
                            />

                        </Box>
                    </AppShell.Section>

                    <AppShell.Section>
                        <Group justify="space-between">
                            <ColorToggleBtn />
                            <LearnMore />
                            <ChangeLanguage />
                        </Group>
                    </AppShell.Section>

                </AppShell.Navbar>

                <AppShell.Main>
                    <Container fluid>
                        <Text fw={600} fz={32} ta="center" mt={60}>
                            <IconSticker /> {t('Sekai Sticker V2')}
                        </Text>

                        <Text c="dimmed" mb={16} ta="center">
                            {t('Generate your sticker in a better way!')}
                        </Text>

                        <Grid mt={18}>
                            <Grid.Col span={{ base: 12, md: 6, lg: 8 }}>
                                <Box>
                                    <Card shadow="sm" padding="lg" radius="md" withBorder>

                                        <Group justify="space-between" mb={16}>

                                            <SaveToHistory />

                                            <Group>
                                                <Tooltip label={t("Download PNG")}>
                                                    <ActionIcon
                                                        variant="light"
                                                        onClick={() => downloadCurrentPng()}
                                                    >
                                                        <IconDownload
                                                            style={{ width: '70%', height: '70%' }}
                                                            stroke={1.5}
                                                        />
                                                    </ActionIcon>
                                                </Tooltip>

                                                <Tooltip label={t("Copy PNG to clipboard")}>
                                                    <ActionIcon
                                                        variant="light"
                                                        onClick={() => copyCurrentPng()}
                                                    >
                                                        <IconCopyPlus
                                                            style={{ width: '70%', height: '70%' }}
                                                            stroke={1.5}
                                                        />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>

                                        </Group>

                                        <Divider mb={24} />

                                        <Group justify="center">
                                            <Box style={{ minWidth: CONFIGS.stageWidth }}>
                                                <Stage
                                                    ref={stageRef}
                                                    width={CONFIGS.stageWidth}
                                                    height={CONFIGS.stageHeight}
                                                    onMouseDown={checkDeselect}
                                                    onTouchStart={checkDeselect}
                                                    style={{
                                                        border: "3px solid rgb(34,138,229, .26)",
                                                        borderRadius: "8px"
                                                    }}
                                                >
                                                    <Layer>

                                                        {stickerContent.map((sticker, i) => {
                                                            if (
                                                                sticker.format === "image"
                                                                || sticker.format === "externalImage"
                                                            ) {
                                                                return (
                                                                    <CanvasTransImage
                                                                        key={sticker.id}
                                                                        shapeProps={sticker}
                                                                        isSelected={sticker.id === selectedId}
                                                                        onSelect={() => {
                                                                            setSelectedId(sticker.id);
                                                                        }}
                                                                        onChange={(newAttrs: StickerObject) => onChangeHelper(newAttrs, i)}
                                                                        url={sticker.content}
                                                                    />
                                                                )
                                                            }

                                                            return (
                                                                <AdjustableText
                                                                    key={sticker.id}
                                                                    shapeProps={sticker}
                                                                    isSelected={sticker.id === selectedId}
                                                                    onSelect={() => {
                                                                        setSelectedId(sticker.id);
                                                                    }}
                                                                    onChange={(newAttrs: StickerObject) => onChangeHelper(newAttrs, i)}
                                                                    content={sticker.content}
                                                                />
                                                            )
                                                        })}

                                                    </Layer>

                                                </Stage>
                                            </Box>
                                        </Group>

                                        <Box mt={16}>
                                            <SelectLayer
                                                data={stickerContent}
                                                selectCb={(id) => setSelectedId(id)}
                                            />
                                        </Box>
                                    </Card>


                                    <Box mb={12} mt={16}>

                                        <Card shadow="sm" padding="lg" radius="md" withBorder mt={12}>
                                            <Group justify="space-between" >
                                                <Group>
                                                    <Tooltip label={t("Up Layer Level")}>
                                                        <ActionIcon
                                                            variant="light"
                                                            color="blue"
                                                            aria-label={t("Up Layer Level")}
                                                            disabled={selectedShape === undefined}
                                                            onClick={() => {
                                                                const ind = stickerContent.findIndex(v => v.id === selectedId);

                                                                if (ind <= -1) {
                                                                    return
                                                                }

                                                                stickerContentHandlers.reorder({
                                                                    from: ind,
                                                                    to: Math.min(ind + 1, stickerContent.length - 1)
                                                                })
                                                            }}
                                                        >
                                                            <IconArrowUp
                                                                style={{ width: '70%', height: '70%' }}
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
                                                                const ind = stickerContent.findIndex(v => v.id === selectedId);

                                                                if (ind <= -1) {
                                                                    return
                                                                }

                                                                stickerContentHandlers.reorder({
                                                                    from: ind,
                                                                    to: Math.max(ind - 1, 0)
                                                                })
                                                            }}
                                                        >
                                                            <IconArrowDown
                                                                style={{ width: '70%', height: '70%' }}
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
                                                                deleteSelectedLayer()
                                                            }}
                                                        >
                                                            <IconTrash
                                                                style={{ width: '70%', height: '70%' }}
                                                                stroke={1.5}
                                                            />
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    <Tooltip label={t("Duplicate Selected Layer")}>
                                                        <ActionIcon
                                                            variant="light"
                                                            color="blue"
                                                            aria-label={t("Duplicate Selected Layer")}
                                                            disabled={selectedShape === undefined}
                                                            onClick={() => {
                                                                duplicateItems();
                                                            }}
                                                        >
                                                            <IconCopy
                                                                style={{ width: '70%', height: '70%' }}
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

                            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                                <Box>
                                    <Group justify="center" >
                                        <Box style={{ width: "105%" }} >
                                            <Card shadow="sm" padding="lg" radius="md" withBorder>

                                                <Text ta="center" fz={12} c="dimmed">
                                                    <IconBox size={12} /> {t("Modify Elements")}
                                                </Text>

                                                {selectedShape === undefined && (
                                                    <Text c="dimmed" ta="center" mt={12}>
                                                        {t("Select item to modify")}
                                                    </Text>
                                                )}

                                                {selectedShape !== undefined && (
                                                    <>
                                                        <Text fw={500} fz={14} mt={20}>
                                                            <IconArrowsHorizontal size={12} /> {t("Position")} X
                                                        </Text>
                                                        <Slider
                                                            mt={2}
                                                            color="blue"
                                                            value={selectedShape.x}
                                                            step={1}
                                                            max={350}
                                                            min={-350}
                                                            onChange={(value) => {
                                                                const ind = stickerContent.findIndex(v => v.id === selectedId);
                                                                stickerContentHandlers.setItemProp(ind, "x", value);
                                                            }}
                                                        />

                                                        <Text fw={500} fz={14} mt={20}>
                                                            <IconArrowsVertical size={12} /> {t("Position")} Y
                                                        </Text>
                                                        <Slider
                                                            mt={2}
                                                            color="blue"
                                                            value={selectedShape.y}
                                                            step={1}
                                                            max={350}
                                                            min={-350}
                                                            onChange={(value) => {
                                                                const ind = stickerContent.findIndex(v => v.id === selectedId);
                                                                stickerContentHandlers.setItemProp(ind, "y", value);
                                                            }}
                                                        />

                                                        {selectedShape.format === "text" && (
                                                            <>

                                                                <Text fw={500} fz={14} mt={20}>
                                                                    <IconDimensions size={14} /> {t("Font Size")}
                                                                </Text>
                                                                <Slider
                                                                    step={1}
                                                                    max={200}
                                                                    min={0}
                                                                    value={selectedShape.fontSize}
                                                                    onChange={(value) => {
                                                                        const ind = stickerContent.findIndex(v => v.id === selectedId);
                                                                        stickerContentHandlers.setItemProp(ind, "fontSize", +value);
                                                                    }}
                                                                />

                                                                <TextInput
                                                                    mt={12}
                                                                    leftSection={<IconTextCaption size={18} />}
                                                                    label={t("Text Content")}
                                                                    placeholder="Input placeholder"
                                                                    value={selectedShape.content}
                                                                    onChange={(event) => {
                                                                        const newText = event.currentTarget.value;
                                                                        const ind = stickerContent.findIndex(v => v.id === selectedId);
                                                                        stickerContentHandlers.setItemProp(ind, "content", newText);
                                                                    }}
                                                                />

                                                                <Text fw={500} fz={14} mt={20}>
                                                                    <IconRulerMeasure size={14} />  {t("Letter Spacing")}
                                                                </Text>
                                                                <Slider
                                                                    mt={2}
                                                                    color="blue"
                                                                    value={selectedShape.letterSpacing}
                                                                    step={0.1}
                                                                    max={20}
                                                                    min={-20}
                                                                    onChange={(value) => {
                                                                        const ind = stickerContent.findIndex(v => v.id === selectedId);
                                                                        stickerContentHandlers.setItemProp(ind, "letterSpacing", value);
                                                                    }}
                                                                />

                                                                <Text fw={500} fz={14} mt={20}>
                                                                    <IconLetterCaseUpper size={14} /> {t("Stroke Width")}
                                                                </Text>
                                                                <Slider
                                                                    mt={2}
                                                                    color="blue"
                                                                    value={selectedShape.strokeWidth}
                                                                    step={0.1}
                                                                    max={80}
                                                                    min={0}
                                                                    onChange={(value) => {
                                                                        const ind = stickerContent.findIndex(v => v.id === selectedId);
                                                                        stickerContentHandlers.setItemProp(ind, "strokeWidth", value);
                                                                    }}
                                                                />

                                                                <ColorInput
                                                                    mt={12}
                                                                    label={t("Color")}
                                                                    placeholder="Input placeholder"
                                                                    value={selectedShape.fill}
                                                                    onChange={(colorStr) => {
                                                                        const ind = stickerContent.findIndex(v => v.id === selectedId);
                                                                        stickerContentHandlers.setItemProp(ind, "fill", colorStr);
                                                                    }}
                                                                />

                                                                <Select
                                                                    mt={12}
                                                                    allowDeselect={false}
                                                                    clearable={false}
                                                                    leftSection={<IconTextCaption size={18} />}
                                                                    label={t("Font Family")}
                                                                    data={[
                                                                        { value: "YurukaStd", label: 'YurukaStd' },
                                                                        { value: "SSFangTangTi", label: 'SSFangTangTi' },
                                                                        { value: "ChillRoundGothic_Bold", label: '(Chinese Friendly) ChillRoundGothic_Bold' },
                                                                    ]}
                                                                    value={selectedShape.fontFamily}
                                                                    onChange={(str) => {

                                                                        if (str === null) {
                                                                            return
                                                                        }

                                                                        const ind = stickerContent.findIndex(v => v.id === selectedId);
                                                                        stickerContentHandlers.setItemProp(ind, "fontFamily", str as any);
                                                                    }}
                                                                />
                                                            </>
                                                        )}

                                                        {selectedShape.format === "image" && (
                                                            <>
                                                                <Space h="md" />
                                                                <SelectCharactor
                                                                    openComp="Button"
                                                                    title={t("Change Charactor")}
                                                                    addStickerCb={async (v) => {
                                                                        const ind = stickerContent.findIndex(v => v.id === selectedId);

                                                                        const { w, h } = await getImagesWidthAndHeight(v.img)

                                                                        stickerContentHandlers.setItemProp(ind, "content", v.img);

                                                                        stickerContentHandlers.setItemProp(ind, "width", w);
                                                                        stickerContentHandlers.setItemProp(ind, "height", h);

                                                                        for (let i = 0; i < stickerContent.length; i++) {
                                                                            if (stickerContent[i].format === "text") {
                                                                                stickerContentHandlers.setItemProp(i, "fill", v.color);
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            </>
                                                        )}

                                                    </>
                                                )}
                                            </Card>
                                        </Box>
                                    </Group>

                                </Box>
                            </Grid.Col>

                        </Grid>




                    </Container>
                </AppShell.Main>

            </AppShell >

        </>
    )
}

export default CanvasBoard
