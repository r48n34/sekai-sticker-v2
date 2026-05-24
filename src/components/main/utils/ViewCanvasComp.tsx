import { Layer, Stage } from "react-konva";
import { CONFIGS, StickerObject } from "../../../utils/createSticker";
import AdjustableText from "../helper/AdjustableText";
import CanvasTransImage from "../helper/CanvasTransImage";
import { useRef } from "react";
import { ActionIcon, Container, Group, Space, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconCopyPlus, IconDownload } from "@tabler/icons-react";
import { copyImages } from "../../../utils/copyUtils";
import { dataURLToBlob, downloadFile, timer } from "../../../utils/downloadUtils";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";

type ViewCanvasCompProps = {
    stickerContent: StickerObject[];
    clickCb?: Function;
};

function ViewCanvasComp({ stickerContent, clickCb }: ViewCanvasCompProps) {
    const { t } = useTranslation();
    const stageRef = useRef<any>(null);

    const maxX = Math.max(...stickerContent.map((v) => v.x + (v.width || 0)));
    const maxY = Math.max(...stickerContent.map((v) => v.y + (v.height || 0)));
    const normalizeDate = (value: unknown): Date => {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value;
        }

        if (typeof value === "string" || typeof value === "number") {
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        return new Date();
    };

    return (
        <>
            <Container>
                <UnstyledButton
                    onClick={() => {
                        if (clickCb) {
                            clickCb();
                        }
                    }}
                >
                    <Stage
                        ref={stageRef}
                        width={maxX || CONFIGS.stageWidth}
                        height={maxY || CONFIGS.stageHeight}
                    >
                        <Layer>
                            {stickerContent.map((sticker) => {
                                if (
                                    sticker.format === "image" ||
                                    sticker.format === "externalImage"
                                ) {
                                    return (
                                        <CanvasTransImage
                                            key={sticker.id}
                                            shapeProps={sticker}
                                            isSelected={false}
                                            onSelect={() => {}}
                                            onChange={() => {}}
                                            url={sticker.content}
                                            draggable={false}
                                        />
                                    );
                                }

                                return (
                                    <AdjustableText
                                        key={sticker.id}
                                        shapeProps={sticker}
                                        isSelected={false}
                                        onSelect={() => {}}
                                        onChange={() => {}}
                                        content={sticker.content}
                                        draggable={false}
                                    />
                                );
                            })}
                        </Layer>
                    </Stage>
                </UnstyledButton>

                <Space h="sm" />

                <Group>
                    <Tooltip label={t("Download PNG")}>
                        <ActionIcon
                            variant="light"
                            onClick={async () => {
                                await timer(200);

                                const uri = stageRef.current!.toDataURL({
                                    width:
                                        Math.max(
                                            ...stickerContent.map((v) => v.x + (v.width || 0)),
                                        ) || CONFIGS.stageWidth,
                                    height:
                                        Math.max(
                                            ...stickerContent.map((v) => v.y + (v.height || 0)),
                                        ) || CONFIGS.stageHeight,
                                    pixelRatio: 1.1,
                                });
                                downloadFile(uri, `${new Date().getTime()}_stage.png`);
                            }}
                        >
                            <IconDownload style={{ width: "70%", height: "70%" }} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip label={t("Copy PNG to clipboard")}>
                        <ActionIcon
                            variant="light"
                            onClick={async () => {
                                try {
                                    await timer(200);

                                    const blobImage = await dataURLToBlob(
                                        stageRef.current!.toDataURL({
                                            width:
                                                Math.max(
                                                    ...stickerContent.map(
                                                        (v) => v.x + (v.width || 0),
                                                    ),
                                                ) || CONFIGS.stageWidth,
                                            height:
                                                Math.max(
                                                    ...stickerContent.map(
                                                        (v) => v.y + (v.height || 0),
                                                    ),
                                                ) || CONFIGS.stageHeight,
                                            pixelRatio: 1.1,
                                        }),
                                    );

                                    copyImages(blobImage, "image/png");

                                    notifications.show({
                                        title: t("Success"),
                                        message: "Image copied to your clipboard.",
                                    });
                                } catch (error) {
                                    console.error(error);
                                    notifications.show({
                                        title: "Error",
                                        message: (error as Error).message,
                                    });
                                }
                            }}
                        >
                            <IconCopyPlus style={{ width: "70%", height: "70%" }} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>

                    <Text c="dimmed" ta="center" fz={12}>
                        {t("Last Update")}:{" "}
                        {stickerContent
                            .map((v) => normalizeDate(v.updatedDate))
                            .sort((a, b) => b.getTime() - a.getTime())[0]
                            .toUTCString()}
                    </Text>
                </Group>
            </Container>
        </>
    );
}

export default ViewCanvasComp;
