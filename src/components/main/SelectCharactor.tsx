import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
    Drawer,
    Grid,
    Menu,
    NavLink,
    UnstyledButton,
    ScrollArea,
    Button,
    Box,
    Tooltip,
    Text,
    MultiSelect,
    ThemeIcon,
    TextInput,
    Select,
    SegmentedControl,
    Group,
    ActionIcon,
} from "@mantine/core";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
    IconAdjustments,
    IconSearch,
    IconStar,
    IconStarFilled,
    IconSticker,
} from "@tabler/icons-react";
import { StickerChatactor, chatactorList } from "../../data/characters";
import { useMemo, useState } from "react";

import { uniqueBy, prop } from "remeda";
import { capitalizeFirstLetter } from "../../utils/createSticker";
import { useTranslation } from "react-i18next";

interface SelectCharactorProps {
    title?: string;
    openComp?: "NavLink" | "Button" | "MenuItem" | "None";
    addStickerCb: (sticker: StickerChatactor) => void;
    opened?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

const characterUnits: Record<string, string[]> = {
    "Leo/need": ["ichika", "saki", "honami", "shiho"],
    "MORE MORE JUMP!": ["minori", "haruka", "airi", "shizuku"],
    "Vivid BAD SQUAD": ["kohane", "an", "akito", "touya"],
    "Wonderlands×Showtime": ["tsukasa", "emu", "nene", "rui"],
    "Nightcord at 25:00": ["kanade", "mafuyu", "ena", "mizuki"],
    "Virtual Singer": ["miku", "rin", "len", "luka", "meiko", "kaito"],
};

function SelectCharactor({
    title = "Add Character",
    openComp = "NavLink",
    addStickerCb,
    opened: controlledOpened,
    onOpen,
    onClose,
}: SelectCharactorProps) {
    const { t } = useTranslation();

    const [searchString, setSearchString] = useState<string[]>([]);
    const [query, setQuery] = useState("");
    const [unit, setUnit] = useState<string | null>(null);
    const [view, setView] = useState<"all" | "favorites" | "recent">("all");
    const [favorites, setFavorites] = useLocalStorage<string[]>({
        key: "sekai-favorite-stickers",
        defaultValue: [],
    });
    const [recent, setRecent] = useLocalStorage<string[]>({
        key: "sekai-recent-stickers",
        defaultValue: [],
    });
    const [internalOpened, { open: openInternal, close: closeInternal }] = useDisclosure(false);
    const opened = controlledOpened ?? internalOpened;
    const open = onOpen ?? openInternal;
    const close = onClose ?? closeInternal;

    const filledList = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const unitCharacters = unit ? characterUnits[unit] : undefined;

        return chatactorList.filter((sticker) => {
            if (searchString.length > 0 && !searchString.includes(sticker.character)) return false;
            if (unitCharacters && !unitCharacters.includes(sticker.character)) return false;
            if (
                normalizedQuery &&
                !`${sticker.name} ${sticker.character} ${sticker.defaultText.text}`
                    .toLowerCase()
                    .includes(normalizedQuery)
            ) {
                return false;
            }
            if (view === "favorites" && !favorites.includes(sticker.img)) return false;
            if (view === "recent" && !recent.includes(sticker.img)) return false;
            return true;
        });
    }, [favorites, query, recent, searchString, unit, view]);

    function selectAndClose(sticker: StickerChatactor) {
        setRecent((current) =>
            [sticker.img, ...current.filter((item) => item !== sticker.img)].slice(0, 20),
        );
        addStickerCb(sticker);
        close();
    }

    function toggleFavorite(sticker: StickerChatactor) {
        setFavorites((current) =>
            current.includes(sticker.img)
                ? current.filter((item) => item !== sticker.img)
                : [sticker.img, ...current],
        );
    }

    return (
        <>
            <Drawer
                offset={8}
                radius="md"
                opened={opened}
                onClose={close}
                title={title}
                position="bottom"
                size="65%"
                closeButtonProps={{ "aria-label": t("Close character browser") }}
            >
                <MultiSelect
                    value={searchString}
                    onChange={setSearchString}
                    placeholder={t("Select Character")}
                    mb={6}
                    data={uniqueBy(chatactorList, prop("character")).map((v) => ({
                        value: v.character,
                        label: capitalizeFirstLetter(v.character),
                    }))}
                />

                <Group grow mb="sm">
                    <TextInput
                        leftSection={<IconSearch size={16} />}
                        placeholder={t("Search stickers")}
                        value={query}
                        onChange={(event) => setQuery(event.currentTarget.value)}
                    />
                    <Select
                        placeholder={t("All units")}
                        clearable
                        data={Object.keys(characterUnits)}
                        value={unit}
                        onChange={setUnit}
                    />
                    <SegmentedControl
                        value={view}
                        onChange={(value) => setView(value as typeof view)}
                        data={[
                            { value: "all", label: t("All") },
                            { value: "favorites", label: t("Favorites") },
                            { value: "recent", label: t("Recent") },
                        ]}
                    />
                </Group>

                <Grid>
                    <Grid.Col span={{ base: 2, md: 2, lg: 2 }}>
                        <ScrollArea h={"55vh"}>
                            {uniqueBy(chatactorList, prop("character")).map((v) => (
                                <Box key={v.img}>
                                    <UnstyledButton
                                        onClick={() =>
                                            setSearchString((currentLs) => {
                                                // Remove Sticker from search
                                                if (currentLs.includes(v.character)) {
                                                    return currentLs.filter(
                                                        (key) => key !== v.character,
                                                    );
                                                }

                                                // Add Sticker to search
                                                return [...currentLs, v.character];
                                            })
                                        }
                                        mb={14}
                                    >
                                        <Text c="dimmed" fz={14}>
                                            {capitalizeFirstLetter(v.character)}
                                        </Text>
                                        <LazyLoadImage
                                            src={`${v.img}`}
                                            width="100%"
                                            height="100%"
                                            effect="blur"
                                        />
                                    </UnstyledButton>
                                </Box>
                            ))}
                        </ScrollArea>
                    </Grid.Col>

                    <Grid.Col span={{ base: 10, md: 10, lg: 10 }}>
                        <ScrollArea h={440}>
                            {filledList.length <= 0 && (
                                <Text c="dimmed" ta="center" mt={180}>
                                    {t("Select Your Sticker Character")}
                                </Text>
                            )}

                            <Grid>
                                {filledList.map((v) => (
                                    <Grid.Col span={{ base: 4, md: 2, lg: 1 }} key={v.img}>
                                        <Tooltip label={v.name}>
                                            <Box pos="relative">
                                                <UnstyledButton
                                                    onClick={() => selectAndClose(v)}
                                                    aria-label={v.name}
                                                    w="100%"
                                                >
                                                    <LazyLoadImage
                                                        src={`${v.img}`}
                                                        width="100%"
                                                        effect="blur"
                                                    />
                                                </UnstyledButton>
                                                <ActionIcon
                                                    pos="absolute"
                                                    top={2}
                                                    right={2}
                                                    variant="light"
                                                    size={32}
                                                    aria-label={
                                                        favorites.includes(v.img)
                                                            ? t("Remove favorite")
                                                            : t("Add favorite")
                                                    }
                                                    onClick={() => toggleFavorite(v)}
                                                >
                                                    {favorites.includes(v.img) ? (
                                                        <IconStarFilled size={16} />
                                                    ) : (
                                                        <IconStar size={16} />
                                                    )}
                                                </ActionIcon>
                                            </Box>
                                        </Tooltip>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </ScrollArea>
                    </Grid.Col>
                </Grid>
            </Drawer>

            {openComp === "NavLink" && (
                <NavLink
                    label={title}
                    leftSection={
                        <ThemeIcon variant="light">
                            <IconSticker size="1rem" />
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

            {openComp === "Button" && (
                <Button leftSection={<IconAdjustments />} variant="light" onClick={() => open()}>
                    {t("Change Character")}
                </Button>
            )}

            {openComp === "MenuItem" && (
                <Menu.Item leftSection={<IconSticker size={14} />} onClick={() => open()}>
                    {title}
                </Menu.Item>
            )}
        </>
    );
}

export default SelectCharactor;
