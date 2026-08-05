import { Grid, NavLink } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import GeneralInformations from "./content/GeneralInformations";
import Shortcuts from "./content/Shortcuts";
import { useTranslation } from "react-i18next";

const howToUseNav = ["General information", "Shortcuts"] as const;
type HowToUseNavType = (typeof howToUseNav)[number];

function LearnMoreContent() {
    const { t } = useTranslation();
    const [guideLink, setGuideLink] = useState<HowToUseNavType>("Shortcuts");

    return (
        <>
            <Grid>
                <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                    {howToUseNav.map((v) => (
                        <NavLink
                            key={v}
                            label={t(v)}
                            onClick={() => setGuideLink(v)}
                            rightSection={
                                <IconChevronRight
                                    size="0.8rem"
                                    stroke={1.5}
                                    className="mantine-rotate-rtl"
                                />
                            }
                        />
                    ))}
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                    {guideLink === "Shortcuts" && <Shortcuts />}
                    {guideLink === "General information" && <GeneralInformations />}
                </Grid.Col>
            </Grid>
        </>
    );
}

export default LearnMoreContent;
