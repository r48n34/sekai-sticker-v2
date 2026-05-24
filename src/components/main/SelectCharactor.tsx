import { useDisclosure } from "@mantine/hooks";
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
} from "@mantine/core";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { IconAdjustments, IconSticker } from "@tabler/icons-react";
import { StickerChatactor, chatactorList } from "../../data/characters";
import { useEffect, useState } from "react";

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

function SelectCharactor({
    title = "Add Charactor",
    openComp = "NavLink",
    addStickerCb,
    opened: controlledOpened,
    onOpen,
    onClose,
}: SelectCharactorProps) {
    const { t } = useTranslation();

    const [filledList, setFilledList] = useState<StickerChatactor[]>([]);
    const [searchString, setSearchString] = useState<string[]>([]);
    const [internalOpened, { open: openInternal, close: closeInternal }] = useDisclosure(false);
    const opened = controlledOpened ?? internalOpened;
    const open = onOpen ?? openInternal;
    const close = onClose ?? closeInternal;

    useEffect(() => {
        if (searchString.length <= 0) {
            setFilledList([]);
            return;
        }

        const searchLs = [];
        for (const target of searchString) {
            searchLs.push(
                ...chatactorList.filter((v) => v.character.toLowerCase() === target.toLowerCase()),
            );
        }

        setFilledList(searchLs.reverse());
    }, [searchString]);

    function selectAndClose(sticker: StickerChatactor) {
        addStickerCb(sticker);
        close();
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
            >
                <MultiSelect
                    value={searchString}
                    onChange={setSearchString}
                    placeholder={t("Select Charactor")}
                    mb={6}
                    data={uniqueBy(chatactorList, prop("character")).map((v) => ({
                        value: v.character,
                        label: capitalizeFirstLetter(v.character),
                    }))}
                />

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
                                    <Grid.Col span={{ base: 3, md: 2, lg: 1 }} key={v.img}>
                                        <Tooltip label={v.name}>
                                            <UnstyledButton onClick={() => selectAndClose(v)}>
                                                <LazyLoadImage
                                                    src={`${v.img}`}
                                                    width="100%"
                                                    effect="blur"
                                                />
                                            </UnstyledButton>
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
                    {t("Change Charactor")}
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
