import {
    ActionIcon,
    Box,
    Button,
    Card,
    ColorInput,
    Group,
    NumberInput,
    Select,
    Slider,
    Space,
    Text,
    Textarea,
    Tooltip,
} from "@mantine/core";
import {
    IconArrowsHorizontal,
    IconArrowsVertical,
    IconFlipHorizontal,
    IconFlipVertical,
    IconBox,
    IconDimensions,
    IconLetterCaseUpper,
    IconLock,
    IconRefresh,
    IconRulerMeasure,
    IconTextCaption,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { StickerChatactor } from "../../data/characters";
import { StickerObject } from "../../utils/createSticker";
import SelectCharactor from "./SelectCharactor";

interface ElementInspectorProps {
    selectedShape?: StickerObject;
    onChangeProp: <K extends keyof StickerObject>(
        property: K,
        value: StickerObject[K],
        coalesceKey?: string,
    ) => void;
    onChangeCharacter: (character: StickerChatactor) => Promise<void>;
    onChangeMany: (patch: Partial<StickerObject>) => void;
    onCenter: (axis: "x" | "y") => void;
    onResetTransform: () => void;
}

function PropertyLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Text fw={500} fz={14} mt={20}>
            {icon} {children}
        </Text>
    );
}

function ElementInspector({
    selectedShape,
    onChangeProp,
    onChangeCharacter,
    onChangeMany,
    onCenter,
    onResetTransform,
}: ElementInspectorProps) {
    const { t } = useTranslation();
    const disabled = selectedShape?.locked === true;

    return (
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
                <Box>
                    {disabled && (
                        <Text c="dimmed" size="sm" mt="md">
                            <IconLock size={14} /> {t("Unlock this layer to edit it")}
                        </Text>
                    )}

                    <Group grow mt="md" align="flex-end">
                        <NumberInput
                            label={`${t("Position")} X`}
                            leftSection={<IconArrowsHorizontal size={14} />}
                            value={selectedShape.x}
                            min={-350}
                            max={350}
                            disabled={disabled}
                            onChange={(value) =>
                                onChangeProp("x", Number(value), `x:${selectedShape.id}`)
                            }
                        />
                        <NumberInput
                            label={`${t("Position")} Y`}
                            leftSection={<IconArrowsVertical size={14} />}
                            value={selectedShape.y}
                            min={-350}
                            max={350}
                            disabled={disabled}
                            onChange={(value) =>
                                onChangeProp("y", Number(value), `y:${selectedShape.id}`)
                            }
                        />
                    </Group>

                    <Group grow mt="sm">
                        <Button variant="light" disabled={disabled} onClick={() => onCenter("x")}>
                            {t("Center horizontally")}
                        </Button>
                        <Button variant="light" disabled={disabled} onClick={() => onCenter("y")}>
                            {t("Center vertically")}
                        </Button>
                    </Group>

                    <Group grow mt="sm" align="flex-end">
                        <NumberInput
                            label={t("Rotation")}
                            value={selectedShape.rotation ?? 0}
                            min={-180}
                            max={180}
                            suffix="°"
                            disabled={disabled}
                            onChange={(value) =>
                                onChangeProp(
                                    "rotation",
                                    Number(value),
                                    `rotation:${selectedShape.id}`,
                                )
                            }
                        />
                        <Button
                            variant="default"
                            leftSection={<IconRefresh size={16} />}
                            disabled={disabled}
                            onClick={onResetTransform}
                        >
                            {t("Reset")}
                        </Button>
                    </Group>

                    <PropertyLabel icon={<IconBox size={12} />}>{t("Opacity")}</PropertyLabel>
                    <Slider
                        aria-label={t("Opacity")}
                        value={selectedShape.opacity ?? 1}
                        step={0.05}
                        max={1}
                        min={0.05}
                        label={(value) => `${Math.round(value * 100)}%`}
                        disabled={disabled}
                        onChange={(value) =>
                            onChangeProp("opacity", value, `opacity:${selectedShape.id}`)
                        }
                    />

                    <Group mt="md">
                        <Tooltip label={t("Flip horizontally")}>
                            <ActionIcon
                                variant={selectedShape.flipX ? "filled" : "light"}
                                size={40}
                                aria-label={t("Flip horizontally")}
                                disabled={disabled}
                                onClick={() => onChangeProp("flipX", !selectedShape.flipX)}
                            >
                                <IconFlipHorizontal size={20} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t("Flip vertically")}>
                            <ActionIcon
                                variant={selectedShape.flipY ? "filled" : "light"}
                                size={40}
                                aria-label={t("Flip vertically")}
                                disabled={disabled}
                                onClick={() => onChangeProp("flipY", !selectedShape.flipY)}
                            >
                                <IconFlipVertical size={20} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>

                    {(selectedShape.format === "image" ||
                        selectedShape.format === "externalImage") && (
                        <Group grow mt="md">
                            <NumberInput
                                label={t("Width")}
                                value={Math.round(selectedShape.width ?? 1)}
                                min={5}
                                max={1000}
                                disabled={disabled}
                                onChange={(value) => {
                                    const width = Number(value);
                                    const ratio =
                                        (selectedShape.height ?? 1) / (selectedShape.width ?? 1);
                                    onChangeMany({ width, height: Math.max(5, width * ratio) });
                                }}
                            />
                            <NumberInput
                                label={t("Height")}
                                value={Math.round(selectedShape.height ?? 1)}
                                min={5}
                                max={1000}
                                disabled={disabled}
                                onChange={(value) => {
                                    const height = Number(value);
                                    const ratio =
                                        (selectedShape.width ?? 1) / (selectedShape.height ?? 1);
                                    onChangeMany({ height, width: Math.max(5, height * ratio) });
                                }}
                            />
                        </Group>
                    )}

                    {selectedShape.format === "text" && (
                        <>
                            <PropertyLabel icon={<IconDimensions size={14} />}>
                                {t("Font Size")}
                            </PropertyLabel>
                            <Slider
                                aria-label={t("Font Size")}
                                step={1}
                                max={200}
                                min={1}
                                value={selectedShape.fontSize ?? 42}
                                disabled={disabled}
                                onChange={(value) =>
                                    onChangeProp("fontSize", value, `fontSize:${selectedShape.id}`)
                                }
                            />

                            <Textarea
                                mt={12}
                                label={t("Text Content")}
                                placeholder={t("Enter sticker text")}
                                value={selectedShape.content}
                                disabled={disabled}
                                onChange={(event) =>
                                    onChangeProp(
                                        "content",
                                        event.currentTarget.value,
                                        `content:${selectedShape.id}`,
                                    )
                                }
                            />

                            <Group grow mt="sm">
                                <Select
                                    label={t("Text alignment")}
                                    data={[
                                        { value: "left", label: t("Left") },
                                        { value: "center", label: t("Center") },
                                        { value: "right", label: t("Right") },
                                    ]}
                                    value={selectedShape.align ?? "center"}
                                    disabled={disabled}
                                    onChange={(value) => {
                                        if (value) {
                                            onChangeProp("align", value as StickerObject["align"]);
                                        }
                                    }}
                                />
                                <NumberInput
                                    label={t("Line height")}
                                    value={selectedShape.lineHeight ?? 1}
                                    min={0.5}
                                    max={3}
                                    step={0.1}
                                    decimalScale={1}
                                    disabled={disabled}
                                    onChange={(value) =>
                                        onChangeProp(
                                            "lineHeight",
                                            Number(value),
                                            `lineHeight:${selectedShape.id}`,
                                        )
                                    }
                                />
                            </Group>

                            <PropertyLabel icon={<IconRulerMeasure size={14} />}>
                                {t("Letter Spacing")}
                            </PropertyLabel>
                            <Slider
                                aria-label={t("Letter Spacing")}
                                value={selectedShape.letterSpacing ?? 0}
                                step={0.1}
                                max={20}
                                min={-20}
                                disabled={disabled}
                                onChange={(value) =>
                                    onChangeProp(
                                        "letterSpacing",
                                        value,
                                        `letterSpacing:${selectedShape.id}`,
                                    )
                                }
                            />

                            <PropertyLabel icon={<IconLetterCaseUpper size={14} />}>
                                {t("Stroke Width")}
                            </PropertyLabel>
                            <Slider
                                aria-label={t("Stroke Width")}
                                value={selectedShape.strokeWidth ?? 0}
                                step={0.1}
                                max={80}
                                min={0}
                                disabled={disabled}
                                onChange={(value) =>
                                    onChangeProp(
                                        "strokeWidth",
                                        value,
                                        `strokeWidth:${selectedShape.id}`,
                                    )
                                }
                            />

                            <ColorInput
                                mt={12}
                                label={t("Color")}
                                placeholder={t("Choose a color")}
                                value={selectedShape.fill}
                                disabled={disabled}
                                onChange={(value) =>
                                    onChangeProp("fill", value, `fill:${selectedShape.id}`)
                                }
                            />

                            <ColorInput
                                mt={12}
                                label={t("Stroke color")}
                                placeholder={t("Choose a color")}
                                value={selectedShape.stroke ?? "#ffffff"}
                                disabled={disabled}
                                onChange={(value) =>
                                    onChangeProp("stroke", value, `stroke:${selectedShape.id}`)
                                }
                            />

                            <Select
                                mt={12}
                                allowDeselect={false}
                                clearable={false}
                                leftSection={<IconTextCaption size={18} />}
                                label={t("Font Family")}
                                data={[
                                    { value: "YurukaStd", label: "YurukaStd" },
                                    { value: "SSFangTangTi", label: "SSFangTangTi" },
                                    {
                                        value: "ChillRoundGothic_Bold",
                                        label: "ChillRoundGothic Bold",
                                    },
                                ]}
                                value={selectedShape.fontFamily}
                                disabled={disabled}
                                onChange={(value) => {
                                    if (value !== null) {
                                        onChangeProp(
                                            "fontFamily",
                                            value as StickerObject["fontFamily"],
                                        );
                                    }
                                }}
                            />
                        </>
                    )}

                    {selectedShape.format === "image" && !disabled && (
                        <>
                            <Space h="md" />
                            <SelectCharactor
                                openComp="Button"
                                title={t("Change Character")}
                                addStickerCb={onChangeCharacter}
                            />
                        </>
                    )}
                </Box>
            )}
        </Card>
    );
}

export default ElementInspector;
