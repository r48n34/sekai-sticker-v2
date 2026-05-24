import { Menu, ActionIcon, Tooltip } from "@mantine/core";
import { IconLanguage, IconStar, IconStarFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";

function ChangeLanguage() {
    const { i18n, t } = useTranslation();
    const [language, setLanguage] = useLocalStorage({
        key: "languages-sekai",
        defaultValue: "en",
    });

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language, i18n]);

    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <Tooltip label={t("Languages")}>
                    <ActionIcon variant="light" aria-label={t("Languages")}>
                        <IconLanguage style={{ width: "70%", height: "70%" }} stroke={1.5} />
                    </ActionIcon>
                </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>{t("Languages")}</Menu.Label>
                {[
                    { lang: "en", label: "English" },
                    { lang: "zh-CN", label: "简体中文" },
                    { lang: "zh-TW", label: "繁體中文" },
                    { lang: "ja", label: "日本語" },
                ].map((v) => (
                    <Menu.Item
                        key={v.lang}
                        onClick={() => setLanguage(v.lang)}
                        leftSection={
                            language === v.lang ? (
                                <IconStarFilled size={12} />
                            ) : (
                                <IconStar size={12} />
                            )
                        }
                    >
                        {v.label}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    );
}

export default ChangeLanguage;
